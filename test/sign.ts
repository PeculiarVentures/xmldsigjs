// tslint:disable: no-shadowed-variable

import * as assert from "assert";
import * as child_process from "child_process";
import * as fs from "fs";
import * as xmldsig from "../src";
import { Crypto } from "@peculiar/webcrypto";
import { Convert } from "pvtsutils";

const SIGN_XML_FILE = "sign.xml";

context("XML Signing + XMLSEC verification", () => {

  let keys: CryptoKeyPair;
  const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };

  before(async () => {
    // Generate key
    keys = (await crypto.subtle.generateKey(alg, false, ["sign", "verify"]));
  });

  after(() => {
    // Remove tmp file
    if (fs.existsSync(SIGN_XML_FILE)) {
      fs.unlinkSync(SIGN_XML_FILE);
    }
  });

  async function checkXMLSEC(xml: string) {
    return new Promise<void>((resolve, reject) => {
      // console.log("%s\n", xml);
      fs.writeFileSync(SIGN_XML_FILE, xml, { flag: "w+" });

      child_process.exec(`xmlsec1 verify ${SIGN_XML_FILE}`, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  context("Enveloped", () => {
    async function test(xml: string, id?: string) {
      const signedXml = new xmldsig.SignedXml();
      const xmlDocument = xmldsig.Parse(xml);

      const signature = await signedXml.Sign(
        alg,
        keys.privateKey,
        xmlDocument,
        {
          keyValue: keys.publicKey,
          references: [
            {
              hash: "SHA-256",
              transforms: ["enveloped"],
              id,
            },
          ],
        });

      xmlDocument.documentElement.appendChild(signature.GetXml()!);

      // serialize XML
      const oSerializer = new XMLSerializer();
      const sXML = oSerializer.serializeToString(xmlDocument);

      await checkXMLSEC(sXML);

      //#region Verify
      const vXml = xmldsig.Parse(sXML);
      const vSignature = vXml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0];
      const verifyXml = new xmldsig.SignedXml(vXml);
      verifyXml.LoadXml(vSignature);
      const ok = await verifyXml.Verify();
      assert.equal(ok, true);
      //#endregion
    }

    it("without namespace", async () => {
      test(`<root><first/><second/></root>`);
    });

    it("with default root namespace", async () => {
      test(`<root xmlns="http://namespace1"><first/><second/></root>`);
    });

    it("with root namespaces", async () => {
      test(`<root xmlns="http://namespace1" xmlns:ns2="http://namespace2"><ns3:first xmlns:ns3="http://namespace3"/><ns2:second/></root>`);
    });

    it("child without namespace", async () => {
      test(`<root xmlns="http://namespace1"><first id="id-1"/><second/></root>`, "id-1");
    });

    it("child with namespace", async () => {
      test(`<root xmlns="http://namespace1"><ns2:first id="id-1" xmlns:ns2="http://namespace2"/><second/></root>`, "id-1");
    });

    it("child with repeated namespace", async () => {
      test(`<root xmlns="http://namespace1" xmlns:ns2="http://namespace3"><ns2:first id="id-1" xmlns:ns2="http://namespace2"/><ns2:second/></root>`, "id-1");
    });
  });

  it("Sign multiple contents", async () => {
    const crypto = new Crypto();
    // tslint:disable-next-line: no-shadowed-variable
    const alg: RsaHashedKeyGenParams = {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
      publicExponent: new Uint8Array([1, 0, 1]),
      modulusLength: 2048,
    };
    // tslint:disable-next-line: no-shadowed-variable
    const keys = await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
    const dataHex = Convert.ToHex(crypto.getRandomValues(new Uint8Array(20)));
    const data = Convert.FromBinary(dataHex);
    const dataHex2 = Buffer.from(crypto.getRandomValues(new Uint8Array(20))).toString("hex");
    const data2 = Buffer.from(dataHex2);

    const signedXml = new xmldsig.SignedXml();
    signedXml.contentHandler = async (ref: xmldsig.Reference) => {
      switch (ref.Uri) {
        case "some-file.txt":
          return data;
        case "some-file-2.txt":
          return data2;
      }
      return null;
    };
    const signature = await signedXml.Sign(alg, keys.privateKey, data, {
      keyValue: keys.publicKey,
      references: [
        {
          hash: "sha-256",
          uri: "some-file.txt"
        },
        {
          hash: "sha-256",
          uri: "some-file-2.txt"
        },
      ]
    });

    const ok = await signedXml.Verify({
      content: data,
    });

    assert.strictEqual(ok, true);
  });

  it("xhtml with xpath and multiple signatures", async () => {
    const crypto = new Crypto();

    async function sign(doc: Document) {
      const keys = await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);

      const signedXml = new xmldsig.SignedXml();

      const signature = await signedXml.Sign(alg, keys.privateKey, doc, {
        keyValue: keys.publicKey,
        references: [
          {
            hash: "sha-256",
            uri: "#xpointer(/)",
            transforms: [
              "c14n",
              {
                name: "xpath",
                selector: "not(ancestor-or-self::ds:Signature)",
                namespaces: {
                  ds: xmldsig.XmlSignature.NamespaceURI,
                }
              }
            ]
          },
        ]
      });

      const firstElement = doc.getElementsByTagName("head")[0];
      if (!firstElement) {
        throw new Error("Empty element");
      }

      const signatureXml = signature.GetXml();
      if (!signatureXml) {
        throw new Error("Empty Signature XML");
      }
      firstElement.appendChild(signatureXml);

      return xmldsig.Stringify(doc);
    }

    const size = 3;

    const xmlDoc = xmldsig.Parse("<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body></body></html>");
    let counter = size;
    while (counter--) {
      await sign(xmlDoc);
    }

    const signatures = xmlDoc.getElementsByTagNameNS(xmldsig.XmlSignature.NamespaceURI, "Signature");
    const signedData = new xmldsig.SignedXml(xmlDoc);
    for (let i=0; i<signatures.length; i++) {
      const signature = signatures[i];
      signedData.LoadXml(signature);

      const ok = await signedData.Verify();
      assert.ok(ok);
    }
    // assert.strictEqual(ok, true);

  });

});

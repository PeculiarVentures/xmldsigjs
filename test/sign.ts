import * as assert from "assert";
import * as child_process from "child_process";
import * as fs from "fs";
import * as xmldsig from "../src";

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
    keys = (await crypto.subtle.generateKey(alg, false, ["sign", "verify"])) as CryptoKeyPair;
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

});

import * as assert from "assert";
import * as xmldsig from "../src";

context("Signing options", () => {

  const xmlDocument = xmldsig.Parse(`<root><child id="child"/></root>`);
  const algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };
  let keys;

  before(async () => {
    keys = await crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]);
  });

  async function Sign(options) {
    const signedXml = new xmldsig.SignedXml();

    await signedXml.Sign(
      algorithm,
      keys.privateKey,
      xmlDocument,
      options,
    );
    return signedXml;
  }

  function Parse(xml) {
    const vXml = xmldsig.Parse(xml);
    const vSignature = vXml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0];
    const signedXml = new xmldsig.SignedXml(vXml);
    signedXml.LoadXml(vSignature);

    return signedXml;
  }

  async function SignParse(options) {
    const xml = await Sign(options);
    // console.log(xml.toString());
    return Parse(xml.toString());
  }

  context("Signature", () => {

    context("Id", () => {

      async function Check(value, expectedValue) {
        const signature = await SignParse({
          id: value,
          keyValue: keys.publicKey,
          references: [
            {
              hash: "SHA-256",
              transforms: ["enveloped"],
            },
          ],
        });

        assert.equal(expectedValue, signature.XmlSignature.Id);
      }

      it("Empty", (done) => {
        Check(undefined, "")
          .then(done, done);
      });

      it("Not empty", (done) => {
        Check("id-12345", "id-12345")
          .then(done, done);
      });
    });
  });

  context("References", () => {

    context("Uri", () => {

      async function Check(value, expectedValue) {
        const signature = await SignParse({
          keyValue: keys.publicKey,
          references: [
            {
              uri: value,
              hash: "SHA-256",
              transforms: ["enveloped"],
            },
          ],
        });

        assert.equal(expectedValue, signature.XmlSignature.SignedInfo.References.Item(0)?.Uri);
      }

      it("Not present", async () => {
        await Check(undefined, undefined);
      });

      it("Empty string", async () => {
        await Check("", "");
      });

      it("Value", async () => {
        await Check("/", "/");
      });
    });

    it("Count", async () => {
      const signature = await SignParse({
        keyValue: keys.publicKey,
        references: [
          {
            hash: "SHA-256",
            transforms: ["enveloped"],
          },
          {
            hash: "SHA-1",
            transforms: ["enveloped"],
          },
        ],
      });

      assert.equal(2, signature.XmlSignature.SignedInfo.References.Count);
    });
  });

});

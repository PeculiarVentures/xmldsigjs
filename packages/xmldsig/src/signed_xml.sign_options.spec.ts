import { describe, it, assert, beforeAll, expect } from "vitest";
import { XE } from "xml-core";
import * as xmldsig from "./index.js";
import "../test/config.js";

describe("Signing options", () => {
  const xmlDocument = xmldsig.Parse(`<root><child id="child"/></root>`);
  const algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };
  let keys: CryptoKeyPair;

  beforeAll(async () => {
    keys = await xmldsig.Application.crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]);
  });

  async function Sign(options?: xmldsig.OptionsSign) {
    const signedXml = new xmldsig.SignedXml();

    await signedXml.Sign(algorithm, keys.privateKey, xmlDocument, options);
    return signedXml;
  }

  function Parse(xml: string) {
    const vXml = xmldsig.Parse(xml);
    const vSignature = vXml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0];
    const signedXml = new xmldsig.SignedXml(vXml);
    signedXml.LoadXml(vSignature);

    return signedXml;
  }

  async function SignParse(options?: xmldsig.OptionsSign) {
    const xml = await Sign(options);
    // console.log(xml.toString());
    return Parse(xml.toString());
  }

  describe("Signature", () => {
    describe("Id", () => {
      async function Check(value?: string, expectedValue?: string) {
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

      it("Empty", async () => {
        await Check(undefined, "");
      });

      it("Not empty", async () => {
        await Check("id-12345", "id-12345");
      });
    });
  });

  describe("Canonicalization", () => {
    async function Check(value: xmldsig.OptionsSignCanonicalization | undefined, expectedValue: string) {
      const signature = await SignParse({
        canonicalization: value,
        references: [
          {
            hash: "SHA-256",
            transforms: ["enveloped"],
          },
        ],
      });

      assert.equal(signature.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm, expectedValue);
      assert.isTrue(await signature.Verify(keys.publicKey));
    }

    it("Default", async () => {
      await Check(undefined, "http://www.w3.org/TR/2001/REC-xml-c14n-20010315");
    });

    it("c14n", async () => {
      await Check("c14n", "http://www.w3.org/TR/2001/REC-xml-c14n-20010315");
    });

    it("exc-c14n", async () => {
      await Check("exc-c14n", "http://www.w3.org/2001/10/xml-exc-c14n#");
    });

    it("c14n-com", async () => {
      await Check("c14n-com", "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments");
    });

    it("exc-c14n-com", async () => {
      await Check("exc-c14n-com", "http://www.w3.org/2001/10/xml-exc-c14n#WithComments");
    });

    it("Namespace URI", async () => {
      await Check("http://www.w3.org/2001/10/xml-exc-c14n#", "http://www.w3.org/2001/10/xml-exc-c14n#");
    });

    it("Registered custom C14N transform", async () => {
      const CUSTOM_C14N_NAMESPACE = "urn:test:custom-c14n";
      class CustomC14NTransform extends xmldsig.XmlDsigExcC14NTransform {
        public override Algorithm = CUSTOM_C14N_NAMESPACE;
      }
      xmldsig.CryptoConfig.RegisterTransform(CUSTOM_C14N_NAMESPACE, CustomC14NTransform);

      await Check(CUSTOM_C14N_NAMESPACE, CUSTOM_C14N_NAMESPACE);
    });

    it("Registered custom C14N transform without own Algorithm", async () => {
      const CUSTOM_C14N_NAMESPACE = "urn:test:custom-c14n-inherited";
      class CustomC14NTransform extends xmldsig.XmlDsigC14NTransform {}
      xmldsig.CryptoConfig.RegisterTransform(CUSTOM_C14N_NAMESPACE, CustomC14NTransform);

      await Check(CUSTOM_C14N_NAMESPACE, CUSTOM_C14N_NAMESPACE);
    });

    describe("Comments in SignedInfo", () => {
      /**
       * Signs, then inserts a comment into SignedInfo and verifies the result.
       * A comment is ignored by c14n/exc-c14n, but is part of the canonicalized
       * SignedInfo for the *-com variants, so the signature must break
       */
      async function VerifyWithComment(value: xmldsig.OptionsSignCanonicalization) {
        const signedXml = await Sign({
          canonicalization: value,
          references: [
            {
              hash: "SHA-256",
              transforms: ["enveloped"],
            },
          ],
        });
        const xml = signedXml.toString().replace(/(<(?:ds:)?SignedInfo[^>]*>)/, "$1<!--comment-->");
        assert.include(xml, "<!--comment-->");

        return Parse(xml).Verify(keys.publicKey);
      }

      for (const value of ["c14n", "exc-c14n"] as const) {
        it(`${value} ignores comments`, async () => {
          assert.isTrue(await VerifyWithComment(value));
        });
      }

      for (const value of ["c14n-com", "exc-c14n-com"] as const) {
        it(`${value} keeps comments`, async () => {
          assert.isFalse(await VerifyWithComment(value));
        });
      }
    });

    it("Unknown", async () => {
      await expect(Sign({ canonicalization: "urn:unknown" })).rejects.toMatchObject({ code: XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM });
    });

    it("Empty", async () => {
      await expect(Sign({ canonicalization: "" })).rejects.toMatchObject({ code: XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM });
    });

    for (const value of ["base64", "enveloped", "http://www.w3.org/2000/09/xmldsig#base64", "http://www.w3.org/2000/09/xmldsig#enveloped-signature"]) {
      it(`Not a canonicalization method: ${value}`, async () => {
        await expect(Sign({ canonicalization: value })).rejects.toMatchObject({ code: XE.ALGORITHM_NOT_SUPPORTED });
      });
    }
  });

  describe("References", () => {
    describe("Uri", () => {
      async function Check(value?: string, expectedValue?: string) {
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

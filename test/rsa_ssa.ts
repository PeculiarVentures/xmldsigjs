import * as assert from "assert";
import * as xmldsig from "../src";

context("RSA-SSA", () => {

  // modulusLength
  [1024, 2048].forEach((modulusLength) => {
    // publicExponent
    [new Uint8Array([1, 0, 1])].forEach((publicExponent) => {
      context(`n:${modulusLength} e:${publicExponent[0] === 1 ? 65537 : 3}`, () => {
        // hash
        ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach((hash) => {
          it(hash, async () => {

            const signature = new xmldsig.SignedXml();

            const keys = await xmldsig.Application.crypto.subtle.generateKey(
              {
                name: "RSASSA-PKCS1-v1_5",
                hash,
                modulusLength,
                publicExponent,
              },
              true,
              ["sign", "verify"]);

            await signature.Sign(
              { name: "RSASSA-PKCS1-v1_5" },                                  // algorithm
              keys.privateKey,                                                // key
              xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`),          // document
              {                                                               // options
                keyValue: keys.publicKey,
                references: [
                  { hash, transforms: ["c14n"] },
                ],
              });

            const signature2 = new xmldsig.SignedXml(xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`));
            signature2.LoadXml(signature.XmlSignature.GetXml()!);

            const si = signature2.XmlSignature.SignedInfo;

            // CanonicalizationMethod
            assert.equal(si.CanonicalizationMethod.Algorithm, "http://www.w3.org/TR/2001/REC-xml-c14n-20010315");

            // SignatureMethod
            let signatureMethod;
            switch (hash) {
              case "SHA-1":
                signatureMethod = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
                break;
              case "SHA-224":
                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha224";
                break;
              case "SHA-256":
                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
                break;
              case "SHA-384":
                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
                break;
              case "SHA-512":
                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
                break;
            }
            assert.equal(si.SignatureMethod.Algorithm, signatureMethod);

            // DigestMethod
            let digestMethod;
            switch (hash) {
              case "SHA-1":
                digestMethod = "http://www.w3.org/2000/09/xmldsig#sha1";
                break;
              case "SHA-224":
                digestMethod = "http://www.w3.org/2001/04/xmlenc#sha224";
                break;
              case "SHA-256":
                digestMethod = "http://www.w3.org/2001/04/xmlenc#sha256";
                break;
              case "SHA-384":
                digestMethod = "http://www.w3.org/2001/04/xmldsig-more#sha384";
                break;
              case "SHA-512":
                digestMethod = "http://www.w3.org/2001/04/xmlenc#sha512";
                break;
            }
            assert.equal(si.References.Item(0)?.DigestMethod.Algorithm, digestMethod);

            const ok = await signature2.Verify();
            assert.equal(ok, true);
          });
        });
      });
    });
  });
});

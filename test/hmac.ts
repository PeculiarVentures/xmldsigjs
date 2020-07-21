import * as assert from "assert";
import * as xmldsig from "../src";

context("HMAC", () => {

  // length
  [0, 128].forEach((hmacLength) => {
    // hash
    ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach((hash) => {
      it(`hash:${hash} length:${hmacLength}`, async () => {

        const signature = new xmldsig.SignedXml();
        const alg: HmacKeyGenParams = {
          name: "HMAC",
          hash,
        };
        if (hmacLength) {
          alg.length = hmacLength;
        }

        const key = (await xmldsig.Application.crypto.subtle.generateKey(
          alg,
          true,
          ["sign", "verify"])) as CryptoKey;

        await signature.Sign(
          { name: "HMAC" },                                        // algorithm
          key,                                                     // key
          xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`),          // document
          {                                                        // options
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
            signatureMethod = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            break;
          case "SHA-256":
            signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
            break;
          case "SHA-384":
            signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
            break;
          case "SHA-512":
            signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
            break;
        }
        assert.equal(si.SignatureMethod.Algorithm, signatureMethod);

        // hmacLength
        if (hmacLength) {
          assert.equal(si.SignatureMethod.HMACOutputLength, hmacLength);
        } else if (typeof (module) !== "undefined") {
          assert.equal(si.SignatureMethod.HMACOutputLength, 512);
        }

        // TODO: Check signature length. Issue #85

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

        const ok = await signature2.Verify(key);

        assert.equal(ok, true);
      });
    });
  });
});

"use strict"
var select, xmldsig, DOMParser, XMLSerializer, readXml, assert;

if (typeof module !== "undefined") {
    var config = require("../config");
    select = config.select;
    xmldsig = config.xmldsig;
    DOMParser = config.DOMParser;
    XMLSerializer = config.XMLSerializer;
    assert = config.assert;
    readXml = config.readXml;
    var XmlCore = config.XmlCore;
}

describe("HMAC", function () {

    console.warn("WARN: No check of SignatureLength. Issue node-webcrypto-ossl #85");

    // length
    [0, 128].forEach(hmacLength => {
        // hash
        ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach(hash => {
            it(`hash:${hash} length:${hmacLength}`, done => {

                let signature = new xmldsig.SignedXml();
                let key;
                let alg = {
                    name: "HMAC",
                    hash,
                }
                if (hmacLength) alg.length = hmacLength;

                xmldsig.Application.crypto.subtle.generateKey(
                    alg,
                    true,
                    ["sign", "verify"])
                    .then(k => {
                        key = k;
                        // Export key to JWK, to compare with KeyValue
                        return xmldsig.Application.crypto.subtle.exportKey("jwk", key);
                    })
                    .then(jwk => {
                        return signature.Sign(
                            { name: "HMAC" },                                        // algorithm 
                            key,                                                     // key 
                            XmlCore.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`),          // document
                            {                                                        // options
                                references: [
                                    { hash, transforms: ["c14n"] },
                                ]
                            });
                    })
                    .then(() => {
                        // console.log(signature.toString());

                        let signature2 = new xmldsig.SignedXml(XmlCore.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`));
                        signature2.LoadXml(signature.XmlSignature.GetXml());

                        let si = signature2.XmlSignature.SignedInfo;

                        // CanonicalizationMethod
                        assert.equal(si.CanonicalizationMethod.Algorithm, "http://www.w3.org/TR/2001/REC-xml-c14n-20010315");

                        // SignatureMethod
                        let signatureMethod;
                        let sigLength;
                        switch (hash) {
                            case "SHA-1":
                                signatureMethod = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
                                sigLength = 160;
                                break;
                            case "SHA-256":
                                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
                                sigLength = 256;
                                break;
                            case "SHA-384":
                                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
                                sigLength = 384;
                                break;
                            case "SHA-512":
                                signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
                                sigLength = 512;
                                break;
                        }
                        assert.equal(si.SignatureMethod.Algorithm, signatureMethod);

                        // hmacLength
                        if (hmacLength) {
                            assert.equal(si.SignatureMethod.HMACOutputLength, hmacLength);
                            sigLength = hmacLength;
                        } else
                            assert.equal(si.SignatureMethod.HMACOutputLength, sigLength);

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
                        assert.equal(si.References.Item(0).DigestMethod.Algorithm, digestMethod);

                        return signature2.Verify(key)
                    })
                    .then(res => {
                        assert.equal(res, true);
                        return Promise.resolve();
                    })
                    .then(done, done);
            });
        });
    });
});
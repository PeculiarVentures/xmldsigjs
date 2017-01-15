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

describe("ECDSA", function () {

    // namedCurves
    ["P-256", "P-384", "P-521"].forEach(namedCurve => {
        context(namedCurve, () => {
            // hash
            ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach(hash => {
                it(hash, done => {

                    let signature = new xmldsig.SignedXml();
                    let keys;

                    xmldsig.Application.crypto.subtle.generateKey({
                        name: "ECDSA",
                        namedCurve
                    },
                        true,
                        ["sign", "verify"])
                        .then(ks => {
                            keys = ks;
                            // Export key to JWK, to compare with KeyValue
                            return xmldsig.Application.crypto.subtle.exportKey("jwk", keys.publicKey);
                        })
                        .then(jwk => {
                            return signature.Sign(
                                { name: "ECDSA", hash },                                        // algorithm 
                                keys.privateKey,                                                // key 
                                XmlCore.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`),          // document
                                {                                                               // options
                                    keyValue: keys.publicKey,
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
                            switch (hash) {
                                case "SHA-1":
                                    signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
                                    break;
                                case "SHA-224":
                                    signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha224";
                                    break;
                                case "SHA-256":
                                    signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
                                    break;
                                case "SHA-384":
                                    signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
                                    break;
                                case "SHA-512":
                                    signatureMethod = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
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
                            assert.equal(si.References.Item(0).DigestMethod.Algorithm, digestMethod);

                            // return signature2.Verify(keys.publicKey)
                            return signature2.Verify()
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
});
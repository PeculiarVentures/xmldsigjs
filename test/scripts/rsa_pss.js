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

describe("RSA-PSS", function () {

    // modulusLength
    [1024, 2048].forEach(modulusLength => {
        // publicExponent
        [new Uint8Array([3]), new Uint8Array([1, 0, 1])].forEach(publicExponent => {
            context(`n:${modulusLength} e:${publicExponent[0] === 1 ? 65537 : 3}`, () => {
                // hash
                ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach(hash => {
                    // salt length
                    [32, 64].forEach(saltLength => {
                        // exclude saltLength=64 for SHA-512
                        if (hash === "SHA-512" && saltLength === 64)
                            return;

                        it(`hash:${hash} salt:${saltLength}`, done => {

                            let signature = new xmldsig.SignedXml();
                            let keys;

                            xmldsig.Application.crypto.subtle.generateKey({
                                name: "RSA-PSS",
                                hash,
                                modulusLength,
                                publicExponent
                            },
                                true,
                                ["sign", "verify"])
                                .then(ks => {
                                    keys = ks;
                                    // Export key to JWK, to compare with KeyValue
                                    return xmldsig.Application.crypto.subtle.exportKey("jwk", keys.publicKey);
                                })
                                .then(jwk => {
                                    let alg = { name: "RSA-PSS" };
                                    if (saltLength)
                                        alg.saltLength = saltLength;
                                    return signature.Sign(
                                        alg,                                        // algorithm 
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
                                        case "SHA-224":
                                        case "SHA-256":
                                        case "SHA-384":
                                        case "SHA-512":
                                            signatureMethod = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
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

                                    // PSS params
                                    assert.equal(si.SignatureMethod.Any.Count, 1);
                                    const pss = si.SignatureMethod.Any.Item(0);
                                    assert.equal(pss.DigestMethod.Algorithm, digestMethod);
                                    assert.equal(pss.SaltLength, saltLength || undefined);

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
    });
});
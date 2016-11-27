"use strict";
var select, xmldsig, DOMParser, XMLSerializer, readXml, assert;

if (typeof module !== "undefined") {
    var config = require("../config");
    select = config.select;
    xmldsig = config.xmldsig;
    DOMParser = config.DOMParser;
    XMLSerializer = config.XMLSerializer;
    assert = config.assert;
    readXml = config.readXml;
}

describe("Sign/Verify", () => {

    function CheckSignature(xmlString, key) {
        return new Promise((resolve, reject) => {
            var xml = new DOMParser().parseFromString(xmlString, "application/xml");
            var signature = select(xml, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
            var sig = new xmldsig.SignedXml(xml);
            sig.LoadXml(signature);
            sig.CheckSignature(key)
                .then(resolve, reject);
        })
    }

    var keys = [];
    // Algorithms
    // ["RSASSA-PKCS1-v1_5", "RSA-PSS"].forEach(alg =>
    ["RSASSA-PKCS1-v1_5"].forEach(alg =>
        // ModulusLength
        [1024, 2048].forEach(modulusLength =>
            // PublicExponent
            [new Uint8Array([3]), new Uint8Array([1, 0, 1])].forEach(publicExponent =>
                // Hash
                ["SHA-1", "SHA-256", "SHA-384", "SHA-512"].forEach(hash => {
                    keys.push({
                        name: `${alg} ${modulusLength} ${publicExponent[0] === 3 ? "3" : "65537"} ${hash}`,
                        algorithm: {
                            name: alg,
                            hash: hash,
                            modulusLength: modulusLength,
                            publicExponent: publicExponent
                        },
                        value: null
                    });
                })
            )
        )
    );

    function generateKey(key) {
        return xmldsig.Application.crypto.subtle.generateKey(
            key.algorithm,
            true,
            ["sign", "verify"]
        )
            .then(keyPair => {
                // console.log(key.name, keyPair);
                key.value = keyPair;
            })
            .catch(e => {
                console.error(e);
            });
    }

    function SignXml(xmlString, key, algorithm) {
        return new Promise(function (resolve, reject) {
            var xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            var signedXml = new xmldsig.SignedXml(xmlDoc);
            // Add the key to the SignedXml document.
            signedXml.SigningKey = key;
            // Create a reference to be signed.
            var reference = new xmldsig.Reference();
            reference.Uri = "";
            // Add an enveloped transformation to the reference.
            reference.AddTransform(new xmldsig.XmlDsigEnvelopedSignatureTransform());
            // Add the reference to the SignedXml object.
            signedXml.AddReference(reference);
            // Set prefix for Signature namespace
            signedXml.Prefix = "ds";

            var rsaKey = new xmldsig.RsaKeyValue();
            rsaKey.importKey(key)
                .then(() => {
                    signedXml.KeyInfo.AddClause(rsaKey);
                    // Compute the signature.
                    return signedXml.ComputeSignature(algorithm)
                })
                .then(() => {
                    // Append signature
                    var xmlDigitalSignature = signedXml.GetXml();
                    xmlDoc.documentElement.appendChild(xmlDigitalSignature);

                    // Serialize XML document
                    var signedDocument = new XMLSerializer().serializeToString(xmlDoc);
                    // console.log(signedDocument);
                    return signedDocument;
                })
                .then(resolve, reject);
        })
    }

    function Test(key, done, length) {
        SignXml("<root><child1/><child2/><child3/></root>", key.value.privateKey, { name: key.algorithm.name, saltLength: length })
            .then(function (xmlSig) {
                assert.equal(!!xmlSig, true, "Empty XML signature string for " + key.name);
                return CheckSignature(xmlSig, key.value.publicKey);
            })
            .then(function (v) {
                assert.equal(v, true, "Wrong signature verification for " + key.name);
                return Promise.resolve();
            })
            .then(done, done);
    }


    keys.forEach(key => {
        it(key.name, done => {
            generateKey(key)
                .then(() => {
                    Test(key, done, 12);
                });
        }).timeout(60e3);
    });

});
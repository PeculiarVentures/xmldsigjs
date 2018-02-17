"use strict"
var select, xmldsig, readXml, assert, crypto;

if (typeof module !== "undefined") {
    var config = require("../config");
    select = config.select;
    xmldsig = config.xmldsig;
    assert = config.assert;
    readXml = config.readXml;
    var XmlCore = config.XmlCore;
    crypto = config.crypto;
}

describe("Signing options", () => {

    const xmlDocument = xmldsig.Parse(`<root><child id="child"/></root>`);
    const algorithm = {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
    }
    let keys;

    before((done) => {
        (async () => {
            keys = await crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]);
        })()
            .then(done, done);
    });

    async function Sign(options) {
        let signedXml = new xmldsig.SignedXml();

        await signedXml.Sign(
            algorithm,
            keys.privateKey,
            xmlDocument,
            options
        );
        return signedXml;
    }

    function Parse(xml) {
        const vXml = xmldsig.Parse(xml);
        const vSignature = vXml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0];
        let signedXml = new xmldsig.SignedXml(vXml);
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
                        }
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
                        }
                    ],
                });

                assert.equal(expectedValue, signature.XmlSignature.SignedInfo.References.Item(0).Uri);
            }

            it("Not present", (done) => {
                Check(undefined, undefined)
                    .then(done, done);
            });

            it("Empty string", (done) => {
                Check("", "")
                    .then(done, done);
            });

            it("Value", (done) => {
                Check("/", "/")
                    .then(done, done);
            });
        });
    });

});

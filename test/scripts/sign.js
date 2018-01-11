if (typeof module !== "undefined" && typeof exports !== "undefined") {

    const fs = require("fs");
    const assert = require("assert");
    const child_process = require("child_process");
    const WebCrypto = require("node-webcrypto-ossl");
    const { XMLSerializer } = require("xmldom-alpha");

    const xmldsig = require("../../");

    const SIGN_XML_FILE = "sign.xml";

    context("XML Signing + XMLSEC verification", () => {

        let crypto, keys;
        const alg = {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
            publicExponent: new Uint8Array([1, 0, 1]),
            modulusLength: 2048
        }

        before((done) => {
            (async () => {
                crypto = new WebCrypto();
                xmldsig.Application.setEngine("OpenSSL", crypto);

                // Generate key
                keys = await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
            })().then(done, done);
        });

        after(() => {
            // Remove tmp file
            if (fs.existsSync(SIGN_XML_FILE)) {
                fs.unlink(SIGN_XML_FILE);
            }
        });

        function checkXMLSEC(xml) {
            return new Promise((resolve, reject) => {
                fs.writeFileSync(SIGN_XML_FILE, xml, { flag: "w+" });

                child_process.exec(`xmlsec1 verify ${SIGN_XML_FILE}`, (err, stdout) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
        }

        it("Simple", (done) => {
            (async () => {

                var xml = xmldsig.Parse(`<root><first/><second/></root>`);
                let signedXml = new xmldsig.SignedXml();


                const signature = await signedXml.Sign(alg, keys.privateKey, xml, {
                    keyValue: keys.publicKey,
                    references: [
                        {
                            hash: "SHA-256",
                            transforms: ["enveloped"],
                        }
                    ],
                });

                xml.documentElement.appendChild(signature.GetXml());

                // serialize XML
                const oSerializer = new XMLSerializer();
                const sXML = oSerializer.serializeToString(xml);
                // console.log(sXML.toString())
                

                await checkXMLSEC(sXML.toString());

            })().then(done, done);
        });

    });

}
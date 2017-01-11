function getAlgorithm() {
    var $key = document.getElementById("key");

    var alg = {};
    switch ($key.value) {
        case "rsassa":
            alg = {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256",
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
            };
            break;
        case "rsapss":
            alg = {
                name: "RSA-PSS",
                hash: "SHA-256",
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
                saltLength: 32,
            };
            break;
        case "ecdsa":
            alg = {
                name: "ECDSA",
                hash: "SHA-256",
                namedCurve: "P-256",
            };
            break;
    }
    return alg;
}

function getHashAlgorithm() {
    return document.getElementById("digest").value;
}

function getCanonMethod() {
    return document.getElementById("canon").value;
}

function isEnveloped() {
    return document.getElementById("enveloped").checked;
}

function useKeyValue() {
    return document.getElementById("keyValue").checked;
}

function getXml() {
    return document.getElementById("xml").value;
}

function generateKey(alg) {
    return crypto.subtle.generateKey(alg, false, ["sign", "verify"])
}

function exportKey(key) {
    return crypto.subtle.exportKey("jwk", key)
}

function error(e) {
    alert(e.message);
    console.error(e);
}

function sign() {
    var transforms = [];
    if (isEnveloped())
        transforms.push("enveloped");
    transforms.push(getCanonMethod());
    console.log(transforms);

    var alg = getAlgorithm();
    var keys, signature, res = {};
    Promise.resolve()
        .then(function () {
            return generateKey(alg);
        })
        .then(function (ks) {
            keys = ks;
            return exportKey(ks.publicKey)
        })
        .then(function (jwk) {
            res.jwk = jwk;
        })
        .then(function () {
            signature = new XmlDSigJs.SignedXml();

            return signature.Sign(                  // Signing document
                alg,                                    // algorithm 
                keys.privateKey,                        // key 
                XmlDSigJs.XmlSignatureObject.Parse(getXml()),// document
                {                                       // options
                    keyValue: useKeyValue() ? keys.publicKey : void 0,
                    references: [
                        { hash: getHashAlgorithm(), transforms: transforms }
                    ]
                });
        })
        .then(function () {
            var sig = signature.toString()
            res.signature = sig;

            document.getElementById("jwk").value = JSON.stringify(res.jwk);
            document.getElementById("signature").value = res.signature;
        })
        .catch(function (e) {
            console.error(e);
        });

}

function verify() {
    var $xml = document.getElementById("xml");
    var $info = document.getElementById("signature_info");
    if (!$xml.value)
        return error(new Error("Unable to get XML"));
    var xml = XmlDSigJs.XmlSignatureObject.Parse($xml.value);
    var signature = new XmlDSigJs.SignedXml(xml);
    var xmlSignatures = XmlDSigJs.Select(xml, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']");

    if (!(xmlSignatures && xmlSignatures.length))
        return error("Cannot get XML signature from XML document");

    signature.LoadXml(xmlSignatures[0]);

    signature.Verify()
        .then(function (res) {
            var info = [];
            info.push("Signature valid: " + res.toString());
            info.push("=================================");
            var si = signature.XmlSignature.SignedInfo;
            info.push("Signature method: " + si.SignatureMethod.Algorithm);
            info.push("Canonicalization method: " + si.CanonicalizationMethod.Algorithm);
            info.push("References:");
            si.References.ForEach(function (ref, index) {
                info.push("  Reference #" + index + 1);
                ref.Type && info.push("    Type: " + ref.Type);
                ref.Uri && info.push("    Uri: " + ref.Uri);
                info.push("    Digest method: " + ref.DigestMethod.Algorithm);
                ref.Transforms.ForEach(function (transform) {
                    info.push("    Transform: " + transform.Algorithm);
                });
            });
            $info.textContent = info.join("\n");
        })
        .catch(function (e) {
            error(e);
        });
}
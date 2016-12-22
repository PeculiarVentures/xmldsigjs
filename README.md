# XMLDSIGjs

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE) [![CircleCI](https://circleci.com/gh/PeculiarVentures/xmldsigjs.svg?style=svg)](https://circleci.com/gh/PeculiarVentures/xmldsigjs)
[![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/xmldsigjs/badge.svg?branch=master)](https://coveralls.io/github/PeculiarVentures/xmldsigjs?branch=master)
[![NPM version](https://badge.fury.io/js/xmldsigjs.png)](http://badge.fury.io/js/xmldsigjs)

[![NPM](https://nodei.co/npm-dl/xmldsigjs.png?months=2&height=2)](https://nodei.co/npm/xmldsigjs/)

[XMLDSIG](https://en.wikipedia.org/wiki/XML_Signature) is short for "XML Digital Signature". This library aims to provide an implementation of XMLDSIG in Typescript/Javascript that uses Web Crypto for cryptographic operations so it can be used both in browsers and in Node.js (when used with a polyfill like [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl) or [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)).
 
## COMPATABILITY

### CRYPTOGRAPHIC ALGORITHM SUPPORT 

|                   | SHA1 | SHA2-256 | SHA2-384 | SHA2-512 |
|-------------------|------|----------|----------|----------|
| RSASSA-PKCS1-v1_5 | X    | X        | X        | X        |
| RSA-PSS           | X    | X        | X        | X        |
| ECDSA             | X    | X        | X        | X        |
| HMAC              | X    | X        | X        | X        |

### CANONICALIZATION ALGORITHM SUPPORT

- XmlDsigC14NTransform
- XmlDsigC14NWithCommentsTransform
- XmlDsigExcC14NTransform
- XmlDsigExcC14NWithCommentsTransform
- XmlDsigEnvelopedSignatureTransform
- XmlDsigBase64Transform


### PLATFORM SUPPORT

XMLDSIGjs works with any browser that suppports Web Crypto. Since node does not have Web Crypto you will need a polyfill on this platform, for this reason the npm package includes [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl); browsers do not need this dependency and in those cases though it will be installed it will be ignored.

If you need to use a Hardware Security Module we have also created a polyfill for Web Crypto that supports PKCS #11. Our polyfill for this is [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11).

To use [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl) you need to specify you want to use it, that looks like this:

```javascript
var xmldsigjs = require("xmldsigjs");
var WebCrypto = require("node-webcrypto-ossl");

xmldsigjs.Application.setEngine("OpenSSL", new WebCrypto());
```

The [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11) polyfill will work the same way. The only difference is that you have to specify the details about your PKCS #11 device when you instansiate it:

```javascript
var xmldsigjs = require("xmldsigjs");
var WebCrypto = require("node-webcrypto-p11");

xmldsigjs.Application.setEngine("PKCS11", new WebCrypto({
    library: "/path/to/pkcs11.so",
	name: "Name of PKCS11 lib",
	slot: 0,
    sessionFlags: 4, // SERIAL_SESSION
	pin: "token pin"
}));
```

## WARNING

**Using XMLDSIG is a bit like running with scissors, that said it is needed for interoperability with a number of systems, for this reason, we have done this implementation.** 

**Given the nuances in handling XMLDSIG securely at this time you should consider this solution suitable for research and experimentation, further code and security review is needed before utilization in a production application.**

## Simple to use

### Sign

```typescript
SignedXml.Sign(algorithm: Algorithm, key: CryptoKey, data: Document, options?: OptionsSign): PromiseLike<Signature>;
```

__Parameters__
| Name          | Description                                                             |
|:--------------|:------------------------------------------------------------------------|
| algorithm     | Signing [Algorithm](https://www.w3.org/TR/WebCryptoAPI/#algorithms)     |
| key           | Signing [Key](https://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface)  |
| data          | XML document which must be signed                                       |
| options       | Additional options                                                      |

#### Options
```typescript
interface OptionsSign {
    /**
     * Public key for KeyInfo block
     */
    keyValue?: CryptoKey;
    /**
     * List of X509 Certificates
     */
    x509?: string[];
    /**
     * List of Reference
     * Default is Reference with hash alg SHA-256 and exc-c14n transform  
     */
    references?: OptionsSignReference[];
}

interface OptionsSignReference {
    /**
     * Id of Reference
     */
    id?: string;
    uri?: string;
    /**
     * Hash algorithm
     */
    hash: AlgorithmIdentifier;
    /**
     * List of transforms
     */
    transforms?: OptionsSignTransform[];
}

type OptionsSignTransform = "enveloped" | "c14n" | "exc-c14n" | "c14n-com" | "exc-c14n-com" | "base64";
```

### Verify

```typescript
Verify(key?: CryptoKey): PromiseLike<boolean>;
```

__Parameters__
| Name          | Description                                                             |
|:--------------|:------------------------------------------------------------------------|
| key           | Verifying [Key](https://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface). Optional. If key not set it looks for keys in KeyInfo element of Signature.  |

## EXAMPLES

### Create XMLDSIG Signature

#### In Node

```javascript
"use strict";

const WebCrypto = require("node-webcrypto-ossl");
const crypto = new WebCrypto();
const XmlCore = require("xml-core");
const XmlDSigJs = require("xmldsigjs");

XmlDSigJs.Application.setEngine("OpenSSL", crypto);

let xml = `<root><first id="id1"><foo>hello</foo></first></root>`;
let signature = new XmlDSigJs.SignedXml();

crypto.subtle.generateKey({                      // Generating key
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),     // 65537
    modulusLength: 2048
},
    true,                                          // extractable
    ["sign", "verify"])
    .then(keys => {
        return signature.Sign(                   // Signing document
            { name: "RSASSA-PKCS1-v1_5" },         // algorithm 
            keys.privateKey,                       // key 
            XmlCore.XmlObject.Parse(xml),          // document
            {                                      // options
                keyValue: keys.publicKey,
                references: [
                    { hash: "SHA-512", transforms: ["enveloped", "c14n"] },
                ]
            });
    })
    .then(() => {
        console.log(signature.toString());       // <xml> document with signature
    })
    .catch(e => console.log(e));
```


#### In the browser
````HTML
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8"/>
    <title>XMLDSIGjs Signature Sample</title>
</head>

<body>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/ASN1.js/master/org/pkijs/common.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/ASN1.js/master/org/pkijs/asn1.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/PKI.js/master/org/pkijs/x509_schema.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/PKI.js/master/org/pkijs/x509_simpl.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/PeculiarVentures/xmldsigjs/master/built/xmldsig.js"></script>
    
    <script type="text/javascript">
        // Generate RSA key pair
        var privateKey, publicKey;
        window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048, //can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-1"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        false, //whether the key is extractable (i.e. can be used in exportKey)
        ["sign", "verify"] //can be any combination of "sign" and "verify"
        )
        .then(function(keyPair){
            // Push ganerated keys to global variable
            privateKey = keyPair.privateKey;
            publicKey = keyPair.publicKey;
            console.log("Sucessfully generate key");
            
            // Call sign function
            var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>';
            return SignXml(xmlString, privateKey, { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-1" } });
        })
        .then(function (signedDocument) {
            console.log("Successfully signed document:\n\n", signedDocument);
        })
        .catch(function (e) {
            console.error(e);
        });

        function SignXml(xmlString, key, algorithm) {
            return new Promise(function (resolve, reject) {
                var xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
                var signedXml = new xmldsigjs.SignedXml(xmlDoc);

                // Add the key to the SignedXml document.
                signedXml.SigningKey = key;

                // Create a reference to be signed.
                var reference = new xmldsigjs.Reference();
                reference.Uri = "";

                // Add an enveloped transformation to the reference.
                reference.AddTransform(new xmldsigjs.XmlDsigEnvelopedSignatureTransform());

                // Add the reference to the SignedXml object.
                signedXml.AddReference(reference);

                // Add KeyInfo
                signedXml.KeyInfo = new xmldsigjs.KeyInfo();
                var keyInfoClause = new xmldsigjs.RsaKeyValue();
                signedXml.KeyInfo.AddClause(keyInfoClause);

                // Set prefix for Signature namespace
                signedXml.Prefix = "ds";

                // Compute the signature.
                signedXml.ComputeSignature(algorithm)
                    .then(function () {
                        return keyInfoClause.importKey(publicKey);
                    })
                    .then(function () {
                        // Append signature
                        var xmlDigitalSignature = signedXml.GetXml();
                        xmlDoc.documentElement.appendChild(xmlDigitalSignature);

                        // Serialize XML document
                        var signedDocument = new XMLSerializer().serializeToString(xmlDoc);

                        return Promise.resolve(signedDocument);
                    })
                    .then(resolve, reject);
            })
        }
    </script>
</body>
</html>
````

### Check XMLDSIG Signature 

#### In Node

```javascript
var xmldsigjs = require("./built/xmldsig.js");
var DOMParser = require("xmldom").DOMParser;
var WebCrypto = require("node-webcrypto-ossl").default;

xmldsigjs.Application.setEngine("OpenSSL", new WebCrypto());

var fs = require("fs");
var xmlString = fs.readFileSync("./xmldsigjs/test/static/valid_signature.xml","utf8");

var signedDocument = new DOMParser().parseFromString(xmlString, "application/xml");
var xmlSignature = signedDocument.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

var signedXml = new xmldsigjs.SignedXml(signedDocument);
signedXml.LoadXml(xmlSignature[0]);
signedXml.CheckSignature()
.then(function (signedDocument) {
        console.log("Successfully Verified");
})
.catch(function (e) {
        console.error(e);
});
```

#### In the browser
```HTML
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8"/>
    <title>XMLDSIGjs Verify Sample</title>
</head>

<body>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/ASN1.js/master/org/pkijs/common.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/ASN1.js/master/org/pkijs/asn1.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/PKI.js/master/org/pkijs/x509_schema.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/GlobalSign/PKI.js/master/org/pkijs/x509_simpl.js"></script>
    <script type="text/javascript" src="https://cdn.rawgit.com/PeculiarVentures/xmldsigjs/master/built/xmldsig.js"></script>
    
    <script type="text/javascript">
        fetch("https://cdn.rawgit.com/PeculiarVentures/xmldsigjs/master/test/static/valid_signature.xml")
        .then(function(response) {
            return response.text()
        }).then(function(body) {
            var xmlString = body;
            
            var signedDocument = new DOMParser().parseFromString(xmlString, "application/xml");
            var xmlSignature = signedDocument.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

            var signedXml = new xmldsigjs.SignedXml(signedDocument);
            signedXml.LoadXml(xmlSignature[0]);
            signedXml.CheckSignature()
            .then(function (signedDocument) {
                    console.log("Successfully Verified");
            })
            .catch(function (e) {
                    console.error(e);
            });
        })
    </script>
</body>
</html>
```

## TESTING

### In NodeJS:

```
npm test
```

### In the browser
To run the browser test you need to run the server, from the test directory run: 
```
npm start
```

And the then browse to `http://localhost:3000'.

## THANKS AND ACKNOWLEDGEMENT
This project takes inspiration (style, approach, design and code) from both the [Mono System.Security.Cryptography.Xml](https://github.com/mono/mono/tree/master/mcs/class/System.Security/System.Security.Cryptography.Xml) implementation as well as [xml-crypto](https://github.com/yaronn/xml-crypto).

## RELATED
- [Why XML Security is Broken](https://www.cs.auckland.ac.nz/~pgut001/pubs/xmlsec.txt)
- [XML Signature Syntax and Processing](https://www.w3.org/TR/xmldsig-core/)
- [XML Security Algorithm Cross-Reference](https://tools.ietf.org/html/rfc6931)
- [XMLDSIG HTML Signing Profile](https://www.w3.org/2007/11/h6n/)
- [Canonical XML](https://www.w3.org/TR/xml-c14n)
- [Exclusive XML Canonicalization](https://www.w3.org/TR/xml-exc-c14n/)
- [Internet X.509 Public Key Infrastructure Time-Stamp Protocol](https://www.ietf.org/rfc/rfc3161.txt)
- [PKIjs](pkijs.org)
- [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl)
- [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

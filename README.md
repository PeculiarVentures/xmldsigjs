# XMLDSIGjs

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE) [![CircleCI](https://circleci.com/gh/PeculiarVentures/xmldsigjs.svg?style=svg)](https://circleci.com/gh/PeculiarVentures/xmldsigjs)
[![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/xmldsigjs/badge.svg?branch=master)](https://coveralls.io/github/PeculiarVentures/xmldsigjs?branch=master)
[![npm version](https://badge.fury.io/js/xmldsigjs.svg)](https://badge.fury.io/js/xmldsigjs)

[![NPM](https://nodei.co/npm/xmldsigjs.png)](https://nodei.co/npm/xmldsigjs/)

[XMLDSIG](https://en.wikipedia.org/wiki/XML_Signature) is short for "XML Digital Signature". This library aims to provide an implementation of XMLDSIG in Typescript/Javascript that uses Web Crypto for cryptographic operations so it can be used both in browsers and in Node.js (when used with a polyfill like [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl) or [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)).

## INSTALLING

```
npm install xmldsigjs
```

The npm module has `build` folder with the following files:

| Name            | Size   | Description                                    |
|-----------------|--------|------------------------------------------------|
| index.js        | 105 Kb | CJS module with external modules               | 
| index.es.js     | 100 Kb | ES module with external modules                | 
| xmldsig.js      | 872 Kb | IIFE bundle module                             | 
| xmldsig.min.js  | 398 Kb | minified IIFE bundled module                   |
 
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

XMLDSIGjs works with any browser that supports Web Crypto. Since node does not have Web Crypto you will need a polyfill on this platform, for this reason the npm package includes [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl); browsers do not need this dependency and in those cases though it will be installed it will be ignored.

If you need to use a Hardware Security Module we have also created a polyfill for Web Crypto that supports PKCS #11. Our polyfill for this is [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11).

To use [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl) you need to specify you want to use it, that looks like this:

```javascript
var xmldsigjs = require("xmldsigjs");
var WebCrypto = require("node-webcrypto-ossl");

xmldsigjs.Application.setEngine("OpenSSL", new WebCrypto());
```

The [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11) polyfill will work the same way. The only difference is that you have to specify the details about your PKCS#11 device when you instansiate it:

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

**Using XMLDSIG is a bit like running with scissors so use it cautiously. That said it is needed for interoperability with a number of systems, for this reason, we have done this implementation.** 

## Usage

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
     * Id of Signature
     */
    id?: string 
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

For Sign/Verify operations you will need to use a Web Crypto CryptoKey. You can see [examples](https://github.com/diafygi/webcrypto-examples#rsassa-pkcs1-v1_5---generatekey) for an example of how to do that.

### Initiating in NodeJs

```javascript
"use strict";

const WebCrypto = require("node-webcrypto-ossl");
const crypto = new WebCrypto();
const XmlDSigJs = require("xmldsigjs");

XmlDSigJs.Application.setEngine("OpenSSL", crypto);
```

### Initiating in Browser

Get the latest version form [unpkg.com/xmldsigjs](https://unpkg.com/xmldsigjs)

```html
<script src="https://unpkg.com/xmldsigjs@<version>/build/xmldsig.js"></script>
```

### Creating a XMLDSIG Signature

```javascript
"use strict";

let signature = new XmlDSigJs.SignedXml();

signature.Sign(                                  // Signing document
    { name: "RSASSA-PKCS1-v1_5" },                        // algorithm 
    keys.privateKey,                                      // key 
    XmlDSigJs.Parse(xml),                                 // document
    {                                                     // options
        keyValue: keys.publicKey,
        references: [
            { hash: "SHA-512", transforms: ["enveloped", "c14n"] },
        ]
    })
    .then(() => {
        console.log(signature.toString());       // <xml> document with signature
    })
    .catch(e => console.log(e));
```

### Checking a XMLDSIG Signature 


```js
let doc = XmlDSigJs.Parse(xml);
let signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

let signedXml = new XmlDSigJs.SignedXml(doc);
signedXml.LoadXml(signature[0]);

signedXml.Verify()
    .then(res => {
        console.log("Signature status:", res);       // Signature status: true
    })
    .catch(e => console.log(e));
```

#### Browser Verify Example
```HTML
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8"/>
    <title>XMLDSIGjs Verify Sample</title>
</head>

<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.7.0/polyfill.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/asmCrypto/2.3.2/asmcrypto.all.es5.min.js"></script>
    <script src="https://cdn.rawgit.com/indutny/elliptic/master/dist/elliptic.min.js"></script>
    <script src="https://unpkg.com/webcrypto-liner@1.1.2/build/webcrypto-liner.shim.min.js"></script>
    <script src="https://unpkg.com/xmldsigjs@2.0.27/build/xmldsig.js"></script>
    <script type="text/javascript">
        fetch("signature.xml")
        .then(function(response) {
            return response.text();
        }).then(function(body) {
            var xmlString = body;

            var signedDocument = XmlDSigJs.Parse(xmlString);
            var xmlSignature = signedDocument.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

            var signedXml = new XmlDSigJs.SignedXml(signedDocument);
            signedXml.LoadXml(xmlSignature[0]);
            signedXml.Verify()
            .then(function (res) {
                console.log((res ? "Valid" : "Invalid") + " signature");
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
To run the browser test you need to run a test server, from the test directory run: 
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
- [@peculiar/webcrypto](https://github.com/PeculiarVentures/webcrypto)
- [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl)
- [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

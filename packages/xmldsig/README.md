# XMLDSIGjs

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE)
[![npm version](https://badge.fury.io/js/xmldsigjs.svg)](https://badge.fury.io/js/xmldsigjs)

XML Digital Signature implementation in TypeScript/JavaScript using Web Crypto API.

## Installation

```bash
npm install xmldsigjs
```

## Features

- Complete XMLDSIG implementation
- Support for RSA, ECDSA, and HMAC algorithms
- Multiple canonicalization methods
- Cross-platform: browsers and Node.js
- TypeScript support

## Algorithm Support

### Cryptographic Algorithms

|                   | SHA1 | SHA2-256 | SHA2-384 | SHA2-512 |
| ----------------- | ---- | -------- | -------- | -------- |
| RSASSA-PKCS1-v1_5 | ✓    | ✓        | ✓        | ✓        |
| RSA-PSS           | ✓    | ✓        | ✓        | ✓        |
| ECDSA             | ✓    | ✓        | ✓        | ✓        |
| HMAC              | ✓    | ✓        | ✓        | ✓        |

### Canonicalization

- C14N (Canonical XML)
- C14N with Comments
- Exclusive C14N
- Exclusive C14N with Comments
- Enveloped Signature Transform
- Base64 Transform

## Quick Start

### Node.js Setup

> **Note:** Use ESM modules (`.mjs` extension or `"type": "module"` in `package.json`).

```javascript
import * as xmldsigjs from 'xmldsigjs';
import { Crypto } from '@peculiar/webcrypto';

xmldsigjs.Application.setEngine('NodeJS', new Crypto());
```

### Browser Setup

```html
<script type="module">
import * as xmldsigjs from "https://unpkg.com/xmldsigjs@latest/dist/esm/index.js";
</script>
```

### Signing XML

```javascript
import * as xmldsigjs from 'xmldsigjs';
import { Crypto } from '@peculiar/webcrypto';

xmldsigjs.Application.setEngine('NodeJS', new Crypto());

async function signXML() {
  // Generate key pair
  const keys = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );

  // Parse XML document
  const xml = xmldsigjs.Parse('<root><data>Hello World</data></root>');

  // Create signature
  const signedXml = new xmldsigjs.SignedXml();
  await signedXml.Sign(
    { name: "RSASSA-PKCS1-v1_5" },
    keys.privateKey,
    xml,
    {
      keyValue: keys.publicKey,
      references: [{ hash: "SHA-256", transforms: ["enveloped", "c14n"] }]
    }
  );

  console.log(signedXml.toString());
}
```

### Verifying XML

```javascript
import * as xmldsigjs from 'xmldsigjs';

async function verifyXML(signedXmlString) {
  const doc = xmldsigjs.Parse(signedXmlString);
  const signatures = doc.getElementsByTagNameNS(
    'http://www.w3.org/2000/09/xmldsig#',
    'Signature'
  );

  const signedXml = new xmldsigjs.SignedXml(doc);
  signedXml.LoadXml(signatures[0]);

  const isValid = await signedXml.Verify();
  console.log('Signature valid:', isValid);
}
```

## API Reference

### SignedXml.Sign()

```typescript
Sign(
  algorithm: Algorithm,
  key: CryptoKey,
  data: Document,
  options?: OptionsSign
): Promise<Signature>
```

**Options:**

```typescript
interface OptionsSign {
  id?: string;                          // Signature ID
  keyValue?: CryptoKey;                 // Public key for KeyInfo
  x509?: string[];                      // X.509 certificates
  references?: OptionsSignReference[];  // Reference elements
}
```

### SignedXml.Verify()

```typescript
Verify(key?: CryptoKey): Promise<boolean>
```

## Node.js: Registering XML Dependencies

To work with XML in Node.js, you need to register DOM and XPath dependencies:

```typescript
import * as xmldom from '@xmldom/xmldom';
import { setNodeDependencies } from 'xmldsigjs';
import xpath from 'xpath';

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});
```

## WebCrypto Environment

Node.js >=19 ships a built‑in WebCrypto. For Node.js 16/18 or to ensure consistent behavior across environments, you can use:

```ts
import { Crypto } from '@peculiar/webcrypto';
import { Application } from 'xmldsigjs';
Application.setEngine('NodeJS', new Crypto());
```

## License

MIT

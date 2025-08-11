# XAdESjs

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE)
[![npm version](https://badge.fury.io/js/xadesjs.svg)](https://badge.fury.io/js/xadesjs)

XML Advanced Electronic Signatures (XAdES) implementation in TypeScript/JavaScript built on XMLDSIGjs.

## Installation

```bash
npm install xadesjs
```

## Features

- XAdES-BES (Basic Electronic Signature) support
- Built on XMLDSIGjs for robust XML signature handling
- Support for signing time, production place, signer roles
- Cross-platform: browsers and Node.js
- TypeScript support

## XAdES Profiles

| Profile    | Digital Signature | Cryptographic Timestamp | Revocation References | Revocation Data | Secure Timestamp |
|------------|-------------------|-------------------------|----------------------|-----------------|------------------|
| **XAdES-BES** | ✓                 | ✗                       | ✗                    | ✗               | ✗                |
| XAdES-T    | ✓                 | ✓                       | ✗                    | ✗               | ✗                |
| XAdES-C    | ✓                 | ✓                       | ✓                    | ✗               | ✗                |
| XAdES-X-L  | ✓                 | ✓                       | ✓                    | ✓               | ✗                |
| XAdES-A    | ✓                 | ✓                       | ✓                    | ✓               | ✓                |

*Currently only XAdES-BES is fully supported.*

## Quick Start

### Node.js Setup

> **Note:** Use ESM modules (`.mjs` extension or `"type": "module"` in `package.json`).

```javascript
import * as xadesjs from 'xadesjs';
import { Crypto } from '@peculiar/webcrypto';

xadesjs.Application.setEngine('NodeJS', new Crypto());
```

### Browser Setup

```html
<script type="module">
import * as xadesjs from "https://unpkg.com/xadesjs@latest/dist/esm/index.js";
</script>
```

### Creating XAdES-BES Signature

```javascript
import * as xadesjs from 'xadesjs';
import { Crypto } from '@peculiar/webcrypto';

xadesjs.Application.setEngine('NodeJS', new Crypto());

async function signXAdES() {
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
  const xml = xadesjs.Parse('<root><data>Hello World</data></root>');

  // Create XAdES signature
  const signedXml = new xadesjs.SignedXml();
  await signedXml.Sign(
    { name: "RSASSA-PKCS1-v1_5" },
    keys.privateKey,
    xml,
    {
      keyValue: keys.publicKey,
      references: [{ hash: "SHA-256", transforms: ["enveloped"] }],
      productionPlace: {
        country: "US",
        state: "California",
        city: "San Francisco"
      },
      signerRole: {
        claimed: ["Developer"]
      }
    }
  );

  console.log(signedXml.toString());
}
```

### Verifying XAdES Signature

```javascript
import * as xadesjs from 'xadesjs';

async function verifyXAdES(signedXmlString) {
  const doc = xadesjs.Parse(signedXmlString);
  const signatures = doc.getElementsByTagNameNS(
    'http://www.w3.org/2000/09/xmldsig#',
    'Signature'
  );

  const signedXml = new xadesjs.SignedXml(doc);
  signedXml.LoadXml(signatures[0]);

  const isValid = await signedXml.Verify();
  console.log('XAdES signature valid:', isValid);
}
```

## API Reference

### SignedXml.Sign()

```typescript
Sign(
  algorithm: Algorithm,
  key: CryptoKey,
  data: Document,
  options?: OptionsXAdES
): Promise<Signature>
```

**XAdES Options:**

```typescript
interface OptionsXAdES {
  keyValue?: CryptoKey;
  x509?: string[];
  references?: OptionsSignReference[];

  // XAdES-specific options
  signingCertificate?: string;
  signingTime?: { value?: Date; format?: string };
  productionPlace?: {
    city?: string;
    state?: string;
    code?: string;
    country?: string;
  };
  signerRole?: {
    claimed?: string[];
    certified?: string[];
  };
  policy?: OptionsPolicyId;
}
```

## Algorithm Support

Same as XMLDSIGjs:

- **Cryptographic**: RSASSA-PKCS1-v1_5, RSA-PSS, ECDSA, HMAC
- **Hash**: SHA-1, SHA-256, SHA-384, SHA-512
- **Canonicalization**: C14N, C14N with Comments, Exclusive C14N variants

## Node.js: Registering XML Dependencies

To work with XML in Node.js, you need to register DOM and XPath dependencies:

```typescript
import * as xmldom from '@xmldom/xmldom';
import { setNodeDependencies } from 'xadesjs';
import xpath from 'xpath';

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});
```

## WebCrypto Environment

In Node.js >=19 the global `crypto.webcrypto` is available. For earlier versions or broader compatibility, install and set the engine:

```ts
import { Crypto } from '@peculiar/webcrypto';
import { Application } from 'xmldsigjs';
Application.setEngine('NodeJS', new Crypto());
```

## License

MIT

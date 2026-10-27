<h1 align="center">
  XAdESjs
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/xadesjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/xadesjs.svg)](https://www.npmjs.com/package/xadesjs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xadesjs.svg)](https://www.npmjs.com/package/xadesjs)

</div>

XML Advanced Electronic Signatures (XAdES) implementation in TypeScript/JavaScript built on XMLDSIGjs.

## Installation

```bash
npm install xadesjs
```

## Breaking Changes In v3

v3 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (was `>=16`). xml-core, xmldsigjs and xadesjs are released together and all move to 3.0.0. CommonJS code can still `require("xadesjs")` on these versions; Node.js 22.0–22.11 can't. See the [full notes](https://github.com/PeculiarVentures/xmldsigjs#breaking-changes-in-v3).

- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or configure an ESM-to-CommonJS transformer and make sure `transformIgnorePatterns` doesn't exclude `xadesjs` and its peers.
- **Deep imports** (`xadesjs/build/...`) are blocked by `exports`; import from `xadesjs`.
- **Peer dependencies:** `xml-core` and `xmldsigjs` (`^3.0.0`) are peers instead of dependencies, so your app shares one copy of the `Application` engine and the algorithm and transform registries. npm installs peers automatically.

## Features

- XAdES-BES (Basic Electronic Signature) support
- Built on XMLDSIGjs for robust XML signature handling
- Support for signing time, production place, signer roles
- Cross-platform: browsers and Node.js
- TypeScript support

## XAdES Profiles

| Profile       | Digital Signature | Cryptographic Timestamp | Revocation References | Revocation Data | Secure Timestamp |
| ------------- | ----------------- | ----------------------- | --------------------- | --------------- | ---------------- |
| **XAdES-BES** | ✓                 | ✗                       | ✗                     | ✗               | ✗                |
| XAdES-T       | ✓                 | ✓                       | ✗                     | ✗               | ✗                |
| XAdES-C       | ✓                 | ✓                       | ✓                     | ✗               | ✗                |
| XAdES-X-L     | ✓                 | ✓                       | ✓                     | ✓               | ✗                |
| XAdES-A       | ✓                 | ✓                       | ✓                     | ✓               | ✓                |

_Currently only XAdES-BES is fully supported._

## Quick Start

### Node.js Setup

> **Note:** The package is ESM-only. CommonJS code can `require()` it on Node.js `^20.19.0 || >=22.12.0`.

```javascript
import * as xadesjs from "xadesjs";
import { Crypto } from "@peculiar/webcrypto";

xadesjs.Application.setEngine("NodeJS", new Crypto());
```

### Browser Setup

```html
<script type="module">
  import * as xadesjs from "https://esm.sh/xadesjs";
</script>
```

### Creating XAdES-BES Signature

```javascript
import * as xadesjs from "xadesjs";
import { Crypto } from "@peculiar/webcrypto";

xadesjs.Application.setEngine("NodeJS", new Crypto());

async function signXAdES() {
  // Generate key pair
  const keys = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"],
  );

  // Parse XML document
  const xml = xadesjs.Parse("<root><data>Hello World</data></root>");

  // Create XAdES signature
  const signedXml = new xadesjs.SignedXml();
  await signedXml.Sign({ name: "RSASSA-PKCS1-v1_5" }, keys.privateKey, xml, {
    keyValue: keys.publicKey,
    references: [{ hash: "SHA-256", transforms: ["enveloped"] }],
    productionPlace: {
      country: "US",
      state: "California",
      city: "San Francisco",
    },
    signerRole: {
      claimed: ["Developer"],
    },
  });

  console.log(signedXml.toString());
}
```

### Verifying XAdES Signature

```javascript
import * as xadesjs from "xadesjs";

async function verifyXAdES(signedXmlString) {
  const doc = xadesjs.Parse(signedXmlString);
  const signatures = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

  const signedXml = new xadesjs.SignedXml(doc);
  signedXml.LoadXml(signatures[0]);

  const isValid = await signedXml.Verify();
  console.log("XAdES signature valid:", isValid);
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
import * as xmldom from "@xmldom/xmldom";
import { setNodeDependencies } from "xadesjs";
import xpath from "xpath";

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
import { Crypto } from "@peculiar/webcrypto";
import { Application } from "xmldsigjs";
Application.setEngine("NodeJS", new Crypto());
```

## License

MIT

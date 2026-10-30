<h1 align="center">
  XMLDSIGjs
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/xmldsigjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/xmldsigjs.svg)](https://www.npmjs.com/package/xmldsigjs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xmldsigjs.svg)](https://www.npmjs.com/package/xmldsigjs)

</div>

XML Digital Signature implementation in TypeScript/JavaScript using Web Crypto API.

## Installation

```bash
npm install xmldsigjs
```

## Breaking Changes In v3

v3 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (was `>=16`). xml-core, xmldsigjs and xadesjs are released together and all move to 3.0.0. CommonJS code can still `require("xmldsigjs")` on these versions; Node.js 22.0–22.11 can't. See the [full notes](https://github.com/PeculiarVentures/xmldsigjs#breaking-changes-in-v3).

- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or configure an ESM-to-CommonJS transformer and make sure `transformIgnorePatterns` doesn't exclude `xmldsigjs` and its peers.
- **Deep imports** (`xmldsigjs/build/...`) are blocked by `exports`; import from `xmldsigjs`.
- **Peer dependencies:** `xml-core` (`^3.0.0`), `pkijs` (`^4.0.0`) and `asn1js` (`^4.0.0`) are peers instead of dependencies, so your app shares one copy with xadesjs. npm installs peers automatically. `xpath` is no longer a direct dependency; it comes with xml-core's peers.

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

> **Note:** The package is ESM-only. CommonJS code can `require()` it on Node.js `^20.19.0 || >=22.12.0`.

xmldsigjs uses Node's built-in WebCrypto (`globalThis.crypto`) by default. To use another implementation, set it explicitly:

```javascript
import * as xmldsigjs from "xmldsigjs";
import { Crypto } from "@peculiar/webcrypto";

xmldsigjs.Application.setEngine("NodeJS", new Crypto());
```

### Browser Setup

```html
<script type="module">
  import * as xmldsigjs from "https://esm.sh/xmldsigjs";
</script>
```

### Signing XML

```javascript
import * as xmldsigjs from "xmldsigjs";
import { Crypto } from "@peculiar/webcrypto";

xmldsigjs.Application.setEngine("NodeJS", new Crypto());

async function signXML() {
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
  const xml = xmldsigjs.Parse("<root><data>Hello World</data></root>");

  // Create signature
  const signedXml = new xmldsigjs.SignedXml();
  await signedXml.Sign({ name: "RSASSA-PKCS1-v1_5" }, keys.privateKey, xml, {
    keyValue: keys.publicKey,
    references: [{ hash: "SHA-256", transforms: ["enveloped", "c14n"] }],
  });

  console.log(signedXml.toString());
}
```

### Verifying XML

```javascript
import * as xmldsigjs from "xmldsigjs";

async function verifyXML(signedXmlString) {
  const doc = xmldsigjs.Parse(signedXmlString);
  const signatures = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

  const signedXml = new xmldsigjs.SignedXml(doc);
  signedXml.LoadXml(signatures[0]);

  const isValid = await signedXml.Verify();
  console.log("Signature valid:", isValid);
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
  id?: string; // Signature ID
  keyValue?: CryptoKey; // Public key for KeyInfo
  x509?: string[]; // X.509 certificates
  references?: OptionsSignReference[]; // Reference elements
}
```

### SignedXml.Verify()

```typescript
Verify(key?: CryptoKey): Promise<boolean>
```

## Node.js: Registering XML Dependencies

To work with XML in Node.js, you need to register DOM and XPath dependencies:

```typescript
import * as xmldom from "@xmldom/xmldom";
import { setNodeDependencies } from "xmldsigjs";
import xpath from "xpath";

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});
```

## WebCrypto Environment

Node.js ships a built‑in WebCrypto (`globalThis.crypto`), which xmldsigjs uses by default. To get the same behavior across environments, you can also use:

```ts
import { Crypto } from "@peculiar/webcrypto";
import { Application } from "xmldsigjs";
Application.setEngine("NodeJS", new Crypto());
```

## License

MIT

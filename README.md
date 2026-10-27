# XMLDSIG Monorepo

![GitHub License](https://img.shields.io/github/license/PeculiarVentures/xmldsigjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/release.yml?branch=master&label=release)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)

A TypeScript/JavaScript implementation of XML security standards using Web Crypto API for both browsers and Node.js.

## Packages

This monorepo contains three interconnected packages:

### [xml-core](./packages/core/README.md)

![NPM License](https://img.shields.io/npm/l/xml-core)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/release.yml?branch=master&label=release)
[![npm version](https://img.shields.io/npm/v/xml-core.svg)](https://www.npmjs.com/package/xml-core)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xml-core.svg)](https://www.npmjs.com/package/xml-core)

A foundational library for working with XML in JavaScript/TypeScript with schema validation through decorators.

### [xmldsigjs](./packages/xmldsig/README.md)

![NPM License](https://img.shields.io/npm/l/xmldsigjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/release.yml?branch=master&label=release)
[![npm version](https://img.shields.io/npm/v/xmldsigjs.svg)](https://www.npmjs.com/package/xmldsigjs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xmldsigjs.svg)](https://www.npmjs.com/package/xmldsigjs)

XML Digital Signature implementation based on Web Crypto API with support for various cryptographic algorithms and canonicalization methods.

### [xadesjs](./packages/xades/README.md)

![NPM License](https://img.shields.io/npm/l/xadesjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/release.yml?branch=master&label=release)
[![npm version](https://img.shields.io/npm/v/xadesjs.svg)](https://www.npmjs.com/package/xadesjs)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xadesjs.svg)](https://www.npmjs.com/package/xadesjs)

XML Advanced Electronic Signatures (XAdES) implementation that extends XMLDSIGjs with additional signature formats and metadata.

## Installation

Each package can be installed independently:

```bash
npm install xml-core        # Core XML utilities
npm install xmldsigjs       # XML Digital Signatures
npm install xadesjs         # XML Advanced Electronic Signatures
```

## Platform Support

All packages work in:

- Modern browsers with Web Crypto API support
- Node.js WebCrypto ([official API](https://nodejs.org/api/webcrypto.html)) and Web Crypto polyfills ([webcrypto](https://github.com/PeculiarVentures/webcrypto))
- Hardware Security Modules via [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

## License

MIT License. See individual package directories for specific license files.

## Related Projects

- [@peculiar/webcrypto](https://github.com/PeculiarVentures/webcrypto)
- [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

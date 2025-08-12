# XMLDSIG Monorepo

[![CI](https://github.com/PeculiarVentures/xmldsigjs/actions/workflows/ci.yml/badge.svg)](https://github.com/PeculiarVentures/xmldsigjs/actions/workflows/ci.yml)

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE)

A TypeScript/JavaScript implementation of XML security standards using Web Crypto API for both browsers and Node.js.

## Packages

This monorepo contains three interconnected packages:

### [xml-core](./packages/core/README.md)

A foundational library for working with XML in JavaScript/TypeScript with schema validation through decorators.

### [xmldsigjs](./packages/xmldsig/README.md)

XML Digital Signature implementation based on Web Crypto API with support for various cryptographic algorithms and canonicalization methods.

### [xadesjs](./packages/xades/README.md)

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

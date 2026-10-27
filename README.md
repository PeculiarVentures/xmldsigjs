<h1 align="center">
  XMLDSIGjs
</h1>

<div align="center">

![GitHub License](https://img.shields.io/github/license/PeculiarVentures/xmldsigjs)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/publish.yml?branch=master&label=publish)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)

</div>

A TypeScript/JavaScript implementation of XML security standards using Web Crypto API for both browsers and Node.js.

## Packages

This monorepo contains three interconnected packages, released together with one version:

- [xml-core](./packages/core/README.md): a foundational library for working with XML in JavaScript/TypeScript with schema validation through decorators.
- [xmldsigjs](./packages/xmldsig/README.md): XML Digital Signature implementation based on Web Crypto API with support for various cryptographic algorithms and canonicalization methods.
- [xadesjs](./packages/xades/README.md): XML Advanced Electronic Signatures (XAdES) implementation that extends XMLDSIGjs with additional signature formats and metadata.

## Installation

```bash
npm install xml-core        # Core XML utilities
npm install xmldsigjs       # XML Digital Signatures
npm install xadesjs         # XML Advanced Electronic Signatures
```

npm 7+ installs the peer dependencies (`xml-core`, `xmldsigjs`, `pkijs`, `asn1js`, `xpath`, `@xmldom/xmldom`) automatically. In Node.js, register `@xmldom/xmldom` and `xpath` with `setNodeDependencies` (see the package READMEs).

## Breaking Changes In v3

v3 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (was `>=16`). xml-core, xmldsigjs and xadesjs now share one version, so all three move to 3.0.0 together (xml-core skips 2 and goes from 1.2.6 to 3.0.0); don't mix them with xml-core 1 or xmldsigjs/xadesjs 2. CommonJS code can still `require()` them on these versions; Node.js 22.0–22.11 can't (`ERR_REQUIRE_ESM`). The public API is unchanged, apart from the decoding changes below.

- **One ESM build per package:** `build/cjs`, `build/esm` and `build/types` are replaced by `build/*.js` with `.d.ts` files next to them. Deep imports (`xmldsigjs/build/...`) are blocked by `exports`; import from the package name.
- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes. Using the classes doesn't need `experimentalDecorators`; only code that declares its own XML schemas with `@XmlElement`/`@XmlChildElement`/`@XmlAttribute` does, as before.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or configure an ESM-to-CommonJS transformer and make sure `transformIgnorePatterns` doesn't exclude `xml-core`, `xmldsigjs`, `xadesjs`, `pkijs`, `asn1js` and `@peculiar/*`.
- **Peer dependencies, one copy per app:** `setNodeDependencies`, the decorator schemas, `Application.setEngine` and the algorithm and transform registries are module-level state, and pkijs checks asn1js objects with `instanceof`, so a second copy of any of these packages breaks at runtime. They are now peers: xmldsigjs has `xml-core` `^3.0.0`, `pkijs` `^4.0.0` and `asn1js` `^4.0.0`; xadesjs has `xml-core` and `xmldsigjs` `^3.0.0`; xml-core keeps `@xmldom/xmldom` `^0.9.10` and `xpath` (now `^0.0.34 || ^0.0.35`). xmldsigjs no longer depends on `xpath` directly. A conflicting version now fails at install (`ERESOLVE`) instead of at runtime.
- **pkijs 4 and asn1js 4:** both are ESM-only, and objects built with asn1js 3 fail their `instanceof` checks; see the [pkijs](https://github.com/PeculiarVentures/PKI.js#breaking-changes-in-v4) and [asn1js](https://github.com/PeculiarVentures/ASN1.js#breaking-changes-in-v4) notes.
- **Stricter decoding in xml-core's `Convert`:** `FromBase64`/`FromBase64Url` throw `TypeError` for text that isn't Base64 (was a `DOMException`); whitespace and missing padding are still accepted. `FromHex` throws `TypeError` for odd-length text or non-hex characters (was silently wrong bytes) and ignores the separators space, tab, newline, `:`, `-` and `.`. `ToUtf8String`/`FromUtf8String` replace invalid UTF-8 and lone surrogates with U+FFFD instead of throwing `URIError`, and `ToUtf8String` no longer overflows the stack on inputs over about 125 KB. `From*` methods are typed `Uint8Array<ArrayBuffer>`.
- **XML passed to `SignedXml` as bytes** is decoded with `TextDecoder`, so invalid UTF-8 becomes U+FFFD instead of throwing `URIError`.
- **Dependencies:** `tslib`, `pvtsutils` and `pvutils` are gone; xml-core and xmldsigjs use `@peculiar/utils` `^4.1.0`.

## Platform Support

All packages work in:

- Modern browsers with Web Crypto API support
- Node.js `^20.19.0 || >=22.12.0` with its WebCrypto ([official API](https://nodejs.org/api/webcrypto.html)) or Web Crypto polyfills ([webcrypto](https://github.com/PeculiarVentures/webcrypto))
- Hardware Security Modules via [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT License. See individual package directories for specific license files.

## Related Projects

- [@peculiar/webcrypto](https://github.com/PeculiarVentures/webcrypto)
- [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11)

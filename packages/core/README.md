<h1 align="center">
  xml-core
</h1>

<div align="center">

![NPM License](https://img.shields.io/npm/l/xml-core)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/PeculiarVentures/xmldsigjs/publish.yml?branch=master&label=publish)
[![npm version](https://img.shields.io/npm/v/xml-core.svg)](https://www.npmjs.com/package/xml-core)
![Coveralls](https://img.shields.io/coverallsCoverage/github/PeculiarVentures/xmldsigjs)
[![npm downloads](https://img.shields.io/npm/dm/xml-core.svg)](https://www.npmjs.com/package/xml-core)

</div>

A foundational library for working with XML in JavaScript/TypeScript with schema validation through decorators.

## Installation

```bash
npm install xml-core
```

## Breaking Changes In v3

v3 is ESM-only and requires Node.js `^20.19.0 || >=22.12.0` (was `>=16`). xml-core, xmldsigjs and xadesjs are released together and all move to 3.0.0. CommonJS code can still `require("xml-core")` on these versions; Node.js 22.0–22.11 can't. See the [full notes](https://github.com/PeculiarVentures/xmldsigjs#breaking-changes-in-v3).

- **TypeScript compiling to CommonJS:** use `"module": "node20"` or `"nodenext"` (`node16` fails with TS1479). ESM and bundler setups need no changes.
- **Jest in CommonJS mode:** switch to ESM mode or Vitest, or configure an ESM-to-CommonJS transformer and make sure `transformIgnorePatterns` doesn't exclude `xml-core` and its peers.
- **Deep imports** (`xml-core/build/...`) are blocked by `exports`; import from `xml-core`.
- **Peer dependencies:** `@xmldom/xmldom` (`^0.9.10`) and `xpath` (`^0.0.34 || ^0.0.35`) stay peers. xmldsigjs and xadesjs have xml-core `^3.0.0` as a peer, so your app shares one copy (`setNodeDependencies` and the decorator schemas are module-level state).
- **Stricter `Convert`:** Base64 and hex decoding throw `TypeError` for invalid text, and UTF-8 helpers replace invalid input with U+FFFD instead of throwing `URIError`. See the full notes.

## Features

- Convert XML to JSON and JSON to XML with schema enforcement
- TypeScript decorators for XML element definitions
- Support for attributes, child elements, and content
- Cross-platform compatibility (browser and Node.js)

## Quick Start

```typescript
import { XmlObject, XmlElement, XmlAttribute, XmlChildElement } from "xml-core";

@XmlElement({ localName: "Person" })
class Person extends XmlObject {
  @XmlAttribute({ localName: "id" })
  public id: string = "";

  @XmlChildElement({ localName: "Name" })
  public name: string = "";
}

// Parse XML
const person = new Person();
person.LoadXml('<Person id="123"><Name>John Doe</Name></Person>');
console.log(person.id); // "123"
console.log(person.name); // "John Doe"

// Generate XML
person.id = "456";
person.name = "Jane Smith";
console.log(person.toString()); // <Person id="456"><Name>Jane Smith</Name></Person>
```

## Decorators

### @XmlElement

Class decorator for XML element schema:

```typescript
@XmlElement({
  localName: "MyElement",      // Element name (default: class name)
  namespaceURI?: string,       // Namespace URI
  prefix?: string              // Namespace prefix
})
```

### @XmlAttribute

Property decorator for XML attributes:

```typescript
@XmlAttribute({
  localName: "attr",           // Attribute name (default: property name)
  namespaceURI?: string,       // Namespace URI
  prefix?: string,             // Namespace prefix
  defaultValue?: any,          // Default value
  required?: boolean,          // Is required (default: false)
  converter?: IConverter       // Custom converter
})
```

### @XmlChildElement

Property decorator for child elements:

```typescript
@XmlChildElement({
  localName: "Child",          // Element name (default: property name)
  namespaceURI?: string,       // Namespace URI
  prefix?: string,             // Namespace prefix
  parser?: typeof XmlObject,   // Parser class
  required?: boolean,          // Is required (default: false)
  converter?: IConverter       // Custom converter
})
```

## API Reference

### XmlObject

Base class for all XML elements.

#### Methods

- `LoadXml(xml: string | Node)` - Parse XML into object
- `GetXml()` - Convert object to XML node
- `toString()` - Convert object to XML string

## Node.js: Registering XML Dependencies

To work with XML in Node.js, you need to register DOM and XPath dependencies:

```typescript
import * as xmldom from "@xmldom/xmldom";
import { setNodeDependencies } from "xml-core";
import xpath from "xpath";

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});
```

## License

MIT

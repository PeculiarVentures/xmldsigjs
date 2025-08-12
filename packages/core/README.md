# xml-core

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xmldsigjs/master/LICENSE)
[![npm version](https://badge.fury.io/js/xml-core.svg)](https://badge.fury.io/js/xml-core)

A foundational library for working with XML in JavaScript/TypeScript with schema validation through decorators.

## Installation

```bash
npm install xml-core
```

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
import * as xmldom from '@xmldom/xmldom';
import { setNodeDependencies } from 'xml-core';
import xpath from 'xpath';

setNodeDependencies({
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
  DOMImplementation: xmldom.DOMImplementation,
  xpath,
});
```

## License

  MIT

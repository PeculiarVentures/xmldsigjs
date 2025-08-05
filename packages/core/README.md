
# xml-core

`xml-core` is a set of classes that make it easier to work with XML within the browser and node.

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://raw.githubusercontent.com/PeculiarVentures/xml-core/master/LICENSE)
[![Test](https://github.com/PeculiarVentures/xml-core/actions/workflows/test.yml/badge.svg)](https://github.com/PeculiarVentures/xml-core/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/PeculiarVentures/xml-core/badge.svg?branch=master)](https://coveralls.io/github/PeculiarVentures/xml-core?branch=master)
[![NPM version](https://badge.fury.io/js/xml-core.png)](http://badge.fury.io/js/xml-core)

[![NPM](https://nodei.co/npm/xml-core.png)](https://nodei.co/npm/xml-core/)

## Introduction

We wanted to be able to validate [XAdES](https://en.wikipedia.org/wiki/XAdES) in the browser, specifically so we could validate the signature on the [EU Trust List](https://github.com/PeculiarVentures/tl-create).

This lead us to the creation od [XMLDSIGjs](https://github.com/PeculiarVentures/xmldsigjs) which allows us to validate XML and [XAdESjs](https://github.com/PeculiarVentures/xadesjs) which extends it and enables us to validate XAdES signatures.

We use `xml-core` to make the creation of these libraries easier, we hope you may find it valuable in your own projects also.

Fundementally `xml-core` provides a way to transform XML to JSON and JSON to XML, which enables you to enforce a schema on the associated XML. The goal of this is to let you work naturally with XML in Javascript.

It is similar to [xmljs](https://www.npmjs.com/package/xmljs) but has a few differences -

- Can convert the JSON back to XML,
- Uses [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.61eut6wa9) to make enforcing schema in Javascript more natural.

## Install

```shell
npm install xml-core
```

## Using

### ES5

```javascript
var XmlCore = require("xml-core");
```

### ES2015

```javascript
import XmlCore from "xml-core";
```

## Decrators

Information about decorators [ES2015](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.qnl62mocp), [TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)

### XmlElement

Class decorator which allows to describe schema for xml element

#### Parameters

| Name | Description |
|:----------------|:--------------------------------------------------------------------------------|
| localName       | Sets a local name for xml element. Default value is name of Class               |
| namespaceURI    | Sets a namespace URI for xml element. Default value is `null`                   |
| prefix          | Sets a prefix for xml element. Default value is `null`                          |
| parser          | Sets a parser as `XmlObject` for each child element of `XmlCollection`. Optional|

### XmlAttribute

Property decorator which allows to describe schema for attribute of xml element

__Paramteres__

| Name | Description |
|:----------------|:--------------------------------------------------------------------------------|
| localName       | Sets a local name for xml element. Default value is name of Property            |
| namespaceURI    | Sets a namespace URI for xml element. Default value is `null`                   |
| prefix          | Sets a prefix for attribute of xml element. Default value is `null`             |
| defaultValue    | Sets a default value for attribute of xml element. Optional                     |
| required        | Determines if attribute of xml element is required. Default value is `false`    |
| converter       | Sets a specific converter for attribute of xml element. Default is simple text  |

### XmlChildElement

Property decorator which allows to describe schema for child element of xml element

__Paramteres__

| Name | Description |
|:----------------|:--------------------------------------------------------------------------------|
| localName       | Sets local name for xml element. Default value is name of Class                 |
| namespaceURI    | Sets namespace URI for xml element. Default value is `null`                     |
| prefix          | Sets prefix for xml element. Default value is `null`                            |
| defaultValue    | Sets a default value for attribute of xml element. Optional                     |
| required        | Determines if child element is required. Default value is `false`               |
| converter       | Sets a specific converter for child element. Default is simple text             |
| parser          | Sets parser as `XmlObject` for child element. Optional                          |
| minOccurs       | Sets a min value for child element occurs. Default value is `0`                 |
| maxOccurs       | Sets a max value for child element occurs. Default value is `MAX`               |
| noRoot          | Determines if parser as `XmlCollection` must return it's children to parent element |

### XmlContent

Property decorator which allows to describe schema for content of xml element

__Paramteres__

| Name | Description |
|-----------------|---------------------------------------------------------------------------------|
| defaultValue    | Sets a default value for content of xml element. Optional                       |
| required        | Determines if content of xml element is required. Default value is `false`      |
| converter       | Sets a specific converter for content of xml element. Default is simple text    |

## XmlObject

Base class for XML elements.

### LoadXml

Reads XML from string

```typescript
LoadXml(node: Node | string): void;
static LoadXml(node: Node | string): this;
```

### GetXml

Writes object to XML node

```typescript
GetXml(): Node | null;
```

### toString

Writes object to string

```
toString(): string;
```

__Example__

Target XML [schema]()

```xml
<element name="Signature" type="ds:SignatureType"/>
<complexType name="SignatureType">
  <sequence>
    <element ref="ds:SignedInfo"/>
    <element ref="ds:SignatureValue"/>
    <element ref="ds:KeyInfo" minOccurs="0"/>
    <element ref="ds:Object" minOccurs="0" maxOccurs="unbounded"/>
  </sequence>
  <attribute name="Id" type="ID" use="optional"/>
</complexType>
```

TypeScript implementation of XML schema

```typescript
import { XmlObject, XmlBase64Converter } from "xml-core";

@XmlElement({
    localName: "Signature",
    namespaceURI: "http://www.w3.org/2000/09/xmldsig#",
    prefix: "ds"
})
class Signature extends XmlObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: "",
    })
    public Id: string;

    @XmlChildElement({
        parser: SignedInfo,
        required: true,
    })
    public SignedInfo: SignedInfo;

    @XmlChildElement({
        localName: "SignatureValue",
        namespaceURI: "http://www.w3.org/2000/09/xmldsig#",
        prefix: "ds",
        required: true,
        converter: XmlBase64Converter,
        defaultValue: null,
    })
    public SignatureValue: Uint8Array | null;

    @XmlChildElement({
        parser: KeyInfo
    })
    public KeyInfo: KeyInfo;

    @XmlChildElement({
        parser: DataObjects,
        noRoot: true
    })
    public ObjectList: DataObjects;

}
```

__Using__

```typescript
const signature = new Signature();

// Read XML
signature.LoadXml(Signature.Parse('<ds:Signature Id="sigId">...</ds:signature>'));
console.log("Id:", signature.Id); // Id: sigId

// Write XML
signature.Id = "newId";
console.log(signature.toString()); // <ds:Signature Id="sigId">...</ds:signature>
```

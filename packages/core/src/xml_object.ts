import * as CONST from './const.js';
import { XE, XmlError } from './error.js';
import {
  AssocArray,
  IXmlSerializable,
  XmlAttributeType,
  XmlChildElementType,
  XmlContentType,
  XmlSchema,
} from './types.js';
import { isDocument, isElement, Parse, SelectSingleNode, Stringify } from './utils.js';

const DEFAULT_ROOT_NAME = 'xml_root';

export class XmlObject implements IXmlSerializable {
  public static LoadXml<T extends XmlObject>(this: new () => T, param: string | Element) {
    const xml = new this();
    xml.LoadXml(param);
    return xml;
  }

  public static GetElement(element: Element, name: string, required = true) {
    const xmlNodeList = element.getElementsByTagName(name);
    if (required && xmlNodeList.length === 0) {
      throw new XmlError(XE.ELEMENT_MISSING, name, element.localName);
    }
    return xmlNodeList[0] || null;
  }

  public static GetAttribute(
    element: Element,
    attrName: string,
    defaultValue: string | null,
    required = true,
  ) {
    if (element.hasAttribute(attrName)) {
      return element.getAttribute(attrName);
    } else {
      if (required) {
        throw new XmlError(XE.ATTRIBUTE_MISSING, attrName, element.localName);
      }
      return defaultValue;
    }
  }

  public static GetElementById(element: Document | Element, idValue: string): Element | null;
  public static GetElementById(node: Node, idValue: string) {
    if (node == null || idValue == null) {
      return null;
    }

    // this works only if there's a DTD or XSD available to define the ID
    let xel: Node | null = null;
    if (isDocument(node)) {
      xel = node.getElementById(idValue);
    }
    if (xel == null) {
      // search an "undefined" ID
      xel = SelectSingleNode(node, `//*[@*[local-name()='Id']='${idValue}']`);
      if (xel == null) {
        xel = SelectSingleNode(node, `//*[@*[local-name()='ID']='${idValue}']`);
        if (xel == null) {
          xel = SelectSingleNode(node, `//*[@*[local-name()='id']='${idValue}']`);
        }
      }
    }
    return xel as Element;
  }

  /**
   * Creates new instance of XmlDocument with given name of root element
   * @param  {string} root Name of root element
   * @param  {string} namespaceUri
   * @param  {string} prefix
   * @returns Document
   */
  public static CreateDocument(
    root: string = DEFAULT_ROOT_NAME,
    namespaceUri: string | null = null,
    prefix: string | null = null,
  ): Document {
    if (prefix && !namespaceUri) {
      throw new XmlError(
        XE.PARAM_REQUIRED,
        'namespaceUri',
        `Prefix '${prefix}' requires namespaceUri`,
      );
    }
    let namePrefix = '';
    let nsPrefix = '';
    let namespaceUri2 = '';
    if (prefix) {
      namePrefix = prefix + ':';
      nsPrefix = ':' + prefix;
    }
    if (namespaceUri) {
      namespaceUri2 = ` xmlns${nsPrefix}="${namespaceUri}"`;
    }
    const name = `${namePrefix}${root}`;
    const doc = Parse(`<${name}${namespaceUri2}></${name}>`);
    return doc;
  }

  public static GetChildren(node: Node, localName: string, nameSpace?: string): Element[] {
    node = isDocument(node) ? node.documentElement : node;
    const res: Element[] = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (
        isElement(child) &&
        child.localName === localName &&
        (child.namespaceURI === nameSpace || !nameSpace)
      ) {
        res.push(child);
      }
    }
    return res;
  }

  public static GetFirstChild(node: Node, localName: string, nameSpace?: string): Element | null {
    node = isDocument(node) ? node.documentElement : node;
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (
        isElement(child) &&
        child.localName === localName &&
        (child.namespaceURI === nameSpace || !nameSpace)
      ) {
        return child;
      }
    }
    return null;
  }

  public static GetChild(
    node: Element,
    localName: string,
    nameSpace?: string,
    required = true,
  ): Element | null {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (
        isElement(child) &&
        child.localName === localName &&
        (child.namespaceURI === nameSpace || !nameSpace)
      ) {
        return child;
      }
    }
    if (required) {
      throw new XmlError(XE.ELEMENT_MISSING, localName, node.localName);
    }
    return null;
  }

  protected static attributes: AssocArray<XmlAttributeType<any>>;
  protected static elements: AssocArray<XmlChildElementType<any>>;
  protected static prefix: string | null;
  protected static namespaceURI: string | null;
  protected static localName: string;

  /**
   * XmlElement
   * undefined - class initialized
   * null - has some changes
   * element - has cached element
   *
   * @protected
   * @type {(Element | null | undefined)}
   * @memberOf XmlObject
   */
  protected element?: Element | null;
  protected prefix = this.GetStatic().prefix || null;

  protected localName = this.GetStatic().localName;
  protected namespaceURI = this.GetStatic().namespaceURI;

  constructor(properties: object = {}) {
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (value !== undefined) {
          (this as any)[key] = value;
        }
      }
    }
  }

  public get Element() {
    return this.element;
  }

  public get Prefix() {
    return this.prefix;
  }

  public set Prefix(value: string | null) {
    this.prefix = value;
  }

  public get LocalName(): string {
    return this.localName || '';
  }

  public get NamespaceURI(): string | null {
    return this.namespaceURI || null;
  }

  public HasChanged() {
    const self = this.GetStatic();

    // Check changed elements
    if (self.items) {
      for (const key in self.items) {
        if (!Object.prototype.hasOwnProperty.call(self.items, key)) {
          continue;
        }
        const item: XmlChildElementType<any> = self.items[key];
        const value = (this as any)[key];

        if (item.parser && value && value.HasChanged()) {
          return true;
        }
      }
    }
    return this.element === null;
  }

  public GetXml(hard?: boolean): Element | null {
    if (!(hard || this.HasChanged())) {
      return this.element || null;
    }

    const thisAny = this as any;
    const doc = this.CreateDocument();
    const el = this.CreateElement();
    const self = this.GetStatic();

    const localName: string = this.localName || '';

    // Add attributes
    if (self.items) {
      for (const key in self.items) {
        if (!Object.prototype.hasOwnProperty.call(self.items, key)) {
          continue;
        }
        const parser = thisAny[key];
        const selfItem: any = self.items[key];
        switch (selfItem.type) {
          case CONST.CONTENT: {
            const schema: XmlContentType<any> = selfItem;
            const value = schema.converter ? schema.converter.get(parser) : parser;
            if (schema.required && (value === null || value === void 0)) {
              throw new XmlError(XE.CONTENT_MISSING, localName);
            }

            if (schema.defaultValue !== parser || schema.required) {
              el.textContent = value;
            }
            break;
          }
          case CONST.ATTRIBUTE: {
            const schema: XmlAttributeType<any> = selfItem;
            const value = schema.converter ? schema.converter.get(parser) : parser;
            if (schema.required && (value === null || value === void 0)) {
              throw new XmlError(XE.ATTRIBUTE_MISSING, schema.localName, localName);
            }

            // attr value
            if (schema.defaultValue !== parser || schema.required) {
              if (!schema.namespaceURI) {
                el.setAttribute(schema.localName || '', value);
              } else {
                el.setAttributeNS(schema.namespaceURI, schema.localName || '', value);
              }
            }
            break;
          }
          case CONST.ELEMENT: {
            // Add elements
            const schema = selfItem as XmlChildElementType<any>;
            let node: Element | null = null;

            if (schema.parser) {
              if ((schema.required && !parser) || (schema.minOccurs && !parser.Count)) {
                const missingElement = parser?.localName || schema.localName;
                throw new XmlError(XE.ELEMENT_MISSING, missingElement, localName);
              }

              if (parser) {
                node = parser.GetXml(
                  parser.element === void 0 && (schema.required || parser.Count),
                );
              }
            } else {
              const value = schema.converter ? schema.converter.get(parser) : parser;
              if (schema.required && value === void 0) {
                throw new XmlError(XE.ELEMENT_MISSING, schema.localName, localName);
              }
              if (parser !== schema.defaultValue || schema.required) {
                if (!schema.namespaceURI) {
                  node = doc.createElement(
                    `${schema.prefix ? schema.prefix + ':' : ''}${schema.localName}`,
                  );
                } else {
                  node = doc.createElementNS(
                    schema.namespaceURI,
                    `${schema.prefix ? schema.prefix + ':' : ''}${schema.localName}`,
                  );
                }
                if (Array.isArray(value)) {
                  for (const child of value) {
                    const val = child instanceof XmlObject ? child.GetXml(true) : child;
                    if (val !== null && node) {
                      node.appendChild(val);
                    }
                  }
                } else if (value instanceof XmlObject) {
                  const xmlElement = value.GetXml(true) as Element;
                  if (xmlElement && node) {
                    node.appendChild(xmlElement);
                  }
                } else {
                  if (node) {
                    node.textContent = value;
                  }
                }
              }
            }

            if (node) {
              if (schema.noRoot) {
                const els: Element[] = [];
                // no root
                for (let i = 0; i < node.childNodes.length; i++) {
                  const colNode = node.childNodes.item(i);
                  if (isElement(colNode)) {
                    els.push(colNode);
                  }
                }
                const minOccurs = schema.minOccurs || 0;
                const maxOccurs = schema.maxOccurs || Infinity;
                if (els.length < minOccurs || els.length > maxOccurs) {
                  throw new XmlError(XE.COLLECTION_LIMIT, parser.localName, self.localName);
                }
                els.forEach((e) => el.appendChild(e.cloneNode(true)));
              } else if (
                node.childNodes.length < (schema.minOccurs || 0) ||
                node.childNodes.length > (schema.maxOccurs || Infinity)
              ) {
                throw new XmlError(XE.COLLECTION_LIMIT, parser.localName, self.localName);
              } else {
                el.appendChild(node);
              }
            }
            break;
          }
        }
      }
    }

    // Set custom
    this.OnGetXml(el);

    // Cache compiled elements
    this.element = el;
    return el;
  }

  public LoadXml(param: string | Element) {
    let element: Element;
    const thisAny = this as any;
    if (typeof param === 'string') {
      const doc = Parse(param);
      element = doc.documentElement;
    } else {
      element = param;
    }

    if (!element) {
      throw new XmlError(XE.PARAM_REQUIRED, 'element');
    }

    const self = this.GetStatic();
    const localName = this.localName || '';

    if (!(element.localName === localName && element.namespaceURI == this.NamespaceURI)) {
      throw new XmlError(XE.ELEMENT_MALFORMED, localName);
    }

    // Get attributes
    if (self.items) {
      for (const key in self.items) {
        if (!Object.prototype.hasOwnProperty.call(self.items, key)) {
          continue;
        }
        const selfItem: any = self.items[key];
        switch (selfItem.type) {
          case CONST.CONTENT: {
            const schema: XmlContentType<any> = selfItem;

            if (schema.required && !element.textContent) {
              throw new XmlError(XE.CONTENT_MISSING, localName);
            }

            if (!element.textContent) {
              thisAny[key] = schema.defaultValue;
            } else {
              const value = schema.converter
                ? schema.converter.set(element.textContent)
                : element.textContent;
              thisAny[key] = value;
            }
            break;
          }
          case CONST.ATTRIBUTE: {
            const schema: XmlAttributeType<any> = selfItem;

            let hasAttribute: () => boolean;
            let getAttribute: () => string | null;

            if (!schema.localName) {
              throw new XmlError(XE.PARAM_REQUIRED, 'localName');
            }

            if (schema.namespaceURI) {
              hasAttribute = element.hasAttributeNS.bind(
                element,
                schema.namespaceURI,
                schema.localName,
              );
              getAttribute = element.getAttributeNS.bind(
                element,
                schema.namespaceURI,
                schema.localName,
              );
            } else {
              hasAttribute = element.hasAttribute.bind(element, schema.localName);
              getAttribute = element.getAttribute.bind(element, schema.localName);
            }

            if (schema.required && !hasAttribute()) {
              throw new XmlError(XE.ATTRIBUTE_MISSING, schema.localName, localName);
            }

            if (!hasAttribute()) {
              thisAny[key] = schema.defaultValue;
            } else {
              const attrValue = getAttribute();
              const value =
                schema.converter && attrValue ? schema.converter.set(attrValue) : attrValue;
              thisAny[key] = value;
            }
            break;
          }
          case CONST.ELEMENT: {
            // Get element
            const schema: XmlChildElementType<any> = selfItem;
            // noRoot
            if (schema.noRoot) {
              if (!schema.parser) {
                throw new XmlError(
                  XE.XML_EXCEPTION,
                  `Schema for '${schema.localName}' with flag noRoot must have 'parser'`,
                );
              }
              const col: XmlCollection<any> = new schema.parser() as any;
              if (!(col instanceof XmlCollection)) {
                throw new XmlError(
                  XE.XML_EXCEPTION,
                  `Schema for '${schema.localName}' with flag noRoot must have 'parser' like instance of XmlCollection`,
                );
              }
              (col as any).OnLoadXml(element); // protected member
              delete col.element; // reset cache status

              const minOccurs = schema.minOccurs || 0;
              const maxOccurs = schema.maxOccurs || Infinity;
              if (col.Count < minOccurs || col.Count > maxOccurs) {
                throw new XmlError(
                  XE.COLLECTION_LIMIT,
                  (schema.parser as any).localName,
                  localName,
                );
              }
              thisAny[key] = col;
              continue;
            }

            // Get element by localName
            let foundElement: Element | null = null;
            for (let i = 0; i < element.childNodes.length; i++) {
              const node = element.childNodes.item(i);
              if (!isElement(node)) {
                continue;
              }
              const el = node;
              if (el.localName === schema.localName && el.namespaceURI == schema.namespaceURI) {
                foundElement = el;
                break;
              }
            }

            // required
            if (schema.required && !foundElement) {
              throw new XmlError(
                XE.ELEMENT_MISSING,
                schema.parser ? (schema.parser as any).localName : schema.localName,
                localName,
              );
            }

            if (!schema.parser) {
              // simple element
              if (!foundElement) {
                thisAny[key] = schema.defaultValue;
              } else {
                const textContent = foundElement.textContent || '';
                const value = schema.converter ? schema.converter.set(textContent) : textContent;
                thisAny[key] = value;
              }
            } else {
              // element
              if (foundElement) {
                const value = new schema.parser() as IXmlSerializable;
                (value as any).localName = schema.localName;
                (value as any).namespaceURI = schema.namespaceURI;
                thisAny[key] = value;
                value.LoadXml(foundElement);
              }
            }
            break;
          }
        }
      }
    }

    // Get custom
    this.OnLoadXml(element);

    this.prefix = element.prefix || '';
    this.element = element;
  }

  /**
   * Returns current Xml as string
   * - if element was initialized without changes, returns empty string
   */
  public toString(): string {
    const xml = this.GetXml();
    return xml ? Stringify(xml) : '';
  }

  public GetElement(name: string, required = true) {
    if (!this.element) {
      throw new XmlError(XE.NULL_PARAM, this.localName);
    }
    return XmlObject.GetElement(this.element, name, required);
  }

  public GetChildren(localName: string, nameSpace?: string) {
    if (!this.element) {
      throw new XmlError(XE.NULL_PARAM, this.localName);
    }
    return XmlObject.GetChildren(
      this.element,
      localName,
      nameSpace || this.NamespaceURI || undefined,
    );
  }

  public GetChild(localName: string, required = true): Element | null {
    if (!this.element) {
      throw new XmlError(XE.NULL_PARAM, this.localName);
    }
    return XmlObject.GetChild(this.element, localName, this.NamespaceURI || undefined, required);
  }

  public GetFirstChild(localName: string, namespace?: string) {
    if (!this.element) {
      throw new XmlError(XE.NULL_PARAM, this.localName);
    }
    return XmlObject.GetFirstChild(this.element, localName, namespace);
  }

  public GetAttribute(name: string, defaultValue: string | null, required = true) {
    if (!this.element) {
      throw new XmlError(XE.NULL_PARAM, this.localName);
    }
    return XmlObject.GetAttribute(this.element, name, defaultValue, required);
  }

  public IsEmpty() {
    return this.Element === void 0;
  }

  protected OnLoadXml(_element: Element) {
    // Empty
  }

  protected GetStatic(): XmlSchema {
    return this.constructor as XmlSchema;
  }

  protected GetPrefix(): string {
    return this.Prefix ? this.prefix + ':' : '';
  }

  protected OnGetXml(_element: Element) {
    // Empty
  }

  protected CreateElement(
    document?: Document,
    localName?: string,
    namespaceUri: string | null = null,
    prefix: string | null = null,
  ) {
    if (!document) {
      const createdDocument = this.CreateDocument();
      if (createdDocument) {
        document = createdDocument;
      } else {
        throw new XmlError(XE.XML_EXCEPTION, 'Document not created');
      }
    }
    localName = localName || this.localName;
    namespaceUri = namespaceUri || this.NamespaceURI;
    prefix = prefix || this.prefix;

    const tagName = (prefix ? `${prefix}:` : '') + localName;
    const xn =
      namespaceUri && document
        ? document.createElementNS(namespaceUri, tagName)
        : document?.createElement(tagName);
    if (document && xn) {
      document.importNode(xn, true);
    }

    return xn;
  }

  protected CreateDocument() {
    return XmlObject.CreateDocument(this.localName, this.NamespaceURI, this.Prefix);
  }
}

import { XmlCollection } from './xml_collection.js';

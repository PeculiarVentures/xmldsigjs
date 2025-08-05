/**
 * Base interface for collections
 *
 * @interface ICollection
 * @template I
 */
export interface ICollection<I> {
  readonly Count: number;
  Item(index: number): I | null;
  Add(item: I): void;
  Pop(): I | undefined;
  RemoveAt(index: number): void;
  Clear(): void;
  GetIterator(): I[];
  ForEach(cb: (item: I, index: number, array: I[]) => void): void;
  Map<U>(cb: (item: I, index: number, array: I[]) => U): ICollection<U>;
  Filter(cb: (item: I, index: number, array: I[]) => boolean): ICollection<I>;
  Sort(cb: (a: I, b: I) => number): ICollection<I>;
  Every(cb: (value: I, index: number, array: I[]) => boolean): boolean;
  Some(cb: (value: I, index: number, array: I[]) => boolean): boolean;
  IsEmpty(): boolean;
}

export interface IXmlSerializable {

  /**
     * Writes object to XML node
     * - if class was initialized and it has no one change, GetXml returns null
     * @returns Node
     */
  GetXml(): Node | null;
  /**
     * Reads XML from string
     * @param  {Node} node
     * @returns void
     */
  LoadXml(node: Node | string): void;
}

export type IXmlSerializableConstructor = new () => IXmlSerializable;

/**
 * Base type for associated arrays
 *
 * @interface AssocArray
 * @template T
 */
export type AssocArray<T> = Record<string, T>;

export declare type XmlBufferEncoding = string | 'utf8' | 'binary' | 'hex' | 'base64' | 'base64url';

export declare type ISelectResult = Node[] | Node | boolean | number | string;

export interface XmlNamespace {
  /**
     * Prefix
     *
     * @type {(string |)}
     * @memberOf XmlNamespace
     */
  prefix: string | null;
  /**
     * Namespace URI
     *
     * @type {(string |)}
     * @memberOf XmlNamespace
     */
  namespace: string | null;
}

export interface XmlSchemaItemBase {
  /**
     * Local name of item
     *
     * @type {string}
     * @memberOf XmlSchemaItemBase
     */
  localName?: string;
  /**
     * Namespace URI of attribute
     *
     * @type {(string |)}
     * @memberOf XmlSchemaItemBase
     */
  namespaceURI?: string | null;

  /**
     * Default prefix for Xml element
     *
     * @type {(string |)}
     * @memberOf XmlSchemaItemBase
     */
  prefix?: string | null;
}

export interface XmlSchemaItem<T> extends XmlSchemaItemBase {
  /**
     * Default value for item
     *
     * @type {(T |)}
     * @memberOf XmlSchemaItem
     */
  defaultValue?: T | null;
  /**
     * Determine where item is required
     *
     * @type {boolean}
     * @memberOf XmlSchemaItem
     */
  required?: boolean;
  /**
     * Custom converter for item value
     *
     * @type {IConverter<T>}
     * @memberOf XmlAttributeType
     */
  converter?: IConverter<T>;
}

export interface XmlSchemaItemParser {
  /**
     * Xml parser for item
     *
     * @type {*}
     * @memberOf XmlSchemaItemParser
     */
  parser?: IXmlSerializableConstructor;
}

export interface XmlAttributeType<T> extends XmlSchemaItem<T> {
}

export interface XmlContentType<T> {
  /**
     * Default value for item
     *
     * @type {(T |)}
     * @memberOf XmlContentType
     */
  defaultValue?: T | null;
  /**
     * Determine where item is required
     *
     * @type {boolean}
     * @memberOf XmlContentType
     */
  required?: boolean;
  /**
     * Custom converter for item value
     *
     * @type {IConverter<T>}
     * @memberOf XmlContentType
     */
  converter?: IConverter<T>;
}

export interface XmlElementType extends XmlSchemaItemBase, XmlSchemaItemParser {
  /**
     * Local name for Xml element
     *
     * @type {string}
     * @memberOf XmlElementType
     */
  localName: string;
  /**
     * Namespace URI fro Xml element
     *
     * @type {(string |)}
     * @memberOf XmlElementType
     */
  namespaceURI?: string | null;
}

export interface XmlChildElementType<T> extends XmlSchemaItem<T>, XmlSchemaItemParser {
  /**
     * max occurs of items in collection
     *
     * @type {number}
     * @memberOf XmlChildElementType
     */
  maxOccurs?: number;
  /**
     * min occurs of items in collection
     *
     * @type {number}
     * @memberOf XmlChildElementType
     */
  minOccurs?: number;
  /**
     * Don't add root element of XmlCollection to compiled element
     *
     * @type {boolean}
     * @memberOf XmlChildElementType
     */
  noRoot?: boolean;
}

export interface XmlSchema {
  localName?: string;
  namespaceURI?: string | null;
  prefix?: string | null;
  parser?: IXmlSerializableConstructor;
  items?: Record<string, (XmlChildElementType<any> | XmlAttributeType<any>) & { type?: string }>;
  target?: any;
}

export interface IConverter<T> {
  /**
     * Converts value from Xml element to Object
     *
     * @memberOf IConverter
     */
  set: (value: string) => T;
  /**
     * Converts value from Object to Xml element
     *
     * @memberOf IConverter
     */
  get: (value: T) => string | undefined;
}

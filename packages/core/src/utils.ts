import { type AssocArray } from './types.js';
import { APPLICATION_XML, XmlNodeType } from './xml.js';

export type SelectNodes = (node: Node, xPath: string) => Node[];

// Browser XPath implementation
function SelectNodesEx(node: Node, xPath: string): Node[] {
  const doc: Document = node.ownerDocument == null ? (node as Document) : node.ownerDocument;
  const nsResolver = document.createNSResolver(
    node.ownerDocument == null
      ? (node as Document).documentElement
      : node.ownerDocument.documentElement,
  );
  const personIterator = doc.evaluate(xPath, node, nsResolver, XPathResult.ANY_TYPE, null);
  const ns: Node[] = [];
  let n: Node | null;
  while ((n = personIterator.iterateNext())) {
    ns.push(n);
  }
  return ns;
}

// Node.js XPath implementation
function SelectNodesNode(node: Node, xPath: string): Node[] {
  const xpath = getNodeDependency<any>('xpath').select;
  return xpath(xPath, node);
}

export const Select: SelectNodes = typeof self !== 'undefined' ? SelectNodesEx : SelectNodesNode;

export function Parse(xmlString: string) {
  xmlString = xmlString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  let DOMParserCtor: typeof DOMParser;
  if (typeof DOMParser !== 'undefined') {
    DOMParserCtor = DOMParser;
  } else {
    DOMParserCtor = getNodeDependency<any>('DOMParser');
  }

  return new DOMParserCtor().parseFromString(xmlString, APPLICATION_XML);
}

export function Stringify(target: Node) {
  let XMLSerializerCtor: typeof XMLSerializer;
  if (typeof XMLSerializer !== 'undefined') {
    XMLSerializerCtor = XMLSerializer;
  } else {
    XMLSerializerCtor = getNodeDependency<any>('XMLSerializer');
  }

  return new XMLSerializerCtor().serializeToString(target);
}

/**
 * Returns single Node from given Node
 *
 * @export
 * @param {Node} node
 * @param {string} path
 * @returns
 */
export function SelectSingleNode(node: Node, path: string) {
  const ns = Select(node, path);
  if (ns && ns.length > 0) {
    return ns[0];
  }
  return null;
}

function _SelectNamespaces(node: Node, selectedNodes: AssocArray<string> = {}) {
  if (isElement(node)) {
    if (
      node.namespaceURI &&
      node.namespaceURI !== 'http://www.w3.org/XML/1998/namespace' &&
      !selectedNodes[node.prefix || '']
    ) {
      selectedNodes[node.prefix ? node.prefix : ''] = node.namespaceURI;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes.item(i);
      if (childNode && childNode.nodeType === XmlNodeType.Element) {
        _SelectNamespaces(childNode, selectedNodes);
      }
    }
  }
}

export function SelectNamespaces(node: Element) {
  const attrs: AssocArray<string> = {};
  _SelectNamespaces(node, attrs);
  return attrs;
}

export function assign(_target: any, ...sources: any[]) {
  const res = sources.length > 0 ? sources[0] : _target;
  for (let i = 1; i < sources.length; i++) {
    const obj = sources[i];
    for (const prop in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        continue;
      }
      res[prop] = obj[prop];
    }
  }
  return res;
}

/**
 * Returns true if object is a XML of specified type
 * @param obj Object to test
 * @param type XML Node type
 */
function isNodeType(obj: any, type: XmlNodeType) {
  return obj && obj.nodeType === type;
}

/**
 * Returns true if object is a XML Element
 * @param obj Object to test
 */
export function isElement(obj: any): obj is Element {
  return isNodeType(obj, XmlNodeType.Element);
}

/**
 * Returns true if object is a XML Document
 * @param obj Object to test
 */
export function isDocument(obj: any): obj is Document {
  return isNodeType(obj, XmlNodeType.Document);
}

const nodeDependencies = new Map<string, any>();

/**
 * Sets multiple node dependencies by updating the internal `nodeDependencies` map
 * with the provided key-value pairs.
 *
 * @param deps - An object containing dependency names as keys and their corresponding values.
 *
 * @since 1.2.0
 */
export function setNodeDependencies(deps: Record<string, any>) {
  for (const key in deps) {
    nodeDependencies.set(key, deps[key]);
  }
}

/**
 * Retrieves a registered node dependency by its key.
 *
 * @template T The expected type of the dependency.
 * @param key - The unique key identifying the dependency.
 * @returns The dependency associated with the given key, cast to type T.
 * @throws {Error} If the dependency is not found for the provided key.
 *
 * @remarks
 * Dependencies must be registered using `setNodeDependencies` before retrieval.
 *
 * @since 1.2.0
 */
export function getNodeDependency<T = any>(key: string): T {
  const dep = nodeDependencies.get(key);
  if (!dep) {
    throw new Error(
      `Node dependency not found: ${key}. Please use 'setNodeDependencies' to register it.`,
    );
  }
  return dep as T;
}

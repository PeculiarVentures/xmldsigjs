import { getNodeDependency, XmlChildElement, XmlError, XE } from 'xml-core';

import { Transform } from '../transform.js';
import { XmlSignature } from '../xml_names.js';

function lookupParentNode(node: Node): Node {
  return node.parentNode ? lookupParentNode(node.parentNode) : node;
}

/**
 * Represents the <XPath> element of an XML signature.
 *
 * ```xml
 * <complexType name="TransformType" mixed="true">
 *   <choice minOccurs="0" maxOccurs="unbounded">
 *     <any namespace="##other" processContents="lax"/>
 *     <!-- (1,1) elements from (0,unbounded) namespaces -->
 *     <element name="XPath" type="string"/>
 *   </choice>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 * ```
 */

export class XmlDsigXPathTransform extends Transform {
  public Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform;

  @XmlChildElement({
    localName: XmlSignature.ElementNames.XPath,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    required: true,
  })
  public XPath: string;

  /**
   * Returns the output of the current XmlDsigXPathTransform object
   */
  public GetOutput(): any {
    if (!this.innerXml) {
      throw new XmlError(XE.PARAM_REQUIRED, 'innerXml');
    }

    this.Filter(lookupParentNode(this.innerXml), this.XPath);
  }

  protected Filter(node: Node, xpath: string) {
    const childNodes = node.childNodes;
    const nodes: Node[] = [];
    for (let i = 0; childNodes && i < childNodes.length; i++) {
      const child = childNodes.item(i);
      nodes.push(child);
    }

    nodes.forEach((child) => {
      if (this.Evaluate(child, xpath)) {
        // Remove child
        if (child.parentNode) {
          child.parentNode.removeChild(child);
        }
      } else {
        this.Filter(child, xpath);
      }
    });
  }

  protected GetEvaluator(node: Node): XPathEvaluator {
    if (typeof self !== 'undefined') {
      // Browser
      return (node.ownerDocument == null ? node : node.ownerDocument) as any;
    } else {
      return getNodeDependency<XPathEvaluator>('xpath');
    }
  }

  protected Evaluate(node: Node, xpath: string) {
    try {
      const evaluator = this.GetEvaluator(node);
      const xml = this.GetXml();
      if (!xml || !xml.firstChild) {
        throw new Error('XML element or firstChild is not defined');
      }
      const xpathEl = xml.firstChild;
      const xPath = `boolean(${xpath})`;
      const xpathModule = typeof self === 'undefined' ? getNodeDependency('xpath') : self;
      const xpathResult = evaluator.evaluate(
        xPath,
        node,
        {
          lookupNamespaceURI: (prefix: string | null) => {
            return xpathEl.lookupNamespaceURI(prefix);
          },
        },
        xpathModule.XPathResult.ANY_TYPE,
        null,
      );
      return !xpathResult.booleanValue;
    } catch {
      return false;
    }
  }
}

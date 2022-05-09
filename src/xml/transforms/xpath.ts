import * as XmlCore from "xml-core";

import { Transform } from "../transform";
import { XmlSignature } from "../xml_names";

function lookupParentNode(node: Node): Node {
    return node.parentNode
        ? lookupParentNode(node.parentNode)
        : node;
}

/**
 * <complexType name="TransformType" mixed="true">
 *   <choice minOccurs="0" maxOccurs="unbounded">
 *     <any namespace="##other" processContents="lax"/>
 *     <!-- (1,1) elements from (0,unbounded) namespaces -->
 *     <element name="XPath" type="string"/>
 *   </choice>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 */

export class XmlDsigXPathTransform extends Transform {

    public Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform;

    @XmlCore.XmlChildElement({
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
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
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
        if (typeof (self) !== "undefined") {
            // Browser
            return (node.ownerDocument == null ? node : node.ownerDocument) as any;
        } else {
            // NodeJS
            return require("xpath");
        }
    }

    protected Evaluate(node: Node, xpath: string) {
        try {
            const evaluator = this.GetEvaluator(node);
            const xpathEl = this.GetXml()!.firstChild!;
            const xPath = `boolean(${xpath})`;
            const xpathResult = evaluator.evaluate(
                xPath,
                node,
                {
                    lookupNamespaceURI: (prefix: string | null) => {
                        return xpathEl.lookupNamespaceURI(prefix);
                    },
                },
                (typeof (self) === "undefined" ? require("xpath") : self).XPathResult.ANY_TYPE,
                null);
            return !xpathResult.booleanValue;
        } catch (e) {
            return false;
        }
    }

}

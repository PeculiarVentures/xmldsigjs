import { XmlError, XE } from "xml-core";
import { XmlElement, XmlChildElement, XmlAttribute } from "xml-core";

import { XmlSignature } from "./xml_names";
import { XmlSignatureObject, XmlSignatureCollection } from "./xml_object";

/**
 * 
 * <element name="Transforms" type="ds:TransformsType"/>
 * <complexType name="TransformsType">
 *   <sequence>
 *     <element ref="ds:Transform" maxOccurs="unbounded"/>
 *   </sequence>
 * </complexType>
 * 
 * <element name="Transform" type="ds:TransformType"/>
 * <complexType name="TransformType" mixed="true">
 *   <choice minOccurs="0" maxOccurs="unbounded">
 *     <any namespace="##other" processContents="lax"/>
 *     <!--  (1,1) elements from (0,unbounded) namespaces  -->
 *     <element name="XPath" type="string"/>
 *   </choice>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 * 
 */

export interface ITransform extends XmlCore.IXmlSerializable {
    Algorithm: string;
    LoadInnerXml(node: Node): void;
    GetInnerXml(): Node | null;
    GetOutput(): any;
}

export interface ITransformConstructable {
    new (): Transform;
}

/**
 * The Transform element contains a single transformation
 */
@XmlElement({
    localName: XmlSignature.ElementNames.Transform
})
export class Transform extends XmlSignatureObject implements ITransform {

    protected innerXml: Node | null = null;

    // Public properties
    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        defaultValue: ""
    })
    public Algorithm: string;

    /**
     * XPath of the transformation
     */
    @XmlChildElement({
        localName: XmlSignature.ElementNames.XPath,
        defaultValue: ""
    })
    public XPath: string;


    // Public methods

    /**
     * When overridden in a derived class, returns the output of the current Transform object.
     */
    GetOutput(): string {
        throw new XmlError(XE.METHOD_NOT_IMPLEMENTED);
    }

    LoadInnerXml(node: Node) {
        if (!node)
            throw new XmlError(XE.PARAM_REQUIRED, "node");
        this.innerXml = node;
    }

    GetInnerXml(): Node | null {
        return this.innerXml;
    }

}

/**
 * The Transforms element contains a collection of transformations
 */
@XmlElement({
    localName: XmlSignature.ElementNames.Transforms,
    parser: Transform
})
export class Transforms extends XmlSignatureCollection<Transform> {
    protected OnLoadXml(element: Element) {
        super.OnLoadXml(element);
        // Update parsed objects
        this.items = this.GetIterator().map(item => {
            switch (item.Algorithm) {
                case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                    return ChangeTransform(item, transforms.XmlDsigEnvelopedSignatureTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                    return ChangeTransform(item, transforms.XmlDsigC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                    return ChangeTransform(item, transforms.XmlDsigC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                    return ChangeTransform(item, transforms.XmlDsigExcC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                    return ChangeTransform(item, transforms.XmlDsigExcC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                    return ChangeTransform(item, transforms.XmlDsigBase64Transform);
                default:
                    throw new XmlError(XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, item.Algorithm);
            }
        });
    }
}

function ChangeTransform(t1: Transform, t2: typeof Transform) {
    let t = new t2();
    (t as any).element = t1.Element;
    return t;
}

import * as transforms from "./transforms";
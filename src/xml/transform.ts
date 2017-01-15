import { XmlError, XE } from "xml-core";
import { XmlElement, XmlChildElement, XmlAttribute } from "xml-core";

import { XmlSignature } from "./xml_names";
import { XmlSignatureObject } from "./xml_object";

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

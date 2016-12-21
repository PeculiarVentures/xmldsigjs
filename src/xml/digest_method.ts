import { XmlElement, XmlAttribute } from "xml-core";

import { XmlSignatureObject } from "./xml_object";
import { XmlSignature } from "./xml_names";

/**
 * 
 * <element name="DigestMethod" type="ds:DigestMethodType"/>
 * <complexType name="DigestMethodType" mixed="true">
 *   <sequence>
 *     <any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 * 
 */

@XmlElement({
    localName: XmlSignature.ElementNames.DigestMethod
})
export class DigestMethod extends XmlSignatureObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: XmlSignature.DefaultDigestMethod
    })
    public Algorithm: string;

}
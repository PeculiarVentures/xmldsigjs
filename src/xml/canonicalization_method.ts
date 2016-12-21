import {XmlElement, XmlAttribute} from "xml-core";

import {XmlSignatureObject} from "./xml_object";
import {XmlSignature} from "./xml_names";

/**
 * 
 * <element name="CanonicalizationMethod" type="ds:CanonicalizationMethodType"/>
 * <complexType name="CanonicalizationMethodType" mixed="true">
 *   <sequence>
 *     <any namespace="##any" minOccurs="0" maxOccurs="unbounded"/>
 *     <!--  (0,unbounded) elements from (1,1) namespace  -->
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 * 
 */

/**
 * 
 * 
 * @export
 * @class CanonicalizationMethod
 * @extends {XmlSignatureObject}
 */
@XmlElement({
    localName: XmlSignature.ElementNames.CanonicalizationMethod
})
export class CanonicalizationMethod extends XmlSignatureObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: XmlSignature.DefaultCanonMethod
    })
    public Algorithm: string;

}
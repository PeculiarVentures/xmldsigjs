import * as XmlCore from "xml-core";
import { XmlElement, XmlChildElement, XmlAttribute, XmlObject } from "xml-core";
import { XmlNumberConverter } from "xml-core";

import { XmlSignatureObject, XmlSignatureCollection } from "./xml_object";
import { XmlSignature } from "./xml_names";
import { PssAlgorithmParams } from "./key_infos";

/**
 * 
 * <element name="SignatureMethod" type="ds:SignatureMethodType"/>
 * <complexType name="SignatureMethodType" mixed="true">
 *   <sequence>
 *     <element name="HMACOutputLength" minOccurs="0" type="ds:HMACOutputLengthType"/>
 *     <any namespace="##other" minOccurs="0" maxOccurs="unbounded"/>
 *     <!--
 *     (0,unbounded) elements from (1,1) external namespace 
 *     -->
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 *
 */

@XmlElement({
    localName: "Other",
})
class SignatureMethodOther extends XmlSignatureCollection<XmlObject> {

    OnLoadXml(element: Element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            let node = element.childNodes.item(i) as Element;
            if (node.nodeType !== XmlCore.XmlNodeType.Element ||
                node.nodeName === XmlSignature.ElementNames.HMACOutputLength) // Exclude HMACOutputLength
                continue;
            let ParserClass: typeof XmlObject | undefined;
            switch (node.localName) {
                case XmlSignature.ElementNames.RSAPSSParams:
                    ParserClass = PssAlgorithmParams;
                    break;
                default:
                    break;
            }
            if (ParserClass) {
                let xml = new ParserClass();
                xml.LoadXml(node);
                this.Add(xml);
            }
        }
    }

}

@XmlElement({
    localName: XmlSignature.ElementNames.SignatureMethod
})
export class SignatureMethod extends XmlSignatureObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: ""
    })
    public Algorithm: string;

    /**
     * Parameters for the XML Signature HMAC Algorithm.
     * The parameters include an optional output length which specifies the MAC truncation length in bits.
     * 
     * @type {number}
     * @memberOf SignatureMethod
     */
    @XmlChildElement({
        localName: XmlSignature.ElementNames.HMACOutputLength,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        converter: XmlNumberConverter,
    })
    public HMACOutputLength: number;

    @XmlChildElement({
        parser: SignatureMethodOther,
        noRoot: true,
        minOccurs: 0,
    })
    public Any: SignatureMethodOther;

}
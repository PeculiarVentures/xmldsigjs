import { XmlNodeType, XmlError, XE } from "xml-core";
import { XmlElement, XmlAttribute } from "xml-core";

import { XmlSignature } from "./xml_names";
import { XmlSignatureCollection } from "./xml_object";
import { KeyInfoX509Data, KeyValue, SPKIData, KeyInfoClause } from "./key_infos";

/**
 * 
 * <element name="KeyInfo" type="ds:KeyInfoType"/>
 * <complexType name="KeyInfoType" mixed="true">
 *   <choice maxOccurs="unbounded">
 *     <element ref="ds:KeyName"/>
 *     <element ref="ds:KeyValue"/>
 *     <element ref="ds:RetrievalMethod"/>
 *     <element ref="ds:X509Data"/>
 *     <element ref="ds:PGPData"/>
 *     <element ref="ds:SPKIData"/>
 *     <element ref="ds:MgmtData"/>
 *     <any processContents="lax" namespace="##other"/>
 *     <!--  (1,1) elements from (0,unbounded) namespaces  -->
 *   </choice>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 * 
 */

/**
 * Represents an XML digital signature or XML encryption <KeyInfo> element.
 */
@XmlElement({
    localName: XmlSignature.ElementNames.KeyInfo
})
export class KeyInfo extends XmlSignatureCollection<KeyInfoClause> {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: ""
    })
    public Id: string;

    protected OnLoadXml(element: Element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            let node = element.childNodes.item(i);
            if (node.nodeType !== XmlNodeType.Element)
                continue;
            let KeyInfoClass: any | null = null;
            switch (node.localName) {
                case XmlSignature.ElementNames.KeyValue:
                    KeyInfoClass = KeyValue;
                    break;
                case XmlSignature.ElementNames.X509Data:
                    KeyInfoClass = KeyInfoX509Data;
                    break;
                case XmlSignature.ElementNames.SPKIData:
                    KeyInfoClass = SPKIData;
                    break;
                case XmlSignature.ElementNames.KeyName:
                case XmlSignature.ElementNames.RetrievalMethod:
                case XmlSignature.ElementNames.PGPData:
                case XmlSignature.ElementNames.MgmtData:
            }
            if (KeyInfoClass) {
                const item = new KeyInfoClass();
                item.LoadXml(node);
                if (item instanceof KeyValue) {
                    // Read KeyValue
                    let keyValue: KeyInfoClause | null = null;
                    [RsaKeyValue, EcdsaKeyValue].some(KeyClass => {
                        try {
                            const k = new KeyClass();
                            for (let i = 0; i < node.childNodes.length; i++) {
                                let nodeKey = node.childNodes.item(i);
                                if (nodeKey.nodeType !== XmlNodeType.Element)
                                    continue;
                                k.LoadXml(nodeKey as Element);
                                keyValue = k;
                                return true;
                            }
                        }
                        catch (e) { }
                        return false;
                    });
                    if (keyValue) {
                        item.Value = keyValue;
                    }
                    else {
                        throw new XmlError(XE.CRYPTOGRAPHIC, "Unsupported KeyValue in use");
                    }
                }
                this.Add(item);
            }
        }
    }

}

import { RsaKeyValue, EcdsaKeyValue } from "./key_infos";
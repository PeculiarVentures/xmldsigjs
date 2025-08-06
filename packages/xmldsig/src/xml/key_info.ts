import { XmlNodeType, XmlAttribute, XmlElement } from 'xml-core';

import { KeyInfoClause, KeyInfoX509Data, KeyValue, SPKIData } from './key_infos';
import { XmlSignature } from './xml_names';
import { XmlSignatureCollection } from './xml_object';

/**
 * Represents the <KeyInfo> element of an XML signature.
 *
 * ```xml
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
 * ```
 */

/**
 * Represents an XML digital signature or XML encryption <KeyInfo> element.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.KeyInfo,
})
export class KeyInfo extends XmlSignatureCollection<KeyInfoClause> {
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Id,
    defaultValue: '',
  })
  public Id: string;

  protected OnLoadXml(element: Element) {
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes.item(i);
      if (node.nodeType !== XmlNodeType.Element) {
        continue;
      }
      let KeyInfoClass: any | null = null;
      switch ((node as Element).localName) {
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
        this.Add(item);
      }
    }
  }
}

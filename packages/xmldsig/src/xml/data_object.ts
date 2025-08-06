import { XmlAttribute, XmlElement } from 'xml-core';

import { XmlSignature } from './xml_names';
import { XmlSignatureCollection, XmlSignatureObject } from './xml_object';

// XmlElement part of the signature
// Note: Looks like KeyInfoNode (but the later is XmlElement inside KeyInfo)
// required for "enveloping signatures"

/**
 * Represents the <Object> element of an XML signature.
 *
 * ```xml
 * <element name='Object' >
 *   <complexType content='mixed'>
 *     <element ref='ds:Manifest' minOccurs='1' maxOccurs='unbounded'/>
 *     <any namespace='##any' minOccurs='1' maxOccurs='unbounded'/>
 *     <attribute name='Id' type='ID' use='optional'/>
 *     <attribute name='MimeType' type='string' use='optional'/> <!-- add a grep facet -->
 *     <attribute name='Encoding' type='uriReference' use='optional'/>
 *   </complexType>
 * </element>
 * ```
 */

/**
 * Represents the object element of an XML signature that holds data to be signed.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.Object,
})
export class DataObject extends XmlSignatureObject {
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Id,
    defaultValue: '',
  })
  public Id: string;

  @XmlAttribute({
    localName: XmlSignature.AttributeNames.MimeType,
    defaultValue: '',
  })
  public MimeType: string;

  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Encoding,
    defaultValue: '',
  })
  public Encoding: string;
}

@XmlElement({
  localName: 'xmldsig_objects',
  parser: DataObject,
})
export class DataObjects extends XmlSignatureCollection<DataObject> {}

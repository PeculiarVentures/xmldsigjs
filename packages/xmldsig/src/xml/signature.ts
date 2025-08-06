import { XmlAttribute, XmlChildElement, XmlElement, XmlBase64Converter } from 'xml-core';

import { DataObjects } from './data_object';
import { KeyInfo } from './key_info';
import { SignedInfo } from './signed_info';
import { XmlSignature } from './xml_names';
import { XmlSignatureObject } from './xml_object';

/**
 * Represents the <Signature> element of an XML signature.
 *
 * ```xml
 * <element name="Signature" type="ds:SignatureType"/>
 * <complexType name="SignatureType">
 *   <sequence>
 *     <element ref="ds:SignedInfo"/>
 *     <element ref="ds:SignatureValue"/>
 *     <element ref="ds:KeyInfo" minOccurs="0"/>
 *     <element ref="ds:Object" minOccurs="0" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 * ```
 */

/**
 * Represents the <Signature> element of an XML signature.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.Signature,
})
export class Signature extends XmlSignatureObject {
  /**
   * Gets or sets the ID of the current Signature.
   */
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Id,
    defaultValue: '',
  })
  public Id: string;

  /**
   * Gets or sets the SignedInfo of the current Signature.
   */
  @XmlChildElement({
    parser: SignedInfo,
    required: true,
  })
  public SignedInfo: SignedInfo;

  /**
   * Gets or sets the value of the digital signature.
   */
  @XmlChildElement({
    localName: XmlSignature.ElementNames.SignatureValue,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    required: true,
    converter: XmlBase64Converter,
    defaultValue: null,
  })
  public SignatureValue: Uint8Array | null;

  /**
   * Gets or sets the KeyInfo of the current Signature.
   */
  @XmlChildElement({
    parser: KeyInfo,
  })
  public KeyInfo: KeyInfo;

  @XmlChildElement({
    parser: DataObjects,
    noRoot: true,
  })
  public ObjectList: DataObjects;
}

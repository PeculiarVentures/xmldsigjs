import { XmlAttribute, XmlChildElement, XmlElement } from 'xml-core';

import { CanonicalizationMethod } from './canonicalization_method.js';
import { References } from './reference.js';
import { SignatureMethod } from './signature_method.js';
import { XmlSignature } from './xml_names.js';
import { XmlSignatureObject } from './xml_object.js';

/**
 * Represents the <SignedInfo> element of an XML signature.
 *
 * ```xml
 * <complexType name="SignedInfoType">
 *   <sequence>
 *     <element ref="ds:CanonicalizationMethod"/>
 *     <element ref="ds:SignatureMethod"/>
 *     <element ref="ds:Reference" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 * ```
 */

/**
 * The SignedInfo class represents the <SignedInfo> element
 * of an XML signature defined by the XML digital signature specification
 *
 * @export
 * @class SignedInfo
 * @extends {XmlSignatureObject}
 */
@XmlElement({
  localName: XmlSignature.ElementNames.SignedInfo,
})
export class SignedInfo extends XmlSignatureObject {
  /**
   * Gets or sets the ID of the current SignedInfo object.
   *
   * @type {string}
   * @memberOf SignedInfo
   */
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Id,
    defaultValue: '',
  })
  public Id: string;

  /**
   * Gets or sets the canonicalization algorithm that is used before signing
   * for the current SignedInfo object.
   */
  @XmlChildElement({
    parser: CanonicalizationMethod,
    required: true,
  })
  public CanonicalizationMethod: CanonicalizationMethod;

  /**
   * Gets or sets the name of the algorithm used for signature generation
   * and validation for the current SignedInfo object.
   */
  @XmlChildElement({
    parser: SignatureMethod,
    required: true,
  })
  public SignatureMethod: SignatureMethod;

  @XmlChildElement({
    parser: References,
    minOccurs: 1,
    noRoot: true,
  })
  public References: References;
}

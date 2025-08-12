import { XmlChildElement, XmlElement } from 'xml-core';
import { Signature } from 'xmldsigjs';
import { UnsignedSignatureProperty } from './unsigned_signature_properties.js';
import { XmlXades } from './xml.js';
import { XadesObject } from './xml_base.js';

/**
 * Represents the <CounterSignature> element of an XML signature.
 *
 * ```xml
 * <xsd:element name="CounterSignature" type="CounterSignatureType"/>
 * <xsd:complexType name="CounterSignatureType">
 *     <xsd:sequence>
 *         <xsd:element ref="ds:Signature"/>
 *     </xsd:sequence>
 * </xsd:complexType>
 * ```
 */

@XmlElement({ localName: XmlXades.ElementNames.CounterSignature })
export class CounterSignature extends XadesObject implements UnsignedSignatureProperty {
  @XmlChildElement({
    parser: Signature,
    required: true,
  })
  public Signature: Signature;
}

import { XmlAttribute, XmlBase64Converter, XmlChildElement, XmlElement } from 'xml-core';

import { DigestMethod } from './digest_method';
import { Transforms } from './transform_collection';
import { XmlSignature } from './xml_names';
import { XmlSignatureCollection, XmlSignatureObject } from './xml_object';

/**
 * Represents the <Reference> element of an XML signature.
 *
 * ```xml
 * <element name="Reference" type="ds:ReferenceType"/>
 * <complexType name="ReferenceType">
 *   <sequence>
 *     <element ref="ds:Transforms" minOccurs="0"/>
 *     <element ref="ds:DigestMethod"/>
 *     <element ref="ds:DigestValue"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 *   <attribute name="URI" type="anyURI" use="optional"/>
 *   <attribute name="Type" type="anyURI" use="optional"/>
 * </complexType>
 * ```
 */

/**
 * Represents the <reference> element of an XML signature.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.Reference,
})
export class Reference extends XmlSignatureObject {
  /**
   * Gets or sets the ID of the current Reference.
   */
  @XmlAttribute({
    defaultValue: '',
  })
  public Id: string;

  /**
   * Gets or sets the Uri of the current Reference.
   */
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.URI,
  })
  public Uri?: string;

  /**
   * Gets or sets the type of the object being signed.
   */
  @XmlAttribute({
    localName: XmlSignature.AttributeNames.Type,
    defaultValue: '',
  })
  public Type: string;

  @XmlChildElement({
    parser: Transforms,
  })
  public Transforms: Transforms;

  /**
   * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
   */
  @XmlChildElement({
    required: true,
    parser: DigestMethod,
  })
  public DigestMethod: DigestMethod = new DigestMethod();

  /**
   * Gets or sets the digest value of the current Reference.
   */
  @XmlChildElement({
    required: true,
    localName: XmlSignature.ElementNames.DigestValue,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    converter: XmlBase64Converter,
  })
  public DigestValue: Uint8Array;

  constructor(uri?: string) {
    super();
    if (uri) {
      this.Uri = uri;
    }
  }
}

@XmlElement({
  localName: 'References',
  parser: Reference,
})
export class References extends XmlSignatureCollection<Reference> {}

import { XmlChildElement, XmlElement, XmlBase64Converter } from 'xml-core';

import { resolveCrypto } from '../../application.js';
import { XmlSignature } from '../xml_names.js';
import { KeyInfoClause } from './key_info_clause.js';

/**
 * Represents the <SPKIData> element of an XML signature.
 *
 * ```xml
 * <element name="SPKIData" type="ds:SPKIDataType"/>
 * <complexType name="SPKIDataType">
 *   <sequence maxOccurs="unbounded">
 *     <element name="SPKISexp" type="base64Binary"/>
 *     <any namespace="##other" processContents="lax" minOccurs="0"/>
 *   </sequence>
 * </complexType>
 * ```
 */

@XmlElement({
  localName: XmlSignature.ElementNames.SPKIData,
})
export class SPKIData extends KeyInfoClause {
  public Key: CryptoKey;

  @XmlChildElement({
    localName: XmlSignature.ElementNames.SPKIexp,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    required: true,
    converter: XmlBase64Converter,
  })
  public SPKIexp: Uint8Array | null;

  public async importKey(key: CryptoKey, crypto?: Crypto) {
    const spki = await resolveCrypto(crypto).subtle.exportKey('spki', key);

    this.SPKIexp = new Uint8Array(spki);
    this.Key = key;

    return this;
  }

  public async exportKey(alg: Algorithm, crypto?: Crypto) {
    if (!this.SPKIexp) {
      throw new Error('SPKI data is not defined');
    }
    const key = await resolveCrypto(crypto).subtle.importKey(
      'spki',
      this.SPKIexp,
      alg as any,
      true,
      ['verify'],
    );
    this.Key = key;
    return key;
  }
}

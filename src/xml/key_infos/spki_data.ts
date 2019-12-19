import { XmlChildElement, XmlElement } from "xml-core";
import { XmlBase64Converter } from "xml-core";

import { Application } from "../../application";
import { XmlSignature } from "../xml_names";
import { KeyInfoClause } from "./key_info_clause";

/**
 *
 * <element name="SPKIData" type="ds:SPKIDataType"/>
 * <complexType name="SPKIDataType">
 *   <sequence maxOccurs="unbounded">
 *     <element name="SPKISexp" type="base64Binary"/>
 *     <any namespace="##other" processContents="lax" minOccurs="0"/>
 *   </sequence>
 * </complexType>
 *
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

    public async importKey(key: CryptoKey) {
        const spki = await Application.crypto.subtle.exportKey("spki", key);

        this.SPKIexp = new Uint8Array(spki);
        this.Key = key;

        return this;
    }

    public async exportKey(alg: Algorithm) {
        const key = await Application.crypto.subtle.importKey("spki", this.SPKIexp!, alg as any, true, ["verify"]);
        this.Key = key;
        return key;
    }

}

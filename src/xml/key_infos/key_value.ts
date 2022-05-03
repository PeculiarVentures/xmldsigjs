import * as XmlCore from "xml-core";
import { XE, XmlElement, XmlError } from "xml-core";

import { ECDSA, RSA_PKCS1, RSA_PSS } from "../../algorithms";
import { XmlSignature } from "../xml_names";
import { EcdsaKeyValue } from "./ecdsa_key";
import { KeyInfoClause } from "./key_info_clause";
import { RsaKeyValue } from "./rsa_key";

/**
 * Represents the <KeyValue> element of an XML signature.
 */
@XmlElement({
    localName: XmlSignature.ElementNames.KeyValue,
})
export class KeyValue extends KeyInfoClause {

    protected value: KeyInfoClause;

    public set Value(v: KeyInfoClause) {
        this.element = null;
        this.value = v;
    }

    public get Value(): KeyInfoClause {
        return this.value;
    }

    constructor(value?: KeyInfoClause) {
        super();
        if (value) {
            this.Value = value;
        }
    }

    public async importKey(key: CryptoKey): Promise<this> {
        switch (key.algorithm.name.toUpperCase()) {
            case RSA_PSS.toUpperCase():
            case RSA_PKCS1.toUpperCase():
                this.Value = new RsaKeyValue();
                await this.Value.importKey(key);
                break;
            case ECDSA.toUpperCase():
                this.Value = new EcdsaKeyValue();
                await this.Value.importKey(key);
                break;
            default:
                throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
        }
        return this;
    }

    public async exportKey(alg?: Algorithm) {

        if (!this.Value) {
            throw new XmlError(XE.NULL_REFERENCE);
        }
        return this.Value.exportKey(alg);
    }

    protected OnGetXml(element: Element) {
        if (!this.Value) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "KeyValue has empty value");
        }

        const node = this.Value.GetXml();
        if (node) {
            element.appendChild(node);
        }
    }

    protected OnLoadXml(element: Element) {
        const keyValueTypes = [RsaKeyValue, EcdsaKeyValue];
        for (const keyValueType of keyValueTypes) {
            try {
                const keyValue = new keyValueType();
                for (let i = 0; i < element.childNodes.length; i++) {
                    const nodeKey = element.childNodes.item(i);
                    if (!XmlCore.isElement(nodeKey)) {
                        continue;
                    }
                    keyValue.LoadXml(nodeKey);
                    this.value = keyValue;
                    return;
                }
            } catch (e) { /* none */ }
        }
        throw new XmlError(XE.CRYPTOGRAPHIC, "Unsupported KeyValue in use");
    }

}

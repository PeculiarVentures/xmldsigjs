import * as XmlCore from "xml-core";
import { XmlError, XE } from "xml-core";
import { XmlElement } from "xml-core";
import { KeyInfoClause } from "./key_info_clause";
import { RsaKeyValue } from "./rsa_key";
import { EcdsaKeyValue } from "./ecdsa_key";
import { XmlSignature } from "../xml_names";
import { RSA_PSS, RSA_PKCS1, ECDSA } from "../../algorithm/index";

/**
 * Represents the <KeyValue> element of an XML signature.
 */
@XmlElement({
    localName: XmlSignature.ElementNames.KeyValue
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
        if (value)
            this.Value = value;
    }

    importKey(key: CryptoKey): PromiseLike<this> {
        return Promise.resolve()
            .then(() => {
                switch (key.algorithm.name!.toUpperCase()) {
                    case RSA_PSS.toUpperCase():
                    case RSA_PKCS1.toUpperCase():
                        this.Value = new RsaKeyValue();
                        return this.Value.importKey(key);
                    case ECDSA.toUpperCase():
                        this.Value = new EcdsaKeyValue();
                        return this.Value.importKey(key);
                    default:
                        throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
                }
            })
            .then(() => {
                return this;
            });
    }
    exportKey(alg: Algorithm): PromiseLike<CryptoKey> {
        return Promise.resolve()
            .then(() => {
                if (!this.Value)
                    throw new XmlError(XE.NULL_REFERENCE);
                return this.Value.exportKey(alg);
            });
    }

    protected OnGetXml(element: Element) {
        if (!this.Value)
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "KeyValue has empty value");

        const node = this.Value.GetXml();
        if (node)
            element.appendChild(node);
    }

}
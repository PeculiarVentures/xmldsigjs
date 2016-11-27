import { XmlError, XE } from "xmljs";
import { Convert } from "xmljs";
import { XmlSignature } from "../xml";
import { XmlSignatureObject } from "../xml_object";
import { ISignatureAlgorithm } from "../algorithm";
import { KeyInfoClause } from "../key_info";
import { Application } from "../application";
import { RSA_PKCS1, RSA_PSS, SHA1, SHA224, SHA256, SHA384, SHA512 } from "../algorithm/index";

export interface IJwkRsa {
    alg: string;
    kty: string;
    e: string;
    n: string;
    ext: boolean;
}

/**
 * Represents the <RSAKeyValue> element of an XML signature.
 */
export class RsaKeyValue extends XmlSignatureObject implements KeyInfoClause {

    protected name = XmlSignature.ElementNames.RSAKeyValue;

    protected m_key: CryptoKey | null = null;
    protected m_jwk: JsonWebKey | null = null;
    protected m_algorithm: ISignatureAlgorithm | null = null;
    protected m_modulus: Uint8Array | null = null;
    protected m_exponent: Uint8Array | null = null;
    protected m_keyusage: string[] = [];

    /**
     * Gets or sets the instance of RSA that holds the public key.
     */
    get Key() {
        return this.m_key;
    }
    set Key(value: CryptoKey | null) {
        this.m_key = value;
    }

    /**
     * Gets the algorithm of the public key
     */
    get Algorithm(): ISignatureAlgorithm | null {
        return this.m_algorithm;
    }

    /**
     * Gets the Modulus of the public key
     */
    get Modulus(): Uint8Array | null {
        return this.m_modulus;
    }

    /**
     * Gets the Exponent of the public key
     */
    get Exponent(): Uint8Array | null {
        return this.m_exponent;
    }

    constructor() {
        super();
    }

    /**
     * Imports key to the RSAKeyValue object 
     * @param  {CryptoKey} key
     * @returns Promise
     */
    importKey(key: CryptoKey) {
        return new Promise((resolve, reject) => {
            const algName = key.algorithm.name!.toUpperCase();
            if (algName !== RSA_PKCS1.toUpperCase() && algName !== RSA_PSS.toUpperCase())
                throw new XmlError(XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            this.m_key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then((jwk: IJwkRsa) => {
                    this.m_jwk = jwk;
                    this.m_modulus = Convert.FromBase64Url(jwk.n);
                    this.m_exponent = Convert.FromBase64Url(jwk.e);
                    this.m_keyusage = key.usages;
                    return Promise.resolve(this);
                })
                .then(resolve, reject);
        });
    }

    /**
     * Exports key from the RSAKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    exportKey(alg: Algorithm) {
        return new Promise((resolve, reject) => {
            if (this.m_key)
                return resolve(this.m_key);
            // fill jwk
            if (!this.m_modulus)
                throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
            let modulus = Convert.ToBase64Url(this.m_modulus);
            if (!this.m_exponent)
                throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
            let exponent = Convert.ToBase64Url(this.m_exponent);
            let algJwk: string;
            switch (alg.name.toUpperCase()) {
                case RSA_PKCS1.toUpperCase():
                    algJwk = "R";
                    break;
                case RSA_PSS.toUpperCase():
                    algJwk = "P";
                    break;
                default:
                    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, alg.name);
            }

            // Convert hash to JWK name
            switch ((alg as any).hash.name.toUpperCase()) {
                case SHA1:
                    algJwk += "S1";
                    break;
                case SHA224:
                    algJwk += "S224";
                    break;
                case SHA256:
                    algJwk += "S256";
                    break;
                case SHA384:
                    algJwk += "S384";
                    break;
                case SHA512:
                    algJwk += "S512";
                    break;
            }
            let jwk: IJwkRsa = {
                kty: "RSA",
                alg: algJwk,
                n: modulus,
                e: exponent,
                ext: true
            };
            Application.crypto.subtle.importKey("jwk", jwk as any, alg, true, this.m_keyusage)
                .then(resolve, reject);
        });
    }


    /**
     * Returns the XML representation of the RSA key clause.
     * @returns Element
     */
    GetXml(): Element {
        if (this.element)
            return this.element;

        let prefix = this.GetPrefix();

        let doc = this.CreateDocument();

        // RsaKeyValue
        let xnRsaKeyValue = this.CreateElement(doc);

        if (!this.m_jwk) {
            throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKey value has no imported key. Use RsaKeyValue.importKey function first.");
        }
        // Modulus
        let xnModulus = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.Modulus);
        xnModulus.textContent = Convert.ToBase64(Convert.FromBase64Url(this.m_jwk.n!));
        xnRsaKeyValue.appendChild(xnModulus);

        // Exponent
        let xnExponent = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.Exponent);
        xnExponent.textContent = Convert.ToBase64(Convert.FromBase64Url(this.m_jwk.e!));
        xnRsaKeyValue.appendChild(xnExponent);

        return xnRsaKeyValue;
    }

    /**
     * Loads an RSA key clause from an XML element.
     * @param  {Element} element
     * @returns void
     */
    LoadXml(element: Element): void {
        super.LoadXml(element);

        // <Modulus>
        let xnModulus = this.GetChild(XmlSignature.ElementNames.Modulus, false);
        if (xnModulus != null)
            this.m_modulus = Convert.FromBase64(xnModulus.textContent || "");
        else
            throw new XmlError(XE.CRYPTOGRAPHIC, XmlSignature.ElementNames.Modulus);

        // <Exponent>
        let xnExponent = this.GetChild(XmlSignature.ElementNames.Exponent, false);
        if (xnExponent != null)
            this.m_exponent = Convert.FromBase64(xnExponent.textContent || "");
        else
            throw new XmlError(XE.CRYPTOGRAPHIC, XmlSignature.ElementNames.Exponent);

        this.m_keyusage = ["verify"];
    }

}

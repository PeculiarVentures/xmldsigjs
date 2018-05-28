import {
    Convert, XE,
    XmlAttribute, XmlBase64Converter, XmlChildElement,
    XmlElement, XmlError, XmlNumberConverter,
    XmlObject,
} from "xml-core";

import { RSA_PKCS1, RSA_PSS, SHA1, SHA256, SHA384, SHA512 } from "../../algorithm/index";
import { Application } from "../../application";
import { CryptoConfig } from "../../crypto_config";
import { DigestMethod } from "../digest_method";
import { XmlSignature } from "../xml_names";
import { KeyInfoClause } from "./key_info_clause";

export interface IJwkRsa {
    alg: string;
    kty: string;
    e: string;
    n: string;
    ext: boolean;
}

export interface RsaPSSSignParams extends RsaPssParams, Algorithm {
    hash: AlgorithmIdentifier;
}

/**
 * Represents the <RSAKeyValue> element of an XML signature.
 */
@XmlElement({
    localName: XmlSignature.ElementNames.RSAKeyValue,
})
export class RsaKeyValue extends KeyInfoClause {

    /**
     * Gets the Modulus of the public key
     */
    @XmlChildElement({
        localName: XmlSignature.ElementNames.Modulus,
        prefix: XmlSignature.DefaultPrefix,
        namespaceURI: XmlSignature.NamespaceURI,
        required: true,
        converter: XmlBase64Converter,
    })
    public Modulus: Uint8Array | null;

    /**
     * Gets the Exponent of the public key
     */
    @XmlChildElement({
        localName: XmlSignature.ElementNames.Exponent,
        prefix: XmlSignature.DefaultPrefix,
        namespaceURI: XmlSignature.NamespaceURI,
        required: true,
        converter: XmlBase64Converter,
    })
    public Exponent: Uint8Array | null;

    protected key: CryptoKey | null = null;
    protected jwk: JsonWebKey | null = null;
    protected keyUsage: string[] = [];

    /**
     * Imports key to the RSAKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    public importKey(key: CryptoKey) {
        return new Promise<this>((resolve, reject) => {
            const algName = key.algorithm.name!.toUpperCase();
            if (algName !== RSA_PKCS1.toUpperCase() && algName !== RSA_PSS.toUpperCase()) {
                throw new XmlError(XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            }
            this.key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then((jwk: IJwkRsa) => {
                    this.jwk = jwk;
                    this.Modulus = Convert.FromBase64Url(jwk.n);
                    this.Exponent = Convert.FromBase64Url(jwk.e);
                    this.keyUsage = key.usages;
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
    public exportKey(alg: Algorithm) {
        return new Promise<CryptoKey>((resolve, reject) => {
            if (this.key) {
                return resolve(this.key);
            }
            // fill jwk
            if (!this.Modulus) {
                throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
            }
            const modulus = Convert.ToBase64Url(this.Modulus);
            if (!this.Exponent) {
                throw new XmlError(XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
            }
            const exponent = Convert.ToBase64Url(this.Exponent);
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
            const jwk: IJwkRsa = {
                kty: "RSA",
                alg: algJwk,
                n: modulus,
                e: exponent,
                ext: true,
            };
            Application.crypto.subtle.importKey("jwk", jwk as any, alg as any, true, this.keyUsage)
                .then(resolve, reject);
        });
    }

    /**
     * Loads an RSA key clause from an XML element.
     * @param  {Element | string} element
     * @returns void
     */
    public LoadXml(node: Element | string): void {
        super.LoadXml(node);
        this.keyUsage = ["verify"];
    }

}

/**
 *
 *  Schema Definition (target namespace
 *  http://www.w3.org/2007/05/xmldsig-more#):
 *
 *  <xs:element name="RSAPSSParams" type="pss:RSAPSSParamsType">
 *      <xs:annotation>
 *          <xs:documentation>
 *  Top level element that can be used in xs:any namespace="#other"
 *  wildcard of ds:SignatureMethod content.
 *          </xs:documentation>
 *      </xs:annotation>
 *  </xs:element>
 *  <xs:complexType name="RSAPSSParamsType">
 *      <xs:sequence>
 *          <xs:element ref="ds:DigestMethod" minOccurs="0"/>
 *          <xs:element name="MaskGenerationFunction"
 *             type="pss:MaskGenerationFunctionType" minOccurs="0"/>
 *          <xs:element name="SaltLength" type="xs:int"
 *             minOccurs="0"/>
 *          <xs:element name="TrailerField" type="xs:int"
 *             minOccurs="0"/>
 *      </xs:sequence>
 *  </xs:complexType>
 *  <xs:complexType name="MaskGenerationFunctionType">
 *      <xs:sequence>
 *          <xs:element ref="ds:DigestMethod" minOccurs="0"/>
 *      </xs:sequence>
 *      <xs:attribute name="Algorithm" type="xs:anyURI"
 *         default="http://www.w3.org/2007/05/xmldsig-more#MGF1"/>
 *  </xs:complexType>
 *
 */

const NAMESPACE_URI = "http://www.w3.org/2007/05/xmldsig-more#";
const PREFIX = "pss";

@XmlElement({
    localName: XmlSignature.ElementNames.MaskGenerationFunction,
    prefix: PREFIX,
    namespaceURI: NAMESPACE_URI,
})
export class MaskGenerationFunction extends XmlObject {
    @XmlChildElement({
        parser: DigestMethod,
    })
    public DigestMethod: DigestMethod;

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        defaultValue: "http://www.w3.org/2007/05/xmldsig-more#MGF1",
    })
    public Algorithm: string;
}

@XmlElement({
    localName: XmlSignature.ElementNames.RSAPSSParams,
    prefix: PREFIX,
    namespaceURI: NAMESPACE_URI,
})
export class PssAlgorithmParams extends XmlObject {
    public static FromAlgorithm(algorithm: RsaPSSSignParams) {
        return new PssAlgorithmParams(algorithm);
    }

    @XmlChildElement({
        parser: DigestMethod,
    })
    public DigestMethod: DigestMethod;

    @XmlChildElement({
        parser: MaskGenerationFunction,
    })
    public MGF: MaskGenerationFunction;

    @XmlChildElement({
        converter: XmlNumberConverter,
        prefix: PREFIX,
        namespaceURI: NAMESPACE_URI,
    })
    public SaltLength: number;

    @XmlChildElement({
        converter: XmlNumberConverter,
    })
    public TrailerField: number;

    constructor(algorithm?: RsaPSSSignParams) {
        super();

        if (algorithm) {
            this.FromAlgorithm(algorithm);
        }
    }

    public FromAlgorithm(algorithm: RsaPSSSignParams) {
        this.DigestMethod = new DigestMethod();
        const digest = CryptoConfig.GetHashAlgorithm(algorithm.hash);
        this.DigestMethod.Algorithm = digest.namespaceURI;
        if (algorithm.saltLength) {
            this.SaltLength = algorithm.saltLength;
        }
    }

}

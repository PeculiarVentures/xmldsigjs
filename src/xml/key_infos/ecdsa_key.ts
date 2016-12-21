import { XmlError, XE } from "xml-core";
import { Convert, XmlBase64Converter } from "xml-core";
import { XmlElement, XmlChildElement, XmlAttribute, XmlObject } from "xml-core";
import { XmlSignature } from "../index";
import { Application } from "../../application";
import { KeyInfoClause } from "./key_info_clause";

export declare type NamedCurveType = string | "P-256" | "P-384" | "P-521";

/**
 * 
 * <xs:element name="ECDSAKeyValue" type="ecdsa:ECDSAKeyValueType"/>
 * <xs:complexType name="ECDSAKeyValueType">
 *   <xs:sequence>
 *     <xs:element name="DomainParameters" type="ecdsa:DomainParamsType"
 *                 minOccurs="0"/>
 *     <xs:element name="PublicKey" type="ecdsa:ECPointType"/>
 *   </xs:sequence>
 * </xs:complexType>
 * 
 * <xs:complexType name="DomainParamsType">
 *   <xs:choice>
 *     <xs:element name="ExplicitParams"
 *                 type="ecdsa:ExplicitParamsType"/>
 *     <xs:element name="NamedCurve">
 *       <xs:complexType>
 *         <xs:attribute name="URN" type="xs:anyURI" use="required"/>
 *       </xs:complexType>
 *     </xs:element>
 *   </xs:choice>
 * </xs:complexType>
 * 
 * <xs:complexType name="ECPointType">
 *   <xs:sequence minOccurs="0">
 *     <xs:element name="X" type="ecdsa:FieldElemType"/>
 *     <xs:element name="Y" type="ecdsa:FieldElemType"/>
 *   </xs:sequence>
 * </xs:complexType>
 *
 */

const NAMESPACE_URI = "http://www.w3.org/2001/04/xmldsig-more#";
const PREFIX = "ecdsa";

@XmlElement({
    localName: XmlSignature.ElementNames.PublicKey,
    namespaceURI: NAMESPACE_URI,
    prefix: PREFIX
})
class EcdsaPublicKey extends XmlObject {

    @XmlChildElement({
        localName: XmlSignature.ElementNames.X,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
        required: true,
        converter: XmlBase64Converter
    })
    public X: Uint8Array;

    @XmlChildElement({
        localName: XmlSignature.ElementNames.Y,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
        required: true,
        converter: XmlBase64Converter
    })
    public Y: Uint8Array;
}

@XmlElement({
    localName: XmlSignature.ElementNames.NamedCurve,
    namespaceURI: NAMESPACE_URI,
    prefix: PREFIX
})
class NamedCurve extends XmlObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.URI,
        required: true,
    })
    public Uri: string;

}

@XmlElement({
    localName: XmlSignature.ElementNames.DomainParameters,
    namespaceURI: NAMESPACE_URI,
    prefix: PREFIX
})
class DomainParameters extends XmlObject {

    @XmlChildElement({
        parser: NamedCurve,
    })
    public NamedCurve: NamedCurve;

}

/**
 * Represents the <ECKeyValue> element of an XML signature.
 */
@XmlElement({
    localName: XmlSignature.ElementNames.ECDSAKeyValue,
    namespaceURI: NAMESPACE_URI,
    prefix: PREFIX
})
export class EcdsaKeyValue extends KeyInfoClause {

    protected name = XmlSignature.ElementNames.ECDSAKeyValue;

    protected m_key: CryptoKey | null = null;
    protected m_jwk: JsonWebKey | null = null;
    protected m_keyusage: string[] | null = null;

    @XmlChildElement({
        parser: DomainParameters,
    })
    public DomainParameters: DomainParameters;

    @XmlChildElement({
        parser: EcdsaPublicKey,
        required: true,
    })
    public PublicKey: EcdsaPublicKey;

    /**
     * Gets the NamedCurve value of then public key
     */
    get NamedCurve() {
        return GetNamedCurveOid(this.DomainParameters.NamedCurve.Uri);
    }

    /**
     * Imports key to the ECKeyValue object 
     * @param  {CryptoKey} key
     * @returns Promise
     */
    importKey(key: CryptoKey): PromiseLike<this> {
        return new Promise((resolve, reject) => {
            if (key.algorithm.name!.toUpperCase() !== "ECDSA")
                throw new XmlError(XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            this.m_key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then((jwk) => {
                    this.m_jwk = jwk;
                    this.PublicKey = new EcdsaPublicKey();
                    this.PublicKey.X = Convert.FromString(jwk.x!, "base64url");
                    this.PublicKey.Y = Convert.FromString(jwk.y!, "base64url");
                    if (!this.DomainParameters)
                        this.DomainParameters = new DomainParameters();
                    if (!this.DomainParameters.NamedCurve)
                        this.DomainParameters.NamedCurve = new NamedCurve();
                    this.DomainParameters.NamedCurve.Uri = GetNamedCurveOid(jwk.crv! as any);
                    this.m_keyusage = key.usages;
                    return Promise.resolve(this);
                })
                .then(resolve, reject);
        });
    }

    /**
     * Exports key from the ECKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    exportKey(alg: Algorithm): PromiseLike<CryptoKey> {
        return Promise.resolve()
            .then(() => {
                if (this.m_key)
                    return this.m_key;
                // fill jwk
                let x = Convert.ToBase64Url(this.PublicKey.X);
                let y = Convert.ToBase64Url(this.PublicKey.Y);
                let crv = GetNamedCurveFromOid(this.DomainParameters.NamedCurve.Uri);
                let jwk: JsonWebKey = {
                    kty: "EC",
                    crv: crv as string,
                    x: x,
                    y: y,
                    ext: true
                };
                this.m_keyusage = ["verify"];
                return Application.crypto.subtle.importKey("jwk", jwk as any, <any>{ name: "ECDSA", namedCurve: crv }, true, this.m_keyusage);
            })
            .then(key => {
                this.m_key = key;
                return this.m_key;
            });
    }

}

function GetNamedCurveOid(namedCurve: NamedCurveType | null): string {
    switch (namedCurve) {
        case "P-256":
            return "urn:oid:1.2.840.10045.3.1.7";
        case "P-384":
            return "urn:oid:1.3.132.0.34";
        case "P-521":
            return "urn:oid:1.3.132.0.35";
    }
    throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve");
}

function GetNamedCurveFromOid(oid: string): NamedCurveType {
    switch (oid) {
        case "urn:oid:1.2.840.10045.3.1.7":
            return "P-256";
        case "urn:oid:1.3.132.0.34":
            return "P-384";
        case "urn:oid:1.3.132.0.35":
            return "P-521";
    }
    throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve OID");
}
import { XmlError, XE } from "xmljs";
import { Convert } from "xmljs";
import { XmlSignature } from "../xml";
import { XmlSignatureObject } from "../xml_object";
import { Application } from "../application";
import { KeyInfoClause } from "../key_info";
import { ISignatureAlgorithm } from "../algorithm";

export declare type NamedCurve = "P-256" | "P-384" | "P-521";

/**
 * Represents the <ECKeyValue> element of an XML signature.
 */
export class EcdsaKeyValue extends XmlSignatureObject implements KeyInfoClause {

    protected name = XmlSignature.ElementNames.ECKeyValue;

    protected m_key: CryptoKey | null = null;
    protected m_jwk: JsonWebKey | null = null;
    protected m_algorithm: ISignatureAlgorithm | null = null;
    protected m_x: Uint8Array | null = null;
    protected m_y: Uint8Array | null = null;
    protected m_curve: NamedCurve | null = null;
    protected m_keyusage: string[] | null = null;

    /**
     * Gets or sets the instance of ECDSA that holds the public key.
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
    get Algorithm() {
        return this.m_algorithm;
    }

    /**
     * Gets the X point value of then public key
     */
    get X() {
        return this.m_x;
    }

    /**
     * Gets the Y point value of then public key
     */
    get Y() {
        return this.m_y;
    }

    /**
     * Gets the NamedCurve value of then public key
     */
    get NamedCurve() {
        return this.m_curve;
    }

    constructor() {
        super();
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
                    this.m_jwk = jwk; console.log(jwk);
                    this.m_x = Convert.FromString(jwk.x!, "base64url");
                    this.m_y = Convert.FromString(jwk.y!, "base64url");
                    this.m_curve = jwk.crv! as any;
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
        return new Promise((resolve, reject) => {
            if (this.m_key)
                return resolve(this.m_key);
            // fill jwk
            let x = Convert.ToBase64Url(this.m_x!);
            let y = Convert.ToBase64Url(this.m_y!);
            let crv = this.m_curve;
            let jwk: JsonWebKey = {
                kty: "EC",
                crv: crv as string,
                x: x,
                y: y,
                ext: true
            };
            Application.crypto.subtle.importKey("jwk", jwk as any, <any>{ name: "ECDSA", namedCurve: crv }, true, this.m_keyusage!)
                .then(resolve, reject);
        });
    }

    /**
     * Returns the XML representation of the ECDSA key clause.
     * @returns Element
     */
    GetXml(): Element {
        if (this.element)
            return this.element;

        let prefix = this.GetPrefix();

        let doc = this.CreateDocument();

        // EcdsaKeyValue
        let xnEcdsaKeyValue = this.CreateElement(doc);

        // NamedCurve
        let xnNamedCurve = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.NamedCurve);
        xnNamedCurve.setAttribute("URI", "urn:oid:" + GetNamedCurveOid(this.m_curve));
        xnEcdsaKeyValue.appendChild(xnNamedCurve);

        // PublicKey
        let xnPublicKey = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.PublicKey);

        // Conactinate point values 
        if (this.m_x!.length !== this.m_y!.length)
            throw new XmlError(XE.CRYPTOGRAPHIC, "ECDSA lenght of X value must be equal length of Y value");
        let pubkey = new Uint8Array(this.m_x!.length + this.m_y!.length);
        for (let i = 0; i < this.m_x!.length; i++) {
            pubkey[i] = this.m_x![i];
            pubkey[this.m_x!.length + i] = this.m_y![i];
        }
        xnPublicKey.textContent = Convert.ToBase64(pubkey);
        xnEcdsaKeyValue.appendChild(xnPublicKey);

        return xnEcdsaKeyValue;
    }

    /**
     * Loads an ECDSA key clause from an XML element.
     * @param  {Element} element
     * @returns void
     */
    LoadXml(element: Element): void {
        super.LoadXml(element);

        // <NamedCurve>
        let xnNamedCurve = this.GetChild(XmlSignature.ElementNames.NamedCurve, true) !;
        let value = /urn\:oid\:(.+)/.exec(xnNamedCurve.getAttribute("URI") || "") ![1];
        this.m_curve = GetNamedCurveFromOid(value);

        // <PublicKey>
        let xnPublicKey = this.GetChild(XmlSignature.ElementNames.PublicKey, true)!;
            let pubkey = Convert.FromBase64(xnPublicKey.textContent || "");
            if (pubkey.length % 2)
                throw new XmlError(XE.CRYPTOGRAPHIC, "ECDSA PublicKey point mustbw odd");
            let point_size = pubkey.length / 2;
            this.m_x = pubkey.slice(0, point_size);
            this.m_y = pubkey.slice(point_size);

        this.m_keyusage = ["verify"];
    }

}

function GetNamedCurveOid(namedCurve: NamedCurve | null): string {
    switch (namedCurve) {
        case "P-256":
            return "1.2.840.10045.3.1.7";
        case "P-384":
            return "1.3.132.0.34";
        case "P-521":
            return "1.3.132.0.35";
    }
    throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve");
}

function GetNamedCurveFromOid(oid: string): NamedCurve {
    switch (oid) {
        case "1.2.840.10045.3.1.7":
            return "P-256";
        case "1.3.132.0.34":
            return "P-384";
        case "1.3.132.0.35":
            return "P-521";
    }
    throw new XmlError(XE.CRYPTOGRAPHIC, "Unknown NamedCurve OID");
}

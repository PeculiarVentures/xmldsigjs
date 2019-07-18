// tslint:disable-next-line:no-reference
/// <reference path="../../types/pkijs.d.ts" />

import { Certificate } from "pkijs";

import * as Asn1Js from "asn1js";
import { ECDSA } from "../algorithm/index";
import { Application } from "../application";

export declare type DigestAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

/**
 * List of OIDs
 * Source: https://msdn.microsoft.com/ru-ru/library/windows/desktop/aa386991(v=vs.85).aspx
 */
const OID: { [key: string]: { short?: string, long?: string } } = {
    "2.5.4.3": {
        short: "CN",
        long: "CommonName",
    },
    "2.5.4.6": {
        short: "C",
        long: "Country",
    },
    "2.5.4.5": {
        long: "DeviceSerialNumber",
    },
    "0.9.2342.19200300.100.1.25": {
        short: "DC",
        long: "DomainComponent",
    },
    "1.2.840.113549.1.9.1": {
        short: "E",
        long: "EMail",
    },
    "2.5.4.42": {
        short: "G",
        long: "GivenName",
    },
    "2.5.4.43": {
        short: "I",
        long: "Initials",
    },
    "2.5.4.7": {
        short: "L",
        long: "Locality",
    },
    "2.5.4.10": {
        short: "O",
        long: "Organization",
    },
    "2.5.4.11": {
        short: "OU",
        long: "OrganizationUnit",
    },
    "2.5.4.8": {
        short: "ST",
        long: "State",
    },
    "2.5.4.9": {
        short: "Street",
        long: "StreetAddress",
    },
    "2.5.4.4": {
        short: "SN",
        long: "SurName",
    },
    "2.5.4.12": {
        short: "T",
        long: "Title",
    },
    "1.2.840.113549.1.9.8": {
        long: "UnstructuredAddress",
    },
    "1.2.840.113549.1.9.2": {
        long: "UnstructuredName",
    },
};

/**
 * Represents an <X509Certificate> element.
 */

export class CustomX509Cert {
    protected decodedCert: PkiJs.Certificate;

    constructor(buff: string) {
        const asn1 = Asn1Js.fromBER(new Uint8Array(Buffer.from(buff, "base64")).buffer);
        this.decodedCert = new Certificate({ schema: asn1.result });
    }

    public getDecodedCert() {
        return this.decodedCert;
    }
    
}

export class X509Certificate {

    protected raw: Uint8Array;
    protected simpl: PkiJs.Certificate;
    protected publicKey: CryptoKey | null = null;

    constructor(rawData?: BufferSource) {
        if (rawData) {
            const buf = new Uint8Array(rawData as ArrayBuffer);
            this.LoadRaw(buf);
            this.raw = buf;
        }
    }

    /**
     * Gets a serial number of the certificate in BIG INTEGER string format
     */
    public get SerialNumber(): string {
        return this.simpl.serialNumber.valueBlock.toString();
    }

    /**
     * Gets a issuer name of the certificate
     */
    public get Issuer(): string {
        return this.NameToString(this.simpl.issuer);
    }

    /**
     * Gets a subject name of the certificate
     */
    public get Subject(): string {
        return this.NameToString(this.simpl.subject);
    }

    /**
     * Returns a thumbprint of the certificate
     * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
     * @returns PromiseLike
     */
    public Thumbprint(algName: DigestAlgorithm = "SHA-1"): PromiseLike<ArrayBuffer> {
        return Application.crypto.subtle.digest(algName, this.raw);
    }

    /**
     * Gets the public key from the X509Certificate
     */
    public get PublicKey(): CryptoKey | null {
        return this.publicKey;
    }

    /**
     * Returns DER raw of X509Certificate
     */
    public GetRaw(): Uint8Array {
        return this.raw;
    }

    /**
     * Returns public key from X509Certificate
     * @param  {Algorithm} algorithm
     * @returns Promise
     */
    public exportKey(algorithm: Algorithm): PromiseLike<CryptoKey> {
        return Promise.resolve()
            .then(() => {
                const alg = {
                    algorithm,
                    usages: ["verify"],
                };
                if (alg.algorithm.name.toUpperCase() === ECDSA) {
                    // Set named curve
                    const namedCurveOid = this.simpl.subjectPublicKeyInfo.toJSON().algorithm.algorithmParams.valueBlock.value;
                    switch (namedCurveOid) {
                        case "1.2.840.10045.3.1.7": // P-256
                            (alg.algorithm as any).namedCurve = "P-256";
                            break;
                        case "1.3.132.0.34": // P-384
                            (alg.algorithm as any).namedCurve = "P-384";
                            break;
                        case "1.3.132.0.35": // P-521
                            (alg.algorithm as any).namedCurve = "P-521";
                            break;
                        default:
                        throw new Error(`Unsupported named curve OID '${namedCurveOid}'`);
                    }
                }
                return this.simpl.getPublicKey({ algorithm: alg })
                    .then((key) => {
                        this.publicKey = key;
                        return key;
                    });
            });
    }

    //#region Protected methods
    /**
     * Converts X500Name to string
     * @param  {RDN} name X500Name
     * @param  {string} splitter Splitter char. Default ','
     * @returns string Formated string
     * Example:
     * > C=Some name, O=Some organization name, C=RU
     */
    protected NameToString(name: PkiJs.RelativeDistinguishedNames, splitter: string = ","): string {
        const res: string[] = [];
        name.typesAndValues.forEach((typeAndValue) => {
            const type = typeAndValue.type;
            const oid = OID[type.toString()];
            const name2 = oid ? oid.short : null;
            res.push(`${name2 ? name2 : type}=${typeAndValue.value.valueBlock.value}`);
        });
        return res.join(splitter + " ");
    }

    /**
     * Loads X509Certificate from DER data
     * @param  {Uint8Array} rawData
     */
    protected LoadRaw(rawData: BufferSource) {
        this.raw = new Uint8Array(rawData as ArrayBuffer);
        const asn1 = Asn1Js.fromBER(this.raw.buffer);
        this.simpl = new Certificate({ schema: asn1.result });
    }
    //#endregion
}

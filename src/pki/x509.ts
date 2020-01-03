import * as Asn1Js from "asn1js";
import { Certificate } from "pkijs";
import { ECDSA } from "../algorithms";
import { Application } from "../application";

export type DigestAlgorithm = string | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

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
export class X509Certificate {

    protected raw: Uint8Array;
    protected simpl: any;
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
     * @returns Promise<ArrayBuffer>
     */
    public async Thumbprint(algName: DigestAlgorithm = "SHA-1") {
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
     * @returns Promise<CryptoKey>
     */
    public async exportKey(algorithm: Algorithm | EcKeyImportParams | RsaHashedImportParams) {
        const alg = {
            algorithm,
            usages: ["verify"],
        };
        if (alg.algorithm.name.toUpperCase() === ECDSA) {
            // Set named curve
            (alg.algorithm as any).namedCurve = this.simpl.subjectPublicKeyInfo.toJSON().crv;
        }
        if (this.isHashedAlgorithm(alg.algorithm)) {
            if (typeof alg.algorithm.hash === "string") {
                alg.algorithm.hash = { name: alg.algorithm.hash };
            }
        }

        const key = await this.simpl.getPublicKey({ algorithm: alg });
        this.publicKey = key;
        return key;
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
    protected NameToString(name: any, splitter: string = ","): string {
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

    private isHashedAlgorithm(alg: Algorithm): alg is RsaHashedImportParams {
        return !!alg["hash"];
    }
}

import { Convert } from "xml-core";
import { Application } from "./application";

export type BASE64 = string;

export interface IAlgorithm {
    algorithm: Algorithm;
    namespaceURI: string;
    getAlgorithmName(): string;
}

export interface IHashAlgorithm extends IAlgorithm {
    Digest(xml: BufferSource | string | Node): Promise<Uint8Array>;
}

export type IHashAlgorithmConstructable = new () => IHashAlgorithm;

export abstract class XmlAlgorithm implements IAlgorithm {
    public algorithm: Algorithm;
    public namespaceURI: string;

    public getAlgorithmName(): string {
        return this.namespaceURI;
    }
}

export abstract class HashAlgorithm extends XmlAlgorithm implements IHashAlgorithm {
    public async Digest(xml: BufferSource | string | Node): Promise<Uint8Array> {
        // console.log("HashedInfo:", xml);
        let buf: Uint8Array;
        if (typeof xml === "string") {
            // C14N transforms
            // console.log("Hash:\n%s\n", xml);
            buf = Convert.FromString(xml, "utf8");
        } else if (ArrayBuffer.isView(xml)) {
            buf = new Uint8Array(xml.buffer);
        } else if (xml instanceof ArrayBuffer) {
            // base64 transform
            buf = new Uint8Array(xml);
        } else {
            // enveloped signature transform
            const txt = new XMLSerializer().serializeToString(xml);
            buf = Convert.FromString(txt, "utf8");
        }
        const hash = await Application.crypto.subtle.digest(this.algorithm, buf);
        return new Uint8Array(hash);
    }
}

export interface ISignatureAlgorithm extends IAlgorithm {
    Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): Promise<ArrayBuffer>;
    Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm): Promise<boolean>;
}

export type ISignatureAlgorithmConstructable = new () => ISignatureAlgorithm;

export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
    /**
     * Sign the given string using the given key
     */
    public async Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm) {
        // console.log("Sign:\n%s\n", signedInfo);
        const info = Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.sign(algorithm as any, signingKey, info);
    }

    /**
     * Verify the given signature of the given string using key
     */
    public async Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm) {
        // console.log("Verify:\n%s\n", signedInfo);
        const info = Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.verify((algorithm || this.algorithm) as any, key, signatureValue, info);
    }
}

import { Convert, Stringify } from 'xml-core';
import { resolveCrypto } from './application.js';
import { SignatureMethod } from './xml/signature_method.js';

export type BASE64 = string;

export interface IAlgorithm {
  algorithm: Algorithm;
  namespaceURI: string;
  getAlgorithmName(): string;
}

export interface IHashAlgorithm extends IAlgorithm {
  Digest(xml: BufferSource | string | Node, crypto?: Crypto): Promise<Uint8Array>;
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
  /**
   * Computes the hash of the given data
   * @param  {BufferSource | string | Node} xml
   * @param  {Crypto} crypto Crypto provider. Default is from Application
   * @returns Promise
   */
  public async Digest(xml: BufferSource | string | Node, crypto?: Crypto): Promise<Uint8Array> {
    // console.log("HashedInfo:", xml);
    let buf: Uint8Array;
    if (typeof xml === 'string') {
      // C14N transforms
      // console.log("Hash:\n%s\n", xml);
      buf = Convert.FromString(xml, 'utf8');
    } else if (ArrayBuffer.isView(xml)) {
      buf = new Uint8Array(xml.buffer);
    } else if (xml instanceof ArrayBuffer) {
      // base64 transform
      buf = new Uint8Array(xml);
    } else {
      // enveloped signature transform
      const txt = Stringify(xml);
      buf = Convert.FromString(txt, 'utf8');
    }
    const hash = await resolveCrypto(crypto).subtle.digest(this.algorithm, buf);
    return new Uint8Array(hash);
  }
}

export interface ISignatureAlgorithm extends IAlgorithm {
  /**
   * Optional method to retrieve parameters from a SignatureMethod.
   */
  fromMethod?: (method: SignatureMethod) => void;
  /**
   * Optional method to set parameters to a SignatureMethod.
   */
  toMethod?: (method: SignatureMethod) => void;
  Sign(
    signedInfo: string,
    signingKey: CryptoKey,
    algorithm: Algorithm,
    crypto?: Crypto,
  ): Promise<ArrayBuffer>;
  Verify(
    signedInfo: string,
    key: CryptoKey,
    signatureValue: Uint8Array,
    crypto?: Crypto,
  ): Promise<boolean>;
}

export interface ISignatureAlgorithmConstructable {
  new (): ISignatureAlgorithm;
  fromAlgorithm(alg: Algorithm): ISignatureAlgorithm | null;
}

export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
  /**
   * Sign the given string using the given key
   * @param  {Crypto} crypto Crypto provider. Default is from Application
   */
  public async Sign(
    signedInfo: string,
    signingKey: CryptoKey,
    algorithm: Algorithm,
    crypto?: Crypto,
  ) {
    const info = Convert.FromString(signedInfo, 'utf8');

    return resolveCrypto(crypto).subtle.sign(algorithm as any, signingKey, info);
  }

  /**
   * Verify the given signature of the given string using key
   * @param  {Crypto} crypto Crypto provider. Default is from Application
   */
  public async Verify(
    signedInfo: string,
    key: CryptoKey,
    signatureValue: Uint8Array,
    crypto?: Crypto,
  ) {
    const alg = this.algorithm;
    const info = Convert.FromString(signedInfo, 'utf8');

    return resolveCrypto(crypto).subtle.verify(alg, key, signatureValue, info);
  }
}

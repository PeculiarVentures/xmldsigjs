import { XE, XmlError } from 'xml-core';
import { ISignatureAlgorithm, SignatureAlgorithm } from '../algorithm.js';
import { SignatureMethod } from '../xml/signature_method.js';
import { PssAlgorithmParams } from '../xml/key_infos/rsa_key.js';
import {
  SHA1,
  SHA1_NAMESPACE,
  SHA256,
  SHA256_NAMESPACE,
  SHA384,
  SHA384_NAMESPACE,
  SHA512,
  SHA512_NAMESPACE,
} from './rsa_hash.js';

// https://tools.ietf.org/html/rfc6931#section-2.3.9

export const RSA_PSS = 'RSA-PSS';

export const RSA_PSS_WITH_PARAMS_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#rsa-pss';

interface RsaPSSSignParams extends Algorithm {
  name: typeof RSA_PSS;
  hash: Algorithm;
  saltLength?: number;
}

export class RsaPssWithParams extends SignatureAlgorithm {
  public static fromAlgorithm(alg: RsaPSSSignParams): ISignatureAlgorithm | null {
    let rsaPssAlgorithm: RsaPssWithParams | null = null;
    if (alg.name.toUpperCase() === RSA_PSS.toUpperCase()) {
      switch (alg.hash.name.toUpperCase()) {
        case SHA1:
          rsaPssAlgorithm = new RsaPssWithParams();
          break;
        case SHA256:
          rsaPssAlgorithm = new RsaPssWithParams();
          break;
        case SHA384:
          rsaPssAlgorithm = new RsaPssWithParams();
          break;
        case SHA512:
          rsaPssAlgorithm = new RsaPssWithParams();
          break;
      }
      if (rsaPssAlgorithm) {
        rsaPssAlgorithm.algorithm.hash.name = alg.hash.name;
        if (alg.saltLength) {
          rsaPssAlgorithm.algorithm.saltLength = alg.saltLength;
        }

        return rsaPssAlgorithm;
      }
    }
    return null;
  }

  public algorithm: RsaPSSSignParams = {
    name: RSA_PSS,
    hash: {
      name: SHA1,
    },
  };

  public namespaceURI = RSA_PSS_WITH_PARAMS_NAMESPACE;

  public fromMethod(method: SignatureMethod): void {
    if (
      !method.Any.Some((item) => {
        if (item instanceof PssAlgorithmParams) {
          // Set the hash algorithm based on the DigestMethod
          switch (item.DigestMethod.Algorithm.toLowerCase()) {
            case SHA1_NAMESPACE:
              this.algorithm.hash.name = SHA1;
              break;
            case SHA256_NAMESPACE:
              this.algorithm.hash.name = SHA256;
              break;
            case SHA384_NAMESPACE:
              this.algorithm.hash.name = SHA384;
              break;
            case SHA512_NAMESPACE:
              this.algorithm.hash.name = SHA512;
              break;
            default:
              throw new XmlError(
                XE.CRYPTOGRAPHIC,
                `Unsupported hash algorithm: ${item.DigestMethod.Algorithm}`,
              );
          }
          // Set the salt length if specified
          if (item.SaltLength) {
            this.algorithm.saltLength = item.SaltLength;
          }
          return true;
        }
        return false;
      })
    ) {
      throw new XmlError(XE.CRYPTOGRAPHIC, 'RSA-PSS parameters not found in SignatureMethod');
    }
  }

  public toMethod(method: SignatureMethod): void {
    const pssParams = new PssAlgorithmParams();

    switch (this.algorithm.hash.name.toUpperCase()) {
      case SHA1:
        pssParams.DigestMethod.Algorithm = SHA1_NAMESPACE;
        break;
      case SHA256:
        pssParams.DigestMethod.Algorithm = SHA256_NAMESPACE;
        break;
      case SHA384:
        pssParams.DigestMethod.Algorithm = SHA384_NAMESPACE;
        break;
      case SHA512:
        pssParams.DigestMethod.Algorithm = SHA512_NAMESPACE;
        break;
      default:
        throw new XmlError(
          XE.CRYPTOGRAPHIC,
          `Unsupported hash algorithm: ${this.algorithm.hash.name}`,
        );
    }

    if (this.algorithm.saltLength) {
      pssParams.SaltLength = this.algorithm.saltLength;
    }

    method.Any.Add(pssParams);
  }
}

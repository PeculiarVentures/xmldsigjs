import { XE, XmlError } from 'xml-core';
import * as XmlCore from 'xml-core';

import {
  IHashAlgorithm,
  ISignatureAlgorithm,
  HashAlgorithm,
  IHashAlgorithmConstructable,
  ISignatureAlgorithmConstructable,
  SignatureAlgorithm,
} from './algorithm';
import { PssAlgorithmParams } from './xml/key_infos';
import { SignatureMethod } from './xml/signature_method';

import {
  // rsa pkcs1
  RSA_PKCS1,
  RSA_PKCS1_SHA1_NAMESPACE,
  RSA_PKCS1_SHA256_NAMESPACE,
  RSA_PKCS1_SHA384_NAMESPACE,
  RSA_PKCS1_SHA512_NAMESPACE,
  RsaPkcs1Sha1,
  RsaPkcs1Sha256,
  RsaPkcs1Sha384,
  RsaPkcs1Sha512,

  // rsa pss without params
  RSA_PSS,
  RSA_PSS_SHA1_NAMESPACE,
  RSA_PSS_SHA256_NAMESPACE,
  RSA_PSS_SHA384_NAMESPACE,
  RSA_PSS_SHA512_NAMESPACE,
  RsaPssWithoutParamsSha1,
  RsaPssWithoutParamsSha256,
  RsaPssWithoutParamsSha384,
  RsaPssWithoutParamsSha512,

  // rsa pss with params
  RSA_PSS_WITH_PARAMS_NAMESPACE,
  RsaPssSha1,
  RsaPssSha256,
  RsaPssSha384,
  RsaPssSha512,

  // ec dsa
  ECDSA,
  ECDSA_SHA1_NAMESPACE,
  ECDSA_SHA256_NAMESPACE,
  ECDSA_SHA384_NAMESPACE,
  ECDSA_SHA512_NAMESPACE,
  EcdsaSha1,
  EcdsaSha256,
  EcdsaSha384,
  EcdsaSha512,

  // hmac
  HMAC,
  HMAC_SHA1_NAMESPACE,
  HMAC_SHA256_NAMESPACE,
  HMAC_SHA384_NAMESPACE,
  HMAC_SHA512_NAMESPACE,
  HmacSha1,
  HmacSha256,
  HmacSha384,
  HmacSha512,

  // Sha
  SHA1,
  Sha1,
  SHA1_NAMESPACE,
  SHA256,
  Sha256,
  SHA256_NAMESPACE,
  SHA384,
  Sha384,
  SHA384_NAMESPACE,
  SHA512,
  Sha512,
  SHA512_NAMESPACE,
} from './algorithms';

import { Transform, XmlSignature } from './xml';
import {
  XmlDsigBase64Transform,
  XmlDsigC14NTransform,
  XmlDsigC14NWithCommentsTransform,
  XmlDsigEnvelopedSignatureTransform,
  XmlDsigExcC14NTransform,
  XmlDsigExcC14NWithCommentsTransform,
} from './xml/transforms';

const SignatureAlgorithms: Record<string, ISignatureAlgorithmConstructable> = {};
SignatureAlgorithms[RSA_PKCS1_SHA1_NAMESPACE] = RsaPkcs1Sha1;
SignatureAlgorithms[RSA_PKCS1_SHA256_NAMESPACE] = RsaPkcs1Sha256;
SignatureAlgorithms[RSA_PKCS1_SHA384_NAMESPACE] = RsaPkcs1Sha384;
SignatureAlgorithms[RSA_PKCS1_SHA512_NAMESPACE] = RsaPkcs1Sha512;
SignatureAlgorithms[ECDSA_SHA1_NAMESPACE] = EcdsaSha1;
SignatureAlgorithms[ECDSA_SHA256_NAMESPACE] = EcdsaSha256;
SignatureAlgorithms[ECDSA_SHA384_NAMESPACE] = EcdsaSha384;
SignatureAlgorithms[ECDSA_SHA512_NAMESPACE] = EcdsaSha512;
SignatureAlgorithms[HMAC_SHA1_NAMESPACE] = HmacSha1;
SignatureAlgorithms[HMAC_SHA256_NAMESPACE] = HmacSha256;
SignatureAlgorithms[HMAC_SHA384_NAMESPACE] = HmacSha384;
SignatureAlgorithms[HMAC_SHA512_NAMESPACE] = HmacSha512;
SignatureAlgorithms[RSA_PSS_SHA1_NAMESPACE] = RsaPssWithoutParamsSha1;
SignatureAlgorithms[RSA_PSS_SHA256_NAMESPACE] = RsaPssWithoutParamsSha256;
SignatureAlgorithms[RSA_PSS_SHA384_NAMESPACE] = RsaPssWithoutParamsSha384;
SignatureAlgorithms[RSA_PSS_SHA512_NAMESPACE] = RsaPssWithoutParamsSha512;

const HashAlgorithms: Record<string, IHashAlgorithmConstructable> = {};
HashAlgorithms[SHA1_NAMESPACE] = Sha1;
HashAlgorithms[SHA256_NAMESPACE] = Sha256;
HashAlgorithms[SHA384_NAMESPACE] = Sha384;
HashAlgorithms[SHA512_NAMESPACE] = Sha512;

export class CryptoConfig {
  /**
   * Creates Transform from given name
   * if name is not exist then throws error
   *
   * @static
   * @param {(string |)} [name=null]
   * @returns
   *
   * @memberOf CryptoConfig
   */
  public static CreateFromName(name: string | null): Transform {
    let transform: Transform;
    switch (name) {
      case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
        transform = new XmlDsigBase64Transform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
        transform = new XmlDsigC14NTransform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
        transform = new XmlDsigC14NWithCommentsTransform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
        transform = new XmlDsigEnvelopedSignatureTransform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform:
        throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
      // t = new XmlDsigXPathTransform();
      // break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigXsltTransform:
        throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
      // t = new XmlDsigXsltTransform();
      // break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
        transform = new XmlDsigExcC14NTransform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
        transform = new XmlDsigExcC14NWithCommentsTransform();
        break;
      case XmlSignature.AlgorithmNamespaces.XmlDecryptionTransform:
        throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
      // t = new XmlDecryptionTransform();
      // break;
      default:
        throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
    }
    return transform;
  }

  public static CreateSignatureAlgorithm(method: SignatureMethod): SignatureAlgorithm {
    const alg = SignatureAlgorithms[method.Algorithm] || null;
    if (alg) {
      return new alg();
    } else if (method.Algorithm === RSA_PSS_WITH_PARAMS_NAMESPACE) {
      let pssParams: PssAlgorithmParams | undefined;
      method.Any.Some((item) => {
        if (item instanceof PssAlgorithmParams) {
          pssParams = item;
        }
        return !!pssParams;
      });
      if (pssParams) {
        switch (pssParams.DigestMethod.Algorithm) {
          case SHA1_NAMESPACE:
            return new RsaPssSha1(pssParams.SaltLength);
          case SHA256_NAMESPACE:
            return new RsaPssSha256(pssParams.SaltLength);
          case SHA384_NAMESPACE:
            return new RsaPssSha384(pssParams.SaltLength);
          case SHA512_NAMESPACE:
            return new RsaPssSha512(pssParams.SaltLength);
        }
      }
      throw new XmlError(XE.CRYPTOGRAPHIC, `Cannot get params for RSA-PSS algoriithm`);
    }
    throw new Error(`signature algorithm '${method.Algorithm}' is not supported`);
  }

  public static CreateHashAlgorithm(namespace: string): HashAlgorithm {
    const alg = HashAlgorithms[namespace];
    if (alg) {
      return new alg();
    } else {
      throw new Error(`hash algorithm '${namespace}' is not supported`);
    }
  }

  public static GetHashAlgorithm(algorithm: AlgorithmIdentifier): IHashAlgorithm {
    const alg = typeof algorithm === 'string' ? { name: algorithm } : algorithm;
    switch (alg.name.toUpperCase()) {
      case SHA1:
        return new Sha1();
      case SHA256:
        return new Sha256();
      case SHA384:
        return new Sha384();
      case SHA512:
        return new Sha512();
      default:
        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, alg.name);
    }
  }

  public static GetSignatureAlgorithm(algorithm: Algorithm): ISignatureAlgorithm {
    if (typeof (algorithm as any).hash === 'string') {
      (algorithm as any).hash = {
        name: (algorithm as any).hash,
      };
    }
    const hashName: string = (algorithm as any).hash.name;
    if (!hashName) {
      throw new Error(`Signing algorithm doesn't have name for hash`);
    }
    let alg: ISignatureAlgorithm;
    switch (algorithm.name.toUpperCase()) {
      case RSA_PKCS1.toUpperCase():
        switch (hashName.toUpperCase()) {
          case SHA1:
            alg = new RsaPkcs1Sha1();
            break;
          case SHA256:
            alg = new RsaPkcs1Sha256();
            break;
          case SHA384:
            alg = new RsaPkcs1Sha384();
            break;
          case SHA512:
            alg = new RsaPkcs1Sha512();
            break;
          default:
            throw new XmlCore.XmlError(
              XmlCore.XE.ALGORITHM_NOT_SUPPORTED,
              `${algorithm.name}:${hashName}`,
            );
        }
        break;
      case RSA_PSS.toUpperCase(): {
        const saltLength = (algorithm as any).saltLength;
        switch (hashName.toUpperCase()) {
          case SHA1:
            alg = saltLength ? new RsaPssSha1(saltLength) : new RsaPssWithoutParamsSha1();
            break;
          case SHA256:
            alg = saltLength ? new RsaPssSha256(saltLength) : new RsaPssWithoutParamsSha256();
            break;
          case SHA384:
            alg = saltLength ? new RsaPssSha384(saltLength) : new RsaPssWithoutParamsSha384();
            break;
          case SHA512:
            alg = saltLength ? new RsaPssSha512(saltLength) : new RsaPssWithoutParamsSha512();
            break;
          default:
            throw new XmlCore.XmlError(
              XmlCore.XE.ALGORITHM_NOT_SUPPORTED,
              `${algorithm.name}:${hashName}`,
            );
        }
        (algorithm as RsaPssParams).saltLength = (alg.algorithm as RsaPssParams).saltLength;
        break;
      }
      case ECDSA:
        switch (hashName.toUpperCase()) {
          case SHA1:
            alg = new EcdsaSha1();
            break;
          case SHA256:
            alg = new EcdsaSha256();
            break;
          case SHA384:
            alg = new EcdsaSha384();
            break;
          case SHA512:
            alg = new EcdsaSha512();
            break;
          default:
            throw new XmlCore.XmlError(
              XmlCore.XE.ALGORITHM_NOT_SUPPORTED,
              `${algorithm.name}:${hashName}`,
            );
        }
        break;
      case HMAC:
        switch (hashName.toUpperCase()) {
          case SHA1:
            alg = new HmacSha1();
            break;
          case SHA256:
            alg = new HmacSha256();
            break;
          case SHA384:
            alg = new HmacSha384();
            break;
          case SHA512:
            alg = new HmacSha512();
            break;
          default:
            throw new XmlCore.XmlError(
              XmlCore.XE.ALGORITHM_NOT_SUPPORTED,
              `${algorithm.name}:${hashName}`,
            );
        }
        break;
      default:
        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name);
    }
    return alg;
  }
}

import { XE, XmlError } from 'xml-core';

import {
  IHashAlgorithm,
  ISignatureAlgorithm,
  HashAlgorithm,
  SignatureAlgorithm,
  ISignatureAlgorithmConstructable,
  IHashAlgorithmConstructable,
} from './algorithm';
import './xml/key_infos';
import { SignatureMethod } from './xml/signature_method';

import { Transform, XmlSignature } from './xml';
import {
  XmlDsigBase64Transform,
  XmlDsigC14NTransform,
  XmlDsigC14NWithCommentsTransform,
  XmlDsigEnvelopedSignatureTransform,
  XmlDsigExcC14NTransform,
  XmlDsigExcC14NWithCommentsTransform,
} from './xml/transforms';
import { AlgorithmFactory } from './algorithm.factory';
import { algorithmRegistry } from './algorithm.registry';
import { KeyInfoClauseConstructable } from './xml/key_infos';
import { keyValueRegistry } from './xml/key_infos/key_info_clause.registry';

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

  /**
   * Creates an instance of a signature algorithm based on the provided signature method.
   *
   * @param method - The signature method containing algorithm information and optional parameters.
   * @returns An instance of the resolved `SignatureAlgorithm`.
   * @throws {XmlError} If RSA-PSS parameters cannot be determined.
   * @throws {XmlError} If the signature algorithm is not supported.
   */
  public static CreateSignatureAlgorithm(method: SignatureMethod): SignatureAlgorithm {
    return AlgorithmFactory.createSignatureAlgorithmFromMethod(method);
  }

  public static CreateHashAlgorithm(namespace: string): HashAlgorithm {
    return AlgorithmFactory.createHashAlgorithmFromNamespace(namespace);
  }

  public static GetHashAlgorithm(algorithm: AlgorithmIdentifier): IHashAlgorithm {
    const alg: Algorithm = typeof algorithm === 'string' ? { name: algorithm } : algorithm;

    return AlgorithmFactory.createHashAlgorithmFromAlgorithm(alg);
  }

  public static GetSignatureAlgorithm(algorithm: AlgorithmIdentifier): ISignatureAlgorithm {
    const alg: Algorithm = typeof algorithm === 'string' ? { name: algorithm } : algorithm;
    if ('hash' in alg && typeof alg.hash === 'string') {
      alg.hash = { name: alg.hash };
    }

    return AlgorithmFactory.createSignatureAlgorithmFromAlgorithm(alg);
  }

  static CreateSignatureMethod(algorithm: ISignatureAlgorithm): SignatureMethod {
    const signatureMethod = new SignatureMethod();
    signatureMethod.Algorithm = algorithm.namespaceURI;

    if (algorithm.toMethod) {
      algorithm.toMethod(signatureMethod);
    }

    return signatureMethod;
  }

  static RegisterSignatureAlgorithm(
    namespace: string,
    algorithm: ISignatureAlgorithmConstructable,
  ) {
    algorithmRegistry.set(namespace, {
      type: 'signature',
      algorithm,
    });
  }

  static RegisterHashAlgorithm(namespace: string, algorithm: IHashAlgorithmConstructable) {
    algorithmRegistry.set(namespace, {
      type: 'hash',
      algorithm,
    });
  }

  static RegisterKeyInfoClause(localName: string, keyValue: KeyInfoClauseConstructable) {
    keyValueRegistry.set(localName, keyValue);
  }
}

import { XE, XmlError } from 'xml-core';
import { algorithmRegistry } from './algorithm.registry';
import { SignatureMethod } from './xml';
import { IHashAlgorithm, ISignatureAlgorithm } from './algorithm';

export class AlgorithmFactory {
  static createHashAlgorithmFromNamespace(namespace: string): IHashAlgorithm {
    for (const [uri, { type, algorithm }] of algorithmRegistry) {
      if (type === 'hash' && uri === namespace) {
        return new algorithm();
      }
    }
    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, namespace);
  }

  static createSignatureAlgorithmFromMethod(method: SignatureMethod): ISignatureAlgorithm {
    for (const [namespaceURI, { type, algorithm: ctor }] of algorithmRegistry) {
      if (type === 'signature' && method.Algorithm === namespaceURI) {
        const signatureAlgorithm = new ctor();

        if (signatureAlgorithm.fromMethod) {
          signatureAlgorithm.fromMethod(method);
        }

        return signatureAlgorithm;
      }
    }
    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, method.Algorithm);
  }

  static createHashAlgorithmFromAlgorithm(alg: Algorithm): IHashAlgorithm {
    for (const [, { type, algorithm: ctor }] of algorithmRegistry) {
      if (type === 'hash') {
        const hashAlgorithm = new ctor();
        if (hashAlgorithm.algorithm.name.toUpperCase() === alg.name.toUpperCase()) {
          return hashAlgorithm;
        }
      }
    }

    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, alg.name);
  }

  static createSignatureAlgorithmFromAlgorithm(alg: Algorithm): ISignatureAlgorithm {
    for (const [, { type, algorithm: ctor }] of algorithmRegistry) {
      if (type === 'signature') {
        const signatureAlgorithm = ctor.fromAlgorithm(alg);
        if (signatureAlgorithm) {
          return signatureAlgorithm;
        }
      }
    }

    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, alg.name);
  }
}

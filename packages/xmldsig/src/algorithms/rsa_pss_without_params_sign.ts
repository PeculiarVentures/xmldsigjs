import { ISignatureAlgorithm, SignatureAlgorithm } from '../algorithm.js';
import { SHA1, SHA256, SHA384, SHA512 } from './rsa_hash.js';
import { RSA_PSS } from './rsa_pss_sign.js';

export const RSA_PSS_SHA1_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha1-rsa-MGF1';
export const RSA_PSS_SHA256_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha256-rsa-MGF1';
export const RSA_PSS_SHA384_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha384-rsa-MGF1';
export const RSA_PSS_SHA512_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha512-rsa-MGF1';

interface RsaPssWithoutParamsAlgorithm extends Algorithm {
  name: typeof RSA_PSS;
  hash: Algorithm;
  saltLength: number;
}

export class RsaPssWithoutParamsBase extends SignatureAlgorithm {
  // No-params URI variants are selected from SignatureMethod URI, not from Algorithm input.
  public static fromAlgorithm(_alg: Algorithm): ISignatureAlgorithm | null {
    return null;
  }
}

export class RsaPssWithoutParamsSha1 extends RsaPssWithoutParamsBase {
  public algorithm: RsaPssWithoutParamsAlgorithm = {
    name: RSA_PSS,
    hash: {
      name: SHA1,
    },
    saltLength: 20,
  };

  public namespaceURI = RSA_PSS_SHA1_NAMESPACE;
}

export class RsaPssWithoutParamsSha256 extends RsaPssWithoutParamsBase {
  public algorithm: RsaPssWithoutParamsAlgorithm = {
    name: RSA_PSS,
    hash: {
      name: SHA256,
    },
    saltLength: 32,
  };

  public namespaceURI = RSA_PSS_SHA256_NAMESPACE;
}

export class RsaPssWithoutParamsSha384 extends RsaPssWithoutParamsBase {
  public algorithm: RsaPssWithoutParamsAlgorithm = {
    name: RSA_PSS,
    hash: {
      name: SHA384,
    },
    saltLength: 48,
  };

  public namespaceURI = RSA_PSS_SHA384_NAMESPACE;
}

export class RsaPssWithoutParamsSha512 extends RsaPssWithoutParamsBase {
  public algorithm: RsaPssWithoutParamsAlgorithm = {
    name: RSA_PSS,
    hash: {
      name: SHA512,
    },
    saltLength: 64,
  };

  public namespaceURI = RSA_PSS_SHA512_NAMESPACE;
}

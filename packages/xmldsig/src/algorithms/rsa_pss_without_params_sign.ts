import { SignatureAlgorithm } from '../algorithm.js';
import { SHA1, SHA256, SHA384, SHA512 } from './rsa_hash.js';
import { RSA_PSS } from './rsa_pss_sign.js';

// https://tools.ietf.org/html/rfc6931#section-2.3.10

export const RSA_PSS_SHA1_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha1-rsa-MGF1';
export const RSA_PSS_SHA256_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha256-rsa-MGF1';
export const RSA_PSS_SHA384_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha384-rsa-MGF1';
export const RSA_PSS_SHA512_NAMESPACE = 'http://www.w3.org/2007/05/xmldsig-more#sha512-rsa-MGF1';

export class RsaPssWithoutParamsBase extends SignatureAlgorithm {
  public algorithm: any = {
    name: RSA_PSS,
    hash: {
      name: SHA1,
    },
  };

  public namespaceURI = RSA_PSS_SHA1_NAMESPACE;
}

export class RsaPssWithoutParamsSha1 extends RsaPssWithoutParamsBase {
  constructor() {
    super();
    this.algorithm.hash.name = SHA1;
    this.algorithm.saltLength = 20;
  }
}

export class RsaPssWithoutParamsSha256 extends RsaPssWithoutParamsBase {
  constructor() {
    super();
    this.algorithm.hash.name = SHA256;
    this.algorithm.saltLength = 32;
  }
}

export class RsaPssWithoutParamsSha384 extends RsaPssWithoutParamsBase {
  constructor() {
    super();
    this.algorithm.hash.name = SHA384;
    this.algorithm.saltLength = 48;
  }
}

export class RsaPssWithoutParamsSha512 extends RsaPssWithoutParamsBase {
  constructor() {
    super();
    this.algorithm.hash.name = SHA512;
    this.algorithm.saltLength = 64;
  }
}

import { ISignatureAlgorithm, SignatureAlgorithm } from '../algorithm';
import { SHA1, SHA256, SHA384, SHA512 } from './rsa_hash';

export const HMAC = 'HMAC';
export const HMAC_SHA1_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#hmac-sha1';
export const HMAC_SHA256_NAMESPACE = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha256';
export const HMAC_SHA384_NAMESPACE = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha384';
export const HMAC_SHA512_NAMESPACE = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha512';

function fromAlgorithm(alg: HmacKeyAlgorithm): ISignatureAlgorithm | null {
  if (alg.name.toUpperCase() === HMAC.toUpperCase()) {
    switch (alg.hash.name.toUpperCase()) {
      case SHA1:
        return new HmacSha1();
      case SHA256:
        return new HmacSha256();
      case SHA384:
        return new HmacSha384();
      case SHA512:
        return new HmacSha512();
    }
  }
  return null;
}

interface HmacKeyAlgorithm extends Algorithm {
  hash: Algorithm;
}

export class HmacSha1 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: HmacKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public algorithm: HmacKeyAlgorithm = {
    name: HMAC,
    hash: {
      name: SHA1,
    },
  };

  public namespaceURI = HMAC_SHA1_NAMESPACE;
}

export class HmacSha256 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: HmacKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public algorithm: HmacKeyAlgorithm = {
    name: HMAC,
    hash: {
      name: SHA256,
    },
  };

  public namespaceURI = HMAC_SHA256_NAMESPACE;
}

export class HmacSha384 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: HmacKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public algorithm: HmacKeyAlgorithm = {
    name: HMAC,
    hash: {
      name: SHA384,
    },
  };

  public namespaceURI = HMAC_SHA384_NAMESPACE;
}

export class HmacSha512 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: HmacKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public algorithm: HmacKeyAlgorithm = {
    name: HMAC,
    hash: {
      name: SHA512,
    },
  };

  public namespaceURI = HMAC_SHA512_NAMESPACE;
}

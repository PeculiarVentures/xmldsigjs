import { type ISignatureAlgorithm, SignatureAlgorithm } from "../algorithm.js";
import { SHA1, SHA256, SHA384, SHA512 } from "./rsa_hash.js";

export const RSA_PKCS1 = "RSASSA-PKCS1-v1_5";

export const RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
export const RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
export const RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
export const RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";

function fromAlgorithm(alg: RsaHashedKeyAlgorithm): ISignatureAlgorithm | null {
  if (alg.name.toUpperCase() === RSA_PKCS1.toUpperCase()) {
    switch (alg.hash.name.toUpperCase()) {
      case SHA1:
        return new RsaPkcs1Sha1();
      case SHA256:
        return new RsaPkcs1Sha256();
      case SHA384:
        return new RsaPkcs1Sha384();
      case SHA512:
        return new RsaPkcs1Sha512();
    }
  }
  return null;
}

export class RsaPkcs1Sha1 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: RsaHashedKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public override algorithm: any = {
    name: RSA_PKCS1,
    hash: {
      name: SHA1,
    },
  };

  public override namespaceURI = RSA_PKCS1_SHA1_NAMESPACE;
}

export class RsaPkcs1Sha256 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: RsaHashedKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public override algorithm: any = {
    name: RSA_PKCS1,
    hash: {
      name: SHA256,
    },
  };

  public override namespaceURI = RSA_PKCS1_SHA256_NAMESPACE;
}

export class RsaPkcs1Sha384 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: RsaHashedKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public override algorithm: any = {
    name: RSA_PKCS1,
    hash: {
      name: SHA384,
    },
  };

  public override namespaceURI = RSA_PKCS1_SHA384_NAMESPACE;
}

export class RsaPkcs1Sha512 extends SignatureAlgorithm {
  public static fromAlgorithm(alg: RsaHashedKeyAlgorithm): ISignatureAlgorithm | null {
    return fromAlgorithm(alg);
  }

  public override algorithm: any = {
    name: RSA_PKCS1,
    hash: {
      name: SHA512,
    },
  };

  public override namespaceURI = RSA_PKCS1_SHA512_NAMESPACE;
}

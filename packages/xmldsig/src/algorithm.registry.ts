import { IHashAlgorithmConstructable, ISignatureAlgorithmConstructable } from './algorithm';

interface IHashAlgorithmRegistryItem {
  type: 'hash';
  algorithm: IHashAlgorithmConstructable;
}

interface ISignatureAlgorithmRegistryItem {
  type: 'signature';
  algorithm: ISignatureAlgorithmConstructable;
}

type AlgorithmRegistryItem = IHashAlgorithmRegistryItem | ISignatureAlgorithmRegistryItem;

class AlgorithmRegistry extends Map<string, AlgorithmRegistryItem> {}

export const algorithmRegistry = new AlgorithmRegistry();

import {
  // rsa pkcs1
  RSA_PKCS1_SHA1_NAMESPACE,
  RSA_PKCS1_SHA256_NAMESPACE,
  RSA_PKCS1_SHA384_NAMESPACE,
  RSA_PKCS1_SHA512_NAMESPACE,
  RsaPkcs1Sha1,
  RsaPkcs1Sha256,
  RsaPkcs1Sha384,
  RsaPkcs1Sha512,
  ECDSA_SHA1_NAMESPACE,
  ECDSA_SHA256_NAMESPACE,
  ECDSA_SHA384_NAMESPACE,
  ECDSA_SHA512_NAMESPACE,
  EcdsaSha1,
  EcdsaSha256,
  EcdsaSha384,
  EcdsaSha512,

  // hmac
  HMAC_SHA1_NAMESPACE,
  HMAC_SHA256_NAMESPACE,
  HMAC_SHA384_NAMESPACE,
  HMAC_SHA512_NAMESPACE,
  HmacSha1,
  HmacSha256,
  HmacSha384,
  HmacSha512,
  Sha1,
  SHA1_NAMESPACE,
  Sha256,
  SHA256_NAMESPACE,
  Sha384,
  SHA384_NAMESPACE,
  Sha512,
  SHA512_NAMESPACE,
  RSA_PSS_WITH_PARAMS_NAMESPACE,
  RsaPssWithParams,
} from './algorithms';

// Register RSA PKCS1 algorithms
algorithmRegistry.set(RSA_PKCS1_SHA1_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha1,
});
algorithmRegistry.set(RSA_PKCS1_SHA256_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha256,
});
algorithmRegistry.set(RSA_PKCS1_SHA384_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha384,
});
algorithmRegistry.set(RSA_PKCS1_SHA512_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha512,
});
algorithmRegistry.set(RSA_PKCS1_SHA1_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha1,
});
algorithmRegistry.set(RSA_PKCS1_SHA256_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha256,
});
algorithmRegistry.set(RSA_PKCS1_SHA384_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha384,
});
algorithmRegistry.set(RSA_PKCS1_SHA512_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPkcs1Sha512,
});
// Register RSA PSS algorithms with params
algorithmRegistry.set(RSA_PSS_WITH_PARAMS_NAMESPACE, {
  type: 'signature',
  algorithm: RsaPssWithParams,
});

// ECDSA algorithms
algorithmRegistry.set(ECDSA_SHA1_NAMESPACE, {
  type: 'signature',
  algorithm: EcdsaSha1,
});
algorithmRegistry.set(ECDSA_SHA256_NAMESPACE, {
  type: 'signature',
  algorithm: EcdsaSha256,
});
algorithmRegistry.set(ECDSA_SHA384_NAMESPACE, {
  type: 'signature',
  algorithm: EcdsaSha384,
});
algorithmRegistry.set(ECDSA_SHA512_NAMESPACE, {
  type: 'signature',
  algorithm: EcdsaSha512,
});
algorithmRegistry.set(ECDSA_SHA1_NAMESPACE.toUpperCase(), {
  type: 'signature',
  algorithm: EcdsaSha1,
});
algorithmRegistry.set(ECDSA_SHA256_NAMESPACE.toUpperCase(), {
  type: 'signature',
  algorithm: EcdsaSha256,
});
algorithmRegistry.set(ECDSA_SHA384_NAMESPACE.toUpperCase(), {
  type: 'signature',
  algorithm: EcdsaSha384,
});
algorithmRegistry.set(ECDSA_SHA512_NAMESPACE.toUpperCase(), {
  type: 'signature',
  algorithm: EcdsaSha512,
});
// HMAC algorithms
algorithmRegistry.set(HMAC_SHA1_NAMESPACE, {
  type: 'signature',
  algorithm: HmacSha1,
});
algorithmRegistry.set(HMAC_SHA256_NAMESPACE, {
  type: 'signature',
  algorithm: HmacSha256,
});
algorithmRegistry.set(HMAC_SHA384_NAMESPACE, {
  type: 'signature',
  algorithm: HmacSha384,
});
algorithmRegistry.set(HMAC_SHA512_NAMESPACE, {
  type: 'signature',
  algorithm: HmacSha512,
});

// SHA algorithms
algorithmRegistry.set(SHA1_NAMESPACE, {
  type: 'hash',
  algorithm: Sha1,
});
algorithmRegistry.set(SHA256_NAMESPACE, {
  type: 'hash',
  algorithm: Sha256,
});
algorithmRegistry.set(SHA384_NAMESPACE, {
  type: 'hash',
  algorithm: Sha384,
});
algorithmRegistry.set(SHA512_NAMESPACE, {
  type: 'hash',
  algorithm: Sha512,
});

import { HashAlgorithm } from '../algorithm.js';

export const SHA1 = 'SHA-1';
export const SHA256 = 'SHA-256';
export const SHA384 = 'SHA-384';
export const SHA512 = 'SHA-512';

export const SHA1_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#sha1';
export const SHA256_NAMESPACE = 'http://www.w3.org/2001/04/xmlenc#sha256';
export const SHA384_NAMESPACE = 'http://www.w3.org/2001/04/xmldsig-more#sha384';
export const SHA512_NAMESPACE = 'http://www.w3.org/2001/04/xmlenc#sha512';

export class Sha1 extends HashAlgorithm {
  public algorithm = { name: SHA1 };
  public namespaceURI = SHA1_NAMESPACE;
}

export class Sha256 extends HashAlgorithm {
  public algorithm = { name: SHA256 };
  public namespaceURI = SHA256_NAMESPACE;
}

export class Sha384 extends HashAlgorithm {
  public algorithm = { name: SHA384 };
  public namespaceURI = SHA384_NAMESPACE;
}

export class Sha512 extends HashAlgorithm {
  public algorithm = { name: SHA512 };
  public namespaceURI = SHA512_NAMESPACE;
}

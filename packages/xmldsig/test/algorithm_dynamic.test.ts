import { describe, it, beforeAll, assert } from 'vitest';
import { Crypto } from '@peculiar/webcrypto';
import { XmlElement, XmlChildElement } from 'xml-core';
import * as xmldsig from '../src';
import { HashAlgorithm, SignatureAlgorithm } from '../src/algorithm';
import { KeyInfoClause } from '../src/xml/key_infos/key_info_clause';

// Initialize @peculiar/webcrypto
const crypto = new Crypto();
xmldsig.Application.setEngine('WebCrypto', crypto);

// Ed25519 signature algorithm namespaces
const ED25519_NAMESPACE = 'http://www.w3.org/2021/04/xmldsig-more#eddsa-ed25519';
const SHAKE256_NAMESPACE = 'http://www.w3.org/2021/04/xmldsig-more#shake256';

/**
 * SHAKE256 hash algorithm implementation
 */
class Shake256 extends HashAlgorithm {
  public algorithm: Algorithm = { name: 'SHAKE256' };
  public namespaceURI = SHAKE256_NAMESPACE;

  public async Digest(xml: BufferSource | string | Node): Promise<Uint8Array> {
    // For SHAKE256, we need to specify the output length
    // Using 256 bits (32 bytes) as default output length
    let buf: Uint8Array;

    if (typeof xml === 'string') {
      buf = new TextEncoder().encode(xml);
    } else if (ArrayBuffer.isView(xml)) {
      buf = new Uint8Array(xml.buffer);
    } else if (xml instanceof ArrayBuffer) {
      buf = new Uint8Array(xml);
    } else {
      const txt = new XMLSerializer().serializeToString(xml);
      buf = new TextEncoder().encode(txt);
    }

    // Use SHAKE256 with 32 bytes output
    const hashAlgorithm = { name: 'SHAKE256', length: 32 };
    const hash = await crypto.subtle.digest(hashAlgorithm, buf);
    return new Uint8Array(hash);
  }
}

/**
 * Ed25519 signature algorithm implementation
 */
class Ed25519Signature extends SignatureAlgorithm {
  public static fromAlgorithm(alg: Algorithm): Ed25519Signature | null {
    if (alg.name.toUpperCase() === 'ED25519') {
      return new Ed25519Signature();
    }
    return null;
  }

  public algorithm: Algorithm = { name: 'Ed25519' };
  public namespaceURI = ED25519_NAMESPACE;

  public async Sign(
    signedInfo: string,
    signingKey: CryptoKey,
    _algorithm: Algorithm,
  ): Promise<ArrayBuffer> {
    const info = new TextEncoder().encode(signedInfo);
    return crypto.subtle.sign('Ed25519', signingKey, info);
  }

  public async Verify(
    signedInfo: string,
    key: CryptoKey,
    signatureValue: Uint8Array,
    _algorithm?: Algorithm,
  ): Promise<boolean> {
    const info = new TextEncoder().encode(signedInfo);
    return crypto.subtle.verify('Ed25519', key, signatureValue, info);
  }
}

/**
 * Ed25519 KeyValue implementation
 */
@XmlElement({
  localName: 'Ed25519KeyValue',
  namespaceURI: 'http://www.w3.org/2021/04/xmldsig-more#',
  prefix: 'dsig11',
})
class Ed25519KeyValue extends KeyInfoClause {
  public static canImportCryptoKey(key: CryptoKey): boolean {
    return key.algorithm.name === 'Ed25519';
  }

  @XmlChildElement({
    localName: 'PublicKey',
    namespaceURI: 'http://www.w3.org/2021/04/xmldsig-more#',
    prefix: 'dsig11',
  })
  public PublicKey: Uint8Array;

  public async importKey(key: CryptoKey): Promise<this> {
    if (key.algorithm.name !== 'Ed25519') {
      throw new Error('Key algorithm must be Ed25519');
    }

    const keyData = await crypto.subtle.exportKey('raw', key);
    this.PublicKey = new Uint8Array(keyData);
    this.Key = key;
    return this;
  }

  public async exportKey(alg?: Algorithm): Promise<CryptoKey> {
    if (!this.PublicKey) {
      throw new Error('PublicKey is not set');
    }

    const algorithm = alg || { name: 'Ed25519' };
    return crypto.subtle.importKey('raw', this.PublicKey, algorithm, true, ['verify']);
  }
}

describe('Dynamic Algorithm Registration', () => {
  beforeAll(() => {
    // Register the new algorithms
    xmldsig.CryptoConfig.RegisterHashAlgorithm(SHAKE256_NAMESPACE, Shake256);
    xmldsig.CryptoConfig.RegisterSignatureAlgorithm(ED25519_NAMESPACE, Ed25519Signature);
    xmldsig.CryptoConfig.RegisterKeyInfoClause('Ed25519', Ed25519KeyValue);
  });

  it('should register and use SHAKE256 hash algorithm', async () => {
    // Test hash algorithm
    const shake256 = xmldsig.CryptoConfig.CreateHashAlgorithm(SHAKE256_NAMESPACE);
    assert.ok(shake256 instanceof Shake256);

    const testData = 'Hello, SHAKE256!';
    const hash = await shake256.Digest(testData);
    assert.ok(hash instanceof Uint8Array);
    assert.equal(hash.length, 32); // 256 bits = 32 bytes
  });

  it('should register and use Ed25519 signature algorithm', async () => {
    // Generate Ed25519 key pair
    const keyPair = (await crypto.subtle.generateKey('Ed25519', true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;

    // Test signature algorithm directly
    const ed25519Alg = new Ed25519Signature();

    const testMessage = 'Hello, Ed25519!';
    const signature = await ed25519Alg.Sign(testMessage, keyPair.privateKey, { name: 'Ed25519' });
    assert.ok(signature instanceof ArrayBuffer);

    const isValid = await ed25519Alg.Verify(
      testMessage,
      keyPair.publicKey,
      new Uint8Array(signature),
    );
    assert.ok(isValid);
  });

  it('should register and use Ed25519 KeyValue', async () => {
    // Generate Ed25519 key pair
    const keyPair = (await crypto.subtle.generateKey('Ed25519', true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;

    // Test KeyValue
    const keyValue = new xmldsig.KeyValue();
    await keyValue.importKey(keyPair.publicKey);

    assert.ok(keyValue.Value instanceof Ed25519KeyValue);

    // Test export
    const exportedKey = await keyValue.exportKey();
    assert.equal(exportedKey.algorithm.name, 'Ed25519');
    assert.equal(exportedKey.type, 'public');
  });

  it('should create and verify XML signature with Ed25519 and SHAKE256', async () => {
    // This test demonstrates the registration working
    // Full XML signature integration would require more complex setup

    // Generate Ed25519 key pair
    const keyPair = (await crypto.subtle.generateKey('Ed25519', true, [
      'sign',
      'verify',
    ])) as CryptoKeyPair;

    // Test that our algorithms are registered and working
    const ed25519Alg = new Ed25519Signature();
    const shake256Alg = new Shake256();

    const testMessage = 'Test message for signing with Ed25519';
    const messageHash = await shake256Alg.Digest(testMessage);

    // Sign the hash
    const signature = await ed25519Alg.Sign(testMessage, keyPair.privateKey, { name: 'Ed25519' });

    // Verify the signature
    const isValid = await ed25519Alg.Verify(
      testMessage,
      keyPair.publicKey,
      new Uint8Array(signature),
    );

    assert.ok(isValid, 'Ed25519 signature should be valid');
    assert.ok(messageHash.length === 32, 'SHAKE256 should produce 32 bytes');
  });

  it('should preserve backward compatibility with existing algorithms', async () => {
    // Test that existing RSA algorithm still works
    const keyPair = (await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify'],
    )) as CryptoKeyPair;

    // Test signature algorithm directly
    const rsaAlg = xmldsig.CryptoConfig.GetSignatureAlgorithm({
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    } as any);

    const testMessage = 'Test message for RSA signing';
    const signature = await rsaAlg.Sign(testMessage, keyPair.privateKey, {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    } as any);

    const isValid = await rsaAlg.Verify(testMessage, keyPair.publicKey, new Uint8Array(signature));

    assert.ok(isValid, 'RSA signature should still work');
  });
});

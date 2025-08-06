import { describe, it, expect, beforeAll } from 'vitest';
import '../../../test/config';
import { Application } from '../../application';
import { SPKIData } from './spki_data';

// Helper to generate a CryptoKey for testing
async function generateTestKey(alg: 'RSASSA-PKCS1-v1_5' | 'ECDSA' = 'RSASSA-PKCS1-v1_5') {
  if (alg === 'RSASSA-PKCS1-v1_5') {
    return Application.crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['sign', 'verify'],
    );
  } else {
    return Application.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify'],
    );
  }
}

describe('SPKIData', () => {
  let publicKey: CryptoKey;
  let _privateKey: CryptoKey;

  beforeAll(async () => {
    const keyPair = await generateTestKey();
    publicKey = keyPair.publicKey;
    _privateKey = keyPair.privateKey;
  });

  it('importKey sets SPKIexp and Key', async () => {
    const spkiData = new SPKIData();
    await spkiData.importKey(publicKey);
    expect(spkiData.SPKIexp).toBeInstanceOf(Uint8Array);
    expect(spkiData.Key).toBe(publicKey);
  });

  it('exportKey throws if SPKIexp is not set', async () => {
    const spkiData = new SPKIData();
    await expect(() =>
      spkiData.exportKey({ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } as Algorithm),
    ).rejects.toThrow('SPKI data is not defined');
  });

  it('exportKey returns CryptoKey and sets Key', async () => {
    const spkiData = new SPKIData();
    await spkiData.importKey(publicKey);
    const key = await spkiData.exportKey({
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    } as Algorithm);
    expect(key.type).toBe('public');
    expect(spkiData.Key).toBe(key);
  });
});

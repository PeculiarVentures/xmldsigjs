import { describe, it, assert } from 'vitest';
import '../test/config.js';
import * as xmldsig from './index.js';

class TestSignedXml extends xmldsig.SignedXml {
  public getPublicKeys(): Promise<CryptoKey[]> {
    return this.GetPublicKeys();
  }
}

function createSignedXmlWithMethod(method: xmldsig.SignatureMethod): TestSignedXml {
  const doc = xmldsig.Parse('<root xmlns:ds="http://www.w3.org/2000/09/xmldsig#" />');
  const signedXml = new TestSignedXml(doc);
  signedXml.XmlSignature.SignedInfo.SignatureMethod = method;
  return signedXml;
}

async function createRsaPssPublicKey(): Promise<CryptoKey> {
  const keyPair = (await xmldsig.Application.crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      hash: 'SHA-256',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;

  return keyPair.publicKey;
}

function addX509ExportStub(signedXml: xmldsig.SignedXml, publicKey: CryptoKey) {
  let seenAlgorithm: Algorithm | undefined;
  const cert = {
    exportKey: async (alg?: Algorithm) => {
      seenAlgorithm = alg;
      return publicKey;
    },
  } as xmldsig.X509Certificate;

  const x509Data = new xmldsig.KeyInfoX509Data();
  x509Data.AddCertificate(cert);
  signedXml.XmlSignature.KeyInfo.Add(x509Data);

  return (): Algorithm | undefined => seenAlgorithm;
}

describe('SignedXml', () => {
  describe('GetPublicKeys', () => {
    it('passes the resolved signature algorithm to X509 certificate export', async () => {
      const algorithm = { name: 'RSA-PSS', hash: { name: 'SHA-256' }, saltLength: 32 } as Algorithm;
      const signatureAlgorithm = xmldsig.CryptoConfig.GetSignatureAlgorithm(algorithm);
      const method = xmldsig.CryptoConfig.CreateSignatureMethod(signatureAlgorithm);
      const signedXml = createSignedXmlWithMethod(method);
      const publicKey = await createRsaPssPublicKey();
      const getSeenAlgorithm = addX509ExportStub(signedXml, publicKey);

      const keys = await signedXml.getPublicKeys();
      const seenAlgorithm = getSeenAlgorithm();

      assert.equal(keys.length, 1);
      assert.equal(seenAlgorithm?.name, 'RSA-PSS');
      assert.equal((seenAlgorithm as RsaHashedImportParams).hash.name, 'SHA-256');
      assert.equal((seenAlgorithm as RsaPssParams).saltLength, 32);
    });
  });
});

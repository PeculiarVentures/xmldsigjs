import { describe, it, assert } from 'vitest';
import * as xmldsig from '../src/index.js';
import './config.js';

describe('HMAC', () => {
  // hash
  ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].forEach((hash) => {
    it(`hash:${hash}`, async () => {
      const signature = new xmldsig.SignedXml();
      const alg: HmacKeyGenParams = {
        name: 'HMAC',
        hash,
      };

      const key = (await xmldsig.Application.crypto.subtle.generateKey(alg, true, [
        'sign',
        'verify',
      ])) as CryptoKey;

      await signature.Sign(
        { name: 'HMAC' }, // algorithm
        key, // key
        xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`), // document
        {
          // options
          references: [{ hash, transforms: ['c14n'] }],
        },
      );

      const signature2 = new xmldsig.SignedXml(
        xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`),
      );
      const xmlSignature = signature.XmlSignature.GetXml();
      assert.ok(xmlSignature);
      signature2.LoadXml(xmlSignature);

      const si = signature2.XmlSignature.SignedInfo;

      // CanonicalizationMethod
      assert.equal(
        si.CanonicalizationMethod.Algorithm,
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      );

      // SignatureMethod
      let signatureMethod;
      let signatureValueSize;
      switch (hash) {
        case 'SHA-1':
          signatureMethod = 'http://www.w3.org/2000/09/xmldsig#hmac-sha1';
          signatureValueSize = 160;
          break;
        case 'SHA-256':
          signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha256';
          signatureValueSize = 256;
          break;
        case 'SHA-384':
          signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha384';
          signatureValueSize = 384;
          break;
        case 'SHA-512':
          signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#hmac-sha512';
          signatureValueSize = 512;
          break;
      }
      assert.equal(si.SignatureMethod.Algorithm, signatureMethod);
      assert.equal(signature2.XmlSignature.SignatureValue?.length, signatureValueSize / 8);

      assert.equal(si.SignatureMethod.HMACOutputLength, undefined);

      // TODO: Check signature length. Issue #85

      // DigestMethod
      let digestMethod;
      switch (hash) {
        case 'SHA-1':
          digestMethod = 'http://www.w3.org/2000/09/xmldsig#sha1';
          break;
        case 'SHA-224':
          digestMethod = 'http://www.w3.org/2001/04/xmlenc#sha224';
          break;
        case 'SHA-256':
          digestMethod = 'http://www.w3.org/2001/04/xmlenc#sha256';
          break;
        case 'SHA-384':
          digestMethod = 'http://www.w3.org/2001/04/xmldsig-more#sha384';
          break;
        case 'SHA-512':
          digestMethod = 'http://www.w3.org/2001/04/xmlenc#sha512';
          break;
      }
      assert.equal(si.References.Item(0)?.DigestMethod.Algorithm, digestMethod);

      const ok = await signature2.Verify(key);

      assert.equal(ok, true);
    });
  });
});

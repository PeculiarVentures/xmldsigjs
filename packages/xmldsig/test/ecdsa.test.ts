import { describe, it, assert } from 'vitest';
import * as xmldsig from '../src/index.js';
import './config.js';

describe('ECDSA', () => {
  // namedCurves
  ['P-256', 'P-384', 'P-521'].forEach((namedCurve) => {
    describe(namedCurve, () => {
      // hash
      ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].forEach((hash) => {
        it(hash, async () => {
          const signature = new xmldsig.SignedXml();

          const keys = (await xmldsig.Application.crypto.subtle.generateKey(
            {
              name: 'ECDSA',
              namedCurve,
            },
            true,
            ['sign', 'verify'],
          )) as Required<CryptoKeyPair>;

          await signature.Sign(
            { name: 'ECDSA', hash } as EcdsaParams, // algorithm
            keys.privateKey, // key
            xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`), // document
            {
              // options
              keyValue: keys.publicKey,
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
          switch (hash) {
            case 'SHA-1':
              signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1';
              break;
            case 'SHA-224':
              signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha224';
              break;
            case 'SHA-256':
              signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256';
              break;
            case 'SHA-384':
              signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384';
              break;
            case 'SHA-512':
              signatureMethod = 'http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512';
              break;
          }
          assert.equal(si.SignatureMethod.Algorithm, signatureMethod);

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

          const ok = await signature2.Verify();

          assert.equal(ok, true);
        });
      });
    });
  });
});

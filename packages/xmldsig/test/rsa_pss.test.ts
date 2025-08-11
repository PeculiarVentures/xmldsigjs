import { describe, it, assert } from 'vitest';
import * as xmldsig from '../src/index.js';
import './config.js';

describe('RSA-PSS', () => {
  // modulusLength
  [1024, 2048].forEach((modulusLength) => {
    // publicExponent
    [new Uint8Array([1, 0, 1])].forEach((publicExponent) => {
      describe(`n:${modulusLength} e:${publicExponent[0] === 1 ? 65537 : 3}`, () => {
        // hash
        ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].forEach((hash) => {
          // salt length
          [32, 64].forEach((saltLength: number) => {
            // exclude saltLength=64 for SHA-512
            if (hash === 'SHA-512' && saltLength === 64) {
              return;
            }

            it(`hash:${hash} salt:${saltLength}`, async () => {
              const signature = new xmldsig.SignedXml();

              const keys = (await xmldsig.Application.crypto.subtle.generateKey(
                {
                  name: 'RSA-PSS',
                  hash,
                  modulusLength,
                  publicExponent,
                },
                true,
                ['sign', 'verify'],
              )) as Required<CryptoKeyPair>;

              const alg = { name: 'RSA-PSS' };
              if (saltLength) {
                alg['saltLength'] = saltLength;
              }
              await signature.Sign(
                alg, // algorithm
                keys.privateKey, // key
                xmldsig.Parse(`<root><first id="id1"><foo>hello</foo></first></root>`), // document
                {
                  // options
                  keyValue: keys.publicKey,
                  references: [{ hash, transforms: ['c14n'] }],
                },
              );

              // console.log(signature.toString());

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
                case 'SHA-224':
                case 'SHA-256':
                case 'SHA-384':
                case 'SHA-512':
                  signatureMethod = 'http://www.w3.org/2007/05/xmldsig-more#rsa-pss';
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

              // PSS params
              assert.equal(si.SignatureMethod.Any.Count, 1);
              const pss = si.SignatureMethod.Any.Item(0) as xmldsig.PssAlgorithmParams;
              assert.equal(pss.DigestMethod.Algorithm, digestMethod);
              assert.equal(pss.SaltLength, saltLength);

              const ok = await signature2.Verify();
              assert.equal(ok, true);
            });
          });
        });
      });
    });
  });
});

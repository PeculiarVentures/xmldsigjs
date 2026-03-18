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

  describe('No params URI', () => {
    const vectors = [
      {
        hash: 'SHA-1',
        saltLength: 20,
        namespace: xmldsig.RSA_PSS_SHA1_NAMESPACE,
        algorithm: xmldsig.RsaPssWithoutParamsSha1,
      },
      {
        hash: 'SHA-256',
        saltLength: 32,
        namespace: xmldsig.RSA_PSS_SHA256_NAMESPACE,
        algorithm: xmldsig.RsaPssWithoutParamsSha256,
      },
      {
        hash: 'SHA-384',
        saltLength: 48,
        namespace: xmldsig.RSA_PSS_SHA384_NAMESPACE,
        algorithm: xmldsig.RsaPssWithoutParamsSha384,
      },
      {
        hash: 'SHA-512',
        saltLength: 64,
        namespace: xmldsig.RSA_PSS_SHA512_NAMESPACE,
        algorithm: xmldsig.RsaPssWithoutParamsSha512,
      },
    ] as const;

    vectors.forEach((vector) => {
      it(`resolves ${vector.hash} namespace and signs/verifies`, async () => {
        const method = xmldsig.CryptoConfig.CreateSignatureMethod(new vector.algorithm());
        assert.equal(method.Algorithm, vector.namespace);
        assert.equal(method.Any.Count, 0);

        const resolved = xmldsig.CryptoConfig.CreateSignatureAlgorithm(method);
        assert.equal(resolved.algorithm.name, 'RSA-PSS');
        assert.equal((resolved.algorithm as RsaHashedImportParams).hash.name, vector.hash);
        assert.equal((resolved.algorithm as RsaPssParams).saltLength, vector.saltLength);

        const algorithm = new vector.algorithm();
        const data = '<SignedInfo />';
        const keys = (await xmldsig.Application.crypto.subtle.generateKey(
          {
            name: 'RSA-PSS',
            hash: vector.hash,
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
          },
          true,
          ['sign', 'verify'],
        )) as Required<CryptoKeyPair>;

        const signature = await algorithm.Sign(data, keys.privateKey, algorithm.algorithm);
        const ok = await algorithm.Verify(data, keys.publicKey, new Uint8Array(signature));
        assert.equal(ok, true);
      });
    });
  });
});

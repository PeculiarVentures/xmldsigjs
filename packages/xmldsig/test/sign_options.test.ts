import { describe, it, assert, beforeAll } from 'vitest';
import * as xmldsig from '../src';
import './config';

describe('Signing options', () => {
  const xmlDocument = xmldsig.Parse(`<root><child id="child"/></root>`);
  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };
  let keys;

  beforeAll(async () => {
    keys = await xmldsig.Application.crypto.subtle.generateKey(algorithm, false, [
      'sign',
      'verify',
    ]);
  });

  async function Sign(options) {
    const signedXml = new xmldsig.SignedXml();

    await signedXml.Sign(algorithm, keys.privateKey, xmlDocument, options);
    return signedXml;
  }

  function Parse(xml) {
    const vXml = xmldsig.Parse(xml);
    const vSignature = vXml.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Signature',
    )[0];
    const signedXml = new xmldsig.SignedXml(vXml);
    signedXml.LoadXml(vSignature);

    return signedXml;
  }

  async function SignParse(options) {
    const xml = await Sign(options);
    // console.log(xml.toString());
    return Parse(xml.toString());
  }

  describe('Signature', () => {
    describe('Id', () => {
      async function Check(value, expectedValue) {
        const signature = await SignParse({
          id: value,
          keyValue: keys.publicKey,
          references: [
            {
              hash: 'SHA-256',
              transforms: ['enveloped'],
            },
          ],
        });

        assert.equal(expectedValue, signature.XmlSignature.Id);
      }

      it('Empty', async () => {
        await Check(undefined, '');
      });

      it('Not empty', async () => {
        await Check('id-12345', 'id-12345');
      });
    });
  });

  describe('References', () => {
    describe('Uri', () => {
      async function Check(value, expectedValue) {
        const signature = await SignParse({
          keyValue: keys.publicKey,
          references: [
            {
              uri: value,
              hash: 'SHA-256',
              transforms: ['enveloped'],
            },
          ],
        });

        assert.equal(expectedValue, signature.XmlSignature.SignedInfo.References.Item(0)?.Uri);
      }

      it('Not present', async () => {
        await Check(undefined, undefined);
      });

      it('Empty string', async () => {
        await Check('', '');
      });

      it('Value', async () => {
        await Check('/', '/');
      });
    });

    it('Count', async () => {
      const signature = await SignParse({
        keyValue: keys.publicKey,
        references: [
          {
            hash: 'SHA-256',
            transforms: ['enveloped'],
          },
          {
            hash: 'SHA-1',
            transforms: ['enveloped'],
          },
        ],
      });

      assert.equal(2, signature.XmlSignature.SignedInfo.References.Count);
    });
  });
});

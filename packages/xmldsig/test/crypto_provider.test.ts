import { describe, it, assert, beforeAll } from 'vitest';
import { Crypto } from '@peculiar/webcrypto';
import * as xmldsig from '../src/index.js';
// NOTE: `./config.js` is not imported on purpose. It sets a default engine for the Application,
// and this suite checks that the library works without one.
import '../../core/test/config.js';

const xml = `<root><first id="id1"><foo>hello</foo></first></root>`;
const x509data = `<ds:X509Data xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Certificate>MIIEHjCCAwagAwIBAgIBATANBgkqhkiG9w0BAQUFADBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbTAeFw0xMzA1MjcwODU1MTNaFw0xODA1MjcwODU1MTNaMGcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRUwEwYDVQQHDAxTYW50YSBNb25pY2ExETAPBgNVBAoMCE9uZUxvZ2luMRkwFwYDVQQDDBBhcHAub25lbG9naW4uY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoXoc7IFZQRv+SwJ15zjIl9touwY5e6b7H4vn3OtOUByjOKHUX8VX0TpbAV2ctZE2GSALx1AGuQAv6O4MVUH+qn/2IAiBY3a7zKN07UBsya7xFMQVHuGE6EiBAs9jpA9wjvYMPRkS5wYZcwjpTQSZK7zFPPtobG8K/1vDbm/tWZjNLmZmQePmXpwrQAuC0+NlzlmnjoQYB2xp2NaTUK9JnnmuB5qev3dpUwlYGSJpf+HUIoxuo8IpxAXOymq1d6tEEJgU1kR2sa7o1sSRFo31YeW/qYCP/gcLJZo3MRUDFe0g5MHeliFue9DsKYUsC6qwAD3gc+MI47buiD6Msu11cwIDAQABo4HUMIHRMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFAAJFJRIlpQQSFsuNdeq7FkTJIH4MIGRBgNVHSMEgYkwgYaAFAAJFJRIlpQQSFsuNdeq7FkTJIH4oWukaTBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbYIBATAOBgNVHQ8BAf8EBAMCBPAwDQYJKoZIhvcNAQEFBQADggEBAB9zN+g6N4sUBE61RaMUH2LSHWwOtfhL64i7pjHjvZa47/qcV/S0Yyd4IE44ho9i2N+AM79d34mThc30oK5aVxOKphKf+xM/cOyVaWIeqr+dCbkY/0OpLEwWOh9VSgOizRO3evLMurbtR892LbSK/Td3hG5jfwoHD23nHH87Dv/3KyZox9MkJdY2DXOHGGIcsqoIifaTyNZyhW6RgwEujQ6LjsaolP1YoeV85TZFKTLa1Ta7ZLUVUC2UJWqz+kRlsyGxf+E/ZmJ7hSq0ZBVHrVOyXjCcFn6X0/W5SrpOmN3fZYcj8Bp6vhB0cJk9qpjgWOP2RCuBdHZVawjCjIaE+bc=</ds:X509Certificate></ds:X509Data>`;

/**
 * Wraps a crypto provider and records the names of the SubtleCrypto methods called on it
 */
function CountingCrypto(crypto: Crypto) {
  const operations: string[] = [];
  const subtle = new Proxy(crypto.subtle, {
    get(target, name: string) {
      const value = Reflect.get(target, name);
      if (typeof value !== 'function') {
        return value;
      }
      return (...args: unknown[]) => {
        operations.push(name);
        return value.apply(target, args);
      };
    },
  });

  return { operations, crypto: { subtle } as Crypto };
}

describe('Crypto provider', () => {
  const crypto1 = new Crypto();
  const crypto2 = new Crypto();
  let keys: Required<CryptoKeyPair>;

  beforeAll(async () => {
    keys = (await crypto1.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      true,
      ['sign', 'verify'],
    )) as Required<CryptoKeyPair>;
  });

  async function Sign(crypto?: Crypto, signedXml = new xmldsig.SignedXml()) {
    await signedXml.Sign(
      { name: 'RSASSA-PKCS1-v1_5' }, // algorithm
      keys.privateKey, // key
      xmldsig.Parse(xml), // document
      {
        // options
        keyValue: keys.publicKey,
        references: [{ hash: 'SHA-256', transforms: ['c14n'] }],
      },
      crypto,
    );

    return signedXml;
  }

  function Load(signedXml: xmldsig.SignedXml, crypto?: Crypto) {
    const loaded = new xmldsig.SignedXml(xmldsig.Parse(xml), crypto);
    const xmlSignature = signedXml.XmlSignature.GetXml();
    assert.ok(xmlSignature);
    loaded.LoadXml(xmlSignature);

    return loaded;
  }

  it('Application has got no default provider', () => {
    // Every test below would throw CRYPTOGRAPHIC_NO_MODULE if it fell back to the Application
    assert.throws(() => xmldsig.Application.crypto);
  });

  it('signs and verifies with a provider given per call', async () => {
    const signedXml = await Sign(crypto1);

    assert.equal(await Load(signedXml).Verify(undefined, crypto1), true);
  });

  it('verifies with a provider other than the signing one', async () => {
    const signedXml = await Sign(crypto1);

    assert.equal(await Load(signedXml).Verify(undefined, crypto2), true);
  });

  it('uses the provider from the constructor', async () => {
    const signedXml = await Sign(undefined, new xmldsig.SignedXml(undefined, crypto1));

    assert.equal(await Load(signedXml, crypto2).Verify(), true);
  });

  it('a provider given per call wins over the one from the constructor', async () => {
    const first = CountingCrypto(crypto1);
    const second = CountingCrypto(crypto2);

    await Sign(second.crypto, new xmldsig.SignedXml(undefined, first.crypto));

    assert.equal(first.operations.length, 0);
    assert.ok(second.operations.includes('sign'));
  });

  it('runs every operation on the given provider', async () => {
    const { operations, crypto } = CountingCrypto(crypto1);

    const signedXml = await Sign(crypto);
    assert.equal(await Load(signedXml, crypto).Verify(), true);

    // digest of the reference, signature of the SignedInfo and the KeyValue round trip
    assert.ok(operations.includes('digest'));
    assert.ok(operations.includes('sign'));
    assert.ok(operations.includes('verify'));
    assert.ok(operations.includes('exportKey'));
    assert.ok(operations.includes('importKey'));
  });

  it('exports a key from X509Data with the given provider', async () => {
    const { operations, crypto } = CountingCrypto(crypto1);
    const keyInfo = xmldsig.KeyInfoX509Data.LoadXml(x509data);

    const key = await keyInfo.exportKey({ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, crypto);

    assert.equal(key.algorithm.name, 'RSASSA-PKCS1-v1_5');
    // PKI.js falls back to its own global engine if the provider is not passed to it
    assert.ok(operations.includes('importKey'));
  });

  it('computes a thumbprint with the given provider', async () => {
    const keyInfo = xmldsig.KeyInfoX509Data.LoadXml(x509data);
    const cert = keyInfo.Certificates[0];

    const thumbprint = await cert.Thumbprint('SHA-256', crypto1);

    assert.equal(thumbprint.byteLength, 32);
  });
});

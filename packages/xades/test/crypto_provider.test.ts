import { describe, it, assert, beforeAll } from 'vitest';
import { Crypto } from '@peculiar/webcrypto';
// NOTE: `./config.js` is not imported on purpose. It sets a default engine for the Application,
// and this suite checks that the library works without one.
import '../../core/test/config.js';
import * as XAdES from '../src/index.js';

describe('XAdES crypto provider', () => {
  const cert =
    'MIIEHjCCAwagAwIBAgIBATANBgkqhkiG9w0BAQUFADBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbTAeFw0xMzA1MjcwODU1MTNaFw0xODA1MjcwODU1MTNaMGcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRUwEwYDVQQHDAxTYW50YSBNb25pY2ExETAPBgNVBAoMCE9uZUxvZ2luMRkwFwYDVQQDDBBhcHAub25lbG9naW4uY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoXoc7IFZQRv+SwJ15zjIl9touwY5e6b7H4vn3OtOUByjOKHUX8VX0TpbAV2ctZE2GSALx1AGuQAv6O4MVUH+qn/2IAiBY3a7zKN07UBsya7xFMQVHuGE6EiBAs9jpA9wjvYMPRkS5wYZcwjpTQSZK7zFPPtobG8K/1vDbm/tWZjNLmZmQePmXpwrQAuC0+NlzlmnjoQYB2xp2NaTUK9JnnmuB5qev3dpUwlYGSJpf+HUIoxuo8IpxAXOymq1d6tEEJgU1kR2sa7o1sSRFo31YeW/qYCP/gcLJZo3MRUDFe0g5MHeliFue9DsKYUsC6qwAD3gc+MI47buiD6Msu11cwIDAQABo4HUMIHRMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFAAJFJRIlpQQSFsuNdeq7FkTJIH4MIGRBgNVHSMEgYkwgYaAFAAJFJRIlpQQSFsuNdeq7FkTJIH4oWukaTBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbYIBATAOBgNVHQ8BAf8EBAMCBPAwDQYJKoZIhvcNAQEFBQADggEBAB9zN+g6N4sUBE61RaMUH2LSHWwOtfhL64i7pjHjvZa47/qcV/S0Yyd4IE44ho9i2N+AM79d34mThc30oK5aVxOKphKf+xM/cOyVaWIeqr+dCbkY/0OpLEwWOh9VSgOizRO3evLMurbtR892LbSK/Td3hG5jfwoHD23nHH87Dv/3KyZox9MkJdY2DXOHGGIcsqoIifaTyNZyhW6RgwEujQ6LjsaolP1YoeV85TZFKTLa1Ta7ZLUVUC2UJWqz+kRlsyGxf+E/ZmJ7hSq0ZBVHrVOyXjCcFn6X0/W5SrpOmN3fZYcj8Bp6vhB0cJk9qpjgWOP2RCuBdHZVawjCjIaE+bc=';
  const alg = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 1024,
  };
  const xml = `<root><child>Test</child></root>`;
  const crypto = new Crypto();
  let keys: Required<CryptoKeyPair>;

  beforeAll(async () => {
    keys = (await crypto.subtle.generateKey(alg, true, [
      'sign',
      'verify',
    ])) as Required<CryptoKeyPair>;
  });

  it('Application has got no default provider', () => {
    // The constructor of SignedXml needs a provider to generate the Id of the signature,
    // so every test below would throw CRYPTOGRAPHIC_NO_MODULE without one
    assert.throws(() => XAdES.Application.crypto);
  });

  it('signs and verifies with a provider given to the constructor', async () => {
    const signature = new XAdES.SignedXml(undefined, crypto);

    await signature.Sign(alg, keys.privateKey, XAdES.Parse(xml), {
      keyValue: keys.publicKey,
      signingCertificate: cert,
      references: [{ hash: 'SHA-256', transforms: ['enveloped'] }],
    });

    const xades = new XAdES.SignedXml(XAdES.Parse(signature.toString()), crypto);
    const xmlSignature = signature.XmlSignature.GetXml();
    assert.ok(xmlSignature);
    xades.LoadXml(xmlSignature);

    assert.equal(
      xades.SignedProperties.SignedSignatureProperties.SigningCertificate.IsEmpty(),
      false,
    );
    assert.equal(await xades.Verify(), true, 'XAdES signature is not valid');
  });

  it('signs with a provider given per call', async () => {
    const signature = new XAdES.SignedXml(undefined, crypto);

    await signature.Sign(
      alg,
      keys.privateKey,
      XAdES.Parse(xml),
      {
        keyValue: keys.publicKey,
        references: [{ hash: 'SHA-256', transforms: ['enveloped'] }],
      },
      crypto,
    );

    const xades = new XAdES.SignedXml(XAdES.Parse(signature.toString()), crypto);
    const xmlSignature = signature.XmlSignature.GetXml();
    assert.ok(xmlSignature);
    xades.LoadXml(xmlSignature);

    assert.equal(await xades.Verify(undefined, crypto), true, 'XAdES signature is not valid');
  });
});

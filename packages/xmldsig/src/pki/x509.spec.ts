import { describe, it, assert } from 'vitest';
import { Convert } from 'pvtsutils';
import '../../test/config';
import { X509Certificate } from './x509';

describe('X509Certificate', () => {
  const x509Rsa = Convert.FromBase64(
    `MIIEOzCCAyOgAwIBAgIJAKP8xLe3bmRsMA0GCSqGSIb3DQEBCwUAMFoxCzAJBgNVBAYTAkFUMS8wLQYDVQQKEyZSdW5kZnVuayB1bmQgVGVsZWtvbSBSZWd1bGllcnVuZ3MtR21iSDEaMBgGA1UEAxMRVHJ1c3RlZCBMaXN0IENBIDEwHhcNMTQwMTI4MTgxNTE4WhcNMTcwMTI4MTgxNTE4WjBXMQswCQYDVQQGEwJBVDEvMC0GA1UEChMmUnVuZGZ1bmsgdW5kIFRlbGVrb20gUmVndWxpZXJ1bmdzLUdtYkgxFzAVBgNVBAMTDlRydXN0ZWQgTGlzdCA0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuh3Ht0BXqmhmMcFDPgSV10WyLlwe3PFoIrgeg3cYQEF+YOtiV5nm6dJnlxoXcO5TJIfbXoSdSOYJTtCuQvZDySHTlSvM5Mr29GRjA489ZKE7pEaI9semFeMyvPaJ/EvaG3ShvrQlLebsS4ALk8JXTRTalZmBlbWi9jK2IFMQaLjQN88K2aUrDZqIqRR4WhBP7T4I3dSVYVmi0TR41JWyaVXKWp7b9WJULewVTf0g+72qwtd7VZo0zQuQgAUsT9bOv8K6PyNIMShh3fLXefaIlmXnPsua6bKc1VAjjR91f83koKUOmDIUciFCsyksa/HUV1tAcZdUZsYe/1JGEJ1CEwIDAQABo4IBBTCCAQEwHwYDVR0jBBgwFoAUsJT0MPOFfU37Ha8aHJ6ELK/YXBkwHQYDVR0OBBYEFNlVL81aLTXfTM3az8PKyBbeWvvFMA4GA1UdDwEB/wQEAwIHgDAWBgNVHSAEDzANMAsGCSooAA8AAQEBADAJBgNVHRMEAjAAMBEGA1UdJQQKMAgGBgQAkTcDADA2BgNVHR8ELzAtMCugKaAnhiVodHRwczovL3d3dy5zaWduYXR1ci5ydHIuYXQvdGxjYTEuY3JsMEEGCCsGAQUFBwEBBDUwMzAxBggrBgEFBQcwAoYlaHR0cHM6Ly93d3cuc2lnbmF0dXIucnRyLmF0L3RsY2ExLmNlcjANBgkqhkiG9w0BAQsFAAOCAQEAHrMrSL2PDCplhLKXmrspfEyjDcCxm6LtoHF58gtZ/kuPQEXzib/6ncxp8wu+HzkHLkZd38rVWgXObngHoKY2F6WtO48xtXgJ7zv2f3Km4yvEuXm/Ro7hzizDatuLZdzCiu97rnvRxCbaQV2XV73dmki+a87ybEGFQGVKBfSM0rEy0p0FD+fRtRvwYafvKjzbC93OJOD7FepEKsHO8CHFWG8X4VxPjkKy/R1yPn2tT/yio626AnKRDqy9/bUQFWITzKMHkVNZY1OMTL7WXjmWFc7L+b0Wt15xBO0YuNg3delXE8aNXdizYDlTzbJUpmq8EcuxHQlMMDQUBtyDcj0RcA==`,
  );
  const x509Ecdsa = Convert.FromBase64(
    `MIIElzCCA3+gAwIBAgISA+clz6CXK2n/5BJuqnF5RgU0MA0GCSqGSIb3DQEBCwUAMEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQDExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0xNjEyMTQyMzAwMDBaFw0xNzAzMTQyMzAwMDBaMBsxGTAXBgNVBAMTEHNjb3R0aGVsbWUuY28udWswWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASCKm6uKC+amuRGFOTtXo0Bh+nNIlbs5XsEVWaP1Ly7igGeofm+tgvE7LcyHndWAWvNaXT2MmWE2DaIoQ81MZp8o4ICbzCCAmswDgYDVR0PAQH/BAQDAgeAMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSB4hotSU3n5hqucTUKcHtpoNypRTAfBgNVHSMEGDAWgBSoSmpjBH3duubRObemRWXv86jsoTBwBggrBgEFBQcBAQRkMGIwLwYIKwYBBQUHMAGGI2h0dHA6Ly9vY3NwLmludC14My5sZXRzZW5jcnlwdC5vcmcvMC8GCCsGAQUFBzAChiNodHRwOi8vY2VydC5pbnQteDMubGV0c2VuY3J5cHQub3JnLzBmBgNVHREEXzBdghZlY2RzYS5zY290dGhlbG1lLmNvLnVrghBzY290dGhlbG1lLmNvLnVrghR3d3cuc2NvdHRoZWxtZS5jby51a4IbeG4tLWx2OGhhYS5zY290dGhlbG1lLmNvLnVrMBEGCCsGAQUFBwEYBAUwAwIBBTCB/gYDVR0gBIH2MIHzMAgGBmeBDAECATCB5gYLKwYBBAGC3xMBAQEwgdYwJgYIKwYBBQUHAgEWGmh0dHA6Ly9jcHMubGV0c2VuY3J5cHQub3JnMIGrBggrBgEFBQcCAjCBngyBm1RoaXMgQ2VydGlmaWNhdGUgbWF5IG9ubHkgYmUgcmVsaWVkIHVwb24gYnkgUmVseWluZyBQYXJ0aWVzIGFuZCBvbmx5IGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgQ2VydGlmaWNhdGUgUG9saWN5IGZvdW5kIGF0IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL3JlcG9zaXRvcnkvMA0GCSqGSIb3DQEBCwUAA4IBAQB7qQsRIzrEChwONa990XMR2ekhTgHVoNbx3dJfN/V04hHtYG0n94ECFFqF4TK8xGhMlOD81UPCylhYshmdxilSvRiWKTmHFfLmzC6gr4pr5mWeNoGqO0CifIM0VGhtsk8V/BBgH42ZJB6cDZc3cXeOWi0itPjOUKjBXdpiUYCWheUlJo391najh454JCLpwxiv9986xuSpaSUkDm9e8tdkVSAgn7KeJYkNoNsNA0Tvz2CCtrgKQN38gUT0el42mrGnXuVM1125GKX7l1XMTAda15SAjZbTR/fPJI0c2YFuXmVNCl+9rzgb2GP+Gg8YnC7Sdj8x8sMqEVkd0yhp/dwB`,
  );

  it('read error', () => {
    assert.throws(() => {
      new X509Certificate(new Uint8Array([1, 2, 3, 4, 5, 6, 7]));
    });
  });

  it('read', () => {
    const x509 = new X509Certificate(x509Rsa);

    assert.equal(!!x509['simpl'], true);
    assert.equal(x509.SerialNumber, '11816535815648863340');
    assert.equal(
      x509.Issuer,
      'C=AT, O=Rundfunk und Telekom Regulierungs-GmbH, CN=Trusted List CA 1',
    );
    assert.equal(x509.Subject, 'C=AT, O=Rundfunk und Telekom Regulierungs-GmbH, CN=Trusted List 4');
    assert.equal(x509.PublicKey, null);
    assert.equal(x509.GetRaw().byteLength, 1087);
  });

  it('thumbprint default sha1', async () => {
    const x509 = new X509Certificate(x509Rsa);

    const hash = await x509.Thumbprint();

    assert.equal(Convert.ToBase64(new Uint8Array(hash)), '8fkJGt2sWZVfYUCi914gPj5wS3E=');
  });

  it('thumbprint sha256', async () => {
    const x509 = new X509Certificate(x509Rsa);

    const hash = await x509.Thumbprint('SHA-256');

    assert.equal(
      Convert.ToBase64(new Uint8Array(hash)),
      '3SYVGIWfXYYHrbeFU3LSrvEbN9HBVXRqJwQjSLhqStU=',
    );
  });

  it('exportKey rsa', async () => {
    const x509 = new X509Certificate(x509Rsa);

    assert.equal(x509.PublicKey, null);

    const key = await x509.exportKey({ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' });

    assert.equal(!!key, true);
    assert.equal(key.type, 'public');
    assert.equal(key.algorithm.name, 'RSASSA-PKCS1-v1_5');
    assert.equal(key.algorithm['hash'].name, 'SHA-256');

    assert.equal(x509.PublicKey, key);
  });

  it('exportKey ecdsa', async () => {
    const x509 = new X509Certificate(x509Ecdsa);

    assert.equal(x509.PublicKey, null);

    const key = await x509.exportKey({ name: 'ECDSA', namedCurve: 'P-256' });
    assert.equal(!!key, true);
    assert.equal(key.type, 'public');
    assert.equal(key.algorithm.name, 'ECDSA');
    assert.equal(key.algorithm['namedCurve'], 'P-256');

    assert.equal(x509.PublicKey, key);

    return;
  });
});

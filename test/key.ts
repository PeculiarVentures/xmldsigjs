import * as assert from "assert";
import { Convert } from "pvtsutils";
import * as xmldsig from "../src";

context("Key", () => {

  context("X509Certificate", () => {

    const certBase64 = "MIIEOzCCAyOgAwIBAgIJAKP8xLe3bmRtMA0GCSqGSIb3DQEBCwUAMFoxCzAJBgNVBAYTAkFUMS8wLQYDVQQKEyZSdW5kZnVuayB1bmQgVGVsZWtvbSBSZWd1bGllcnVuZ3MtR21iSDEaMBgGA1UEAxMRVHJ1c3RlZCBMaXN0IENBIDEwHhcNMTQwMTI4MTgzMzI5WhcNMTgwMTI4MTgzMzI5WjBXMQswCQYDVQQGEwJBVDEvMC0GA1UEChMmUnVuZGZ1bmsgdW5kIFRlbGVrb20gUmVndWxpZXJ1bmdzLUdtYkgxFzAVBgNVBAMTDlRydXN0ZWQgTGlzdCA1MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxsSAzrdy4zFiN1bypCT2LZ5O07y9nTJxNlFXERfTzf0zSEtOKXTjxuRQvXvDSfvvar2au9QDuUEdA+jO9NlBFfHfl95ON/gGhQG/NLplVfVB80y4/iX08O43ZuDXcZbBaNdg6M/2qCwflXBakkwaiF7l2kJQyPl+w9hkSi3LBLRfssJOsk5K8VxaILW680gwVX+9BeShXKn5Fr5vde1G1rAKjs6kNtIlrGLWEXyVeAcdDZNKO16MynSMAUeoyz1k74vdWV1/ixrz2DtgeD/rJOnIiDrBqReJzFyZ74iCIsC4EtiIAg5nEah0krWPH6Yhsurqo8zKYDaZAhmJ2hK39wIDAQABo4IBBTCCAQEwHwYDVR0jBBgwFoAUsJT0MPOFfU37Ha8aHJ6ELK/YXBkwHQYDVR0OBBYEFC9vHwsF0o04l9zC+UONiidHmxfJMA4GA1UdDwEB/wQEAwIHgDAWBgNVHSAEDzANMAsGCSooAA8AAQEBADAJBgNVHRMEAjAAMBEGA1UdJQQKMAgGBgQAkTcDADA2BgNVHR8ELzAtMCugKaAnhiVodHRwczovL3d3dy5zaWduYXR1ci5ydHIuYXQvdGxjYTEuY3JsMEEGCCsGAQUFBwEBBDUwMzAxBggrBgEFBQcwAoYlaHR0cHM6Ly93d3cuc2lnbmF0dXIucnRyLmF0L3RsY2ExLmNlcjANBgkqhkiG9w0BAQsFAAOCAQEAfOCwly06iznOF0juUqqXkC0YoQDwVD8OqlevpJkrvAEl+uYTEa0XzBdTCZ+zXdJW6Icgt+pces+RjeFh4tIQgBkwqPWqmnTqw37ysxgqPO0EHXGu/zLdoA2+8TLLsu9csQ+NY4qNfxFXTWoFqlaUC6Af86Tds7QyjVyqOTMjxS8QKqNfI3bLvc9dSH+oi1v2xsFAl/igoKTqWRhad79lroBRKG6SqNR6Y5WqVFMHToZMD+cdulJE6jrKp3hZQrU/8qkKlqTiem6x2NkKAsGZ13+j25P9Pb3x6hh1gV0A1urI1kG+4cj8UDqLhpPXJN/ZtF95WBaioUhiEae3gojXlA==";
    let cert: xmldsig.X509Certificate;

    before(() => {
      cert = new xmldsig.X509Certificate(Convert.FromBase64(certBase64));
    });

    it("Init with raw", () => {
      cert = new xmldsig.X509Certificate(Convert.FromBase64(certBase64));
      assert.equal(!!cert.GetRaw(), true);
      assert.equal(cert.Issuer, "C=AT, O=Rundfunk und Telekom Regulierungs-GmbH, CN=Trusted List CA 1");
      assert.equal(cert.Subject, "C=AT, O=Rundfunk und Telekom Regulierungs-GmbH, CN=Trusted List 5");
      assert.equal(cert.SerialNumber, "11816535815648863341");
    });

    context("Thumbprint", () => {
      [
        { digest: "SHA-1", value: "563c51e51976c06bba31040ac048765a7c3b65ce" },
        { digest: "SHA-256", value: "dfb818a07dc65a07bf67ebbf389e2d88728ae907bd60de5710d91cf031df518e" },
        { digest: "SHA-384", value: "51002a5a77917e801fb36f5ded7a311697a6b92d089089ce5300143cac3f95b85a04214b318c3df0a6de2e3b7846407b" },
        { digest: "SHA-512", value: "f4859a1f201e7d146fb709f4cae78c502f04f9579d7983c69b1e364370134d2695557625fdf27fec2dc854ffffa4b844d8b64d57a240ee0722459dd0f9b3874e" },
      ].forEach((obj) =>
        it(obj.digest, async () => {
          const hash = await cert.Thumbprint(obj.digest);

          assert.equal(Convert.ToHex(new Uint8Array(hash)), obj.value);
        }));
    });

    it("Export key", async () => {
      assert.equal(!!cert.PublicKey, false);
      const key = await cert.exportKey({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } as RsaHashedImportParams);

      assert.equal(!!key.algorithm, true);
      assert.equal(key.type, "public");
      assert.equal(!!cert.PublicKey, true);
    });

  });

});

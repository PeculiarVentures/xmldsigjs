"use strict"
var select, xmldsig, DOMParser, XMLSerializer, readXml, assert;

if (typeof module !== "undefined") {
    var config = require("../config");
    select = config.select;
    xmldsig = config.xmldsig;
    DOMParser = config.DOMParser;
    XMLSerializer = config.XMLSerializer;
    assert = config.assert;
    readXml = config.readXml;
    var XmlCore = config.XmlCore;
}

describe("X509Data", () => {

    const xml_x509 = `<ds:X509Data xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Certificate>MIIEHjCCAwagAwIBAgIBATANBgkqhkiG9w0BAQUFADBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbTAeFw0xMzA1MjcwODU1MTNaFw0xODA1MjcwODU1MTNaMGcxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRUwEwYDVQQHDAxTYW50YSBNb25pY2ExETAPBgNVBAoMCE9uZUxvZ2luMRkwFwYDVQQDDBBhcHAub25lbG9naW4uY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoXoc7IFZQRv+SwJ15zjIl9touwY5e6b7H4vn3OtOUByjOKHUX8VX0TpbAV2ctZE2GSALx1AGuQAv6O4MVUH+qn/2IAiBY3a7zKN07UBsya7xFMQVHuGE6EiBAs9jpA9wjvYMPRkS5wYZcwjpTQSZK7zFPPtobG8K/1vDbm/tWZjNLmZmQePmXpwrQAuC0+NlzlmnjoQYB2xp2NaTUK9JnnmuB5qev3dpUwlYGSJpf+HUIoxuo8IpxAXOymq1d6tEEJgU1kR2sa7o1sSRFo31YeW/qYCP/gcLJZo3MRUDFe0g5MHeliFue9DsKYUsC6qwAD3gc+MI47buiD6Msu11cwIDAQABo4HUMIHRMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFAAJFJRIlpQQSFsuNdeq7FkTJIH4MIGRBgNVHSMEgYkwgYaAFAAJFJRIlpQQSFsuNdeq7FkTJIH4oWukaTBnMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEVMBMGA1UEBwwMU2FudGEgTW9uaWNhMREwDwYDVQQKDAhPbmVMb2dpbjEZMBcGA1UEAwwQYXBwLm9uZWxvZ2luLmNvbYIBATAOBgNVHQ8BAf8EBAMCBPAwDQYJKoZIhvcNAQEFBQADggEBAB9zN+g6N4sUBE61RaMUH2LSHWwOtfhL64i7pjHjvZa47/qcV/S0Yyd4IE44ho9i2N+AM79d34mThc30oK5aVxOKphKf+xM/cOyVaWIeqr+dCbkY/0OpLEwWOh9VSgOizRO3evLMurbtR892LbSK/Td3hG5jfwoHD23nHH87Dv/3KyZox9MkJdY2DXOHGGIcsqoIifaTyNZyhW6RgwEujQ6LjsaolP1YoeV85TZFKTLa1Ta7ZLUVUC2UJWqz+kRlsyGxf+E/ZmJ7hSq0ZBVHrVOyXjCcFn6X0/W5SrpOmN3fZYcj8Bp6vhB0cJk9qpjgWOP2RCuBdHZVawjCjIaE+bc=</ds:X509Certificate></ds:X509Data>`;

    context("Load", () => {

        it("X509Certificate", () => {

            const x509data = xmldsig.KeyInfoX509Data.LoadXml(xml_x509);

            assert.equal(x509data.Certificates.length, 1);

        });

        it("X509CRL", () => {
            const xml = `<ds:X509Data xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509CRL>MIIDFDCCAfwCAQEwDQYJKoZIhvcNAQEFBQAwXzEjMCEGA1UEChMaU2FtcGxlIFNpZ25lciBPcmdhbml6YXRpb24xGzAZBgNVBAsTElNhbXBsZSBTaWduZXIgVW5pdDEbMBkGA1UEAxMSU2FtcGxlIFNpZ25lciBDZXJ0Fw0xMzAyMTgxMDMyMDBaFw0xMzAyMTgxMDQyMDBaMIIBNjA8AgMUeUcXDTEzMDIxODEwMjIxMlowJjAKBgNVHRUEAwoBAzAYBgNVHRgEERgPMjAxMzAyMTgxMDIyMDBaMDwCAxR5SBcNMTMwMjE4MTAyMjIyWjAmMAoGA1UdFQQDCgEGMBgGA1UdGAQRGA8yMDEzMDIxODEwMjIwMFowPAIDFHlJFw0xMzAyMTgxMDIyMzJaMCYwCgYDVR0VBAMKAQQwGAYDVR0YBBEYDzIwMTMwMjE4MTAyMjAwWjA8AgMUeUoXDTEzMDIxODEwMjI0MlowJjAKBgNVHRUEAwoBATAYBgNVHRgEERgPMjAxMzAyMTgxMDIyMDBaMDwCAxR5SxcNMTMwMjE4MTAyMjUxWjAmMAoGA1UdFQQDCgEFMBgGA1UdGAQRGA8yMDEzMDIxODEwMjIwMFqgLzAtMB8GA1UdIwQYMBaAFL4SAcyq6hGA2i6tsurHtfuf+a00MAoGA1UdFAQDAgEDMA0GCSqGSIb3DQEBBQUAA4IBAQBCIb6B8cN5dmZbziETimiotDy+FsOvS93LeDWSkNjXTG/+bGgnrm3aQpgB7heT8L2o7s2QtjX2DaTOSYL3nZ/Ibn/R8S0g+EbNQxdk5/la6CERxiRp+E2TUG8LDb14YVMhRGKvCguSIyUG0MwGW6waqVtd6K71u7vhIU/Tidf6ZSdsTMhpPPFuPUid4j29U3q10SGFF6cCt1DzjvUcCwHGhHA02Men70EgZFADPLWmLg0HglKUh1iZWcBGtev/8VsUijyjsM072C6Ut5TwNyrrthb952+eKlmxLNgT0o5hVYxjXhtwLQsL7QZhrypAM1DLYqQjkiDI7hlvt7QuDGTJ</ds:X509CRL></ds:X509Data>`;

            const x509data = xmldsig.KeyInfoX509Data.LoadXml(xml);

            assert.equal(!!x509data.CRL, true);

        });

    });

    it("export key", done => {
        const x509data = xmldsig.KeyInfoX509Data.LoadXml(xml_x509);

        x509data.exportKey({ name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } })
            .then(key => {
                assert.equal(!!key, true);
                assert.equal(!!x509data.Key, true);
                return;
            })
            .then(done, done);
    })

});
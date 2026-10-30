import { describe, it, assert } from "vitest";
import "../test/config.js";
import * as xmldsig from "./index.js";

class TestSignedXml extends xmldsig.SignedXml {
  public getPublicKeys(): Promise<CryptoKey[]> {
    return this.GetPublicKeys();
  }
}

function createSignedXmlWithMethod(method: xmldsig.SignatureMethod): TestSignedXml {
  const doc = xmldsig.Parse('<root xmlns:ds="http://www.w3.org/2000/09/xmldsig#" />');
  const signedXml = new TestSignedXml(doc);
  signedXml.XmlSignature.SignedInfo.SignatureMethod = method;
  return signedXml;
}

async function createRsaPssPublicKey(): Promise<CryptoKey> {
  const keyPair = (await xmldsig.Application.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      hash: "SHA-256",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;

  return keyPair.publicKey;
}

function addX509ExportStub(signedXml: TestSignedXml, publicKey: CryptoKey) {
  let seenAlgorithm: Algorithm | undefined;
  const cert = {
    exportKey: async (alg?: Algorithm) => {
      seenAlgorithm = alg;
      return publicKey;
    },
  } as xmldsig.X509Certificate;

  const x509Data = new xmldsig.KeyInfoX509Data();
  x509Data.AddCertificate(cert);
  signedXml.XmlSignature.KeyInfo.Add(x509Data);

  return (): Algorithm | undefined => seenAlgorithm;
}

describe("SignedXml", () => {
  describe("GetPublicKeys", () => {
    it("passes the resolved signature algorithm to X509 certificate export", async () => {
      const algorithm = { name: "RSA-PSS", hash: { name: "SHA-256" }, saltLength: 32 } as Algorithm;
      const signatureAlgorithm = xmldsig.CryptoConfig.GetSignatureAlgorithm(algorithm);
      const method = xmldsig.CryptoConfig.CreateSignatureMethod(signatureAlgorithm);
      const signedXml = createSignedXmlWithMethod(method);
      const publicKey = await createRsaPssPublicKey();
      const getSeenAlgorithm = addX509ExportStub(signedXml, publicKey);

      const keys = await signedXml.getPublicKeys();
      const seenAlgorithm = getSeenAlgorithm();

      assert.equal(keys.length, 1);
      assert.equal(seenAlgorithm?.name, "RSA-PSS");
      assert.equal((seenAlgorithm as RsaHashedKeyAlgorithm).hash.name, "SHA-256");
      assert.equal((seenAlgorithm as RsaPssParams).saltLength, 32);
    });

    it("supports RSA-PSS no-params URI (sha256-rsa-MGF1) for X509 certificate export", async () => {
      const method = xmldsig.CryptoConfig.CreateSignatureMethod(new xmldsig.RsaPssWithoutParamsSha256());
      const signedXml = createSignedXmlWithMethod(method);
      const publicKey = await createRsaPssPublicKey();
      const getSeenAlgorithm = addX509ExportStub(signedXml, publicKey);

      const keys = await signedXml.getPublicKeys();
      const seenAlgorithm = getSeenAlgorithm();

      assert.equal(keys.length, 1);
      assert.equal(signedXml.XmlSignature.SignedInfo.SignatureMethod.Algorithm, xmldsig.RSA_PSS_SHA256_NAMESPACE);
      assert.equal(signedXml.XmlSignature.SignedInfo.SignatureMethod.Any.Count, 0);
      assert.equal(seenAlgorithm?.name, "RSA-PSS");
      assert.equal((seenAlgorithm as RsaHashedKeyAlgorithm).hash.name, "SHA-256");
      assert.equal((seenAlgorithm as RsaPssParams).saltLength, 32);
    });
  });
});

async function sha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  return new Uint8Array(await xmldsig.Application.crypto.subtle.digest("SHA-256", data));
}

describe("SignedXml BufferSource content", () => {
  const hmac = { name: "HMAC", hash: "SHA-256" };

  it("digests only the bytes of a Uint8Array view with an offset", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const content = new Uint8Array([0xff, 0xff, 1, 2, 3, 0xff]).subarray(2, 5);
    const signedXml = new xmldsig.SignedXml();
    signedXml.contentHandler = async () => content;

    await signedXml.Sign(hmac, key, content, { references: [{ hash: "SHA-256", uri: "data.bin" }] });

    const reference = signedXml.XmlSignature.SignedInfo.References.Item(0)!;
    assert.deepEqual(new Uint8Array(reference.DigestValue), await sha256(new Uint8Array([1, 2, 3])));
    assert.isTrue(await signedXml.Verify({ key, content }));
  });

  it("decodes UTF-8 XML bytes before the default C14N transform", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const xml = "<root>żółw €</root>";
    const content = new TextEncoder().encode(`﻿${xml}`);
    const signedXml = new xmldsig.SignedXml();

    await signedXml.Sign(hmac, key, content, { references: [{ hash: "SHA-256" }] });

    const reference = signedXml.XmlSignature.SignedInfo.References.Item(0)!;
    assert.deepEqual(new Uint8Array(reference.DigestValue), await sha256(new TextEncoder().encode(xml)));
  });

  it("replaces invalid UTF-8 in XML bytes with U+FFFD", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const content = new Uint8Array([...new TextEncoder().encode("<root>"), 0xff, ...new TextEncoder().encode("</root>")]);
    const signedXml = new xmldsig.SignedXml();

    await signedXml.Sign(hmac, key, content, { references: [{ hash: "SHA-256" }] });

    const reference = signedXml.XmlSignature.SignedInfo.References.Item(0)!;
    assert.deepEqual(new Uint8Array(reference.DigestValue), await sha256(new TextEncoder().encode("<root>\uFFFD</root>")));
  });

  it("rejects an x509 option that is not Base64", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const signedXml = new xmldsig.SignedXml();

    let error: unknown;
    try {
      await signedXml.Sign(hmac, key, xmldsig.Parse("<root/>"), { x509: ["not base64!"] });
    } catch (e) {
      error = e;
    }
    assert.instanceOf(error, TypeError);
  });
});

describe("SignedXml xml:id references", () => {
  const hmac = { name: "HMAC", hash: "SHA-256" };

  it("signs and verifies a reference to an xml:id element", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const document = xmldsig.Parse('<root><item xml:id="36a01fc1-9497-4f9d-af2f-40ff8558e0c0">value</item></root>');
    const signedXml = new xmldsig.SignedXml();
    await signedXml.Sign(hmac, key, document, {
      references: [{ hash: "SHA-256", uri: "#36a01fc1-9497-4f9d-af2f-40ff8558e0c0" }],
    });
    assert.isTrue(await signedXml.Verify({ key, content: document.documentElement }));
  });

  it("rejects a reference when multiple elements have the same xml:id", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const document = xmldsig.Parse('<root><first xml:id="duplicate"/><second xml:id="duplicate"/></root>');
    const signedXml = new xmldsig.SignedXml();
    let error: unknown;
    try {
      await signedXml.Sign(hmac, key, document, {
        references: [{ hash: "SHA-256", uri: "#duplicate" }],
      });
    } catch (e) {
      error = e;
    }
    assert.match((error as { message: string }).message, /Duplicate Id 'duplicate' detected in the signed document/);
  });
  it("sign and verify function when both xml:id and id are declared in the same element only one reference is added.", async () => {
    const key = (await xmldsig.Application.crypto.subtle.generateKey(hmac, false, ["sign", "verify"])) as CryptoKey;
    const document = xmldsig.Parse('<root><first xml:id="duplicate" id="duplicate"/></root>');
    const signedXml = new xmldsig.SignedXml();
    await signedXml.Sign(hmac, key, document, {
      references: [{ hash: "SHA-256", uri: "#duplicate" }],
    });
    assert.isTrue(await signedXml.Verify({ key, content: document.documentElement }));
  });
});

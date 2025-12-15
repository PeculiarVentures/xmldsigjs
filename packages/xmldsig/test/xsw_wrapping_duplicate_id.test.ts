import { describe, it, assert } from 'vitest';
import * as xmldsig from '../src/index.js';
import './config.js';

describe('Security: XSW (duplicate Id shadowing)', () => {
  it('rejects signature when same Id exists in document and ds:Object', async () => {
    const keys = (await xmldsig.Application.crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      true,
      ['sign', 'verify'],
    )) as Required<CryptoKeyPair>;

    const doc = xmldsig.Parse(
      `<Transaction><Payment Id="payment-001"><Amount currency="USD">500.00</Amount><Recipient>Bob</Recipient><Reference>Invoice-12345</Reference></Payment></Transaction>`,
    );

    const signer = new xmldsig.SignedXml();
    await signer.Sign({ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, keys.privateKey, doc, {
      keyValue: keys.publicKey,
      references: [{ uri: '#payment-001', hash: 'SHA-256', transforms: ['exc-c14n'] }],
    });

    const sigXml = signer.GetXml();
    assert.ok(sigXml);
    doc.documentElement.appendChild(sigXml);

    // Baseline: original document verifies
    {
      const verifyDoc = xmldsig.Parse(xmldsig.Stringify(doc));
      const signatureEl = verifyDoc.getElementsByTagNameNS(
        'http://www.w3.org/2000/09/xmldsig#',
        'Signature',
      )[0];
      const verifier = new xmldsig.SignedXml(verifyDoc);
      verifier.LoadXml(signatureEl);
      const ok = await verifier.Verify(keys.publicKey);
      assert.equal(ok, true);
    }

    // Attack: keep original payload under ds:Object, replace live payload in document
    const attackDoc = xmldsig.Parse(xmldsig.Stringify(doc));
    const signatureEl = attackDoc.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Signature',
    )[0];
    assert.ok(signatureEl);

    const paymentEl = xmldsig.Select(attackDoc, '//*[local-name()="Payment"]')[0] as Element;
    assert.ok(paymentEl);
    const originalPayment = paymentEl.cloneNode(true) as Element;

    // Modify the document's Payment (attacker-controlled)
    const amountEl = xmldsig.Select(paymentEl, './*[local-name()="Amount"]')[0] as Element;
    const recipientEl = xmldsig.Select(paymentEl, './*[local-name()="Recipient"]')[0] as Element;
    assert.ok(amountEl);
    assert.ok(recipientEl);
    amountEl.textContent = '999999.99';
    recipientEl.textContent = 'Attacker';

    // Inject the original Payment into ds:Object with the same Id
    const objectEl = attackDoc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Object');
    objectEl.setAttribute('Id', 'wrapped');
    objectEl.appendChild(originalPayment);
    signatureEl.appendChild(objectEl);

    const verifier2 = new xmldsig.SignedXml(attackDoc);
    verifier2.LoadXml(signatureEl);

    let err: unknown = null;
    try {
      await verifier2.Verify(keys.publicKey);
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Expected verification to fail');
    assert.match(
      String((err as Error).message || err),
      /Duplicate Id 'payment-001' detected in both the signed document and Signature objects/,
    );
  });
});

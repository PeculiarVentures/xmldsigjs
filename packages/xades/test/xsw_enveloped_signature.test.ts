import { describe, it, assert } from 'vitest';
import * as xades from '../src/index.js';
import { Stringify } from '../../xmldsig/src/index.js';
import './config.js';
import { stringify } from 'querystring';

describe('Security: XSW (duplicate Id shadowing)', () => {
  it('accepts the signature when added to the signed element itself but rejects signature when same Id exists in document and ds:Object', async () => {
    const keys = (await xades.Application.crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
      },
      true,
      ['sign', 'verify'],
    )) as Required<CryptoKeyPair>;

    const doc = xades.Parse(
      `<Transaction><Payment Id="payment-001"><Amount currency="USD">500.00</Amount><Recipient>Bob</Recipient><Reference>Invoice-12345</Reference></Payment></Transaction>`,
    );

    const signer = new xades.SignedXml();
    const rsassaParams: RsaHashedImportParams = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    await signer.Sign(rsassaParams, keys.privateKey, doc, {
      keyValue: keys.publicKey,
      references: [{ uri: '#payment-001', hash: 'SHA-256', transforms: ['enveloped', 'exc-c14n'] }],
    });

    const sigXml = signer.GetXml();
    assert.ok(sigXml);

    // Add the signature into the signed element itself, which is allowed with `enveloped` transform and should verify successfully.
    const paymentEl = xades.Select(doc, '//*[local-name()="Payment"]')[0] as Element;
    assert.ok(paymentEl);
    paymentEl.appendChild(sigXml);

    // Baseline: original document verifies
    {
      const verifyDoc = xades.Parse(Stringify(doc));
      const signatureEl = verifyDoc.getElementsByTagNameNS(
        'http://www.w3.org/2000/09/xmldsig#',
        'Signature',
      )[0];
      const verifier = new xades.SignedXml(verifyDoc);
      verifier.LoadXml(signatureEl);
      const ok = await verifier.Verify(keys.publicKey);
      assert.equal(ok, true);
    }

    // Attack: keep original payload under ds:Object, replace live payload in document
    const attackDoc = xades.Parse(Stringify(doc));
    const signatureEl = attackDoc.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Signature',
    )[0];
    assert.ok(signatureEl);

    const paymentAttackEl = xades.Select(attackDoc, '//*[local-name()="Payment"]')[0] as Element;
    assert.ok(paymentAttackEl);
    const originalPayment = paymentAttackEl.cloneNode(true) as Element;
    const clonedSignatureEl = originalPayment.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Signature',
    )[0];
    assert.ok(clonedSignatureEl);
    clonedSignatureEl.parentNode?.removeChild(clonedSignatureEl);

    // Modify the document's Payment (attacker-controlled)
    const amountEl = xades.Select(paymentAttackEl, './*[local-name()="Amount"]')[0] as Element;
    const recipientEl = xades.Select(paymentAttackEl, './*[local-name()="Recipient"]')[0] as Element;
    assert.ok(amountEl);
    assert.ok(recipientEl);
    amountEl.textContent = '999999.99';
    recipientEl.textContent = 'Attacker';

    // Inject the original Payment into ds:Object with the same Id
    const objectEl = attackDoc.createElementNS('http://www.w3.org/2000/09/xmldsig#', 'ds:Object');
    objectEl.setAttribute('Id', 'wrapped');
    objectEl.appendChild(originalPayment);
    signatureEl.appendChild(objectEl);

    const verifier2 = new xades.SignedXml(attackDoc);
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

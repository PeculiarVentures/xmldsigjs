import { describe, it, beforeAll, assert } from 'vitest';
import * as xmldsig from '../src/index.js';
import './config.js';

const CUSTOM_TRANSFORM_NAMESPACE = 'urn:custom:transform';

/**
 * Custom transform implementation for testing
 */
class CustomTransformation extends xmldsig.Transform {
  public Algorithm = CUSTOM_TRANSFORM_NAMESPACE;

  public GetOutput(): string {
    if (!this.innerXml) {
      throw new Error('innerXml is required');
    }

    // Simple custom transformation: just return the stringified XML
    const result = xmldsig.Stringify(this.innerXml);
    return result;
  }
}

describe('Transform Registration', () => {
  beforeAll(() => {
    // Register the custom transform
    xmldsig.CryptoConfig.RegisterTransform(CUSTOM_TRANSFORM_NAMESPACE, CustomTransformation);
  });

  it('should register and use custom transform', () => {
    // Create transform using registered namespace
    const transform = xmldsig.CryptoConfig.CreateFromName(CUSTOM_TRANSFORM_NAMESPACE);

    assert.ok(transform instanceof CustomTransformation);
    assert.equal(transform.Algorithm, CUSTOM_TRANSFORM_NAMESPACE);
  });

  it('should use custom transform with XML', () => {
    const transform = xmldsig.CryptoConfig.CreateFromName(CUSTOM_TRANSFORM_NAMESPACE);

    // Create a simple XML element
    const doc = xmldsig.Parse('<root><child>test</child></root>');
    transform.LoadInnerXml(doc.documentElement);

    const output = transform.GetOutput();
    assert.ok(output.includes('<root'));
    assert.ok(output.includes('test'));
  });

  it('should preserve backward compatibility with built-in transforms', () => {
    // Test that built-in transforms still work
    const c14nTransform = xmldsig.CryptoConfig.CreateFromName(
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    );

    assert.ok(c14nTransform instanceof xmldsig.XmlDsigC14NTransform);
  });

  it('should allow overriding built-in transforms', () => {
    // Register a custom implementation for a built-in namespace
    const customNamespace = 'http://www.w3.org/2000/09/xmldsig#base64';

    class CustomBase64Transform extends xmldsig.Transform {
      public Algorithm = customNamespace;
      public GetOutput(): string {
        return 'custom-base64-output';
      }
    }

    xmldsig.CryptoConfig.RegisterTransform(customNamespace, CustomBase64Transform);

    const transform = xmldsig.CryptoConfig.CreateFromName(customNamespace);
    assert.ok(transform instanceof CustomBase64Transform);

    // Re-register the original to avoid affecting other tests
    xmldsig.CryptoConfig.RegisterTransform(customNamespace, xmldsig.XmlDsigBase64Transform);
  });

  it('should use custom transform in SignedXml', async () => {
    const { crypto } = xmldsig.Application;

    // Generate a key pair for signing
    const keys = (await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
      },
      false,
      ['sign', 'verify'],
    )) as CryptoKeyPair;

    // Create XML to sign
    const xmlDocument = xmldsig.Parse('<root><data>test data</data></root>');

    // Create SignedXml instance
    const signedXml = new xmldsig.SignedXml();

    // Sign with custom transform namespace in references
    const signature = await signedXml.Sign(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      keys.privateKey,
      xmlDocument,
      {
        keyValue: keys.publicKey,
        references: [
          {
            hash: 'SHA-256',
            transforms: [CUSTOM_TRANSFORM_NAMESPACE, 'c14n'],
            uri: '',
          },
        ],
      },
    );

    // Get the signature XML
    const signatureXml = signature.GetXml();
    assert.ok(signatureXml);

    // Check that custom transform is in the signature using namespace-aware search
    const transformElements = signatureXml.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'Transform',
    );
    let foundCustomTransform = false;
    for (let i = 0; i < transformElements.length; i++) {
      const algorithm = transformElements[i].getAttribute('Algorithm');
      if (algorithm === CUSTOM_TRANSFORM_NAMESPACE) {
        foundCustomTransform = true;
      }
    }

    assert.ok(foundCustomTransform, 'Custom transform should be present in signature');
  });

  it('should verify signature with custom transform', async () => {
    const { crypto } = xmldsig.Application;

    // Generate a key pair for signing
    const keys = (await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
      },
      false,
      ['sign', 'verify'],
    )) as CryptoKeyPair;

    // Create XML to sign
    const xmlDocument = xmldsig.Parse('<root><data>test data</data></root>');

    // Create SignedXml instance for signing
    const signedXml = new xmldsig.SignedXml();

    signedXml.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm = CUSTOM_TRANSFORM_NAMESPACE;

    // Sign with custom transform namespace in references
    // Use enveloped to handle signature insertion into document
    const signature = await signedXml.Sign(
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      keys.privateKey,
      xmlDocument,
      {
        keyValue: keys.publicKey,
        references: [
          {
            hash: 'SHA-256',
            transforms: [CUSTOM_TRANSFORM_NAMESPACE, 'enveloped', 'c14n'],
            uri: '',
          },
        ],
      },
    );

    // Get the signature XML and add to document
    const signatureXml = signature.GetXml();
    assert.ok(signatureXml);
    xmlDocument.documentElement.appendChild(signatureXml);

    const signatureString = signature.toString();
    assert.ok(signatureString.includes('CanonicalizationMethod Algorithm="urn:custom:transform"'));
    assert.ok(signatureString.includes('Transform Algorithm="urn:custom:transform"'));

    // Now verify the signature
    const signedXmlVerify = new xmldsig.SignedXml(xmlDocument);
    signedXmlVerify.LoadXml(signatureXml);

    // Verify with the public key
    const isValid = await signedXmlVerify.Verify(keys.publicKey);
    assert.ok(isValid, 'Signature with custom transform should be valid');
  });
});

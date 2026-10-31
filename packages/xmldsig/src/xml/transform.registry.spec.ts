import { describe, it, beforeAll, assert } from "vitest";
import { isElement } from "xml-core";
import * as xmldsig from "../index.js";
import "../../test/config.js";

const CUSTOM_TRANSFORM_NAMESPACE = "urn:custom:transform";

/**
 * Custom transform implementation for testing
 */
class CustomTransformation extends xmldsig.Transform {
  public override Algorithm = CUSTOM_TRANSFORM_NAMESPACE;

  public override GetOutput(): string {
    if (!this.innerXml) {
      throw new Error("innerXml is required");
    }

    // Simple custom transformation: just return the stringified XML
    const result = xmldsig.Stringify(this.innerXml);
    return result;
  }
}

describe("Transform Registration", () => {
  beforeAll(() => {
    // Register the custom transform
    xmldsig.CryptoConfig.RegisterTransform(CUSTOM_TRANSFORM_NAMESPACE, CustomTransformation);
  });

  it("should register and use custom transform", () => {
    // Create transform using registered namespace
    const transform = xmldsig.CryptoConfig.CreateFromName(CUSTOM_TRANSFORM_NAMESPACE);

    assert.ok(transform instanceof CustomTransformation);
    assert.equal(transform.Algorithm, CUSTOM_TRANSFORM_NAMESPACE);
  });

  it("should use custom transform with XML", () => {
    const transform = xmldsig.CryptoConfig.CreateFromName(CUSTOM_TRANSFORM_NAMESPACE);

    // Create a simple XML element
    const doc = xmldsig.Parse("<root><child>test</child></root>");
    transform.LoadInnerXml(doc.documentElement);

    const output = transform.GetOutput();
    assert.ok(output.includes("<root"));
    assert.ok(output.includes("test"));
  });

  it("should preserve backward compatibility with built-in transforms", () => {
    // Test that built-in transforms still work
    const c14nTransform = xmldsig.CryptoConfig.CreateFromName("http://www.w3.org/TR/2001/REC-xml-c14n-20010315");

    assert.ok(c14nTransform instanceof xmldsig.XmlDsigC14NTransform);
  });

  it("should allow overriding built-in transforms", () => {
    // Register a custom implementation for a built-in namespace
    const customNamespace = "http://www.w3.org/2000/09/xmldsig#base64";

    class CustomBase64Transform extends xmldsig.Transform {
      public override Algorithm = customNamespace;
      public override GetOutput(): string {
        return "custom-base64-output";
      }
    }

    xmldsig.CryptoConfig.RegisterTransform(customNamespace, CustomBase64Transform);

    const transform = xmldsig.CryptoConfig.CreateFromName(customNamespace);
    assert.ok(transform instanceof CustomBase64Transform);

    // Re-register the original to avoid affecting other tests
    xmldsig.CryptoConfig.RegisterTransform(customNamespace, xmldsig.XmlDsigBase64Transform);
  });

  it("should use custom transform in SignedXml", async () => {
    const { crypto } = xmldsig.Application;

    // Generate a key pair for signing
    const keys = (await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
      },
      false,
      ["sign", "verify"],
    )) as CryptoKeyPair;

    // Create XML to sign
    const xmlDocument = xmldsig.Parse("<root><data>test data</data></root>");

    // Create SignedXml instance
    const signedXml = new xmldsig.SignedXml();

    // Sign with custom transform namespace in references
    const signature = await signedXml.Sign({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, keys.privateKey, xmlDocument, {
      keyValue: keys.publicKey,
      references: [
        {
          hash: "SHA-256",
          transforms: [CUSTOM_TRANSFORM_NAMESPACE, "c14n"],
          uri: "",
        },
      ],
    });

    // Get the signature XML
    const signatureXml = signature.GetXml();
    assert.ok(signatureXml);

    // Check that custom transform is in the signature using namespace-aware search
    const transformElements = signatureXml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Transform");
    let foundCustomTransform = false;
    for (let i = 0; i < transformElements.length; i++) {
      const algorithm = transformElements[i].getAttribute("Algorithm");
      if (algorithm === CUSTOM_TRANSFORM_NAMESPACE) {
        foundCustomTransform = true;
      }
    }

    assert.ok(foundCustomTransform, "Custom transform should be present in signature");
  });

  it("should verify signature with custom transform", async () => {
    const { crypto } = xmldsig.Application;

    // Generate a key pair for signing
    const keys = (await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
      },
      false,
      ["sign", "verify"],
    )) as CryptoKeyPair;

    // Create XML to sign
    const xmlDocument = xmldsig.Parse("<root><data>test data</data></root>");

    // Create SignedXml instance for signing
    const signedXml = new xmldsig.SignedXml();

    signedXml.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm = CUSTOM_TRANSFORM_NAMESPACE;

    // Sign with custom transform namespace in references
    // Use enveloped to handle signature insertion into document
    const signature = await signedXml.Sign({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, keys.privateKey, xmlDocument, {
      keyValue: keys.publicKey,
      references: [
        {
          hash: "SHA-256",
          transforms: [CUSTOM_TRANSFORM_NAMESPACE, "enveloped", "c14n"],
          uri: "",
        },
      ],
    });

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
    assert.ok(isValid, "Signature with custom transform should be valid");
  });
});

const REMOVE_SECRET_NAMESPACE = "urn:custom:remove-secret";

/**
 * Returns a copy of the node without <secret> elements
 */
class RemoveSecretTransform extends xmldsig.Transform {
  public override Algorithm = REMOVE_SECRET_NAMESPACE;

  public override GetOutput(): any {
    if (!this.innerXml) {
      throw new Error("innerXml is required");
    }

    const copy = this.innerXml.cloneNode(true) as Element;
    for (const secret of Array.from(copy.getElementsByTagName("secret"))) {
      secret.parentNode?.removeChild(secret);
    }
    return copy;
  }
}

class TransformsSignedXml extends xmldsig.SignedXml {
  public Apply(transforms: xmldsig.Transforms, input: Element) {
    return this.ApplyTransforms(transforms, input);
  }
}

describe("Transform chaining", () => {
  const algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
  };

  beforeAll(() => {
    xmldsig.CryptoConfig.RegisterTransform(REMOVE_SECRET_NAMESPACE, RemoveSecretTransform);
  });

  it("passes the node returned by a transform to the next one", () => {
    const transforms = new xmldsig.Transforms();
    transforms.Add(new RemoveSecretTransform());
    transforms.Add(new xmldsig.XmlDsigC14NTransform());

    const doc = xmldsig.Parse("<root><data>value</data><secret>1</secret></root>");
    const output = new TransformsSignedXml().Apply(transforms, doc.documentElement);

    assert.equal(output, "<root><data>value</data></root>");
  });

  it("signs and verifies with a custom transform before c14n", async () => {
    const keys = await xmldsig.Application.crypto.subtle.generateKey(algorithm, false, ["sign", "verify"]);
    const signedXml = new xmldsig.SignedXml();
    await signedXml.Sign(algorithm, keys.privateKey, xmldsig.Parse("<root><data>value</data><secret>1</secret></root>"), {
      references: [{ hash: "SHA-256", transforms: ["enveloped", REMOVE_SECRET_NAMESPACE, "c14n"] }],
    });

    // The secret is not covered by the signature, so changing it keeps the signature valid
    const doc = xmldsig.Parse(signedXml.toString().replace("<secret>1</secret>", "<secret>2</secret>"));
    const verifier = new xmldsig.SignedXml(doc);
    verifier.LoadXml(doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0]);

    assert.isTrue(await verifier.Verify(keys.publicKey));
  });
});

describe("Transform chaining with built-in transforms", () => {
  function apply(xml: string, ...items: xmldsig.Transform[]) {
    const transforms = new xmldsig.Transforms();
    items.forEach((item) => transforms.Add(item));
    return new TransformsSignedXml().Apply(transforms, xmldsig.Parse(xml).documentElement);
  }

  function xpath(selector: string) {
    const transform = new xmldsig.XmlDsigXPathTransform();
    transform.XPath = selector;
    return transform;
  }

  it("keeps base64 output when XPath follows it", () => {
    const output = apply("<root>dGVzdA==</root>", new xmldsig.XmlDsigBase64Transform(), xpath("true()"));

    assert.deepEqual(Array.from(output), [116, 101, 115, 116]);
  });

  it("canonicalizes the result of a single XPath transform", () => {
    const output = apply("<root><data  a='1'/><secret/></root>", xpath("not(self::secret)"));

    assert.equal(output, '<root><data a="1"></data></root>');
  });

  it("keeps the node for enveloped followed by XPath", () => {
    const output = apply(
      `<root><data/><secret/><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/></root>`,
      new xmldsig.XmlDsigEnvelopedSignatureTransform(),
      xpath("not(self::secret)"),
    );

    // Digest serializes the node, as before
    assert.isTrue(isElement(output));
    assert.equal(xmldsig.Stringify(output), "<root><data/></root>");
  });

  it("canonicalizes after enveloped", () => {
    const xml = `<root><data/><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/></root>`;

    assert.equal(apply(xml, new xmldsig.XmlDsigEnvelopedSignatureTransform()), "<root><data></data></root>");
    assert.equal(apply(xml, new xmldsig.XmlDsigEnvelopedSignatureTransform(), new xmldsig.XmlDsigExcC14NTransform()), "<root><data></data></root>");
  });
});

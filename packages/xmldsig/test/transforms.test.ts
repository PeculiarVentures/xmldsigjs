import { describe, it, assert } from 'vitest';
import * as xmldsig from '../src';

describe('Transforms', () => {
  describe('base64', () => {
    it('GetOutput error', () => {
      const transform = new xmldsig.XmlDsigBase64Transform();

      assert.throws(() => {
        transform.GetOutput();
      });
    });

    it('GetOutput with content', () => {
      const transform = new xmldsig.XmlDsigBase64Transform();
      const node = xmldsig.Parse('<test>AQAB</test>').documentElement;

      transform.LoadInnerXml(node);

      const buf = transform.GetOutput();

      assert.equal(ArrayBuffer.isView(buf), true);
      assert.equal(buf.length, 3);
      assert.equal(buf[0], 1);
      assert.equal(buf[1], 0);
      assert.equal(buf[2], 1);
    });

    it('GetOutput without content', () => {
      const transform = new xmldsig.XmlDsigBase64Transform();
      const node = xmldsig.Parse('<test></test>').documentElement;

      transform.LoadInnerXml(node);

      const buf = transform.GetOutput();

      assert.equal(ArrayBuffer.isView(buf), true);
      assert.equal(buf.length, 0);
    });

    it('To string', () => {
      const transform = new xmldsig.XmlDsigBase64Transform();

      assert.equal(
        transform.toString(),
        `<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#base64" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`,
      );
    });
  });

  describe('c14n', () => {
    it('GetOutput error', () => {
      const transform = new xmldsig.XmlDsigC14NTransform();

      assert.throws(() => {
        transform.GetOutput();
      });
    });

    it('GetOutput with content', () => {
      const transform = new xmldsig.XmlDsigC14NTransform();
      const node = xmldsig.Parse(
        `<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`,
      ).documentElement;

      transform.LoadInnerXml(node);

      const text = transform.GetOutput();

      assert.equal(
        text,
        `<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner>123</inclusive:inner></p:child></root>`,
      );
    });

    it('GetOutput without content', () => {
      const transform = new xmldsig.XmlDsigC14NTransform();
      const node = xmldsig.Parse('<test/>').documentElement;

      transform.LoadInnerXml(node);

      const text = transform.GetOutput();

      assert.equal(text, `<test></test>`);
    });

    it('To string', () => {
      const transform = new xmldsig.XmlDsigC14NTransform();
      assert.equal(
        transform.toString(),
        `<ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`,
      );
    });

    it('with comment', () => {
      const transform = new xmldsig.XmlDsigC14NWithCommentsTransform();
      assert.equal(
        transform.toString(),
        `<ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`,
      );
    });
  });

  describe('exc-c14n', () => {
    it('GetOutput error', () => {
      const transform = new xmldsig.XmlDsigExcC14NTransform();

      assert.throws(() => {
        transform.GetOutput();
      });
    });

    it('GetOutput with content', () => {
      const transform = new xmldsig.XmlDsigExcC14NTransform();
      const node = xmldsig.Parse(
        `<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`,
      ).documentElement;

      transform.LoadInnerXml(node);

      const text = transform.GetOutput();

      assert.equal(
        text,
        `<root><p:child xmlns:p="ns"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`,
      );
    });

    it('GetOutput without content', () => {
      const transform = new xmldsig.XmlDsigExcC14NTransform();
      const node = xmldsig.Parse('<test/>').documentElement;

      transform.LoadInnerXml(node);

      const text = transform.GetOutput();

      assert.equal(text, `<test></test>`);
    });

    it('To string', () => {
      const transform = new xmldsig.XmlDsigExcC14NTransform();
      assert.equal(
        transform.toString(),
        `<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`,
      );
    });

    it('with comment', () => {
      const transform = new xmldsig.XmlDsigExcC14NWithCommentsTransform();
      assert.equal(
        transform.toString(),
        `<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#WithComments" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`,
      );
    });
  });

  describe('enveloped', () => {
    it('GetOutput error', () => {
      const transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();

      assert.throws(() => {
        transform.GetOutput();
      });
    });

    it('GetOutput with signature', () => {
      const transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
      const node = xmldsig.Parse(
        `<root><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/></root>`,
      ).documentElement;

      transform.LoadInnerXml(node);

      const out = transform.GetOutput();

      assert.equal(new XMLSerializer().serializeToString(out), '<root/>');
    });

    it('GetOutput without signature', () => {
      const transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
      const node = xmldsig.Parse(`<root></root>`).documentElement;

      transform.LoadInnerXml(node);

      const out = transform.GetOutput();

      assert.equal(new XMLSerializer().serializeToString(out), '<root/>');
    });

    it('GetOutput with nested signature should leave it alone', () => {
      const transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
      const node = xmldsig.Parse(
        `<root xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Assertion><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/></saml:Assertion></root>`,
      ).documentElement;

      transform.LoadInnerXml(node);

      const out = transform.GetOutput();

      assert.equal(
        new XMLSerializer().serializeToString(out),
        `<root xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Assertion><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/></saml:Assertion></root>`,
      );
    });

    it('GetOutput must remove all Signature elements from the document', () => {
      const transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
      const node = xmldsig.Parse(
        `<root><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/></root>`,
      ).documentElement;

      transform.LoadInnerXml(node);

      const out = transform.GetOutput();

      assert.equal(new XMLSerializer().serializeToString(out), `<root/>`);
    });
  });
});

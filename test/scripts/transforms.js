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

describe("Transforms", () => {

    context("base64", () => {

        it("GetOutput error", () => {
            let transform = new xmldsig.XmlDsigBase64Transform();

            assert.throws(() => {
                transform.GetOutput();
            });

        });

        it("GetOutput with content", () => {
            let transform = new xmldsig.XmlDsigBase64Transform();
            let node = XmlCore.Parse("<test>AQAB</test>").documentElement;

            transform.LoadInnerXml(node);

            let buf = transform.GetOutput();

            assert.equal(ArrayBuffer.isView(buf), true);
            assert.equal(buf.length, 3);
            assert.equal(buf[0], 1);
            assert.equal(buf[1], 0);
            assert.equal(buf[2], 1);
        });
        it("GetOutput without content", () => {
            let transform = new xmldsig.XmlDsigBase64Transform();
            let node = XmlCore.Parse("<test></test>").documentElement;

            transform.LoadInnerXml(node);

            let buf = transform.GetOutput();

            assert.equal(ArrayBuffer.isView(buf), true);
            assert.equal(buf.length, 0);
        });

        it("To string", () => {
            let transform = new xmldsig.XmlDsigBase64Transform();

            assert.equal(transform.toString(), `<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#base64" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`);
        });

    });

    context("c14n", () => {

        it("GetOutput error", () => {
            let transform = new xmldsig.XmlDsigC14NTransform();

            assert.throws(() => {
                transform.GetOutput();
            });

        });

        it("GetOutput with content", () => {
            let transform = new xmldsig.XmlDsigC14NTransform();
            let node = XmlCore.Parse(`<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`).documentElement;

            transform.LoadInnerXml(node);

            let text = transform.GetOutput();

            assert.equal(text, `<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner>123</inclusive:inner></p:child></root>`);
        });

        it("GetOutput without content", () => {
            let transform = new xmldsig.XmlDsigC14NTransform();
            let node = XmlCore.Parse("<test/>").documentElement;

            transform.LoadInnerXml(node);

            let text = transform.GetOutput();

            assert.equal(text, `<test></test>`);
        });

        it("To string", () => {
            let transform = new xmldsig.XmlDsigC14NTransform();
            assert.equal(transform.toString(), `<ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`);
        });

        it("with comment", () => {
            let transform = new xmldsig.XmlDsigC14NWithCommentsTransform();
            assert.equal(transform.toString(), `<ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`);
        });
    });

    context("exc-c14n", () => {

        it("GetOutput error", () => {
            let transform = new xmldsig.XmlDsigExcC14NTransform();

            assert.throws(() => {
                transform.GetOutput();
            });

        });

        it("GetOutput with content", () => {
            let transform = new xmldsig.XmlDsigExcC14NTransform();
            let node = XmlCore.Parse(`<root xmlns:p="ns"><p:child xmlns:inclusive="ns2"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`).documentElement;

            transform.LoadInnerXml(node);

            let text = transform.GetOutput();

            assert.equal(text, `<root><p:child xmlns:p="ns"><inclusive:inner xmlns:inclusive="ns2">123</inclusive:inner></p:child></root>`);
        });

        it("GetOutput without content", () => {
            let transform = new xmldsig.XmlDsigExcC14NTransform();
            let node = XmlCore.Parse("<test/>").documentElement;

            transform.LoadInnerXml(node);

            let text = transform.GetOutput();

            assert.equal(text, `<test></test>`);
        });

        it("To string", () => {
            let transform = new xmldsig.XmlDsigExcC14NTransform();
            assert.equal(transform.toString(), `<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`);
        });

        it("with comment", () => {
            let transform = new xmldsig.XmlDsigExcC14NWithCommentsTransform();
            assert.equal(transform.toString(), `<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#WithComments" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>`);
        });
    });

    context("enveloped", () => {
        it("GetOutput error", () => {
            let transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();

            assert.throws(() => {
                transform.GetOutput();
            });

        });

        it("GetOutput with signature", () => {
            let transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
            let node = XmlCore.Parse(`<root><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/></root>`).documentElement;

            transform.LoadInnerXml(node);

            let out = transform.GetOutput();

            assert.equal(new XMLSerializer().serializeToString(out), "<root/>");
        });

        it("GetOutput without signature", () => {
            let transform = new xmldsig.XmlDsigEnvelopedSignatureTransform();
            let node = XmlCore.Parse(`<root></root>`).documentElement;

            transform.LoadInnerXml(node);

            let out = transform.GetOutput();

            assert.equal(new XMLSerializer().serializeToString(out), "<root/>");
        });

    })

});
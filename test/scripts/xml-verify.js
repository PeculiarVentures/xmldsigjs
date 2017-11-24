"use strict";
var select, xmldsig, DOMParser, readXml, assert, XmlCore;

if (typeof module !== "undefined") {
    var config = require("../config");
    select = config.select;
    xmldsig = config.xmldsig;
    DOMParser = config.DOMParser;
    assert = config.assert;
    readXml = config.readXml;
    XmlCore = config.XmlCore;
}

describe("Verify XML signatures", function () {
    this.timeout(3500);
    function verifyXML(name, done, res) {
        if (res === void 0) res = true;
        var folder = (typeof module === "undefined") ? "./static/" : "./test/static/";
        readXml(folder + name, function (xml) {
            // console.log("Xml", xml);
            // console.log(new XMLSerializer().serializeToString(xml));
            var signature = XmlCore.Select(xml, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
            var sig = new xmldsig.SignedXml(xml);
            sig.LoadXml(signature);
            sig.Verify()
                .then(function (v) {
                    assert.equal(v, res, "Wrong signature");
                    done();
                })
                .catch(done);
        })
    }

    function verifyExternalXML(name, externalName, done, res) {
        if (res === void 0) res = true;
        var folder = (typeof module === "undefined") ? "./static/" : "./test/static/";
        readXml(folder + externalName, function (externalXml) {
            readXml(folder + name, function (xml) {
                // console.log("Xml", xml);
                // console.log(new XMLSerializer().serializeToString(xml));
                var signature = XmlCore.Select(xml, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
                var sig = new xmldsig.SignedXml(externalXml);
                sig.LoadXml(signature);
                sig.Verify()
                    .then(function (v) {
                        assert.equal(v, res, "Wrong signature");
                        done();
                    })
                    .catch(done);
            });
        });
    }

    it("Init SignedXml from Element", function () {
        var xmlText = "<root><first></first><second/></root>";
        var xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
        assert.equal(!!xmlDoc, true);
        assert.equal(xmlDoc.documentElement.nodeName, "root");

        var first = XmlCore.Select(xmlDoc, "//*[local-name()='first']");
        assert.equal(!!first, true);

        var sx = new xmldsig.SignedXml(first);
        assert.equal(!!sx, true);
    });

    context("some", () => {
        [
            "valid_signature_utf8",
            "valid_saml",
            "saml_external_ns",
            "wsfederation_metadata",
            "tl-mp"
        ].forEach(file =>
            it(file, done => verifyXML(`${file}.xml`, done)));
    });

    context("aleksey.com", () => {

        [
            "enveloping-rsa-x509chain",
            "enveloping-sha1-rsa-sha1",
            "enveloping-sha256-rsa-sha256",
            "enveloping-sha384-rsa-sha384",
            "enveloping-sha512-rsa-sha512",
        ].forEach(file =>
            it(file, done => verifyXML(`${file}.xml`, done)));
            
            [
                ["valid_signature_asic", "ping"],
            ].forEach(file =>
                it(file[0], done => verifyExternalXML(`${file[0]}.xml`, `${file[1]}.xml`, done)));

    });

})

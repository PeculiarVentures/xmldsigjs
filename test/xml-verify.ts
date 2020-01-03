import * as assert from "assert";
import * as path from "path";
import * as xmldsig from "../src";
import { readXml } from "./config";

context("Verify XML signatures", function () {

    this.timeout(3500);

    async function verifyXML(name: string, res = true) {
        const file = path.join(__dirname, "static", name);
        const xml = readXml(file);

        const signatures = xml.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");
        const sig = new xmldsig.SignedXml(xml);
        sig.LoadXml(signatures[0]);
        const ok = await sig.Verify();
        assert.equal(ok, res, "Wrong signature");
    }

    async function verifyExternalXML(name: string, externalName: string, res = true) {
        const file = path.join(__dirname, "static", name);
        const externalFile = path.join(__dirname, "static", externalName);
        const xml = readXml(file);
        const externalXml = readXml(externalFile);

        const signature = xmldsig.Select(xml, "//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        const sig = new xmldsig.SignedXml(externalXml);
        sig.LoadXml(signature as Element);
        const ok = await sig.Verify();
        assert.equal(ok, res, "Wrong signature");
    }

    it("Init SignedXml from Element", () => {
        const xmlText = "<root><first></first><second/></root>";
        const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
        assert.equal(!!xmlDoc, true);
        assert.equal(xmlDoc.documentElement.nodeName, "root");

        const first = xmldsig.Select(xmlDoc, "//*[local-name()='first']")[0];
        assert.equal(!!first, true);

        const sx = new xmldsig.SignedXml(first as Element);
        assert.equal(!!sx, true);
    });

    context("some", () => {
        [
            "valid_signature_utf8",
            "valid_signature_office",
            "valid_saml",
            "saml_external_ns",
            "wsfederation_metadata",
            "tl-mp",
            "tl-mp-repeated-namespace",
        ].forEach((file) =>
            it(file, async () => {
                await verifyXML(`${file}.xml`);
            }));
    });

    context("aleksey.com", () => {

        [
            "enveloping-rsa-x509chain",
            "enveloping-sha1-rsa-sha1",
            "enveloping-sha256-rsa-sha256",
            "enveloping-sha384-rsa-sha384",
            "enveloping-sha512-rsa-sha512",
        ].forEach((file) =>
            it(file, async () => verifyXML(`${file}.xml`)));

    });

    [
        ["valid_signature_asic", "ping"],
    ].forEach((file) =>
        it(file[0], async () => verifyExternalXML(`${file[0]}.xml`, `${file[1]}.xml`)));

});

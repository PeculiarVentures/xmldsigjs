"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var transform_1 = require("../transform");
/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
var XmlDsigEnvelopedSignatureTransform = (function (_super) {
    __extends(XmlDsigEnvelopedSignatureTransform, _super);
    function XmlDsigEnvelopedSignatureTransform() {
        _super.apply(this, arguments);
        this.Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
    }
    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    XmlDsigEnvelopedSignatureTransform.prototype.GetOutput = function () {
        if (!this.innerXml)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "innerXml");
        var signature = xmljs_1.select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        if (signature)
            signature.parentNode.removeChild(signature);
        return this.innerXml;
    };
    return XmlDsigEnvelopedSignatureTransform;
}(transform_1.Transform));
exports.XmlDsigEnvelopedSignatureTransform = XmlDsigEnvelopedSignatureTransform;

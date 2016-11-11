"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var transform_1 = require("../transform");
var canonicalizer_1 = require("../canonicalizer");
var xmljs_1 = require("xmljs");
/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
var XmlDsigC14NTransform = (function (_super) {
    __extends(XmlDsigC14NTransform, _super);
    function XmlDsigC14NTransform() {
        _super.apply(this, arguments);
        this.xmlCanonicalizer = new canonicalizer_1.XmlCanonicalizer(false, false);
        this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
    }
    /**
     * Returns the output of the current XmlDsigC14NTransform object.
     * @returns string
     */
    XmlDsigC14NTransform.prototype.GetOutput = function () {
        if (!this.innerXml)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "innerXml");
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    };
    return XmlDsigC14NTransform;
}(transform_1.Transform));
exports.XmlDsigC14NTransform = XmlDsigC14NTransform;
;
/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
var XmlDsigC14NWithCommentsTransform = (function (_super) {
    __extends(XmlDsigC14NWithCommentsTransform, _super);
    function XmlDsigC14NWithCommentsTransform() {
        _super.apply(this, arguments);
        this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments";
        this.xmlCanonicalizer = new canonicalizer_1.XmlCanonicalizer(true, true);
    }
    return XmlDsigC14NWithCommentsTransform;
}(XmlDsigC14NTransform));
exports.XmlDsigC14NWithCommentsTransform = XmlDsigC14NWithCommentsTransform;

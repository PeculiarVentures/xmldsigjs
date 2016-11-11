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
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
var XmlDsigExcC14NTransform = (function (_super) {
    __extends(XmlDsigExcC14NTransform, _super);
    function XmlDsigExcC14NTransform() {
        _super.apply(this, arguments);
        this.xmlCanonicalizer = new canonicalizer_1.XmlCanonicalizer(false, true);
        this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
    }
    Object.defineProperty(XmlDsigExcC14NTransform.prototype, "InclusiveNamespacesPrefixList", {
        /**
         * Gets or sets a string that contains namespace prefixes to canonicalize
         * using the standard canonicalization algorithm.
         */
        get: function () {
            return this.xmlCanonicalizer.InclusiveNamespacesPrefixList;
        },
        set: function (value) {
            this.xmlCanonicalizer.InclusiveNamespacesPrefixList = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the output of the current XmlDsigExcC14NTransform object
     */
    XmlDsigExcC14NTransform.prototype.GetOutput = function () {
        if (!this.innerXml)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "innerXml");
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    };
    return XmlDsigExcC14NTransform;
}(transform_1.Transform));
exports.XmlDsigExcC14NTransform = XmlDsigExcC14NTransform;
;
/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
var XmlDsigExcC14NWithCommentsTransform = (function (_super) {
    __extends(XmlDsigExcC14NWithCommentsTransform, _super);
    function XmlDsigExcC14NWithCommentsTransform() {
        _super.apply(this, arguments);
        this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
        this.xmlCanonicalizer = new canonicalizer_1.XmlCanonicalizer(true, true);
    }
    return XmlDsigExcC14NWithCommentsTransform;
}(XmlDsigExcC14NTransform));
exports.XmlDsigExcC14NWithCommentsTransform = XmlDsigExcC14NWithCommentsTransform;

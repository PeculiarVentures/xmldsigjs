"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var XmlSignatureError = (function (_super) {
    __extends(XmlSignatureError, _super);
    function XmlSignatureError() {
        _super.apply(this, arguments);
        this.prefix = "XMLDSIG";
    }
    return XmlSignatureError;
}(xmljs_1.XmlError));
exports.XmlSignatureError = XmlSignatureError;

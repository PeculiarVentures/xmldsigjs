"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xml_1 = require("../xml");
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var transform_1 = require("../transform");
var XmlDsigBase64Transform = (function (_super) {
    __extends(XmlDsigBase64Transform, _super);
    function XmlDsigBase64Transform() {
        _super.apply(this, arguments);
        this.Algorithm = xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;
    }
    /**
     * Returns the output of the current XmlDsigBase64Transform object
     */
    XmlDsigBase64Transform.prototype.GetOutput = function () {
        if (!this.innerXml)
            throw new xmljs_2.XmlError(xmljs_2.XE.PARAM_REQUIRED, "innerXml");
        return xmljs_1.Convert.FromString(this.innerXml.textContent || "", "base64");
    };
    return XmlDsigBase64Transform;
}(transform_1.Transform));
exports.XmlDsigBase64Transform = XmlDsigBase64Transform;

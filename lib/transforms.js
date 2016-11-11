"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_object_1 = require("./xml_object");
var xml_1 = require("./xml");
var crypto_config_1 = require("./crypto_config");
/**
 * The Transforms element contains a collection of transformations
 */
var Transforms = (function (_super) {
    __extends(Transforms, _super);
    function Transforms() {
        _super.apply(this, arguments);
        this.name = xml_1.XmlSignature.ElementNames.Transforms;
    }
    Transforms.prototype.OnLoadChildElement = function (element) {
        if (element.hasAttribute(xml_1.XmlSignature.AttributeNames.Algorithm)) {
            var alg = element.getAttribute(xml_1.XmlSignature.AttributeNames.Algorithm);
            var obj = crypto_config_1.CryptoConfig.CreateFromName(alg);
            obj.LoadXml(element);
            return obj;
        }
        throw new xmljs_1.XmlError(xmljs_1.XE.ELEMENT_MALFORMED, xml_1.XmlSignature.ElementNames.Transform);
    };
    return Transforms;
}(xml_object_1.XmlSignatureCollection));
exports.Transforms = Transforms;

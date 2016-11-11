"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_1 = require("./xml");
var XmlSignatureObject = (function (_super) {
    __extends(XmlSignatureObject, _super);
    function XmlSignatureObject() {
        _super.apply(this, arguments);
        this.prefix = xml_1.XmlSignature.DefaultPrefix;
        this.namespaceUri = xml_1.XmlSignature.NamespaceURI;
    }
    return XmlSignatureObject;
}(xmljs_1.XmlObject));
exports.XmlSignatureObject = XmlSignatureObject;
var XmlSignatureCollection = (function (_super) {
    __extends(XmlSignatureCollection, _super);
    function XmlSignatureCollection() {
        _super.apply(this, arguments);
        this.prefix = xml_1.XmlSignature.DefaultPrefix;
        this.namespaceUri = xml_1.XmlSignature.NamespaceURI;
    }
    return XmlSignatureCollection;
}(xmljs_1.XmlCollection));
exports.XmlSignatureCollection = XmlSignatureCollection;

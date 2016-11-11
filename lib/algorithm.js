"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var application_1 = require("./application");
var XmlAlgorithm = (function () {
    function XmlAlgorithm() {
    }
    XmlAlgorithm.prototype.getAlgorithmName = function () {
        return this.xmlNamespace;
    };
    return XmlAlgorithm;
}());
exports.XmlAlgorithm = XmlAlgorithm;
var HashAlgorithm = (function (_super) {
    __extends(HashAlgorithm, _super);
    function HashAlgorithm() {
        _super.apply(this, arguments);
    }
    HashAlgorithm.prototype.getHash = function (xml) {
        // console.log("HashedInfo:", xml);
        var buf;
        if (typeof xml === "string") {
            // C14N transforms
            buf = xmljs_1.Convert.FromString(xml, "utf8");
        }
        else if (xml instanceof Uint8Array) {
            // base64 transform
            buf = xml;
        }
        else {
            // enveloped signature transform
            var txt = new XMLSerializer().serializeToString(xml);
            buf = xmljs_1.Convert.FromString(txt, "utf8");
        }
        return application_1.Application.crypto.subtle.digest(this.algorithm, buf);
    };
    return HashAlgorithm;
}(XmlAlgorithm));
exports.HashAlgorithm = HashAlgorithm;
var SignatureAlgorithm = (function (_super) {
    __extends(SignatureAlgorithm, _super);
    function SignatureAlgorithm() {
        _super.apply(this, arguments);
    }
    /**
     * Sign the given string using the given key
     */
    SignatureAlgorithm.prototype.getSignature = function (signedInfo, signingKey, algorithm) {
        return application_1.Application.crypto.subtle.sign(algorithm, signingKey, xmljs_1.Convert.FromString(signedInfo, "binary"));
    };
    /**
    * Verify the given signature of the given string using key
    */
    SignatureAlgorithm.prototype.verifySignature = function (signedInfo, key, signatureValue, algorithm) {
        var _signatureValue = xmljs_1.Convert.FromString(signatureValue, "binary");
        // console.log("SignatureValue:", Convert.ToBase64String(Convert.FromBufferString(_signatureValue)));
        var _signedInfo = xmljs_1.Convert.FromString(signedInfo, "utf8");
        // console.log("SignedInfo:", Convert.FromBufferString(_signedInfo));
        return application_1.Application.crypto.subtle.verify((algorithm || this.algorithm), key, _signatureValue, _signedInfo);
    };
    return SignatureAlgorithm;
}(XmlAlgorithm));
exports.SignatureAlgorithm = SignatureAlgorithm;

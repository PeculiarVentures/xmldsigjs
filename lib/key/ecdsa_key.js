"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var xml_1 = require("../xml");
var xml_object_1 = require("../xml_object");
var application_1 = require("../application");
/**
 * Represents the <ECKeyValue> element of an XML signature.
 */
var EcdsaKeyValue = (function (_super) {
    __extends(EcdsaKeyValue, _super);
    function EcdsaKeyValue() {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.ECKeyValue;
        this.m_key = null;
        this.m_jwk = null;
        this.m_algorithm = null;
        this.m_x = null;
        this.m_y = null;
        this.m_curve = null;
        this.m_keyusage = null;
    }
    Object.defineProperty(EcdsaKeyValue.prototype, "Key", {
        /**
         * Gets or sets the instance of ECDSA that holds the public key.
         */
        get: function () {
            return this.m_key;
        },
        set: function (value) {
            this.m_key = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EcdsaKeyValue.prototype, "Algorithm", {
        /**
         * Gets the algorithm of the public key
         */
        get: function () {
            return this.m_algorithm;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EcdsaKeyValue.prototype, "X", {
        /**
         * Gets the X point value of then public key
         */
        get: function () {
            return this.m_x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EcdsaKeyValue.prototype, "Y", {
        /**
         * Gets the Y point value of then public key
         */
        get: function () {
            return this.m_y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EcdsaKeyValue.prototype, "NamedCurve", {
        /**
         * Gets the NamedCurve value of then public key
         */
        get: function () {
            return this.m_curve;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Imports key to the ECKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    EcdsaKeyValue.prototype.importKey = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (key.algorithm.name.toUpperCase() !== "ECDSA")
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            _this.m_key = key;
            application_1.Application.crypto.subtle.exportKey("jwk", key)
                .then(function (jwk) {
                _this.m_jwk = jwk;
                console.log(jwk);
                _this.m_x = xmljs_2.Convert.FromString(jwk.x, "base64url");
                _this.m_y = xmljs_2.Convert.FromString(jwk.y, "base64url");
                _this.m_curve = jwk.crv;
                _this.m_keyusage = key.usages;
                return Promise.resolve(_this);
            })
                .then(resolve, reject);
        });
    };
    /**
     * Exports key from the ECKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    EcdsaKeyValue.prototype.exportKey = function (alg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.m_key)
                return resolve(_this.m_key);
            // fill jwk
            var x = xmljs_2.Convert.ToBase64Url(_this.m_x);
            var y = xmljs_2.Convert.ToBase64Url(_this.m_y);
            var crv = _this.m_curve;
            var jwk = {
                kty: "EC",
                crv: crv,
                x: x,
                y: y,
                ext: true
            };
            application_1.Application.crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: crv }, true, _this.m_keyusage)
                .then(resolve, reject);
        });
    };
    /**
     * Returns the XML representation of the ECDSA key clause.
     * @returns Element
     */
    EcdsaKeyValue.prototype.GetXml = function () {
        if (this.element)
            return this.element;
        var prefix = this.GetPrefix();
        var doc = this.CreateDocument();
        // EcdsaKeyValue
        var xnEcdsaKeyValue = this.CreateElement(doc);
        // NamedCurve
        var xnNamedCurve = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.NamedCurve);
        xnNamedCurve.setAttribute("URI", "urn:oid:" + GetNamedCurveOid(this.m_curve));
        xnEcdsaKeyValue.appendChild(xnNamedCurve);
        // PublicKey
        var xnPublicKey = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.PublicKey);
        // Conactinate point values 
        if (this.m_x.length !== this.m_y.length)
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "ECDSA lenght of X value must be equal length of Y value");
        var pubkey = new Uint8Array(this.m_x.length + this.m_y.length);
        for (var i = 0; i < this.m_x.length; i++) {
            pubkey[i] = this.m_x[i];
            pubkey[this.m_x.length + i] = this.m_y[i];
        }
        xnPublicKey.textContent = xmljs_2.Convert.ToBase64(pubkey);
        xnEcdsaKeyValue.appendChild(xnPublicKey);
        return xnEcdsaKeyValue;
    };
    /**
     * Loads an ECDSA key clause from an XML element.
     * @param  {Element} element
     * @returns void
     */
    EcdsaKeyValue.prototype.LoadXml = function (element) {
        _super.prototype.LoadXml.call(this, element);
        // <NamedCurve>
        var xnNamedCurve = this.GetChild(xml_1.XmlSignature.ElementNames.NamedCurve, true);
        var value = /urn\:oid\:(.+)/.exec(xnNamedCurve.getAttribute("URI") || "")[1];
        this.m_curve = GetNamedCurveFromOid(value);
        // <PublicKey>
        var xnPublicKey = this.GetChild(xml_1.XmlSignature.ElementNames.PublicKey, true);
        var pubkey = xmljs_2.Convert.FromBase64(xnPublicKey.textContent || "");
        if (pubkey.length % 2)
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "ECDSA PublicKey point mustbw odd");
        var point_size = pubkey.length / 2;
        this.m_x = pubkey.slice(0, point_size);
        this.m_y = pubkey.slice(point_size);
        this.m_keyusage = ["verify"];
    };
    return EcdsaKeyValue;
}(xml_object_1.XmlSignatureObject));
exports.EcdsaKeyValue = EcdsaKeyValue;
function GetNamedCurveOid(namedCurve) {
    switch (namedCurve) {
        case "P-256":
            return "1.2.840.10045.3.1.7";
        case "P-384":
            return "1.3.132.0.34";
        case "P-521":
            return "1.3.132.0.35";
    }
    throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Unknown NamedCurve");
}
function GetNamedCurveFromOid(oid) {
    switch (oid) {
        case "1.2.840.10045.3.1.7":
            return "P-256";
        case "1.3.132.0.34":
            return "P-384";
        case "1.3.132.0.35":
            return "P-521";
    }
    throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Unknown NamedCurve OID");
}

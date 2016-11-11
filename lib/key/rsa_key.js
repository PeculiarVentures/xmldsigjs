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
var index_1 = require("../algorithm/index");
/**
 * Represents the <RSAKeyValue> element of an XML signature.
 */
var RsaKeyValue = (function (_super) {
    __extends(RsaKeyValue, _super);
    function RsaKeyValue() {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.RSAKeyValue;
        this.m_key = null;
        this.m_jwk = null;
        this.m_algorithm = null;
        this.m_modulus = null;
        this.m_exponent = null;
        this.m_keyusage = [];
    }
    Object.defineProperty(RsaKeyValue.prototype, "Key", {
        /**
         * Gets or sets the instance of RSA that holds the public key.
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
    Object.defineProperty(RsaKeyValue.prototype, "Algorithm", {
        /**
         * Gets the algorithm of the public key
         */
        get: function () {
            return this.m_algorithm;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RsaKeyValue.prototype, "Modulus", {
        /**
         * Gets the Modulus of the public key
         */
        get: function () {
            return this.m_modulus;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RsaKeyValue.prototype, "Exponent", {
        /**
         * Gets the Exponent of the public key
         */
        get: function () {
            return this.m_exponent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Imports key to the RSAKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    RsaKeyValue.prototype.importKey = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (key.algorithm.name.toUpperCase() !== index_1.RSA_PKCS1.toUpperCase())
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            _this.m_key = key;
            application_1.Application.crypto.subtle.exportKey("jwk", key)
                .then(function (jwk) {
                _this.m_jwk = jwk;
                _this.m_modulus = xmljs_2.Convert.FromBase64Url(jwk.n);
                _this.m_exponent = xmljs_2.Convert.FromBase64Url(jwk.e);
                _this.m_keyusage = key.usages;
                return Promise.resolve(_this);
            })
                .then(resolve, reject);
        });
    };
    /**
     * Exports key from the RSAKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    RsaKeyValue.prototype.exportKey = function (alg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.m_key)
                return resolve(_this.m_key);
            // fill jwk
            if (!_this.m_modulus)
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
            var modulus = xmljs_2.Convert.ToBase64Url(_this.m_modulus);
            if (!_this.m_exponent)
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
            var exponent = xmljs_2.Convert.ToBase64Url(_this.m_exponent);
            var algJwk;
            switch (alg.name.toUpperCase()) {
                case index_1.RSA_PKCS1.toUpperCase():
                    algJwk = "R";
                    break;
                case index_1.RSA_PSS.toUpperCase():
                    algJwk = "P";
                    break;
                default:
                    throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, alg.name);
            }
            // Convert hash to JWK name
            switch (alg.hash.name.toUpperCase()) {
                case index_1.SHA1:
                    algJwk += "S1";
                    break;
                case index_1.SHA224:
                    algJwk += "S224";
                    break;
                case index_1.SHA256:
                    algJwk += "S256";
                    break;
                case index_1.SHA384:
                    algJwk += "S384";
                    break;
                case index_1.SHA512:
                    algJwk += "S512";
                    break;
            }
            var jwk = {
                kty: "RSA",
                alg: algJwk,
                n: modulus,
                e: exponent,
                ext: true
            };
            application_1.Application.crypto.subtle.importKey("jwk", jwk, alg, true, _this.m_keyusage)
                .then(resolve, reject);
        });
    };
    /**
     * Returns the XML representation of the RSA key clause.
     * @returns Element
     */
    RsaKeyValue.prototype.GetXml = function () {
        if (this.element)
            return this.element;
        var prefix = this.GetPrefix();
        var doc = this.CreateDocument();
        // RsaKeyValue
        var xnRsaKeyValue = this.CreateElement(doc);
        if (!this.m_jwk) {
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "RsaKey value has no imported key. Use RsaKeyValue.importKey function first.");
        }
        // Modulus
        var xnModulus = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.Modulus);
        xnModulus.textContent = xmljs_2.Convert.ToBase64(xmljs_2.Convert.FromBase64Url(this.m_jwk.n));
        xnRsaKeyValue.appendChild(xnModulus);
        // Exponent
        var xnExponent = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.Exponent);
        xnExponent.textContent = xmljs_2.Convert.ToBase64(xmljs_2.Convert.FromBase64Url(this.m_jwk.e));
        xnRsaKeyValue.appendChild(xnExponent);
        return xnRsaKeyValue;
    };
    /**
     * Loads an RSA key clause from an XML element.
     * @param  {Element} element
     * @returns void
     */
    RsaKeyValue.prototype.LoadXml = function (element) {
        _super.prototype.LoadXml.call(this, element);
        // <Modulus>
        var xnModulus = this.GetChild(xml_1.XmlSignature.ElementNames.Modulus, false);
        if (xnModulus != null)
            this.m_modulus = xmljs_2.Convert.FromBase64(xnModulus.textContent || "");
        else
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, xml_1.XmlSignature.ElementNames.Modulus);
        // <Exponent>
        var xnExponent = this.GetChild(xml_1.XmlSignature.ElementNames.Exponent, false);
        if (xnExponent != null)
            this.m_exponent = xmljs_2.Convert.FromBase64(xnExponent.textContent || "");
        else
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, xml_1.XmlSignature.ElementNames.Exponent);
        this.m_keyusage = ["verify"];
    };
    return RsaKeyValue;
}(xml_object_1.XmlSignatureObject));
exports.RsaKeyValue = RsaKeyValue;

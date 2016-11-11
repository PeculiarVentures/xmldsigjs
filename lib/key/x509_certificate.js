"use strict";
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var application_1 = require("../application");
var Certificate_1 = require("pkijs/src/Certificate");
var RSAPublicKey_1 = require("pkijs/src/RSAPublicKey");
var asn1js = require("asn1js");
/**
 * List of OIDs
 * Source: https://msdn.microsoft.com/ru-ru/library/windows/desktop/aa386991(v=vs.85).aspx
 */
var OID = {
    "2.5.4.3": {
        short: "CN",
        long: "CommonName"
    },
    "2.5.4.6": {
        short: "C",
        long: "Country"
    },
    "2.5.4.5": {
        long: "DeviceSerialNumber"
    },
    "0.9.2342.19200300.100.1.25": {
        short: "DC",
        long: "DomainComponent"
    },
    "1.2.840.113549.1.9.1": {
        short: "E",
        long: "EMail"
    },
    "2.5.4.42": {
        short: "G",
        long: "GivenName"
    },
    "2.5.4.43": {
        short: "I",
        long: "Initials"
    },
    "2.5.4.7": {
        short: "L",
        long: "Locality"
    },
    "2.5.4.10": {
        short: "O",
        long: "Organization"
    },
    "2.5.4.11": {
        short: "OU",
        long: "OrganizationUnit"
    },
    "2.5.4.8": {
        short: "ST",
        long: "State"
    },
    "2.5.4.9": {
        short: "Street",
        long: "StreetAddress"
    },
    "2.5.4.4": {
        short: "SN",
        long: "SurName"
    },
    "2.5.4.12": {
        short: "T",
        long: "Title"
    },
    "1.2.840.113549.1.9.8": {
        long: "UnstructuredAddress"
    },
    "1.2.840.113549.1.9.2": {
        long: "UnstructuredName"
    }
};
/**
 * Represents an <X509Certificate> element.
 */
var X509Certificate = (function () {
    function X509Certificate(rawData) {
        this.publicKey = null;
        this.publicKey;
        if (rawData) {
            this.LoadFromRawData(rawData);
            this.raw = rawData;
        }
    }
    Object.defineProperty(X509Certificate.prototype, "SerialNumber", {
        /**
         * Gets a serial number of the certificate in HEX format
         */
        get: function () {
            return xmljs_2.Convert.ToHex(this.cert_simpl.serialNumber.value_block.value_hex);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Converts X500Name to string
     * @param  {RDN} name X500Name
     * @param  {string} spliter Splitter char. Default ','
     * @returns string Formated string
     * Example:
     * > C=Some name, O=Some organization name, C=RU
     */
    X509Certificate.prototype.NameToString = function (name, spliter) {
        if (spliter === void 0) { spliter = ","; }
        var res = [];
        for (var _i = 0, _a = name.types_and_values; _i < _a.length; _i++) {
            var type_and_value = _a[_i];
            var type = type_and_value.type;
            var name_1 = OID[type].short;
            res.push((name_1 ? name_1 : type) + "=" + type_and_value.value.value_block.value);
        }
        return res.join(spliter + " ");
    };
    Object.defineProperty(X509Certificate.prototype, "Issuer", {
        /**
         * Gets a issuer name of the certificate
         */
        get: function () {
            return this.NameToString(this.cert_simpl.issuer);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(X509Certificate.prototype, "Subject", {
        /**
         * Gets a subject name of the certificate
         */
        get: function () {
            return this.NameToString(this.cert_simpl.subject);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a thumbrint of the certififcate
     * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
     * @returns PromiseLike
     */
    X509Certificate.prototype.Thumbprint = function (algName) {
        if (algName === void 0) { algName = "SHA-1"; }
        return application_1.Application.crypto.subtle.digest(algName, this.raw);
    };
    /**
     * Loads X509Certificate from DER data
     * @param  {Uint8Array} rawData
     */
    X509Certificate.prototype.LoadFromRawData = function (rawData) {
        this.raw = rawData;
        var asn1 = asn1js.fromBER(rawData.buffer);
        this.cert_simpl = new Certificate_1.default({ schema: asn1.result });
    };
    Object.defineProperty(X509Certificate.prototype, "PublicKey", {
        /**
         * Gets the public key from the X509Certificate
         */
        get: function () {
            return this.publicKey;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns DER raw of X509Certificate
     */
    X509Certificate.prototype.GetRawCertData = function () {
        return this.raw;
    };
    /**
     * Returns public key from X509Certificate
     * @param  {Algorithm} algorithm
     * @returns Promise
     */
    X509Certificate.prototype.exportKey = function (algorithm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var asn1_publicKey = asn1js.fromBER(_this.cert_simpl.subjectPublicKeyInfo.subjectPublicKey.value_block.value_hex);
            var alg_oid = _this.cert_simpl.subjectPublicKeyInfo.algorithm.algorithm_id;
            var jwk = null;
            switch (alg_oid) {
                // RSA
                case "1.2.840.113549.1.1.1":
                    var rsa_publicKey_simple = new RSAPublicKey_1.default({ schema: asn1_publicKey.result });
                    var modulus_view = new Uint8Array(rsa_publicKey_simple.modulus.valueBlock.valueHex);
                    var public_exponent_view = new Uint8Array(rsa_publicKey_simple.publicExponent.valueBlock.valueHex);
                    if (modulus_view[0] === 0x00)
                        modulus_view = modulus_view.slice(1);
                    var b64uModulus = xmljs_2.Convert.ToBase64Url(modulus_view);
                    var b64uPublicExponent = xmljs_2.Convert.ToBase64Url(public_exponent_view);
                    var alg = "RS";
                    switch (algorithm.hash.name) {
                        case "SHA-1":
                            alg += "1";
                            break;
                        case "SHA-256":
                            alg += "256";
                            break;
                        case "SHA-384":
                            alg += "384";
                            break;
                        case "SHA-516":
                            alg += "516";
                            break;
                    }
                    jwk = {
                        kty: "RSA",
                        e: b64uPublicExponent,
                        n: b64uModulus,
                        alg: alg,
                        ext: true,
                    };
                    break;
                default:
                    throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, alg_oid);
            }
            application_1.Application.crypto.subtle.importKey("jwk", jwk, algorithm, true, ["verify"])
                .then(resolve, reject);
        });
    };
    return X509Certificate;
}());
exports.X509Certificate = X509Certificate;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_1 = require("../xml");
var xml_object_1 = require("../xml_object");
var algorithm_1 = require("../algorithm");
var rsa_hash_1 = require("./rsa_hash");
exports.RSA_PSS = "RSA-PSS";
exports.RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#MGF1";
exports.RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha224-rsa-MGF1";
exports.RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha256-rsa-MGF1";
exports.RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha384-rsa-MGF1";
exports.RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha512-rsa-MGF1";
var RsaPssSha1 = (function (_super) {
    __extends(RsaPssSha1, _super);
    function RsaPssSha1() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PSS,
            hash: {
                name: rsa_hash_1.SHA1
            }
        };
        this.xmlNamespace = exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
    }
    return RsaPssSha1;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPssSha1 = RsaPssSha1;
var RsaPssSha224 = (function (_super) {
    __extends(RsaPssSha224, _super);
    function RsaPssSha224() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PSS,
            hash: {
                name: rsa_hash_1.SHA224
            }
        };
        this.xmlNamespace = exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
    }
    return RsaPssSha224;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPssSha224 = RsaPssSha224;
var RsaPssSha256 = (function (_super) {
    __extends(RsaPssSha256, _super);
    function RsaPssSha256() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PSS,
            hash: {
                name: rsa_hash_1.SHA256
            }
        };
        this.xmlNamespace = exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
    }
    return RsaPssSha256;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPssSha256 = RsaPssSha256;
var RsaPssSha384 = (function (_super) {
    __extends(RsaPssSha384, _super);
    function RsaPssSha384() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PSS,
            hash: {
                name: rsa_hash_1.SHA384
            }
        };
        this.xmlNamespace = exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
    }
    return RsaPssSha384;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPssSha384 = RsaPssSha384;
var RsaPssSha512 = (function (_super) {
    __extends(RsaPssSha512, _super);
    function RsaPssSha512() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PSS,
            hash: {
                name: rsa_hash_1.SHA512
            }
        };
        this.xmlNamespace = exports.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
    }
    return RsaPssSha512;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPssSha512 = RsaPssSha512;
var PssAlgorithmParams = (function (_super) {
    __extends(PssAlgorithmParams, _super);
    function PssAlgorithmParams() {
        _super.apply(this, arguments);
        this.name = xml_1.XmlSignature.ElementNames.RSAPSSParams;
        this.m_digest_method = null;
        this.m_salt_length = null;
        this.m_mgf = null;
    }
    Object.defineProperty(PssAlgorithmParams.prototype, "DigestMethod", {
        get: function () {
            return this.m_digest_method;
        },
        set: function (value) {
            this.m_digest_method = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PssAlgorithmParams.prototype, "SaltLength", {
        get: function () {
            return this.m_salt_length;
        },
        set: function (v) {
            this.m_salt_length = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PssAlgorithmParams.prototype, "MGF", {
        get: function () {
            return this.m_mgf;
        },
        set: function (v) {
            this.m_mgf = v;
        },
        enumerable: true,
        configurable: true
    });
    PssAlgorithmParams.prototype.GetXml = function () {
        if (this.element != null)
            return this.element;
        if (this.DigestMethod == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "DigestMethod");
        var prefix = this.GetPrefix();
        var ds_prefix = this.dsPrefix ? this.dsPrefix + ":" : "";
        var doc = this.CreateDocument();
        var xel = this.CreateElement(doc);
        if (this.DigestMethod) {
            var dsDigestMethod = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, ds_prefix + xml_1.XmlSignature.ElementNames.DigestMethod);
            dsDigestMethod.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.DigestMethod);
            xel.appendChild(dsDigestMethod);
        }
        if (this.SaltLength) {
            var SaltLength = doc.createElementNS(xml_1.XmlSignature.NamespaceURIPss, prefix + xml_1.XmlSignature.ElementNames.SaltLength);
            SaltLength.textContent = this.SaltLength.toString();
            xel.appendChild(SaltLength);
        }
        if (this.MGF) {
            var MGF = doc.createElementNS(xml_1.XmlSignature.NamespaceURIPss, prefix + xml_1.XmlSignature.ElementNames.MaskGenerationFunction);
            MGF.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.MGF);
            xel.appendChild(MGF);
        }
        return xel;
    };
    PssAlgorithmParams.prototype.LoadXml = function (value) {
        _super.prototype.LoadXml.call(this, value);
        var digest_mode = this.GetChild(xml_1.XmlSignature.ElementNames.DigestMethod, false);
        if (digest_mode)
            this.m_digest_method = digest_mode.getAttribute(xml_1.XmlSignature.AttributeNames.Algorithm);
        var salt_length = this.GetChild(xml_1.XmlSignature.ElementNames.SaltLength, false);
        if (salt_length)
            this.m_salt_length = +salt_length.textContent;
        var mgf = this.GetChild(xml_1.XmlSignature.ElementNames.MaskGenerationFunction, false);
        if (mgf)
            this.m_mgf = mgf.firstChild.getAttribute(xml_1.XmlSignature.AttributeNames.Algorithm);
        this.element = value;
    };
    return PssAlgorithmParams;
}(xml_object_1.XmlSignatureObject));
exports.PssAlgorithmParams = PssAlgorithmParams;

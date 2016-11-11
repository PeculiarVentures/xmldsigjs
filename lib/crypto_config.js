"use strict";
var xmljs_1 = require("xmljs");
var index_1 = require("./algorithm/index");
var xml_1 = require("./xml");
var index_2 = require("./transforms/index");
var SignatureAlgorithms = {};
SignatureAlgorithms[index_1.RSA_PKCS1_SHA1_NAMESPACE] = index_1.RsaPkcs1Sha1;
SignatureAlgorithms[index_1.RSA_PKCS1_SHA224_NAMESPACE] = index_1.RsaPkcs1Sha224;
SignatureAlgorithms[index_1.RSA_PKCS1_SHA256_NAMESPACE] = index_1.RsaPkcs1Sha256;
SignatureAlgorithms[index_1.RSA_PKCS1_SHA384_NAMESPACE] = index_1.RsaPkcs1Sha384;
SignatureAlgorithms[index_1.RSA_PKCS1_SHA512_NAMESPACE] = index_1.RsaPkcs1Sha512;
SignatureAlgorithms[index_1.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE] = index_1.RsaPssSha1;
SignatureAlgorithms[index_1.RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE] = index_1.RsaPssSha224;
SignatureAlgorithms[index_1.RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE] = index_1.RsaPssSha256;
SignatureAlgorithms[index_1.RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE] = index_1.RsaPssSha384;
SignatureAlgorithms[index_1.RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE] = index_1.RsaPssSha512;
SignatureAlgorithms[index_1.ECDSA_SHA1_NAMESPACE] = index_1.EcdsaSha1;
SignatureAlgorithms[index_1.ECDSA_SHA224_NAMESPACE] = index_1.EcdsaSha224;
SignatureAlgorithms[index_1.ECDSA_SHA256_NAMESPACE] = index_1.EcdsaSha256;
SignatureAlgorithms[index_1.ECDSA_SHA384_NAMESPACE] = index_1.EcdsaSha384;
SignatureAlgorithms[index_1.ECDSA_SHA512_NAMESPACE] = index_1.EcdsaSha512;
SignatureAlgorithms[index_1.HMAC_SHA1_NAMESPACE] = index_1.HmacSha1;
SignatureAlgorithms[index_1.HMAC_SHA224_NAMESPACE] = index_1.HmacSha224;
SignatureAlgorithms[index_1.HMAC_SHA256_NAMESPACE] = index_1.HmacSha256;
SignatureAlgorithms[index_1.HMAC_SHA384_NAMESPACE] = index_1.HmacSha384;
SignatureAlgorithms[index_1.HMAC_SHA512_NAMESPACE] = index_1.HmacSha512;
var HashAlgorithms = {};
HashAlgorithms[index_1.SHA1_NAMESPACE] = index_1.Sha1;
HashAlgorithms[index_1.SHA224_NAMESPACE] = index_1.Sha224;
HashAlgorithms[index_1.SHA256_NAMESPACE] = index_1.Sha256;
HashAlgorithms[index_1.SHA384_NAMESPACE] = index_1.Sha384;
HashAlgorithms[index_1.SHA512_NAMESPACE] = index_1.Sha512;
var CryptoConfig = (function () {
    function CryptoConfig() {
    }
    /**
     * Creates Transform from given name
     * if name is not exist then throws error
     *
     * @static
     * @param {(string |)} [name=null]
     * @returns
     *
     * @memberOf CryptoConfig
     */
    CryptoConfig.CreateFromName = function (name) {
        var transform;
        switch (name) {
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                transform = new index_2.XmlDsigBase64Transform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                transform = new index_2.XmlDsigC14NTransform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                transform = new index_2.XmlDsigC14NWithCommentsTransform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                transform = new index_2.XmlDsigEnvelopedSignatureTransform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform:
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXPathTransform();
            // break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigXsltTransform:
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXsltTransform();
            // break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                transform = new index_2.XmlDsigExcC14NTransform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                transform = new index_2.XmlDsigExcC14NWithCommentsTransform();
                break;
            case xml_1.XmlSignature.AlgorithmNamespaces.XmlDecryptionTransform:
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDecryptionTransform();
            // break;
            default:
                throw new xmljs_1.XmlError(xmljs_1.XE.ALGORITHM_NOT_SUPPORTED, name);
        }
        return transform;
    };
    CryptoConfig.CreateSignatureAlgorithm = function (namespace) {
        var alg = SignatureAlgorithms[namespace] || null;
        if (alg)
            return new alg();
        else
            throw new Error("signature algorithm '" + namespace + "' is not supported");
    };
    ;
    CryptoConfig.CreateHashAlgorithm = function (namespace) {
        var algo = HashAlgorithms[namespace];
        if (algo)
            return new algo();
        else
            throw new Error("hash algorithm '" + namespace + "' is not supported");
    };
    return CryptoConfig;
}());
exports.CryptoConfig = CryptoConfig;

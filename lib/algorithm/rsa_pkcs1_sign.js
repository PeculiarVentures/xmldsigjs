"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var algorithm_1 = require("../algorithm");
var rsa_hash_1 = require("./rsa_hash");
exports.RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
exports.RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
exports.RSA_PKCS1_SHA224_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha224";
exports.RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
exports.RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
exports.RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
var RsaPkcs1Sha1 = (function (_super) {
    __extends(RsaPkcs1Sha1, _super);
    function RsaPkcs1Sha1() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PKCS1,
            hash: {
                name: rsa_hash_1.SHA1
            }
        };
        this.xmlNamespace = exports.RSA_PKCS1_SHA1_NAMESPACE;
    }
    return RsaPkcs1Sha1;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPkcs1Sha1 = RsaPkcs1Sha1;
var RsaPkcs1Sha224 = (function (_super) {
    __extends(RsaPkcs1Sha224, _super);
    function RsaPkcs1Sha224() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PKCS1,
            hash: {
                name: rsa_hash_1.SHA224
            }
        };
        this.xmlNamespace = exports.RSA_PKCS1_SHA224_NAMESPACE;
    }
    return RsaPkcs1Sha224;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPkcs1Sha224 = RsaPkcs1Sha224;
var RsaPkcs1Sha256 = (function (_super) {
    __extends(RsaPkcs1Sha256, _super);
    function RsaPkcs1Sha256() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PKCS1,
            hash: {
                name: rsa_hash_1.SHA256
            }
        };
        this.xmlNamespace = exports.RSA_PKCS1_SHA256_NAMESPACE;
    }
    return RsaPkcs1Sha256;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPkcs1Sha256 = RsaPkcs1Sha256;
var RsaPkcs1Sha384 = (function (_super) {
    __extends(RsaPkcs1Sha384, _super);
    function RsaPkcs1Sha384() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PKCS1,
            hash: {
                name: rsa_hash_1.SHA384
            }
        };
        this.xmlNamespace = exports.RSA_PKCS1_SHA384_NAMESPACE;
    }
    return RsaPkcs1Sha384;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPkcs1Sha384 = RsaPkcs1Sha384;
var RsaPkcs1Sha512 = (function (_super) {
    __extends(RsaPkcs1Sha512, _super);
    function RsaPkcs1Sha512() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.RSA_PKCS1,
            hash: {
                name: rsa_hash_1.SHA512
            }
        };
        this.xmlNamespace = exports.RSA_PKCS1_SHA512_NAMESPACE;
    }
    return RsaPkcs1Sha512;
}(algorithm_1.SignatureAlgorithm));
exports.RsaPkcs1Sha512 = RsaPkcs1Sha512;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var algorithm_1 = require("../algorithm");
var rsa_hash_1 = require("../algorithm/rsa_hash");
exports.HMAC_ALGORITHM = "HMAC";
exports.HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
exports.HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
exports.HMAC_SHA224_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha224";
exports.HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
exports.HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
var HmacSha1 = (function (_super) {
    __extends(HmacSha1, _super);
    function HmacSha1() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.HMAC_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA1
            }
        };
        this.xmlNamespace = exports.HMAC_SHA1_NAMESPACE;
    }
    return HmacSha1;
}(algorithm_1.SignatureAlgorithm));
exports.HmacSha1 = HmacSha1;
var HmacSha224 = (function (_super) {
    __extends(HmacSha224, _super);
    function HmacSha224() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.HMAC_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA224
            }
        };
        this.xmlNamespace = exports.HMAC_SHA224_NAMESPACE;
    }
    return HmacSha224;
}(algorithm_1.SignatureAlgorithm));
exports.HmacSha224 = HmacSha224;
var HmacSha256 = (function (_super) {
    __extends(HmacSha256, _super);
    function HmacSha256() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.HMAC_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA256
            }
        };
        this.xmlNamespace = exports.HMAC_SHA256_NAMESPACE;
    }
    return HmacSha256;
}(algorithm_1.SignatureAlgorithm));
exports.HmacSha256 = HmacSha256;
var HmacSha384 = (function (_super) {
    __extends(HmacSha384, _super);
    function HmacSha384() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.HMAC_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA384
            }
        };
        this.xmlNamespace = exports.HMAC_SHA384_NAMESPACE;
    }
    return HmacSha384;
}(algorithm_1.SignatureAlgorithm));
exports.HmacSha384 = HmacSha384;
var HmacSha512 = (function (_super) {
    __extends(HmacSha512, _super);
    function HmacSha512() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.HMAC_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA512
            }
        };
        this.xmlNamespace = exports.HMAC_SHA512_NAMESPACE;
    }
    return HmacSha512;
}(algorithm_1.SignatureAlgorithm));
exports.HmacSha512 = HmacSha512;

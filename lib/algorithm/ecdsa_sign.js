"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var algorithm_1 = require("../algorithm");
var rsa_hash_1 = require("../algorithm/rsa_hash");
exports.ECDSA_SIGN_ALGORITHM = "ECDSA";
exports.ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
exports.ECDSA_SHA224_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha224";
exports.ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
exports.ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
exports.ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
var EcdsaSha1 = (function (_super) {
    __extends(EcdsaSha1, _super);
    function EcdsaSha1() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.ECDSA_SIGN_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA1
            }
        };
        this.xmlNamespace = exports.ECDSA_SHA1_NAMESPACE;
    }
    return EcdsaSha1;
}(algorithm_1.SignatureAlgorithm));
exports.EcdsaSha1 = EcdsaSha1;
var EcdsaSha224 = (function (_super) {
    __extends(EcdsaSha224, _super);
    function EcdsaSha224() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.ECDSA_SIGN_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA224
            }
        };
        this.xmlNamespace = exports.ECDSA_SHA224_NAMESPACE;
    }
    return EcdsaSha224;
}(algorithm_1.SignatureAlgorithm));
exports.EcdsaSha224 = EcdsaSha224;
var EcdsaSha256 = (function (_super) {
    __extends(EcdsaSha256, _super);
    function EcdsaSha256() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.ECDSA_SIGN_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA256
            }
        };
        this.xmlNamespace = exports.ECDSA_SHA256_NAMESPACE;
    }
    return EcdsaSha256;
}(algorithm_1.SignatureAlgorithm));
exports.EcdsaSha256 = EcdsaSha256;
var EcdsaSha384 = (function (_super) {
    __extends(EcdsaSha384, _super);
    function EcdsaSha384() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.ECDSA_SIGN_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA384
            }
        };
        this.xmlNamespace = exports.ECDSA_SHA384_NAMESPACE;
    }
    return EcdsaSha384;
}(algorithm_1.SignatureAlgorithm));
exports.EcdsaSha384 = EcdsaSha384;
var EcdsaSha512 = (function (_super) {
    __extends(EcdsaSha512, _super);
    function EcdsaSha512() {
        _super.apply(this, arguments);
        this.algorithm = {
            name: exports.ECDSA_SIGN_ALGORITHM,
            hash: {
                name: rsa_hash_1.SHA512
            }
        };
        this.xmlNamespace = exports.ECDSA_SHA512_NAMESPACE;
    }
    return EcdsaSha512;
}(algorithm_1.SignatureAlgorithm));
exports.EcdsaSha512 = EcdsaSha512;

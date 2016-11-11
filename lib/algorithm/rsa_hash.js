"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var algorithm_1 = require("../algorithm");
exports.SHA1 = "SHA-1";
exports.SHA224 = "SHA-224";
exports.SHA256 = "SHA-256";
exports.SHA384 = "SHA-384";
exports.SHA512 = "SHA-512";
exports.SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
exports.SHA224_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha224";
exports.SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
exports.SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha384";
exports.SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";
var Sha1 = (function (_super) {
    __extends(Sha1, _super);
    function Sha1() {
        _super.apply(this, arguments);
        this.algorithm = { name: exports.SHA1 };
        this.xmlNamespace = exports.SHA1_NAMESPACE;
    }
    return Sha1;
}(algorithm_1.HashAlgorithm));
exports.Sha1 = Sha1;
var Sha224 = (function (_super) {
    __extends(Sha224, _super);
    function Sha224() {
        _super.apply(this, arguments);
        this.algorithm = { name: exports.SHA224 };
        this.xmlNamespace = exports.SHA224_NAMESPACE;
    }
    return Sha224;
}(algorithm_1.HashAlgorithm));
exports.Sha224 = Sha224;
var Sha256 = (function (_super) {
    __extends(Sha256, _super);
    function Sha256() {
        _super.apply(this, arguments);
        this.algorithm = { name: exports.SHA256 };
        this.xmlNamespace = exports.SHA256_NAMESPACE;
    }
    return Sha256;
}(algorithm_1.HashAlgorithm));
exports.Sha256 = Sha256;
var Sha384 = (function (_super) {
    __extends(Sha384, _super);
    function Sha384() {
        _super.apply(this, arguments);
        this.algorithm = { name: exports.SHA384 };
        this.xmlNamespace = exports.SHA384_NAMESPACE;
    }
    return Sha384;
}(algorithm_1.HashAlgorithm));
exports.Sha384 = Sha384;
var Sha512 = (function (_super) {
    __extends(Sha512, _super);
    function Sha512() {
        _super.apply(this, arguments);
        this.algorithm = { name: exports.SHA512 };
        this.xmlNamespace = exports.SHA512_NAMESPACE;
    }
    return Sha512;
}(algorithm_1.HashAlgorithm));
exports.Sha512 = Sha512;

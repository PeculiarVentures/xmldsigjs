"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var xmljs_3 = require("xmljs");
var xmljs_4 = require("xmljs");
var xml_object_1 = require("./xml_object");
var signature_1 = require("./signature");
var crypto_config_1 = require("./crypto_config");
var index_1 = require("./algorithm/index");
var index_2 = require("./key/index");
var index_3 = require("./transforms/index");
/**
* Provides a wrapper on a core XML signature object to facilitate creating XML signatures.
*/
var SignedXml = (function (_super) {
    __extends(SignedXml, _super);
    function SignedXml(node) {
        _super.call(this);
        this.name = "SignedXml";
        // Internal properties
        this.m_element = null;
        this.m_signature_algorithm = null;
        this.envdoc = null;
        this.validationErrors = [];
        this.key = null;
        // constructor();
        this.m_signature = new signature_1.Signature();
        // this.hashes = new Hashtable(2); // 98% SHA1 for now
        if (node && node.nodeType === xmljs_1.XmlNodeType.Document) {
            // constructor(node: Document);
            this.envdoc = node;
        }
        else if (node && node.nodeType === xmljs_1.XmlNodeType.Element) {
            // constructor(node: Element);
            var xmlText = new XMLSerializer().serializeToString(node);
            this.envdoc = new DOMParser().parseFromString(xmlText, xmljs_1.APPLICATION_XML);
        }
    }
    Object.defineProperty(SignedXml.prototype, "KeyInfo", {
        /**
         * Gets or sets the KeyInfo object of the current SignedXml object.
         */
        get: function () {
            return this.m_signature.KeyInfo;
        },
        set: function (value) {
            this.m_signature.KeyInfo = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "Signature", {
        /**
         * Gets the Signature object of the current SignedXml object.
         */
        get: function () {
            return this.m_signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "Prefix", {
        get: function () {
            return this.prefix;
        },
        /**
         * Gets or sets the prefix for the current SignedXml object.
         */
        set: function (value) {
            this.prefix = value;
            this.SignedInfo.Prefix = this.prefix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SignatureLength", {
        /**
         * Gets the length of the signature for the current SignedXml object.
         */
        get: function () {
            return this.m_signature.SignatureValue.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SignatureMethod", {
        get: function () {
            if (!this.SignedInfo.SignatureMethod)
                throw new xmljs_3.XmlError(xmljs_3.XE.NULL_PARAM, "SignedXml.Signature.SignedInfo", "SignatureMethod");
            return this.SignedInfo.SignatureMethod;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SignatureValue", {
        /**
         * Gets the signature value of the current SignedXml object.
         */
        get: function () {
            return this.m_signature.SignatureValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "CanonicalizationMethod", {
        /**
         * Gets the CanonicalizationMethod of the current SignedXml object.
         */
        get: function () {
            if (!this.SignedInfo.CanonicalizationMethod)
                throw new xmljs_3.XmlError(xmljs_3.XE.NULL_PARAM, "SignedXml", "CanonicalizationMethod");
            return this.SignedInfo.CanonicalizationMethod;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SignedInfo", {
        /**
         * Gets the SignedInfo object of the current SignedXml object.
         */
        get: function () {
            return this.SignedInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SigningKey", {
        /**
         * Gets or sets the asymmetric algorithm key used for signing a SignedXml object.
         */
        get: function () {
            return this.key;
        },
        set: function (value) {
            this.key = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "SigningKeyName", {
        /**
         * Gets or sets the name of the installed key to be used for signing the SignedXml object.
         */
        get: function () {
            throw new xmljs_3.XmlError(xmljs_3.XE.METHOD_NOT_IMPLEMENTED);
        },
        set: function (value) {
            throw new xmljs_3.XmlError(xmljs_3.XE.METHOD_NOT_IMPLEMENTED);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the public key of a signature.
     */
    SignedXml.prototype.GetPublicKeys = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.key !== null)
                return resolve([_this.key]);
            var pkEnumerator = _this.KeyInfo.GetEnumerator();
            var keys = [];
            var chain = Promise.resolve();
            var _loop_1 = function(kic) {
                var alg = crypto_config_1.CryptoConfig.CreateSignatureAlgorithm(_this.SignatureMethod);
                if (kic instanceof index_2.KeyInfoX509Data) {
                    var _loop_2 = function(cert) {
                        chain = chain.then(function () {
                            return cert.exportKey(alg.algorithm);
                        })
                            .then(function (key) {
                            keys.push(key);
                            return Promise.resolve(keys);
                        });
                    };
                    for (var _i = 0, _a = kic.Certificates; _i < _a.length; _i++) {
                        var cert = _a[_i];
                        _loop_2(cert);
                    }
                }
                else {
                    chain = chain.then(function () {
                        return kic.exportKey(alg.algorithm);
                    })
                        .then(function (key) {
                        keys.push(key);
                        return Promise.resolve(keys);
                    });
                }
            };
            for (var _b = 0, pkEnumerator_1 = pkEnumerator; _b < pkEnumerator_1.length; _b++) {
                var kic = pkEnumerator_1[_b];
                _loop_1(kic);
            }
            chain.then(resolve, reject);
        });
    };
    /**
     * Adds a Reference object to the SignedXml object that describes a digest method,
     * digest value, and transform to use for creating an XML digital signature.
     * @param  {Reference} reference The Reference object that describes a digest method, digest value,
     * and transform to use for creating an XML digital signature.
     * @returns void
     */
    SignedXml.prototype.AddReference = function (reference) {
        if (reference == null)
            throw new xmljs_3.XmlError(xmljs_3.XE.PARAM_REQUIRED, "reference");
        this.SignedInfo.AddReference(reference);
    };
    SignedXml.prototype.DigestReferences = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promise = Promise.resolve();
            // we must tell each reference which hash algorithm to use 
            // before asking for the SignedInfo XML !
            var _loop_3 = function(r) {
                // assume SHA-1 if nothing is specified
                if (r.DigestMethod == null)
                    r.DigestMethod = new index_1.Sha1().xmlNamespace;
                promise = promise.then(function () {
                    return _this.GetReferenceHash(r, false);
                })
                    .then(function (hashValue) {
                    r.DigestValue = hashValue;
                    return Promise.resolve();
                });
            };
            for (var _i = 0, _a = _this.SignedInfo.References; _i < _a.length; _i++) {
                var r = _a[_i];
                _loop_3(r);
            }
            promise.then(resolve, reject);
        });
    };
    SignedXml.prototype.FixupNamespaceNodes = function (src, dst, ignoreDefault) {
        // add namespace nodes
        var namespaces = xmljs_2.SelectNamespaces(src);
        for (var i in namespaces) {
            var uri = namespaces[i];
            dst.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    };
    SignedXml.prototype.findById = function (element, id) {
        if (element.nodeType !== xmljs_1.XmlNodeType.Element)
            return null;
        if (element.hasAttribute("Id") && element.getAttribute("Id") === id)
            return element;
        if (element.childNodes && element.childNodes.length)
            for (var i = 0; i < element.childNodes.length; i++) {
                var el = this.findById(element.childNodes[i], id);
                if (el)
                    return el;
            }
        return null;
    };
    SignedXml.prototype.GetReferenceHash = function (reference, check_hmac) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var doc = null;
            var canonOutput = null;
            if (!reference.Uri) {
                doc = _this.envdoc;
            }
            else {
                doc = _this.CreateDocument();
                var objectName = null;
                if (reference.Uri.indexOf("#xpointer") === 0) {
                    var uri_1 = reference.Uri;
                    SignedXml.whitespaceChars.forEach(function (c) {
                        uri_1 = uri_1.substring(9).split(c).join("");
                    });
                    if (uri_1.length < 2 || uri_1[0] !== "(" || uri_1[uri_1.length - 1] !== ")")
                        // FIXME: how to handle invalid xpointer?
                        uri_1 = ""; // String.Empty
                    else
                        uri_1 = uri_1.substring(1, uri_1.length - 2);
                    if (uri_1 === "/")
                        doc = _this.envdoc;
                    else if (uri_1.length > 6 && uri_1.indexOf("id(") === 0 && uri_1[uri_1.length - 1] === ")")
                        // id('foo'), id("foo")
                        objectName = uri_1.substring(4, uri_1.length - 6);
                }
                else if (reference.Uri[0] === "#") {
                    objectName = reference.Uri.substring(1);
                }
                if (objectName) {
                    var found = null;
                    if (_this.m_signature) {
                        for (var i in _this.m_signature.ObjectList) {
                            var obj = _this.m_signature.ObjectList[i];
                            found = _this.findById(obj.element, objectName);
                            if (found) {
                                doc = doc.importNode(found, true);
                                // FIXME: there should be theoretical justification of copying namespace declaration nodes this way.
                                for (var j = 0; j < found.childNodes.length; j++) {
                                    var n = found.childNodes[j];
                                    // Do not copy default namespace as it must be xmldsig namespace for "Object" element.
                                    if (n.nodeType === xmljs_1.XmlNodeType.Element)
                                        _this.FixupNamespaceNodes(n, doc, true);
                                }
                                break;
                            }
                        }
                    }
                    if (!found && _this.envdoc) {
                        found = _this.GetElementById(_this.envdoc, objectName);
                        if (found != null) {
                            doc = doc.importNode(found, true);
                            _this.FixupNamespaceNodes(found, doc, false);
                        }
                    }
                    if (found == null)
                        throw new xmljs_3.XmlError(xmljs_3.XE.CRYPTOGRAPHIC, "Malformed reference object: " + objectName);
                }
            }
            // Create clone to save sorce element from transformations
            doc = doc.cloneNode(true);
            if (reference.TransformChain.Count > 0) {
                // Sort transforms. Enveloped should be first transform
                reference.TransformChain.Sort(function (a, b) {
                    if (b instanceof index_3.XmlDsigEnvelopedSignatureTransform)
                        return 1;
                    return 0;
                });
                for (var _i = 0, _a = reference.TransformChain.GetIterator(); _i < _a.length; _i++) {
                    var transform = _a[_i];
                    if (transform instanceof index_3.XmlDsigC14NWithCommentsTransform)
                        transform = new index_3.XmlDsigC14NTransform(); // TODO: Check RFC for it
                    if (transform instanceof index_3.XmlDsigExcC14NWithCommentsTransform)
                        transform = new index_3.XmlDsigExcC14NTransform(); // TODO: Check RFC for it
                    transform.LoadInnerXml(doc);
                    canonOutput = transform.GetOutput();
                }
                // Apply C14N transform if Reference has only one transform EnvelopdeSignature
                if (reference.TransformChain.Count === 1 && reference.TransformChain.Item(0) instanceof index_3.XmlDsigEnvelopedSignatureTransform) {
                    var c14n = new index_3.XmlDsigC14NTransform();
                    c14n.LoadInnerXml(doc);
                    canonOutput = c14n.GetOutput();
                }
            }
            else if (canonOutput == null) {
                // we must not C14N references from outside the document
                // e.g. non-xml documents
                if (reference.Uri && reference.Uri[0] !== "#") {
                    canonOutput = new XMLSerializer().serializeToString(doc);
                }
                else {
                    // apply default C14N transformation
                    var excC14N = new index_3.XmlDsigC14NTransform();
                    excC14N.LoadInnerXml(doc);
                    canonOutput = excC14N.GetOutput();
                }
            }
            if (!reference.DigestMethod) {
                throw new xmljs_3.XmlError(xmljs_3.XE.NULL_PARAM, "Reference", "DigestMethod");
            }
            var digest = crypto_config_1.CryptoConfig.CreateHashAlgorithm(reference.DigestMethod);
            digest.getHash(canonOutput)
                .then(resolve, reject);
        });
    };
    SignedXml.prototype.GetC14NMethod = function () {
        return crypto_config_1.CryptoConfig.CreateFromName(this.CanonicalizationMethod);
    };
    SignedXml.prototype.SignedInfoTransformed = function () {
        var t = this.GetC14NMethod();
        var xml = new XMLSerializer().serializeToString(this.SignedInfo.GetXml());
        var doc = new DOMParser().parseFromString(xml, xmljs_1.APPLICATION_XML);
        if (this.envdoc) {
            var namespaces = xmljs_2.SelectNamespaces(this.envdoc.documentElement);
            for (var i in namespaces) {
                var uri = namespaces[i];
                if (i === doc.documentElement.prefix)
                    continue;
                doc.documentElement.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
            }
        }
        t.LoadInnerXml(doc);
        return t.GetOutput();
    };
    /**
     * Computes an XML digital signature using the specified algorithm.
     * @param  {Algorithm} algorithm Specified WebCrypto Algoriithm
     * @returns Promise
     */
    SignedXml.prototype.ComputeSignature = function (algorithm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.key) {
                var alg_1 = GetSignatureAlgorithm(_this.key.algorithm ? _this.key.algorithm : algorithm);
                if (_this.SignedInfo.SignatureMethod == null)
                    // required before hashing
                    _this.SignedInfo.SignatureMethod = alg_1.xmlNamespace;
                else if (_this.SignedInfo.SignatureMethod !== alg_1.xmlNamespace)
                    throw new xmljs_3.XmlError(xmljs_3.XE.CRYPTOGRAPHIC, "Specified SignatureAlgorithm is not supported by the signing key.");
                if (_this.key.algorithm.name.toUpperCase() === index_1.RSA_PSS) {
                    var pss = _this.SignedInfo.SignatureParams = new index_1.PssAlgorithmParams();
                    pss.SaltLength = algorithm.saltLength;
                    switch (_this.key.algorithm.hash.name.toUpperCase()) {
                        case index_1.SHA1:
                            pss.DigestMethod = index_1.SHA1_NAMESPACE;
                            break;
                        case index_1.SHA224:
                            pss.DigestMethod = index_1.SHA224_NAMESPACE;
                            break;
                        case index_1.SHA256:
                            pss.DigestMethod = index_1.SHA256_NAMESPACE;
                            break;
                        case index_1.SHA384:
                            pss.DigestMethod = index_1.SHA384_NAMESPACE;
                            break;
                        case index_1.SHA512:
                            pss.DigestMethod = index_1.SHA512_NAMESPACE;
                            break;
                    }
                }
                _this.DigestReferences()
                    .then(function () {
                    // let si = this.getCanonXml([this.SignedInfo.CanonicalizationMethodObject], this.SignedInfo.getXml());
                    var si = _this.SignedInfoTransformed();
                    if (!_this.SigningKey)
                        throw new xmljs_3.XmlError(xmljs_3.XE.NULL_PARAM, "SignedXml", "SigningKey");
                    alg_1.getSignature(si, _this.SigningKey, algorithm)
                        .then(function (signature) {
                        _this.m_signature.SignatureValue = signature;
                        return Promise.resolve(signature);
                    })
                        .then(resolve, reject);
                })
                    .catch(reject);
            }
            else
                throw new xmljs_3.XmlError(xmljs_3.XE.CRYPTOGRAPHIC, "signing key is not specified");
        });
    };
    SignedXml.prototype.CheckSignature = function (param) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.validationErrors = [];
            var xml = _this.envdoc;
            if (!xml)
                throw new xmljs_3.XmlError(xmljs_3.XE.NULL_PARAM, "SignedXml", "envdoc");
            _this.ValidateReferences(xml)
                .then(function () {
                if (param) {
                    var signer_1 = crypto_config_1.CryptoConfig.CreateSignatureAlgorithm(_this.SignatureMethod);
                    if (!signer_1) {
                        reject(new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, _this.SignedInfo.SignatureMethod));
                        return false;
                    }
                    var promise = Promise.resolve();
                    var key_1 = param;
                    if (param instanceof index_2.X509Certificate) {
                        // certificate
                        var cert_1 = param;
                        promise = promise
                            .then(function () {
                            return cert_1.exportKey(signer_1.algorithm);
                        })
                            .then(function (ckey) {
                            key_1 = ckey;
                            return Promise.resolve();
                        });
                    }
                    var signedInfoCanon_1;
                    return promise.then(function () {
                        signedInfoCanon_1 = _this.SignedInfoTransformed();
                        var alg = null;
                        if (_this.SignedInfo.SignatureParams && _this.SignatureMethod === index_1.RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE) {
                            var sp = _this.SignedInfo.SignatureParams;
                            alg = { name: index_1.RSA_PSS };
                            if (sp.SaltLength)
                                alg.saltLength = sp.SaltLength;
                        }
                        return signer_1.verifySignature(signedInfoCanon_1, key_1, xmljs_4.Convert.ToString(_this.SignatureValue, "binary"), alg);
                    });
                }
                else
                    return _this.validateSignatureValue();
            })
                .then(resolve, reject);
        });
    };
    SignedXml.prototype.validateSignatureValue = function () {
        var _this = this;
        var signer;
        var signedInfoCanon;
        return new Promise(function (resolve, reject) {
            signedInfoCanon = _this.SignedInfoTransformed();
            signer = crypto_config_1.CryptoConfig.CreateSignatureAlgorithm(_this.SignatureMethod);
            _this.GetPublicKeys()
                .then(function (keys) {
                return new Promise(function (resolve, reject) {
                    var chain = Promise.resolve(false);
                    var signatureValue = xmljs_4.Convert.ToString(_this.SignatureValue, "binary");
                    var _loop_4 = function(key) {
                        chain = chain.then(function (v) {
                            if (!v) {
                                return signer.verifySignature(signedInfoCanon, key, signatureValue);
                            }
                            return Promise.resolve(v);
                        });
                    };
                    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                        var key = keys_1[_i];
                        _loop_4(key);
                    }
                    chain.then(resolve, reject);
                });
            })
                .then(resolve, reject);
        });
    };
    SignedXml.prototype.findCanonicalizationAlgorithm = function (name) {
        var algo = SignedXml.CanonicalizationAlgorithms[name];
        if (algo)
            return new algo();
        else
            throw new Error("canonicalization algorithm '" + name + "' is not supported");
    };
    SignedXml.prototype.ValidateReferences = function (doc) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            var refs = that.SignedInfo.References;
            var promise = Promise.resolve(true);
            var _loop_5 = function(ref) {
                promise = promise.then(function () {
                    return _this.GetReferenceHash(ref, false);
                })
                    .then(function (digest) {
                    var b64Digest = xmljs_4.Convert.ToBase64(digest);
                    var b64DigestValue = xmljs_4.Convert.ToString(ref.DigestValue, "base64");
                    if (b64Digest !== b64DigestValue) {
                        var err_text = "Invalid digest for uri '" + ref.Uri + "'. Calculated digest is " + b64Digest + " but the xml to validate supplies digest " + b64DigestValue;
                        _this.validationErrors.push(err_text);
                        throw new xmljs_3.XmlError(xmljs_3.XE.CRYPTOGRAPHIC, err_text);
                    }
                    return Promise.resolve(true);
                });
            };
            for (var _i = 0, refs_1 = refs; _i < refs_1.length; _i++) {
                var ref = refs_1[_i];
                _loop_5(ref);
            }
            promise.then(resolve, reject);
        });
    };
    SignedXml.prototype.getCanonXml = function (transforms, node) {
        var res = "";
        var canonXml = node;
        for (var _i = 0, transforms_1 = transforms; _i < transforms_1.length; _i++) {
            var transform = transforms_1[_i];
            if (res)
                canonXml = new DOMParser().parseFromString(res, xmljs_1.APPLICATION_XML);
            transform.LoadInnerXml(canonXml);
            res = transform.GetOutput();
        }
        if (!res)
            res = new XMLSerializer().serializeToString(canonXml);
        return res;
    };
    /**
     * Loads a SignedXml state from an XML element.
     * @param  {Element} value The XML element to load the SignedXml state from.
     * @returns void
     */
    SignedXml.prototype.LoadXml = function (value) {
        if (value == null)
            throw new xmljs_3.XmlError(xmljs_3.XE.PARAM_REQUIRED, "value");
        this.m_element = value;
        this.m_signature.LoadXml(value);
        // Need to give the EncryptedXml object to the 
        // XmlDecryptionTransform to give it a fighting 
        // chance at decrypting the document.
        // for (let r of this.SignedInfo.References) {
        //     for (let t of r.TransformChain) {
        //         if (t instanceof XmlDecryptionTransform)
        //             (<XmlDecryptionTransform>t).EncryptedXml = this.EncryptedXml;
        //     }
        // }
    };
    /**
     * Returns the XML representation of a SignedXml object.
     * @returns Element
     */
    SignedXml.prototype.GetXml = function () {
        this.m_signature.Prefix = this.Prefix;
        if (this.m_element)
            return this.m_element;
        else
            return this.m_signature.GetXml();
    };
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard canonicalization
     * algorithm for XML digital signatures. This field is constant.
     */
    SignedXml.XmlDsigCanonicalizationUrl = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard canonicalization algorithm
     * for XML digital signatures and includes comments. This field is constant.
     */
    SignedXml.XmlDsigCanonicalizationWithCommentsUrl = SignedXml.XmlDsigCanonicalizationUrl + "#WithComments";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard namespace for XML digital signatures.
     * This field is constant.
     */
    SignedXml.XmlDsigNamespaceUrl = "http://www.w3.org/2000/09/xmldsig#";
    SignedXml.XmlDsigDSAUrl = SignedXml.XmlDsigNamespaceUrl + "dsa-sha1";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard HMACSHA1 algorithm for XML digital signatures.
     * This field is constant.
     */
    SignedXml.XmlDsigHMACSHA1Url = SignedXml.XmlDsigNamespaceUrl + "hmac-sha1";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard minimal canonicalization algorithm
     * for XML digital signatures. This field is constant.
     */
    SignedXml.XmlDsigMinimalCanonicalizationUrl = SignedXml.XmlDsigNamespaceUrl + "minimal";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard RSA signature method
     * for XML digital signatures. This field is constant.
     */
    SignedXml.XmlDsigRSASHA1Url = SignedXml.XmlDsigNamespaceUrl + "rsa-sha1";
    /**
     * Represents the Uniform Resource Identifier (URI) for the standard SHA1 digest method for
     * XML digital signatures. This field is constant.
     */
    SignedXml.XmlDsigSHA1Url = SignedXml.XmlDsigNamespaceUrl + "sha1";
    /**
     * Represents the Uniform Resource Identifier (URI) for the XML mode
     * decryption transformation. This field is constant.
     */
    SignedXml.XmlDecryptionTransformUrl = "http://www.w3.org/2002/07/decrypt#XML";
    /**
     * Represents the Uniform Resource Identifier (URI) for the base 64 transformation. This field is constant.
     */
    SignedXml.XmlDsigBase64TransformUrl = SignedXml.XmlDsigNamespaceUrl + "base64";
    /**
     * Represents the Uniform Resource Identifier (URI)
     * for the Canonical XML transformation. This field is constant.
     */
    SignedXml.XmlDsigC14NTransformUrl = SignedXml.XmlDsigCanonicalizationUrl;
    /**
     * Represents the Uniform Resource Identifier (URI) for the Canonical XML transformation,
     * with comments. This field is constant.
     */
    SignedXml.XmlDsigC14NWithCommentsTransformUrl = SignedXml.XmlDsigCanonicalizationWithCommentsUrl;
    /**
     * Represents the Uniform Resource Identifier (URI) for enveloped signature transformation.
     * This field is constant.
     */
    SignedXml.XmlDsigEnvelopedSignatureTransformUrl = SignedXml.XmlDsigNamespaceUrl + "enveloped-signature";
    /**
     * Represents the Uniform Resource Identifier (URI) for exclusive XML canonicalization.
     * This field is constant.
     */
    SignedXml.XmlDsigExcC14NTransformUrl = "http://www.w3.org/2001/10/xml-exc-c14n#";
    /**
     * Represents the Uniform Resource Identifier (URI) for exclusive XML canonicalization, with comments.
     * This field is constant.
     */
    SignedXml.XmlDsigExcC14NWithCommentsTransformUrl = SignedXml.XmlDsigExcC14NTransformUrl + "WithComments";
    /**
     * Represents the Uniform Resource Identifier (URI) for the XML Path Language (XPath).
     * This field is constant.
     */
    SignedXml.XmlDsigXPathTransformUrl = "http://www.w3.org/TR/1999/REC-xpath-19991116";
    /**
     * Represents the Uniform Resource Identifier (URI) for XSLT transformations.
     * This field is constant.
     */
    SignedXml.XmlDsigXsltTransformUrl = "http://www.w3.org/TR/1999/REC-xslt-19991116";
    /**
     * Represents the Uniform Resource Identifier (URI) for the license transform algorithm
     * used to normalize XrML licenses for signatures.
     */
    SignedXml.XmlLicenseTransformUrl = "urn:mpeg:mpeg21:2003:01-REL-R-NS:licenseTransform";
    SignedXml.whitespaceChars = [" ", "\r", "\n", "\t"];
    return SignedXml;
}(xml_object_1.XmlSignatureObject));
exports.SignedXml = SignedXml;
function GetSignatureAlgorithm(algorithm) {
    if (algorithm.name.toUpperCase() === index_1.RSA_PKCS1.toUpperCase()) {
        var hashName = algorithm.hash.name;
        var alg = void 0;
        switch (hashName.toUpperCase()) {
            case index_1.SHA1:
                alg = new index_1.RsaPkcs1Sha1();
                break;
            case index_1.SHA224:
                alg = new index_1.RsaPkcs1Sha224();
                break;
            case index_1.SHA256:
                alg = new index_1.RsaPkcs1Sha256();
                break;
            case index_1.SHA384:
                alg = new index_1.RsaPkcs1Sha384();
                break;
            case index_1.SHA512:
                alg = new index_1.RsaPkcs1Sha512();
                break;
            default:
                throw new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
        }
        return alg;
    }
    else if (algorithm.name.toUpperCase() === index_1.RSA_PSS.toUpperCase()) {
        var hashName = algorithm.hash.name;
        var alg = void 0;
        switch (hashName.toUpperCase()) {
            case index_1.SHA1:
                alg = new index_1.RsaPssSha1();
                break;
            case index_1.SHA224:
                alg = new index_1.RsaPssSha224();
                break;
            case index_1.SHA256:
                alg = new index_1.RsaPssSha256();
                break;
            case index_1.SHA384:
                alg = new index_1.RsaPssSha384();
                break;
            case index_1.SHA512:
                alg = new index_1.RsaPssSha512();
                break;
            default:
                throw new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
        }
        return alg;
    }
    else if (algorithm.name.toUpperCase() === "ECDSA") {
        var hashName = algorithm.hash.name;
        var alg = void 0;
        switch (hashName.toUpperCase()) {
            case index_1.SHA1:
                alg = new index_1.EcdsaSha1();
                break;
            case index_1.SHA224:
                alg = new index_1.EcdsaSha224();
                break;
            case index_1.SHA256:
                alg = new index_1.EcdsaSha256();
                break;
            case index_1.SHA384:
                alg = new index_1.EcdsaSha384();
                break;
            case index_1.SHA512:
                alg = new index_1.EcdsaSha512();
                break;
            default:
                throw new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
        }
        return alg;
    }
    else if (algorithm.name.toUpperCase() === index_1.HMAC_ALGORITHM) {
        var hashName = algorithm.hash.name;
        var alg = void 0;
        switch (hashName.toUpperCase()) {
            case index_1.SHA1:
                alg = new index_1.HmacSha1();
                break;
            case index_1.SHA224:
                alg = new index_1.HmacSha224();
                break;
            case index_1.SHA256:
                alg = new index_1.HmacSha256();
                break;
            case index_1.SHA384:
                alg = new index_1.HmacSha384();
                break;
            case index_1.SHA512:
                alg = new index_1.HmacSha512();
                break;
            default:
                throw new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
        }
        return alg;
    }
    else {
        throw new xmljs_3.XmlError(xmljs_3.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name);
    }
}

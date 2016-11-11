"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var xml_1 = require("./xml");
var xml_object_1 = require("./xml_object");
var reference_1 = require("./reference");
var crypto_config_1 = require("./crypto_config");
var index_1 = require("./algorithm/index");
/**
 * The SignedInfo class represents the <SignedInfo> element
 * of an XML signature defined by the XML digital signature specification
 */
var SignedInfo = (function (_super) {
    __extends(SignedInfo, _super);
    function SignedInfo(signedXml) {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.SignedInfo;
        this.signedXml = null;
        if (signedXml)
            this.signedXml = signedXml;
        this.references = new Array();
        this.c14nMethod = xml_1.XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform;
    }
    Object.defineProperty(SignedInfo.prototype, "CanonicalizationMethod", {
        /**
         * Gets or sets the canonicalization algorithm that is used before signing
         * for the current SignedInfo object.
         */
        get: function () {
            return this.c14nMethod;
        },
        set: function (value) {
            this.c14nMethod = value;
            this.element = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "CanonicalizationMethodObject", {
        /**
         * Gets a Transform object used for canonicalization.
         * @returns Transform
         */
        get: function () {
            return crypto_config_1.CryptoConfig.CreateFromName(this.CanonicalizationMethod);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "Count", {
        /**
         * Gets the number of references in the current SignedInfo object.
         */
        get: function () {
            return this.References.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "Id", {
        /**
         * Gets or sets the ID of the current SignedInfo object.
         */
        get: function () {
            return this.id;
        },
        set: function (value) {
            this.element = null;
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "IsReadOnly", {
        /**
         * Gets a value that indicates whether the collection is read-only.
         * @returns boolean
         */
        get: function () {
            throw new xmljs_2.XmlError(xmljs_2.XE.METHOD_NOT_SUPPORTED);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "IsSynchronized", {
        /**
         * Gets a value that indicates whether the collection is synchronized.
         * @returns boolean
         */
        get: function () {
            throw new xmljs_2.XmlError(xmljs_2.XE.METHOD_NOT_SUPPORTED);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "References", {
        /**
         * Gets a list of the Reference objects of the current SignedInfo object.
         */
        get: function () {
            return this.references;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "SignatureLength", {
        /**
         * Gets or sets the length of the signature for the current SignedInfo object.
         */
        get: function () {
            return this.signatureLength;
        },
        set: function (value) {
            this.element = null;
            this.signatureLength = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "SignatureMethod", {
        /**
         * Gets or sets the name of the algorithm used for signature generation
         * and validation for the current SignedInfo object.
         */
        get: function () {
            return this.signatureMethod;
        },
        set: function (value) {
            this.element = null;
            this.signatureMethod = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "SignatureParams", {
        get: function () {
            return this.signatureParams;
        },
        set: function (v) {
            this.signatureParams = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedInfo.prototype, "SyncRoot", {
        /**
         * Gets an object to use for synchronization.
         */
        get: function () {
            throw new xmljs_2.XmlError(xmljs_2.XE.METHOD_NOT_SUPPORTED);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a Reference object to the list of references to digest and sign.
     * @param  {Reference} reference The reference to add to the list of references.
     * @returns void
     */
    SignedInfo.prototype.AddReference = function (reference) {
        this.references.push(reference);
    };
    /**
     * Copies the elements of this instance into an Array object, starting at a specified index in the array.
     * @param  {any[]} array
     * @param  {number} index
     * @returns void
     */
    SignedInfo.prototype.CopyTo = function (array, index) {
        throw new xmljs_2.XmlError(xmljs_2.XE.METHOD_NOT_SUPPORTED);
    };
    /**
     * Returns the XML representation of the SignedInfo object.
     * @returns Node
     */
    SignedInfo.prototype.GetXml = function () {
        var document = this.CreateDocument();
        var element = this.CreateElement(document);
        if (this.signatureMethod == null)
            throw new xmljs_2.XmlError(xmljs_2.XE.CRYPTOGRAPHIC, "SignatureMethod");
        if (this.references.length === 0)
            throw new xmljs_2.XmlError(xmljs_2.XE.CRYPTOGRAPHIC, "References empty");
        var prefix = this.GetPrefix();
        // @Id
        if (this.id != null)
            element.setAttribute(xml_1.XmlSignature.AttributeNames.Id, this.id);
        // CanonicalizationMethod
        if (this.c14nMethod) {
            var c14n = document.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.CanonicalizationMethod);
            c14n.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.c14nMethod);
            element.appendChild(c14n);
        }
        // SignatureMethod
        if (this.signatureMethod) {
            var sm = document.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.SignatureMethod);
            sm.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.signatureMethod);
            if (this.signedXml && this.signedXml.SigningKey) {
                // HMAC
                if (this.signedXml.SigningKey.algorithm.name === index_1.HMAC_ALGORITHM) {
                    var hmac = document.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.HMACOutputLength);
                    hmac.textContent = this.signedXml.SigningKey.algorithm.length;
                    sm.appendChild(hmac);
                }
                else if (this.signedXml.SigningKey.algorithm.name === index_1.RSA_PSS) {
                    this.signatureParams.Prefix = "pss";
                    this.signatureParams.dsPrefix = this.Prefix;
                    var pss = this.signatureParams.GetXml();
                    sm.appendChild(pss);
                }
            }
            element.appendChild(sm);
        }
        // This check is only done when element is created here.
        if (this.references.length === 0)
            throw new xmljs_2.XmlError(xmljs_2.XE.CRYPTOGRAPHIC, "At least one Reference element is required in SignedInfo.");
        // we add References afterward so we don't end up with extraneous
        // xmlns="..." in each reference elements.
        for (var i in this.references) {
            var r = this.references[i];
            r.Prefix = this.Prefix;
            var xn = r.GetXml();
            var newNode = document.importNode(xn, true);
            element.appendChild(newNode);
        }
        return element;
    };
    /**
     * Loads a SignedInfo state from an XML element.
     * @param  {Element} value
     * @returns void
     */
    SignedInfo.prototype.LoadXml = function (value) {
        _super.prototype.LoadXml.call(this, value);
        this.id = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Id, null, false);
        this.c14nMethod = xml_1.XmlSignature.GetAttributeFromElement(value, xml_1.XmlSignature.AttributeNames.Algorithm, xml_1.XmlSignature.ElementNames.CanonicalizationMethod);
        var sm = xml_1.XmlSignature.GetChildElement(value, xml_1.XmlSignature.ElementNames.SignatureMethod, xml_1.XmlSignature.NamespaceURI);
        if (sm !== null) {
            this.signatureMethod = sm.getAttribute(xml_1.XmlSignature.AttributeNames.Algorithm);
            if (sm.hasChildNodes) {
                var pss = xml_1.XmlSignature.GetChildElement(sm, xml_1.XmlSignature.ElementNames.RSAPSSParams, xml_1.XmlSignature.NamespaceURIPss);
                if (pss) {
                    this.signatureParams = new index_1.PssAlgorithmParams();
                    this.signatureParams.LoadXml(pss);
                }
            }
        }
        for (var i = 0; i < value.childNodes.length; i++) {
            var n = value.childNodes[i];
            if (n.nodeType === xmljs_1.XmlNodeType.Element &&
                n.localName === xml_1.XmlSignature.ElementNames.Reference &&
                n.namespaceURI === xml_1.XmlSignature.NamespaceURI) {
                var r = new reference_1.Reference();
                r.LoadXml(n);
                this.AddReference(r);
            }
        }
        this.element = value;
    };
    return SignedInfo;
}(xml_object_1.XmlSignatureObject));
exports.SignedInfo = SignedInfo;

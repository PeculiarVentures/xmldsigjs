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
var transforms_1 = require("./transforms");
/**
 * Represents the <reference> element of an XML signature.
 */
var Reference = (function (_super) {
    __extends(Reference, _super);
    function Reference(p) {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.Reference;
        this.transforms = new transforms_1.Transforms();
        this.digestMethod = "http://www.w3.org/2001/04/xmlenc#sha256";
        if (typeof p === "string") {
            this.uri = p;
        }
    }
    Object.defineProperty(Reference.prototype, "DigestMethod", {
        /**
         * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
         */
        get: function () {
            return this.digestMethod;
        },
        set: function (value) {
            this.element = null;
            this.digestMethod = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "DigestValue", {
        /**
         * Gets or sets the digest value of the current Reference.
         */
        get: function () {
            return this.digestValue;
        },
        set: function (value) {
            this.element = null;
            this.digestValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "Id", {
        /**
         * Gets or sets the ID of the current Reference.
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
    Object.defineProperty(Reference.prototype, "TransformChain", {
        /**
         * Gets the transform chain of the current Reference.
         */
        get: function () {
            return this.transforms;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "Type", {
        /**
         * Gets or sets the type of the object being signed.
         */
        get: function () {
            return this.type;
        },
        set: function (value) {
            this.element = null;
            this.type = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reference.prototype, "Uri", {
        /**
         * Gets or sets the Uri of the current Reference.
         */
        get: function () {
            return this.uri;
        },
        set: function (value) {
            this.element = null;
            this.uri = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a Transform object to the list of transforms to be performed
     * on the data before passing it to the digest algorithm.
     * @param  {Transform} transform The transform to be added to the list of transforms.
     * @returns void
     */
    Reference.prototype.AddTransform = function (transform) {
        this.transforms.Add(transform);
    };
    /**
     * Returns the XML representation of the Reference.
     * @returns Element
     */
    Reference.prototype.GetXml = function () {
        if (this.element != null)
            return this.element;
        if (this.digestMethod == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "DigestMethod");
        if (this.digestValue == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "DigestValue");
        var doc = this.CreateDocument();
        var xel = this.CreateElement(doc);
        var prefix = this.GetPrefix();
        // @id
        if (this.id != null)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.Id, this.id);
        // @uri
        if (this.uri != null)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.URI, this.uri);
        // @type
        if (this.type != null)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.Type, this.type);
        // Transforms
        if (this.transforms.Count > 0) {
            var ts = this.transforms.GetXml();
            xel.appendChild(ts);
        }
        // DigestMethod
        var dm = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.DigestMethod);
        dm.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.digestMethod);
        xel.appendChild(dm);
        // DigestValue
        var dv = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.DigestValue);
        dv.textContent = xmljs_2.Convert.ToString(this.digestValue, "base64");
        xel.appendChild(dv);
        return xel;
    };
    /**
     * Loads a Reference state from an XML element.
     * @param  {Element} value
     */
    Reference.prototype.LoadXml = function (value) {
        _super.prototype.LoadXml.call(this, value);
        this.id = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Id, null, false);
        this.uri = this.GetAttribute(xml_1.XmlSignature.AttributeNames.URI, null, false);
        this.type = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Type, null, false);
        var transforms = this.GetElement(xml_1.XmlSignature.ElementNames.Transforms, false);
        if (transforms) {
            this.transforms.LoadXml(transforms);
        }
        // get DigestMethod
        this.DigestMethod = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, xml_1.XmlSignature.ElementNames.DigestMethod);
        // get DigestValue
        var dig = this.GetChild(xml_1.XmlSignature.ElementNames.DigestValue, false);
        if (dig)
            this.DigestValue = xmljs_2.Convert.FromString(dig.textContent || "", "base64").buffer;
    };
    return Reference;
}(xml_object_1.XmlSignatureObject));
exports.Reference = Reference;

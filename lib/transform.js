"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_1 = require("./xml");
var xml_object_1 = require("./xml_object");
/**
 * The Transform element contains a single transformation
 */
var Transform = (function (_super) {
    __extends(Transform, _super);
    // Constructors
    /**
     * Default constructor
     */
    function Transform() {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.Transform;
        this.innerXml = null;
    }
    // Public methods
    /**
     * When overridden in a derived class, returns the output of the current Transform object.
     */
    Transform.prototype.GetOutput = function () {
        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
    };
    Transform.prototype.LoadInnerXml = function (node) {
        if (!node)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "node");
        this.innerXml = node;
    };
    Transform.prototype.GetInnerXml = function () {
        return this.innerXml;
    };
    /**
     * Check to see if something has changed in this instance and needs to be serialized
     * @returns Flag indicating if a member needs serialization
     */
    Transform.prototype.HasChanged = function () {
        var retVal = false;
        if (this.Algorithm) {
            retVal = true;
        }
        if (this.XPath) {
            retVal = true;
        }
        return retVal;
    };
    /**
     * Load state from an XML element
     * @param {Element} element XML element containing new state
     */
    Transform.prototype.LoadXml = function (element) {
        _super.prototype.LoadXml.call(this, element);
        this.Algorithm = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, "", false);
        var xpath = this.GetElement(xml_1.XmlSignature.ElementNames.XPath, false);
        this.XPath = xpath && xpath.textContent ? xpath.textContent : "";
    };
    /**
     * Returns the XML representation of the this object
     * @returns XML element containing the state of this object
     */
    Transform.prototype.GetXml = function () {
        var document = this.CreateDocument();
        var element = this.CreateElement(document);
        // @Algorithm
        element.setAttribute(xml_1.XmlSignature.AttributeNames.Algorithm, this.Algorithm || "");
        if (this.XPath) {
            var xmlXPath = document.createElementNS(xml_1.XmlSignature.NamespaceURI, this.GetPrefix() + "XPath");
            xmlXPath.textContent = this.XPath;
            element.appendChild(xmlXPath);
        }
        return element;
    };
    return Transform;
}(xml_object_1.XmlSignatureObject));
exports.Transform = Transform;

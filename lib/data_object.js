"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_1 = require("./xml");
var xml_object_1 = require("./xml_object");
// XmlElement part of the signature
// Note: Looks like KeyInfoNode (but the later is XmlElement inside KeyInfo)
// required for "enveloping signatures"
/**
 * Represents the object element of an XML signature that holds data to be signed.
 */
var DataObject = (function (_super) {
    __extends(DataObject, _super);
    function DataObject(id, mimeType, encoding, data) {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.Object;
        this.Build(id, mimeType, encoding, data);
    }
    // this one accept a null "data" parameter
    DataObject.prototype.Build = function (id, mimeType, encoding, data) {
        var document = this.CreateDocument();
        var xel = this.CreateElement(document);
        // @Id
        if (id)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.Id, id);
        // @MimeType
        if (mimeType)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.MimeType, mimeType);
        // @Encoding
        if (encoding)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.Encoding, encoding);
        // Data
        if (data != null) {
            var newNode = document.importNode(data, true);
            xel.appendChild(newNode);
        }
    };
    Object.defineProperty(DataObject.prototype, "Data", {
        /**
         * Gets or sets the data value of the current DataObject object.
         */
        get: function () {
            if (this.element)
                return this.element.childNodes;
            throw new xmljs_1.XmlError(xmljs_1.XE.NULL_REFERENCE, "DataObject", "element");
        },
        set: function (value) {
            if (value == null)
                throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "value");
            if (!this.element)
                throw new xmljs_1.XmlError(xmljs_1.XE.NULL_REFERENCE, "DataObject", "element");
            var doc = this.CreateDocument();
            var el = doc.importNode(this.element, true);
            while (el.lastChild != null)
                el.removeChild(el.lastChild);
            for (var i = 0; i < value.length; i++) {
                var n = value[i];
                el.appendChild(doc.importNode(n, true));
            }
            this.element = el;
            this.propertyModified = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "Encoding", {
        /**
         * Gets or sets the encoding of the current DataObject object.
         */
        get: function () {
            return this.GetField(xml_1.XmlSignature.AttributeNames.Encoding);
        },
        set: function (value) {
            this.SetField(xml_1.XmlSignature.AttributeNames.Encoding, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "Id", {
        /**
         * Gets or sets the identification of the current DataObject object.
         */
        get: function () {
            return this.GetField(xml_1.XmlSignature.AttributeNames.Id);
        },
        set: function (value) {
            this.SetField(xml_1.XmlSignature.AttributeNames.Id, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "MimeType", {
        /**
         * Gets or sets the MIME type of the current DataObject object.
         */
        get: function () {
            return this.GetField(xml_1.XmlSignature.AttributeNames.MimeType);
        },
        set: function (value) {
            this.SetField(xml_1.XmlSignature.AttributeNames.MimeType, value);
        },
        enumerable: true,
        configurable: true
    });
    DataObject.prototype.GetField = function (attribute) {
        return this.element && this.element.hasAttribute(attribute) ? this.element.getAttribute(attribute) : null;
    };
    DataObject.prototype.SetField = function (attribute, value) {
        // MS-BUGS: it never cleans attribute value up.
        if (value == null)
            return;
        if (!this.element)
            throw new xmljs_1.XmlError(xmljs_1.XE.NULL_REFERENCE, "DataObject", "element");
        if (this.propertyModified)
            this.element.setAttribute(attribute, value);
        else {
            var doc = this.CreateDocument();
            var el = doc.importNode(this.element, true);
            el.setAttribute(attribute, value);
            this.element = el;
            this.propertyModified = true;
        }
    };
    /**
     * Returns the XML representation of the DataObject object.
     * @returns Element
     */
    DataObject.prototype.GetXml = function () {
        if (!this.element)
            throw new xmljs_1.XmlError(xmljs_1.XE.NULL_REFERENCE, "DataObject", "element");
        if (this.propertyModified) {
            // It looks MS.NET returns element which comes from new XmlDocument every time
            var oldElement = this.element;
            var doc = this.CreateDocument();
            var prefix = this.GetPrefix();
            this.element = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.Object);
            for (var i = 0; i < oldElement.attributes.length; i++) {
                var attribute = oldElement.attributes[i];
                switch (attribute.nodeName) {
                    case xml_1.XmlSignature.AttributeNames.Id:
                    case xml_1.XmlSignature.AttributeNames.Encoding:
                    case xml_1.XmlSignature.AttributeNames.MimeType:
                        this.element.setAttribute(attribute.nodeName, attribute.nodeValue); // TODO Can be attr value null?
                        break;
                }
            }
            for (var i = 0; i < oldElement.childNodes.length; i++) {
                var n = oldElement.childNodes[i];
                this.element.appendChild(doc.importNode(n, true));
            }
        }
        return this.element;
    };
    /**
     * Loads a DataObject state from an XML element.
     * @param  {Element} value
     * @returns void
     */
    DataObject.prototype.LoadXml = function (value) {
        if (value == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "value");
        this.element = value;
        this.propertyModified = false;
    };
    return DataObject;
}(xml_object_1.XmlSignatureObject));
exports.DataObject = DataObject;

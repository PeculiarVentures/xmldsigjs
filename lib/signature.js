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
var data_object_1 = require("./data_object");
var signed_info_1 = require("./signed_info");
var key_info_1 = require("./key_info");
var application_1 = require("./application");
/**
 * Represents the <Signature> element of an XML signature.
 */
var Signature = (function (_super) {
    __extends(Signature, _super);
    function Signature() {
        _super.call(this);
        this.name = "Signature";
        this.info = new signed_info_1.SignedInfo();
        this.key = new key_info_1.KeyInfo();
        this.list = [];
    }
    Object.defineProperty(Signature.prototype, "Id", {
        get: function () {
            return this.id;
        },
        /**
         * Gets or sets the ID of the current Signature.
         */
        set: function (value) {
            this.element = null;
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signature.prototype, "KeyInfo", {
        /**
         * Gets or sets the KeyInfo of the current Signature.
         */
        get: function () {
            return this.key;
        },
        set: function (value) {
            this.element = null;
            this.key = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signature.prototype, "ObjectList", {
        /**
         * Gets or sets a list of objects to be signed.
         */
        get: function () {
            return this.list;
        },
        set: function (value) {
            this.list = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signature.prototype, "SignatureValue", {
        /**
         * Gets or sets the value of the digital signature.
         */
        get: function () {
            return this.signature;
        },
        set: function (value) {
            this.element = null;
            this.signature = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signature.prototype, "SignatureValueId", {
        /**
         * Gets or sets the Id of the SignatureValue.
         */
        get: function () {
            return this.signature_id;
        },
        set: function (value) {
            this.element = null;
            this.signature_id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signature.prototype, "SignedInfo", {
        /**
         * Gets or sets the SignedInfo of the current Signature.
         */
        get: function () {
            return this.info;
        },
        set: function (value) {
            this.element = null;
            this.info = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a DataObject to the list of objects to be signed.
     * @param  {DataObject} dataObject The DataObject to be added to the list of objects to be signed.
     * @returns void
     */
    Signature.prototype.AddObject = function (dataObject) {
        this.list.push(dataObject);
    };
    /**
     * Returns the XML representation of the Signature.
     * @returns Element
     */
    Signature.prototype.GetXml = function () {
        if (this.element)
            return this.element;
        if (this.info == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "SignedInfo");
        if (this.signature == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "SignatureValue");
        var document = this.CreateDocument();
        var xel = this.CreateElement(document);
        // add xmlns for xmldom
        if (application_1.Application.isNodePlugin()) {
            xel.setAttribute("xmlns:" + this.Prefix, xml_1.XmlSignature.NamespaceURI);
        }
        // @Id
        if (this.id != null)
            xel.setAttribute(xml_1.XmlSignature.AttributeNames.Id, this.id);
        // SignedInfo
        this.info.Prefix = this.Prefix;
        var xn = this.info.GetXml();
        xel.appendChild(xn);
        // Signature
        if (this.signature != null) {
            var sv = document.createElementNS(xml_1.XmlSignature.NamespaceURI, this.GetPrefix() + xml_1.XmlSignature.ElementNames.SignatureValue);
            sv.textContent = xmljs_2.Convert.ToString(this.signature, "base64");
            if (this.signature_id)
                sv.setAttribute(xml_1.XmlSignature.AttributeNames.Id, this.signature_id);
            xel.appendChild(sv);
        }
        // KeyInfo
        if (this.key != null) {
            this.key.Prefix = this.Prefix;
            xn = this.key.GetXml();
            xel.appendChild(xn);
        }
        // DataObject[]
        if (this.list.length > 0) {
            for (var i in this.list) {
                var obj = this.list[i];
                obj.Prefix = this.Prefix;
                xn = obj.GetXml();
                xel.appendChild(xn);
            }
        }
        return xel;
    };
    /**
     * Loads a Signature state from an XML element.
     * @param  {Element} value
     */
    Signature.prototype.LoadXml = function (element) {
        _super.prototype.LoadXml.call(this, element);
        // @Id
        this.id = this.GetAttribute(xml_1.XmlSignature.AttributeNames.Id, "", false);
        // LAMESPEC: This library is totally useless against eXtensibly Marked-up document.
        var i = this.NextElementPos(element.childNodes, 0, xml_1.XmlSignature.ElementNames.SignedInfo, xml_1.XmlSignature.NamespaceURI, true);
        var sinfo = element.childNodes[i];
        this.info = new signed_info_1.SignedInfo();
        this.info.LoadXml(sinfo);
        i = this.NextElementPos(element.childNodes, ++i, xml_1.XmlSignature.ElementNames.SignatureValue, xml_1.XmlSignature.NamespaceURI, true);
        var sigValue = element.childNodes[i];
        this.signature = xmljs_2.Convert.FromString(sigValue.textContent || "", "base64");
        this.signature_id = xml_object_1.XmlSignatureObject.GetAttribute(sigValue, xml_1.XmlSignature.AttributeNames.Id, "", false);
        // signature isn't required: <element ref="ds:KeyInfo" minOccurs="0"/> 
        i = this.NextElementPos(element.childNodes, ++i, xml_1.XmlSignature.ElementNames.KeyInfo, xml_1.XmlSignature.NamespaceURI, false);
        if (i > 0) {
            var kinfo = element.childNodes[i];
            this.key = new key_info_1.KeyInfo();
            this.key.LoadXml(kinfo);
        }
        var xnl = element.getElementsByTagNameNS(xml_1.XmlSignature.NamespaceURI, "Object");
        for (var i_1 = 0; i_1 < xnl.length; i_1++) {
            var xn = xnl[i_1];
            var obj = new data_object_1.DataObject();
            obj.LoadXml(xn);
            this.AddObject(obj);
        }
    };
    Signature.prototype.NextElementPos = function (nl, pos, name, ns, required) {
        while (pos < nl.length) {
            if (nl[pos].nodeType === xmljs_1.XmlNodeType.Element) {
                if (nl[pos].localName !== name || nl[pos].namespaceURI !== ns) {
                    if (required)
                        throw new xmljs_1.XmlError(xmljs_1.XE.ELEMENT_MALFORMED, name);
                    else
                        return -2;
                }
                else
                    return pos;
            }
            else
                pos++;
        }
        if (required)
            throw new xmljs_1.XmlError(xmljs_1.XE.ELEMENT_MALFORMED, name);
        return -1;
    };
    return Signature;
}(xml_object_1.XmlSignatureObject));
exports.Signature = Signature;

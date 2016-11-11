"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xml_1 = require("./xml");
var index_1 = require("./key/index");
var index_2 = require("./key/index");
/**
 * Represents an XML digital signature or XML encryption <KeyInfo> element.
 */
var KeyInfo = (function (_super) {
    __extends(KeyInfo, _super);
    function KeyInfo() {
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.KeyInfo;
        this.Info = [];
    }
    Object.defineProperty(KeyInfo.prototype, "length", {
        /**
         * Gets the number of KeyInfoClause objects contained in the KeyInfo object.
         */
        get: function () {
            return this.Info.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyInfo.prototype, "Id", {
        /**
         * Gets or sets the key information identity.
         */
        get: function () {
            return this.id;
        },
        set: function (value) {
            this.id = value;
        },
        enumerable: true,
        configurable: true
    });
    KeyInfo.prototype.GetEnumerator = function (requestedObjectType) {
        if (!requestedObjectType)
            return this.Info;
        var TypeList = [];
        for (var _i = 0, _a = this.Info; _i < _a.length; _i++) {
            var el = _a[_i];
            // ...with all object of specified type...
            if (el instanceof requestedObjectType)
                TypeList.push(el);
        }
        // ...and return its enumerator
        return TypeList;
    };
    /**
     * Returns an enumerator of the KeyInfoClause objects in the KeyInfo object.
     * @param  {KeyInfoClause} clause The KeyInfoClause to add to the KeyInfo object.
     * @returns void
     */
    KeyInfo.prototype.AddClause = function (clause) {
        this.Info.push(clause);
    };
    /**
     * Returns the XML representation of the KeyInfo object.
     * @returns Node
     */
    KeyInfo.prototype.GetXml = function () {
        var doc = this.CreateDocument();
        var xel = this.CreateElement(doc);
        // we add References afterward so we don't end up with extraneous
        // xmlns="..." in each reference elements.
        for (var i in this.Info) {
            var kic = this.Info[i];
            kic.Prefix = this.Prefix;
            var xn = kic.GetXml();
            xel.appendChild(xn);
        }
        return xel;
    };
    /**
     * Loads a KeyInfo state from an XML element.
     * @param  {Element} value
     * @returns void
     */
    KeyInfo.prototype.LoadXml = function (value) {
        if (value == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "value");
        this.Id = value.hasAttribute("Id") ? value.getAttribute("Id") : null;
        if ((value.localName === xml_1.XmlSignature.ElementNames.KeyInfo) && (value.namespaceURI === xml_1.XmlSignature.NamespaceURI)) {
            for (var i = 0; i < value.childNodes.length; i++) {
                var n = value.childNodes[i];
                if (n.nodeType !== xmljs_1.XmlNodeType.Element)
                    continue;
                var kic = null;
                switch (n.localName) {
                    case xml_1.XmlSignature.ElementNames.KeyValue:
                        var xnl = n.childNodes;
                        if (xnl.length > 0) {
                            // we must now treat the whitespace !
                            for (var j = 0; j < xnl.length; j++) {
                                var m = xnl[j];
                                switch (m.localName) {
                                    case xml_1.XmlSignature.ElementNames.ECKeyValue:
                                        kic = new index_1.EcdsaKeyValue();
                                        n = m;
                                        break;
                                    case xml_1.XmlSignature.ElementNames.RSAKeyValue:
                                        kic = new index_1.RsaKeyValue();
                                        n = m;
                                        break;
                                }
                            }
                        }
                        break;
                    case xml_1.XmlSignature.ElementNames.KeyName:
                        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
                    // kic = <KeyInfoClause>new KeyInfoName();
                    // break;
                    case xml_1.XmlSignature.ElementNames.RetrievalMethod:
                        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
                    // kic = <KeyInfoClause>new KeyInfoRetrievalMethod();
                    // break;
                    case xml_1.XmlSignature.ElementNames.X509Data:
                        kic = new index_2.KeyInfoX509Data();
                        break;
                    case xml_1.XmlSignature.ElementNames.RSAKeyValue:
                        kic = new index_1.RsaKeyValue();
                        break;
                    case xml_1.XmlSignature.ElementNames.EncryptedKey:
                        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
                    // kic = <KeyInfoClause>new KeyInfoEncryptedKey();
                    // break;
                    default:
                        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
                }
                if (kic != null) {
                    kic.LoadXml(n);
                    this.AddClause(kic);
                }
            }
        }
        // No check is performed on MS.NET...
    };
    return KeyInfo;
}(xmljs_1.XmlObject));
exports.KeyInfo = KeyInfo;

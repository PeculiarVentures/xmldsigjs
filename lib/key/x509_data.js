"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xmljs_1 = require("xmljs");
var xmljs_2 = require("xmljs");
var xml_1 = require("../xml");
var xml_object_1 = require("../xml_object");
var x509_certificate_1 = require("./x509_certificate");
(function (X509IncludeOption) {
    X509IncludeOption[X509IncludeOption["None"] = 0] = "None";
    X509IncludeOption[X509IncludeOption["EndCertOnly"] = 1] = "EndCertOnly";
    X509IncludeOption[X509IncludeOption["ExcludeRoot"] = 2] = "ExcludeRoot";
    X509IncludeOption[X509IncludeOption["WholeChain"] = 3] = "WholeChain";
})(exports.X509IncludeOption || (exports.X509IncludeOption = {}));
var X509IncludeOption = exports.X509IncludeOption;
/**
 * Represents an <X509Data> subelement of an XMLDSIG or XML Encryption <KeyInfo> element.
 */
var KeyInfoX509Data = (function (_super) {
    __extends(KeyInfoX509Data, _super);
    function KeyInfoX509Data(cert, includeOptions) {
        if (includeOptions === void 0) { includeOptions = X509IncludeOption.None; }
        _super.call(this);
        this.name = xml_1.XmlSignature.ElementNames.X509Data;
        this.x509crl = null;
        this.SubjectKeyIdList = [];
        this.key = null;
        if (cert) {
            if (cert instanceof Uint8Array)
                this.AddCertificate(new x509_certificate_1.X509Certificate(cert));
            else if (cert instanceof x509_certificate_1.X509Certificate) {
                switch (includeOptions) {
                    case X509IncludeOption.None:
                    case X509IncludeOption.EndCertOnly:
                        this.AddCertificate(cert);
                        break;
                    case X509IncludeOption.ExcludeRoot:
                        this.AddCertificatesChainFrom(cert, false);
                        break;
                    case X509IncludeOption.WholeChain:
                        this.AddCertificatesChainFrom(cert, true);
                        break;
                }
            }
        }
    }
    Object.defineProperty(KeyInfoX509Data.prototype, "Key", {
        /**
         * Gets public key of the X509Data
         */
        get: function () {
            return this.key;
        },
        enumerable: true,
        configurable: true
    });
    KeyInfoX509Data.prototype.importKey = function (key) {
        return Promise.reject(new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_SUPPORTED));
    };
    /**
     * Exports key from X509Data object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    KeyInfoX509Data.prototype.exportKey = function (alg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.Certificates.length)
                _this.Certificates[0].exportKey(alg)
                    .then(resolve, reject);
        });
    };
    // this gets complicated because we must:
    // 1. build the chain using a X509Certificate2 class;
    // 2. test for root using the Mono.Security.X509.X509Certificate class;
    // 3. add the certificates as X509Certificate instances;
    KeyInfoX509Data.prototype.AddCertificatesChainFrom = function (cert, root) {
        throw new xmljs_1.XmlError(xmljs_1.XE.METHOD_NOT_IMPLEMENTED);
    };
    Object.defineProperty(KeyInfoX509Data.prototype, "Certificates", {
        /**
         * Gets a list of the X.509v3 certificates contained in the KeyInfoX509Data object.
         */
        get: function () {
            return this.X509CertificateList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyInfoX509Data.prototype, "CRL", {
        /**
         * Gets or sets the Certificate Revocation List (CRL) contained within the KeyInfoX509Data object.
         */
        get: function () {
            return this.x509crl;
        },
        set: function (value) {
            this.x509crl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyInfoX509Data.prototype, "IssuerSerials", {
        /**
         * Gets a list of X509IssuerSerial structures that represent an issuer name and serial number pair.
         */
        get: function () {
            return this.IssuerSerialList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyInfoX509Data.prototype, "SubjectKeyIds", {
        /**
         * Gets a list of the subject key identifiers (SKIs) contained in the KeyInfoX509Data object.
         */
        get: function () {
            return this.SubjectKeyIdList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeyInfoX509Data.prototype, "SubjectNames", {
        /**
         * Gets a list of the subject names of the entities contained in the KeyInfoX509Data object.
         */
        get: function () {
            return this.SubjectNameList;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds the specified X.509v3 certificate to the KeyInfoX509Data.
     * @param  {X509Certificate} certificate
     * @returns void
     */
    KeyInfoX509Data.prototype.AddCertificate = function (certificate) {
        if (certificate == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "certificate");
        if (this.X509CertificateList == null)
            this.X509CertificateList = [];
        this.X509CertificateList.push(certificate);
    };
    /**
     * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
     * @param  {string} issuerName
     * @param  {string} serialNumber
     * @returns void
     */
    KeyInfoX509Data.prototype.AddIssuerSerial = function (issuerName, serialNumber) {
        if (issuerName == null)
            throw new xmljs_1.XmlError(xmljs_1.XE.PARAM_REQUIRED, "issuerName");
        if (this.IssuerSerialList == null)
            this.IssuerSerialList = [];
        var xis = { issuerName: issuerName, serialNumber: serialNumber };
        this.IssuerSerialList.push(xis);
    };
    KeyInfoX509Data.prototype.AddSubjectKeyId = function (subjectKeyId) {
        if (this.SubjectKeyIdList)
            this.SubjectKeyIdList = [];
        if (typeof subjectKeyId === "string") {
            if (subjectKeyId != null) {
                var id = void 0;
                id = xmljs_2.Convert.FromBase64(subjectKeyId);
                this.SubjectKeyIdList.push(id);
            }
        }
        else {
            this.SubjectKeyIdList.push(subjectKeyId);
        }
    };
    /**
     * Adds the subject name of the entity that was issued an X.509v3 certificate to the KeyInfoX509Data object.
     * @param  {string} subjectName
     * @returns void
     */
    KeyInfoX509Data.prototype.AddSubjectName = function (subjectName) {
        if (this.SubjectNameList == null)
            this.SubjectNameList = [];
        this.SubjectNameList.push(subjectName);
    };
    /**
     * Returns an XML representation of the KeyInfoX509Data object.
     * @returns Element
     */
    KeyInfoX509Data.prototype.GetXml = function () {
        var doc = this.CreateDocument();
        var xel = this.CreateElement(doc);
        var prefix = this.GetPrefix();
        // <X509IssuerSerial>
        if ((this.IssuerSerialList != null) && (this.IssuerSerialList.length > 0)) {
            for (var _i = 0, _a = this.IssuerSerialList; _i < _a.length; _i++) {
                var iser = _a[_i];
                var isl = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509IssuerSerial);
                var xin = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509IssuerName);
                xin.textContent = iser.issuerName;
                isl.appendChild(xin);
                var xsn = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509SerialNumber);
                xsn.textContent = iser.serialNumber;
                isl.appendChild(xsn);
                xel.appendChild(isl);
            }
        }
        // <X509SKI>
        if ((this.SubjectKeyIdList != null) && (this.SubjectKeyIdList.length > 0)) {
            for (var _b = 0, _c = this.SubjectKeyIdList; _b < _c.length; _b++) {
                var skid = _c[_b];
                var ski = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509SKI);
                ski.textContent = xmljs_2.Convert.ToBase64(skid);
                xel.appendChild(ski);
            }
        }
        // <X509SubjectName>
        if ((this.SubjectNameList != null) && (this.SubjectNameList.length > 0)) {
            for (var _d = 0, _e = this.SubjectNameList; _d < _e.length; _d++) {
                var subject = _e[_d];
                var sn = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509SubjectName);
                sn.textContent = subject;
                xel.appendChild(sn);
            }
        }
        // <X509Certificate>
        if ((this.X509CertificateList != null) && (this.X509CertificateList.length > 0)) {
            for (var _f = 0, _g = this.X509CertificateList; _f < _g.length; _f++) {
                var x509 = _g[_f];
                var cert = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509Certificate);
                cert.textContent = xmljs_2.Convert.ToBase64(x509.GetRawCertData());
                xel.appendChild(cert);
            }
        }
        // only one <X509CRL> 
        if (this.x509crl != null) {
            var crl = doc.createElementNS(xml_1.XmlSignature.NamespaceURI, prefix + xml_1.XmlSignature.ElementNames.X509CRL);
            crl.textContent = xmljs_2.Convert.ToBase64(this.x509crl);
            xel.appendChild(crl);
        }
        return xel;
    };
    /**
     * Parses the input XmlElement object and configures the internal state of the KeyInfoX509Data object to match.
     * @param  {Element} element
     * @returns void
     */
    KeyInfoX509Data.prototype.LoadXml = function (element) {
        _super.prototype.LoadXml.call(this, element);
        if (this.IssuerSerialList)
            this.IssuerSerialList = [];
        if (this.SubjectKeyIdList)
            this.SubjectKeyIdList = [];
        if (this.SubjectNameList)
            this.SubjectNameList = [];
        if (this.X509CertificateList)
            this.X509CertificateList = [];
        this.x509crl = null;
        // <X509IssuerSerial>
        var xnl = this.GetChildren(xml_1.XmlSignature.ElementNames.X509IssuerSerial);
        if (xnl) {
            for (var _i = 0, xnl_1 = xnl; _i < xnl_1.length; _i++) {
                var xel = xnl_1[_i];
                var issuer = xml_object_1.XmlSignatureObject.GetChild(xel, xml_1.XmlSignature.ElementNames.X509IssuerName, xml_1.XmlSignature.NamespaceURI, true);
                var serial = xml_object_1.XmlSignatureObject.GetChild(xel, xml_1.XmlSignature.ElementNames.X509SerialNumber, xml_1.XmlSignature.NamespaceURI, true);
                if (issuer && issuer.textContent && serial && serial.textContent)
                    this.AddIssuerSerial(issuer.textContent, serial.textContent);
            }
        }
        // <X509SKI>
        xnl = this.GetChildren(xml_1.XmlSignature.ElementNames.X509SKI);
        if (xnl) {
            for (var _a = 0, xnl_2 = xnl; _a < xnl_2.length; _a++) {
                var xel = xnl_2[_a];
                if (xel.textContent) {
                    var skid = xmljs_2.Convert.FromBase64(xel.textContent);
                    this.AddSubjectKeyId(skid);
                }
            }
        }
        // <X509SubjectName>
        xnl = this.GetChildren(xml_1.XmlSignature.ElementNames.X509SubjectName);
        if (xnl != null) {
            for (var _b = 0, xnl_3 = xnl; _b < xnl_3.length; _b++) {
                var xel = xnl_3[_b];
                if (xel.textContent)
                    this.AddSubjectName(xel.textContent);
            }
        }
        // <X509Certificate>
        xnl = this.GetChildren(xml_1.XmlSignature.ElementNames.X509Certificate);
        if (xnl) {
            for (var _c = 0, xnl_4 = xnl; _c < xnl_4.length; _c++) {
                var xel = xnl_4[_c];
                if (xel.textContent) {
                    var cert = xmljs_2.Convert.FromBase64(xel.textContent);
                    this.AddCertificate(new x509_certificate_1.X509Certificate(cert));
                }
            }
        }
        // only one <X509CRL> 
        var x509el = this.GetChild(xml_1.XmlSignature.ElementNames.X509CRL, false);
        if (x509el && x509el.textContent) {
            this.x509crl = xmljs_2.Convert.FromBase64(x509el.textContent);
        }
    };
    return KeyInfoX509Data;
}(xml_object_1.XmlSignatureObject));
exports.KeyInfoX509Data = KeyInfoX509Data;

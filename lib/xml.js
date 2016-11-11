"use strict";
var xmljs_1 = require("xmljs");
exports.XmlSignature = {
    DEFAULT_CANON_METHOD: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
    DefaultPrefix: "ds",
    ElementNames: {
        CanonicalizationMethod: "CanonicalizationMethod",
        DigestMethod: "DigestMethod",
        DigestValue: "DigestValue",
        DSAKeyValue: "DSAKeyValue",
        EncryptedKey: "EncryptedKey",
        HMACOutputLength: "HMACOutputLength",
        RSAPSSParams: "RSAPSSParams",
        MaskGenerationFunction: "MaskGenerationFunction",
        SaltLength: "SaltLength",
        KeyInfo: "KeyInfo",
        KeyName: "KeyName",
        KeyValue: "KeyValue",
        Modulus: "Modulus",
        Exponent: "Exponent",
        Manifest: "Manifest",
        Object: "Object",
        Reference: "Reference",
        RetrievalMethod: "RetrievalMethod",
        RSAKeyValue: "RSAKeyValue",
        ECKeyValue: "ECKeyValue",
        NamedCurve: "NamedCurve",
        PublicKey: "PublicKey",
        Signature: "Signature",
        SignatureMethod: "SignatureMethod",
        SignatureValue: "SignatureValue",
        SignedInfo: "SignedInfo",
        Transform: "Transform",
        Transforms: "Transforms",
        X509Data: "X509Data",
        X509IssuerSerial: "X509IssuerSerial",
        X509IssuerName: "X509IssuerName",
        X509SerialNumber: "X509SerialNumber",
        X509SKI: "X509SKI",
        X509SubjectName: "X509SubjectName",
        X509Certificate: "X509Certificate",
        X509CRL: "X509CRL",
        XPath: "XPath"
    },
    AttributeNames: {
        Algorithm: "Algorithm",
        Encoding: "Encoding",
        Id: "Id",
        MimeType: "MimeType",
        Type: "Type",
        URI: "URI",
    },
    AlgorithmNamespaces: {
        XmlDsigBase64Transform: "http://www.w3.org/2000/09/xmldsig#base64",
        XmlDsigC14NTransform: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
        XmlDsigC14NWithCommentsTransform: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments",
        XmlDsigEnvelopedSignatureTransform: "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
        XmlDsigXPathTransform: "http://www.w3.org/TR/1999/REC-xpath-19991116",
        XmlDsigXsltTransform: "http://www.w3.org/TR/1999/REC-xslt-19991116",
        XmlDsigExcC14NTransform: "http://www.w3.org/2001/10/xml-exc-c14n#",
        XmlDsigExcC14NWithCommentsTransform: "http://www.w3.org/2001/10/xml-exc-c14n#WithComments",
        XmlDecryptionTransform: "http://www.w3.org/2002/07/decrypt#XML",
        XmlLicenseTransform: "urn:mpeg:mpeg21:2003:01-REL-R-NS:licenseTransform"
    },
    Uri: {
        Manifest: "http://www.w3.org/2000/09/xmldsig#Manifest"
    },
    NamespaceURI: "http://www.w3.org/2000/09/xmldsig#",
    NamespaceURIMore: "http://www.w3.org/2007/05/xmldsig-more#",
    NamespaceURIPss: "http://www.example.org/xmldsig-pss/#",
    Prefix: "ds",
    GetChildElement: function GetChildElement(xel, element, ns) {
        for (var i = 0; i < xel.childNodes.length; i++) {
            var n = xel.childNodes[i];
            if (n.nodeType === xmljs_1.XmlNodeType.Element && n.localName === element && n.namespaceURI === ns)
                return n;
        }
        return null;
    },
    GetAttributeFromElement: function GetAttributeFromElement(xel, attribute, element) {
        var el = this.GetChildElement(xel, element, exports.XmlSignature.NamespaceURI);
        return el != null ? el.getAttribute(attribute) : null;
    },
    GetChildElements: function GetChildElements(xel, element) {
        var al = [];
        for (var i = 0; i < xel.childNodes.length; i++) {
            var n = xel.childNodes[i];
            if (n.nodeType === xmljs_1.XmlNodeType.Element && n.localName === element && n.namespaceURI === exports.XmlSignature.NamespaceURI)
                al.push(n);
        }
        return al;
    }
};

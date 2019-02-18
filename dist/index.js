'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pkijs = require('pkijs');
var XmlCore = require('xml-core');
var tslib_1 = require('tslib');
var Asn1Js = require('asn1js');

var engineCrypto = null;
var Application = /** @class */ (function () {
    function Application() {
    }
    /**
     * Sets crypto engine for the current Application
     * @param  {string} name
     * @param  {Crypto} crypto
     * @returns void
     */
    Application.setEngine = function (name, crypto) {
        engineCrypto = {
            getRandomValues: crypto.getRandomValues.bind(crypto),
            subtle: crypto.subtle,
            name: name,
        };
        pkijs.setEngine(name, new pkijs.CryptoEngine({ name: name, crypto: crypto, subtle: crypto.subtle }), new pkijs.CryptoEngine({ name: name, crypto: crypto, subtle: crypto.subtle }));
    };
    Object.defineProperty(Application, "crypto", {
        /**
         * Gets the crypto module from the Application
         */
        get: function () {
            if (!engineCrypto) {
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_NO_MODULE);
            }
            return engineCrypto;
        },
        enumerable: true,
        configurable: true
    });
    Application.isNodePlugin = function () {
        return (typeof self === "undefined" && typeof window === "undefined");
    };
    return Application;
}());
// set default w3 WebCrypto
function init() {
    if (!Application.isNodePlugin()) {
        Application.setEngine("W3 WebCrypto module", self.crypto);
    }
}
init();

(function (XmlCanonicalizerState) {
    XmlCanonicalizerState[XmlCanonicalizerState["BeforeDocElement"] = 0] = "BeforeDocElement";
    XmlCanonicalizerState[XmlCanonicalizerState["InsideDocElement"] = 1] = "InsideDocElement";
    XmlCanonicalizerState[XmlCanonicalizerState["AfterDocElement"] = 2] = "AfterDocElement";
})(exports.XmlCanonicalizerState || (exports.XmlCanonicalizerState = {}));
var XmlCanonicalizer = /** @class */ (function () {
    function XmlCanonicalizer(withComments, excC14N, propagatedNamespaces) {
        if (propagatedNamespaces === void 0) { propagatedNamespaces = new XmlCore.NamespaceManager(); }
        this.propagatedNamespaces = new XmlCore.NamespaceManager();
        this.result = [];
        this.visibleNamespaces = new XmlCore.NamespaceManager();
        this.inclusiveNamespacesPrefixList = [];
        this.state = exports.XmlCanonicalizerState.BeforeDocElement;
        this.withComments = withComments;
        this.exclusive = excC14N;
        this.propagatedNamespaces = propagatedNamespaces;
    }
    Object.defineProperty(XmlCanonicalizer.prototype, "InclusiveNamespacesPrefixList", {
        // See xml-enc-c14n specification
        get: function () {
            return this.inclusiveNamespacesPrefixList.join(" ");
        },
        set: function (value) {
            this.inclusiveNamespacesPrefixList = value.split(" ");
        },
        enumerable: true,
        configurable: true
    });
    XmlCanonicalizer.prototype.Canonicalize = function (node) {
        if (!node) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Parameter 1 is not Node");
        }
        var node2;
        if (node.nodeType === XmlCore.XmlNodeType.Document) {
            this.document = node;
            node2 = this.document.documentElement;
        }
        else {
            this.document = node.ownerDocument;
            node2 = node;
        }
        // get nss from document
        // this.nsManager = new XmlNamespaceManager(this.document);
        this.WriteNode(node2);
        var res = this.result.join("");
        return res;
    };
    XmlCanonicalizer.prototype.WriteNode = function (node) {
        switch (node.nodeType) {
            case XmlCore.XmlNodeType.Document:
            case XmlCore.XmlNodeType.DocumentFragment:
                this.WriteDocumentNode(node);
                break;
            case XmlCore.XmlNodeType.Element:
                this.WriteElementNode(node);
                break;
            case XmlCore.XmlNodeType.CDATA:
            case XmlCore.XmlNodeType.SignificantWhitespace:
            case XmlCore.XmlNodeType.Text:
                // CDATA sections are processed as text nodes
                this.WriteTextNode(node);
                break;
            case XmlCore.XmlNodeType.Whitespace:
                if (this.state === exports.XmlCanonicalizerState.InsideDocElement) {
                    this.WriteTextNode(node);
                }
                break;
            case XmlCore.XmlNodeType.Comment:
                this.WriteCommentNode(node);
                break;
            case XmlCore.XmlNodeType.ProcessingInstruction:
                this.WriteProcessingInstructionNode(node);
                break;
            case XmlCore.XmlNodeType.EntityReference:
                // tslint:disable-next-line:prefer-for-of
                for (var i = 0; i < node.childNodes.length; i++) {
                    this.WriteNode(node.childNodes[i]);
                }
                break;
            case XmlCore.XmlNodeType.Attribute:
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case XmlCore.XmlNodeType.EndElement:
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case XmlCore.XmlNodeType.EndEntity:
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case XmlCore.XmlNodeType.DocumentType:
            case XmlCore.XmlNodeType.Entity:
            case XmlCore.XmlNodeType.Notation:
            case XmlCore.XmlNodeType.XmlDeclaration:
                // just do nothing
                break;
        }
    };
    XmlCanonicalizer.prototype.WriteDocumentNode = function (node) {
        this.state = exports.XmlCanonicalizerState.BeforeDocElement;
        for (var child = node.firstChild; child != null; child = child.nextSibling) {
            this.WriteNode(child);
        }
    };
    XmlCanonicalizer.prototype.WriteCommentNode = function (node) {
        // console.log(`WriteCommentNode: ${node.nodeName}`);
        // Console.WriteLine ("Debug: comment node");
        if (this.withComments) {
            if (this.state === exports.XmlCanonicalizerState.AfterDocElement) {
                this.result.push(String.fromCharCode(10) + "<!--");
            }
            else {
                this.result.push("<!--");
            }
            this.result.push(this.NormalizeString(node.nodeValue, XmlCore.XmlNodeType.Comment));
            if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
                this.result.push("-->" + String.fromCharCode(10));
            }
            else {
                this.result.push("-->");
            }
        }
    };
    // Text Nodes
    // the string value, except all ampersands are replaced
    // by &amp;, all open angle brackets (<) are replaced by &lt;, all closing
    // angle brackets (>) are replaced by &gt;, and all #xD characters are
    // replaced by &#xD;.
    XmlCanonicalizer.prototype.WriteTextNode = function (node) {
        // console.log(`WriteTextNode: ${node.nodeName}`);
        this.result.push(this.NormalizeString(node.nodeValue, node.nodeType));
    };
    // Processing Instruction (PI) Nodes-
    // The opening PI symbol (<?), the PI target name of the node,
    // a leading space and the string value if it is not empty, and
    // the closing PI symbol (?>). If the string value is empty,
    // then the leading space is not added. Also, a trailing #xA is
    // rendered after the closing PI symbol for PI children of the
    // root node with a lesser document order than the document
    // element, and a leading #xA is rendered before the opening PI
    // symbol of PI children of the root node with a greater document
    // order than the document element.
    XmlCanonicalizer.prototype.WriteProcessingInstructionNode = function (node) {
        // console.log(`WriteProcessingInstructionNode: ${node.nodeName}`);
        if (this.state === exports.XmlCanonicalizerState.AfterDocElement) {
            this.result.push("\u000A<?");
        }
        else {
            this.result.push("<?");
        }
        this.result.push(node.nodeName);
        if (node.nodeValue) {
            this.result.push(" ");
            this.result.push(this.NormalizeString(node.nodeValue, XmlCore.XmlNodeType.ProcessingInstruction));
        }
        if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
            this.result.push("?>\u000A");
        }
        else {
            this.result.push("?>");
        }
    };
    XmlCanonicalizer.prototype.WriteElementNode = function (node) {
        // console.log(`WriteElementNode: ${node.nodeName}`);
        if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
            this.state = exports.XmlCanonicalizerState.InsideDocElement;
        }
        // open tag
        this.result.push("<");
        this.result.push(node.nodeName);
        // namespaces
        var visibleNamespacesCount = this.WriteNamespacesAxis(node);
        // attributes
        this.WriteAttributesAxis(node);
        this.result.push(">");
        for (var n = node.firstChild; n != null; n = n.nextSibling) {
            // if (!(n.nodeType === XmlCore.XmlNodeType.Text && node.childNodes.length > 1))
            this.WriteNode(n);
        }
        // close tag
        this.result.push("</");
        this.result.push(node.nodeName);
        this.result.push(">");
        if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
            this.state = exports.XmlCanonicalizerState.AfterDocElement;
        }
        // remove added namespaces
        while (visibleNamespacesCount--) {
            this.visibleNamespaces.Pop();
        }
    };
    XmlCanonicalizer.prototype.WriteNamespacesAxis = function (node) {
        var _this = this;
        var list = [];
        var visibleNamespacesCount = 0;
        for (var i = 0; i < node.attributes.length; i++) {
            var attribute = node.attributes[i];
            if (!IsNamespaceNode(attribute)) {
                // render namespace for attribute, if needed
                if (attribute.prefix && !this.IsNamespaceRendered(attribute.prefix, attribute.namespaceURI)) {
                    var ns = { prefix: attribute.prefix, namespace: attribute.namespaceURI };
                    list.push(ns);
                    this.visibleNamespaces.Add(ns);
                    visibleNamespacesCount++;
                }
                continue;
            }
            if (attribute.localName === "xmlns" && !attribute.prefix && !attribute.nodeValue) {
                var ns = { prefix: attribute.prefix, namespace: attribute.nodeValue };
                list.push(ns);
                this.visibleNamespaces.Add(ns);
                visibleNamespacesCount++;
            }
            // if (attribute.localName === "xmlns")
            //     continue;
            // get namespace prefix
            var prefix = null;
            var matches = void 0;
            if (matches = /xmlns:([\w\.]+)/.exec(attribute.nodeName)) {
                prefix = matches[1];
            }
            var printable = true;
            if (this.exclusive && !this.IsNamespaceInclusive(node, prefix)) {
                var used = IsNamespaceUsed(node, prefix);
                if (used > 1) {
                    printable = false;
                }
                else if (used === 0) {
                    continue;
                }
            }
            if (this.IsNamespaceRendered(prefix, attribute.nodeValue)) {
                continue;
            }
            if (printable) {
                var ns = { prefix: prefix, namespace: attribute.nodeValue };
                list.push(ns);
                this.visibleNamespaces.Add(ns);
                visibleNamespacesCount++;
            }
        }
        if (!this.IsNamespaceRendered(node.prefix, node.namespaceURI) && node.namespaceURI !== "http://www.w3.org/2000/xmlns/") {
            var ns = { prefix: node.prefix, namespace: node.namespaceURI };
            list.push(ns);
            this.visibleNamespaces.Add(ns);
            visibleNamespacesCount++;
        }
        // sort nss
        list.sort(XmlDsigC14NTransformNamespacesComparer);
        var prevPrefix = null;
        list.forEach(function (n) {
            if (n.prefix === prevPrefix) {
                return;
            }
            prevPrefix = n.prefix;
            _this.result.push(" xmlns");
            if (n.prefix) {
                _this.result.push(":" + n.prefix);
            }
            _this.result.push("=\"");
            _this.result.push(n.namespace); // TODO namespace can be null
            _this.result.push("\"");
        });
        return visibleNamespacesCount;
    };
    XmlCanonicalizer.prototype.WriteAttributesAxis = function (node) {
        // Console.WriteLine ("Debug: attributes");
        var _this = this;
        var list = [];
        for (var i = 0; i < node.attributes.length; i++) {
            var attribute = node.attributes[i];
            if (!IsNamespaceNode(attribute)) {
                list.push(attribute);
            }
        }
        // sort namespaces and write results
        list.sort(XmlDsigC14NTransformAttributesComparer);
        list.forEach(function (attribute) {
            if (attribute != null) {
                _this.result.push(" ");
                _this.result.push(attribute.nodeName);
                _this.result.push("=\"");
                _this.result.push(_this.NormalizeString(attribute.nodeValue, XmlCore.XmlNodeType.Attribute));
                _this.result.push("\"");
            }
        });
    };
    XmlCanonicalizer.prototype.NormalizeString = function (input, type) {
        var sb = [];
        if (input) {
            for (var i = 0; i < input.length; i++) {
                var ch = input[i];
                if (ch === "<" && (type === XmlCore.XmlNodeType.Attribute || this.IsTextNode(type))) {
                    sb.push("&lt;");
                }
                else if (ch === ">" && this.IsTextNode(type)) {
                    sb.push("&gt;");
                }
                else if (ch === "&" && (type === XmlCore.XmlNodeType.Attribute || this.IsTextNode(type))) {
                    sb.push("&amp;");
                }
                else if (ch === "\"" && type === XmlCore.XmlNodeType.Attribute) {
                    sb.push("&quot;");
                }
                else if (ch === "\u0009" && type === XmlCore.XmlNodeType.Attribute) {
                    sb.push("&#x9;");
                }
                else if (ch === "\u000A" && type === XmlCore.XmlNodeType.Attribute) {
                    sb.push("&#xA;");
                }
                else if (ch === "\u000D") {
                    sb.push("&#xD;");
                }
                else {
                    sb.push(ch);
                }
            }
        }
        return sb.join("");
    };
    XmlCanonicalizer.prototype.IsTextNode = function (type) {
        switch (type) {
            case XmlCore.XmlNodeType.Text:
            case XmlCore.XmlNodeType.CDATA:
            case XmlCore.XmlNodeType.SignificantWhitespace:
            case XmlCore.XmlNodeType.Whitespace:
                return true;
        }
        return false;
    };
    XmlCanonicalizer.prototype.IsNamespaceInclusive = function (node, prefix) {
        var prefix2 = prefix || null;
        if (node.prefix === prefix2) {
            return false;
        }
        return this.inclusiveNamespacesPrefixList.indexOf(prefix2 || "") !== -1; // && node.prefix === prefix;
    };
    XmlCanonicalizer.prototype.IsNamespaceRendered = function (prefix, uri) {
        prefix = prefix || "";
        uri = uri || "";
        if (!prefix && !uri) {
            return true;
        }
        if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace") {
            return true;
        }
        var ns = this.visibleNamespaces.GetPrefix(prefix);
        if (ns) {
            return ns.namespace === uri;
        }
        return false;
    };
    return XmlCanonicalizer;
}());
function XmlDsigC14NTransformNamespacesComparer(x, y) {
    // simple cases
    // tslint:disable-next-line:triple-equals
    if (x == y) {
        return 0;
    }
    else if (!x) {
        return -1;
    }
    else if (!y) {
        return 1;
    }
    else if (!x.prefix) {
        return -1;
    }
    else if (!y.prefix) {
        return 1;
    }
    return x.prefix.localeCompare(y.prefix);
}
function XmlDsigC14NTransformAttributesComparer(x, y) {
    if (!x.namespaceURI && y.namespaceURI) {
        return -1;
    }
    if (!y.namespaceURI && x.namespaceURI) {
        return 1;
    }
    var left = x.namespaceURI + x.localName;
    var right = y.namespaceURI + y.localName;
    if (left === right) {
        return 0;
    }
    else if (left < right) {
        return -1;
    }
    else {
        return 1;
    }
}
function IsNamespaceUsed(node, prefix, result) {
    if (result === void 0) { result = 0; }
    var prefix2 = prefix || null;
    if (node.prefix === prefix2) {
        return ++result;
    }
    // prefix of attributes
    if (node.attributes) {
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (!IsNamespaceNode(attr) && prefix && node.attributes[i].prefix === prefix) {
                return ++result;
            }
        }
    }
    // check prefix of Element
    for (var n = node.firstChild; !!n; n = n.nextSibling) {
        if (n.nodeType === XmlCore.XmlNodeType.Element) {
            var el = n;
            var res = IsNamespaceUsed(el, prefix, result);
            if (n.nodeType === XmlCore.XmlNodeType.Element && res) {
                return ++result + res;
            }
        }
    }
    return result;
}
function IsNamespaceNode(node) {
    var reg = /xmlns:/;
    if (node !== null && node.nodeType === XmlCore.XmlNodeType.Attribute && (node.nodeName === "xmlns" || reg.test(node.nodeName))) {
        return true;
    }
    return false;
}

var XmlSignature = {
    DefaultCanonMethod: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
    DefaultDigestMethod: "http://www.w3.org/2001/04/xmlenc#sha256",
    DefaultPrefix: " ",
    ElementNames: {
        CanonicalizationMethod: "CanonicalizationMethod",
        DigestMethod: "DigestMethod",
        DigestValue: "DigestValue",
        DSAKeyValue: "DSAKeyValue",
        DomainParameters: "DomainParameters",
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
        ECDSAKeyValue: "ECDSAKeyValue",
        NamedCurve: "NamedCurve",
        PublicKey: "PublicKey",
        Signature: "Signature",
        SignatureMethod: "SignatureMethod",
        SignatureValue: "SignatureValue",
        SignedInfo: "SignedInfo",
        Transform: "Transform",
        Transforms: "Transforms",
        X509Data: "X509Data",
        PGPData: "PGPData",
        SPKIData: "SPKIData",
        SPKIexp: "SPKIexp",
        MgmtData: "MgmtData",
        X509IssuerSerial: "X509IssuerSerial",
        X509IssuerName: "X509IssuerName",
        X509SerialNumber: "X509SerialNumber",
        X509SKI: "X509SKI",
        X509SubjectName: "X509SubjectName",
        X509Certificate: "X509Certificate",
        X509CRL: "X509CRL",
        XPath: "XPath",
        X: "X",
        Y: "Y",
    },
    AttributeNames: {
        Algorithm: "Algorithm",
        Encoding: "Encoding",
        Id: "Id",
        MimeType: "MimeType",
        Type: "Type",
        URI: "URI",
        Filter: "Filter"
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
        XmlLicenseTransform: "urn:mpeg:mpeg21:2003:01-REL-R-NS:licenseTransform",
        XmlDsigFilterTransform: "http://www.w3.org/2002/06/xmldsig-filter2",
    },
    Uri: {
        Manifest: "http://www.w3.org/2000/09/xmldsig#Manifest",
    },
    NamespaceURI: "http://www.w3.org/2000/09/xmldsig#",
    NamespaceURIMore: "http://www.w3.org/2007/05/xmldsig-more#",
    NamespaceURIPss: "http://www.example.org/xmldsig-pss/#",
};

var XmlSignatureObject = /** @class */ (function (_super) {
    tslib_1.__extends(XmlSignatureObject, _super);
    function XmlSignatureObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    XmlSignatureObject = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: "xmldsig",
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
        })
    ], XmlSignatureObject);
    return XmlSignatureObject;
}(XmlCore.XmlObject));
var XmlSignatureCollection = /** @class */ (function (_super) {
    tslib_1.__extends(XmlSignatureCollection, _super);
    function XmlSignatureCollection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    XmlSignatureCollection = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: "xmldsig_collection",
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
        })
    ], XmlSignatureCollection);
    return XmlSignatureCollection;
}(XmlCore.XmlCollection));

var KeyInfoClause = /** @class */ (function (_super) {
    tslib_1.__extends(KeyInfoClause, _super);
    function KeyInfoClause() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return KeyInfoClause;
}(XmlSignatureObject));

var XmlAlgorithm = /** @class */ (function () {
    function XmlAlgorithm() {
    }
    XmlAlgorithm.prototype.getAlgorithmName = function () {
        return this.namespaceURI;
    };
    return XmlAlgorithm;
}());
var HashAlgorithm = /** @class */ (function (_super) {
    tslib_1.__extends(HashAlgorithm, _super);
    function HashAlgorithm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HashAlgorithm.prototype.Digest = function (xml) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            // console.log("HashedInfo:", xml);
            var buf;
            if (typeof xml === "string") {
                // C14N transforms
                // console.log("Hash:\n%s\n", xml);
                buf = XmlCore.Convert.FromString(xml, "utf8");
            }
            else if (ArrayBuffer.isView(xml) || xml instanceof ArrayBuffer) {
                // base64 transform
                buf = xml;
            }
            else {
                // enveloped signature transform
                var txt = new XMLSerializer().serializeToString(xml);
                buf = XmlCore.Convert.FromString(txt, "utf8");
            }
            return Application.crypto.subtle.digest(_this.algorithm, buf);
        })
            .then(function (hash) {
            return new Uint8Array(hash);
        });
    };
    return HashAlgorithm;
}(XmlAlgorithm));
var SignatureAlgorithm = /** @class */ (function (_super) {
    tslib_1.__extends(SignatureAlgorithm, _super);
    function SignatureAlgorithm() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Sign the given string using the given key
     */
    SignatureAlgorithm.prototype.Sign = function (signedInfo, signingKey, algorithm) {
        // console.log("Sign:\n%s\n", signedInfo);
        var info = XmlCore.Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.sign(algorithm, signingKey, info);
    };
    /**
     * Verify the given signature of the given string using key
     */
    SignatureAlgorithm.prototype.Verify = function (signedInfo, key, signatureValue, algorithm) {
        // console.log("Verify:\n%s\n", signedInfo);
        var info = XmlCore.Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.verify((algorithm || this.algorithm), key, signatureValue, info);
    };
    return SignatureAlgorithm;
}(XmlAlgorithm));

var SHA1 = "SHA-1";
var SHA256 = "SHA-256";
var SHA384 = "SHA-384";
var SHA512 = "SHA-512";
var SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
var SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
var SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#sha384";
var SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";
var Sha1 = /** @class */ (function (_super) {
    tslib_1.__extends(Sha1, _super);
    function Sha1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = { name: SHA1 };
        _this.namespaceURI = SHA1_NAMESPACE;
        return _this;
    }
    return Sha1;
}(HashAlgorithm));
var Sha256 = /** @class */ (function (_super) {
    tslib_1.__extends(Sha256, _super);
    function Sha256() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = { name: SHA256 };
        _this.namespaceURI = SHA256_NAMESPACE;
        return _this;
    }
    return Sha256;
}(HashAlgorithm));
var Sha384 = /** @class */ (function (_super) {
    tslib_1.__extends(Sha384, _super);
    function Sha384() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = { name: SHA384 };
        _this.namespaceURI = SHA384_NAMESPACE;
        return _this;
    }
    return Sha384;
}(HashAlgorithm));
var Sha512 = /** @class */ (function (_super) {
    tslib_1.__extends(Sha512, _super);
    function Sha512() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = { name: SHA512 };
        _this.namespaceURI = SHA512_NAMESPACE;
        return _this;
    }
    return Sha512;
}(HashAlgorithm));

var ECDSA = "ECDSA";
var ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
var ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
var ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
var ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
var EcdsaSha1 = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaSha1, _super);
    function EcdsaSha1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA1,
            },
        };
        _this.namespaceURI = ECDSA_SHA1_NAMESPACE;
        return _this;
    }
    return EcdsaSha1;
}(SignatureAlgorithm));
var EcdsaSha256 = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaSha256, _super);
    function EcdsaSha256() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA256,
            },
        };
        _this.namespaceURI = ECDSA_SHA256_NAMESPACE;
        return _this;
    }
    return EcdsaSha256;
}(SignatureAlgorithm));
var EcdsaSha384 = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaSha384, _super);
    function EcdsaSha384() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA384,
            },
        };
        _this.namespaceURI = ECDSA_SHA384_NAMESPACE;
        return _this;
    }
    return EcdsaSha384;
}(SignatureAlgorithm));
var EcdsaSha512 = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaSha512, _super);
    function EcdsaSha512() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA512,
            },
        };
        _this.namespaceURI = ECDSA_SHA512_NAMESPACE;
        return _this;
    }
    return EcdsaSha512;
}(SignatureAlgorithm));

var HMAC = "HMAC";
var HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
var HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
var HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
var HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
var HmacSha1 = /** @class */ (function (_super) {
    tslib_1.__extends(HmacSha1, _super);
    function HmacSha1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA1,
            },
        };
        _this.namespaceURI = HMAC_SHA1_NAMESPACE;
        return _this;
    }
    return HmacSha1;
}(SignatureAlgorithm));
var HmacSha256 = /** @class */ (function (_super) {
    tslib_1.__extends(HmacSha256, _super);
    function HmacSha256() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA256,
            },
        };
        _this.namespaceURI = HMAC_SHA256_NAMESPACE;
        return _this;
    }
    return HmacSha256;
}(SignatureAlgorithm));
var HmacSha384 = /** @class */ (function (_super) {
    tslib_1.__extends(HmacSha384, _super);
    function HmacSha384() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA384,
            },
        };
        _this.namespaceURI = HMAC_SHA384_NAMESPACE;
        return _this;
    }
    return HmacSha384;
}(SignatureAlgorithm));
var HmacSha512 = /** @class */ (function (_super) {
    tslib_1.__extends(HmacSha512, _super);
    function HmacSha512() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA512,
            },
        };
        _this.namespaceURI = HMAC_SHA512_NAMESPACE;
        return _this;
    }
    return HmacSha512;
}(SignatureAlgorithm));

var RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
var RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
var RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
var RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
var RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
var RsaPkcs1Sha1 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPkcs1Sha1, _super);
    function RsaPkcs1Sha1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA1,
            },
        };
        _this.namespaceURI = RSA_PKCS1_SHA1_NAMESPACE;
        return _this;
    }
    return RsaPkcs1Sha1;
}(SignatureAlgorithm));
var RsaPkcs1Sha256 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPkcs1Sha256, _super);
    function RsaPkcs1Sha256() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA256,
            },
        };
        _this.namespaceURI = RSA_PKCS1_SHA256_NAMESPACE;
        return _this;
    }
    return RsaPkcs1Sha256;
}(SignatureAlgorithm));
var RsaPkcs1Sha384 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPkcs1Sha384, _super);
    function RsaPkcs1Sha384() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA384,
            },
        };
        _this.namespaceURI = RSA_PKCS1_SHA384_NAMESPACE;
        return _this;
    }
    return RsaPkcs1Sha384;
}(SignatureAlgorithm));
var RsaPkcs1Sha512 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPkcs1Sha512, _super);
    function RsaPkcs1Sha512() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA512,
            },
        };
        _this.namespaceURI = RSA_PKCS1_SHA512_NAMESPACE;
        return _this;
    }
    return RsaPkcs1Sha512;
}(SignatureAlgorithm));

var RSA_PSS = "RSA-PSS";
var RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
var RsaPssBase = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPssBase, _super);
    function RsaPssBase(saltLength) {
        var _this = _super.call(this) || this;
        _this.algorithm = {
            name: RSA_PSS,
            hash: {
                name: SHA1,
            },
        };
        _this.namespaceURI = RSA_PSS_WITH_PARAMS_NAMESPACE;
        if (saltLength) {
            _this.algorithm.saltLength = saltLength;
        }
        return _this;
    }
    return RsaPssBase;
}(SignatureAlgorithm));
var RsaPssSha1 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPssSha1, _super);
    function RsaPssSha1(saltLength) {
        var _this = _super.call(this, saltLength) || this;
        _this.algorithm.hash.name = SHA1;
        return _this;
    }
    return RsaPssSha1;
}(RsaPssBase));
var RsaPssSha256 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPssSha256, _super);
    function RsaPssSha256(saltLength) {
        var _this = _super.call(this, saltLength) || this;
        _this.algorithm.hash.name = SHA256;
        return _this;
    }
    return RsaPssSha256;
}(RsaPssBase));
var RsaPssSha384 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPssSha384, _super);
    function RsaPssSha384(saltLength) {
        var _this = _super.call(this, saltLength) || this;
        _this.algorithm.hash.name = SHA384;
        return _this;
    }
    return RsaPssSha384;
}(RsaPssBase));
var RsaPssSha512 = /** @class */ (function (_super) {
    tslib_1.__extends(RsaPssSha512, _super);
    function RsaPssSha512(saltLength) {
        var _this = _super.call(this, saltLength) || this;
        _this.algorithm.hash.name = SHA512;
        return _this;
    }
    return RsaPssSha512;
}(RsaPssBase));

/**
 *
 * <element name="CanonicalizationMethod" type="ds:CanonicalizationMethodType"/>
 * <complexType name="CanonicalizationMethodType" mixed="true">
 *   <sequence>
 *     <any namespace="##any" minOccurs="0" maxOccurs="unbounded"/>
 *     <!--  (0,unbounded) elements from (1,1) namespace  -->
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 *
 */
/**
 *
 *
 * @export
 * @class CanonicalizationMethod
 * @extends {XmlSignatureObject}
 */
var CanonicalizationMethod = /** @class */ (function (_super) {
    tslib_1.__extends(CanonicalizationMethod, _super);
    function CanonicalizationMethod() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Algorithm,
            required: true,
            defaultValue: XmlSignature.DefaultCanonMethod,
        })
    ], CanonicalizationMethod.prototype, "Algorithm", void 0);
    CanonicalizationMethod = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.CanonicalizationMethod,
        })
    ], CanonicalizationMethod);
    return CanonicalizationMethod;
}(XmlSignatureObject));

// XmlElement part of the signature
// Note: Looks like KeyInfoNode (but the later is XmlElement inside KeyInfo)
// required for "enveloping signatures"
/**
 *
 * <element name='Object' >
 *   <complexType content='mixed'>
 *     <element ref='ds:Manifest' minOccurs='1' maxOccurs='unbounded'/>
 *     <any namespace='##any' minOccurs='1' maxOccurs='unbounded'/>
 *     <attribute name='Id' type='ID' use='optional'/>
 *     <attribute name='MimeType' type='string' use='optional'/> <!-- add a grep facet -->
 *     <attribute name='Encoding' type='uriReference' use='optional'/>
 *   </complexType>
 * </element>
 *
 */
/**
 * Represents the object element of an XML signature that holds data to be signed.
 */
var DataObject = /** @class */ (function (_super) {
    tslib_1.__extends(DataObject, _super);
    function DataObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Id,
            defaultValue: "",
        })
    ], DataObject.prototype, "Id", void 0);
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.MimeType,
            defaultValue: "",
        })
    ], DataObject.prototype, "MimeType", void 0);
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Encoding,
            defaultValue: "",
        })
    ], DataObject.prototype, "Encoding", void 0);
    DataObject = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.Object,
        })
    ], DataObject);
    return DataObject;
}(XmlSignatureObject));
var DataObjects = /** @class */ (function (_super) {
    tslib_1.__extends(DataObjects, _super);
    function DataObjects() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataObjects = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: "xmldsig_objects",
            parser: DataObject,
        })
    ], DataObjects);
    return DataObjects;
}(XmlSignatureCollection));

/**
 *
 * <element name="DigestMethod" type="ds:DigestMethodType"/>
 * <complexType name="DigestMethodType" mixed="true">
 *   <sequence>
 *     <any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 *
 */
var DigestMethod = /** @class */ (function (_super) {
    tslib_1.__extends(DigestMethod, _super);
    function DigestMethod() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Algorithm,
            required: true,
            defaultValue: XmlSignature.DefaultDigestMethod,
        })
    ], DigestMethod.prototype, "Algorithm", void 0);
    DigestMethod = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.DigestMethod,
        })
    ], DigestMethod);
    return DigestMethod;
}(XmlSignatureObject));

/**
 *
 * <element name="KeyInfo" type="ds:KeyInfoType"/>
 * <complexType name="KeyInfoType" mixed="true">
 *   <choice maxOccurs="unbounded">
 *     <element ref="ds:KeyName"/>
 *     <element ref="ds:KeyValue"/>
 *     <element ref="ds:RetrievalMethod"/>
 *     <element ref="ds:X509Data"/>
 *     <element ref="ds:PGPData"/>
 *     <element ref="ds:SPKIData"/>
 *     <element ref="ds:MgmtData"/>
 *     <any processContents="lax" namespace="##other"/>
 *     <!--  (1,1) elements from (0,unbounded) namespaces  -->
 *   </choice>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 *
 */
/**
 * Represents an XML digital signature or XML encryption <KeyInfo> element.
 */
var KeyInfo = /** @class */ (function (_super) {
    tslib_1.__extends(KeyInfo, _super);
    function KeyInfo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    KeyInfo.prototype.OnLoadXml = function (element) {
        var _loop_1 = function (i) {
            var node = element.childNodes.item(i);
            if (node.nodeType !== XmlCore.XmlNodeType.Element) {
                return "continue";
            }
            var KeyInfoClass = null;
            switch (node.localName) {
                case XmlSignature.ElementNames.KeyValue:
                    KeyInfoClass = KeyValue;
                    break;
                case XmlSignature.ElementNames.X509Data:
                    KeyInfoClass = KeyInfoX509Data;
                    break;
                case XmlSignature.ElementNames.SPKIData:
                    KeyInfoClass = SPKIData;
                    break;
                case XmlSignature.ElementNames.KeyName:
                case XmlSignature.ElementNames.RetrievalMethod:
                case XmlSignature.ElementNames.PGPData:
                case XmlSignature.ElementNames.MgmtData:
            }
            if (KeyInfoClass) {
                var item = new KeyInfoClass();
                item.LoadXml(node);
                if (item instanceof KeyValue) {
                    // Read KeyValue
                    var keyValue_1 = null;
                    [RsaKeyValue, EcdsaKeyValue].some(function (KeyClass) {
                        try {
                            var k = new KeyClass();
                            for (var j = 0; j < node.childNodes.length; j++) {
                                var nodeKey = node.childNodes.item(j);
                                if (nodeKey.nodeType !== XmlCore.XmlNodeType.Element) {
                                    continue;
                                }
                                k.LoadXml(nodeKey);
                                keyValue_1 = k;
                                return true;
                            }
                        }
                        catch (e) { /* none */ }
                        return false;
                    });
                    if (keyValue_1) {
                        item.Value = keyValue_1;
                    }
                    else {
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Unsupported KeyValue in use");
                    }
                    item.GetXml();
                }
                this_1.Add(item);
            }
        };
        var this_1 = this;
        for (var i = 0; i < element.childNodes.length; i++) {
            _loop_1(i);
        }
    };
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Id,
            defaultValue: "",
        })
    ], KeyInfo.prototype, "Id", void 0);
    KeyInfo = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.KeyInfo,
        })
    ], KeyInfo);
    return KeyInfo;
}(XmlSignatureCollection));

/**
 * The Transform element contains a single transformation
 */
var Transform = /** @class */ (function (_super) {
    tslib_1.__extends(Transform, _super);
    function Transform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.innerXml = null;
        return _this;
    }
    // Public methods
    /**
     * When overridden in a derived class, returns the output of the current Transform object.
     */
    Transform.prototype.GetOutput = function () {
        throw new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_IMPLEMENTED);
    };
    Transform.prototype.LoadInnerXml = function (node) {
        if (!node) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "node");
        }
        this.innerXml = node;
    };
    Transform.prototype.GetInnerXml = function () {
        return this.innerXml;
    };
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Algorithm,
            defaultValue: "",
        })
    ], Transform.prototype, "Algorithm", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.XPath,
            defaultValue: "",
        })
    ], Transform.prototype, "XPath", void 0);
    Transform = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.Transform,
        })
    ], Transform);
    return Transform;
}(XmlSignatureObject));

var XmlDsigBase64Transform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigBase64Transform, _super);
    function XmlDsigBase64Transform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;
        return _this;
    }
    /**
     * Returns the output of the current XmlDsigBase64Transform object
     */
    XmlDsigBase64Transform.prototype.GetOutput = function () {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return XmlCore.Convert.FromString(this.innerXml.textContent || "", "base64");
    };
    return XmlDsigBase64Transform;
}(Transform));

/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
var XmlDsigC14NTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigC14NTransform, _super);
    function XmlDsigC14NTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
        _this.xmlCanonicalizer = new XmlCanonicalizer(false, false);
        return _this;
    }
    /**
     * Returns the output of the current XmlDSigC14NTransform object.
     * @returns string
     */
    XmlDsigC14NTransform.prototype.GetOutput = function () {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    };
    return XmlDsigC14NTransform;
}(Transform));
/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
var XmlDsigC14NWithCommentsTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigC14NWithCommentsTransform, _super);
    function XmlDsigC14NWithCommentsTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments";
        _this.xmlCanonicalizer = new XmlCanonicalizer(true, false);
        return _this;
    }
    return XmlDsigC14NWithCommentsTransform;
}(XmlDsigC14NTransform));

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
var XmlDsigEnvelopedSignatureTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigEnvelopedSignatureTransform, _super);
    function XmlDsigEnvelopedSignatureTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
        return _this;
    }
    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    XmlDsigEnvelopedSignatureTransform.prototype.GetOutput = function () {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        var signature = XmlCore.Select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        if (signature) {
            signature.parentNode.removeChild(signature);
        }
        return this.innerXml;
    };
    return XmlDsigEnvelopedSignatureTransform;
}(Transform));

/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
var XmlDsigExcC14NTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigExcC14NTransform, _super);
    function XmlDsigExcC14NTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
        _this.xmlCanonicalizer = new XmlCanonicalizer(false, true);
        return _this;
    }
    Object.defineProperty(XmlDsigExcC14NTransform.prototype, "InclusiveNamespacesPrefixList", {
        /**
         * Gets or sets a string that contains namespace prefixes to canonicalize
         * using the standard canonicalization algorithm.
         */
        get: function () {
            return this.xmlCanonicalizer.InclusiveNamespacesPrefixList;
        },
        set: function (value) {
            this.xmlCanonicalizer.InclusiveNamespacesPrefixList = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the output of the current XmlDsigExcC14NTransform object
     */
    XmlDsigExcC14NTransform.prototype.GetOutput = function () {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    };
    return XmlDsigExcC14NTransform;
}(Transform));
/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
var XmlDsigExcC14NWithCommentsTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigExcC14NWithCommentsTransform, _super);
    function XmlDsigExcC14NWithCommentsTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
        _this.xmlCanonicalizer = new XmlCanonicalizer(true, true);
        return _this;
    }
    return XmlDsigExcC14NWithCommentsTransform;
}(XmlDsigExcC14NTransform));

//N.B. This does not apply any XPath filters to the original doc, it exists only to ensure that the XPath filter information is included in the signature
var XPathDisplayFilterObject = /** @class */ (function (_super) {
    tslib_1.__extends(XPathDisplayFilterObject, _super);
    function XPathDisplayFilterObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Filter,
            required: true,
        })
    ], XPathDisplayFilterObject.prototype, "Filter", void 0);
    tslib_1.__decorate([
        XmlCore.XmlContent({
            required: true
        })
    ], XPathDisplayFilterObject.prototype, "XPath", void 0);
    XPathDisplayFilterObject = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.XPath,
            prefix: "",
            namespaceURI: "http://www.w3.org/2002/06/xmldsig-filter2",
        })
    ], XPathDisplayFilterObject);
    return XPathDisplayFilterObject;
}(XmlSignatureObject));

/*
<Transform Algorithm="http://www.w3.org/2002/06/xmldsig-filter2">
    <XPath xmlns="http://www.w3.org/2002/06/xmldsig-filter2" Filter="intersect">//RenderedData</XPath>
</Transform>
*/
//N.B. This does not apply any XPath filters to the original doc, it exists only to ensure that the XPath filter information is included in the signature
var XmlDsigDisplayFilterTransform = /** @class */ (function (_super) {
    tslib_1.__extends(XmlDsigDisplayFilterTransform, _super);
    function XmlDsigDisplayFilterTransform(params) {
        var _this = _super.call(this) || this;
        _this.Algorithm = "http://www.w3.org/2002/06/xmldsig-filter2";
        if (params == null)
            throw Error("params is undefined");
        _this.XPathFilter = new XPathDisplayFilterObject();
        _this.XPathFilter.Prefix = "";
        _this.XPathFilter.XPath = params.XPath;
        _this.XPathFilter.Filter = params.Filter;
        return _this;
    }
    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    XmlDsigDisplayFilterTransform.prototype.GetOutput = function () {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.innerXml;
    };
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: "XPath",
            required: true,
            parser: XPathDisplayFilterObject,
            prefix: "",
            namespaceURI: XmlSignature.NamespaceURI
        })
    ], XmlDsigDisplayFilterTransform.prototype, "XPathFilter", void 0);
    return XmlDsigDisplayFilterTransform;
}(Transform));

/**
 * The Transforms element contains a collection of transformations
 */
var Transforms = /** @class */ (function (_super) {
    tslib_1.__extends(Transforms, _super);
    function Transforms() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Transforms.prototype.OnLoadXml = function (element) {
        _super.prototype.OnLoadXml.call(this, element);
        // Update parsed objects
        this.items = this.GetIterator().map(function (item) {
            switch (item.Algorithm) {
                case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                    return ChangeTransform(item, XmlDsigEnvelopedSignatureTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                    return ChangeTransform(item, XmlDsigC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                    return ChangeTransform(item, XmlDsigC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                    return ChangeTransform(item, XmlDsigExcC14NTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                    return ChangeTransform(item, XmlDsigExcC14NWithCommentsTransform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                    return ChangeTransform(item, XmlDsigBase64Transform);
                case XmlSignature.AlgorithmNamespaces.XmlDsigFilterTransform:
                    return ChangeTransform(item, XmlDsigDisplayFilterTransform);
                default:
                    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, item.Algorithm);
            }
        });
    };
    Transforms = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.Transforms,
            parser: Transform,
        })
    ], Transforms);
    return Transforms;
}(XmlSignatureCollection));
function ChangeTransform(t1, t2) {
    var t = new t2();
    t.element = t1.Element;
    return t;
}

/**
 *
 * <element name="Reference" type="ds:ReferenceType"/>
 * <complexType name="ReferenceType">
 *   <sequence>
 *     <element ref="ds:Transforms" minOccurs="0"/>
 *     <element ref="ds:DigestMethod"/>
 *     <element ref="ds:DigestValue"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 *   <attribute name="URI" type="anyURI" use="optional"/>
 *   <attribute name="Type" type="anyURI" use="optional"/>
 * </complexType>
 *
 */
/**
 * Represents the <reference> element of an XML signature.
 */
var Reference = /** @class */ (function (_super) {
    tslib_1.__extends(Reference, _super);
    function Reference(uri) {
        var _this = _super.call(this) || this;
        if (uri) {
            _this.Uri = uri;
        }
        return _this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            defaultValue: "",
        })
    ], Reference.prototype, "Id", void 0);
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.URI,
        })
    ], Reference.prototype, "Uri", void 0);
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Type,
            defaultValue: "",
        })
    ], Reference.prototype, "Type", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: Transforms,
        })
    ], Reference.prototype, "Transforms", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            required: true,
            parser: DigestMethod,
        })
    ], Reference.prototype, "DigestMethod", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            required: true,
            localName: XmlSignature.ElementNames.DigestValue,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            converter: XmlCore.XmlBase64Converter,
        })
    ], Reference.prototype, "DigestValue", void 0);
    Reference = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.Reference,
        })
    ], Reference);
    return Reference;
}(XmlSignatureObject));
var References = /** @class */ (function (_super) {
    tslib_1.__extends(References, _super);
    function References() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    References = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: "References",
            parser: Reference,
        })
    ], References);
    return References;
}(XmlSignatureCollection));

/**
 *
 * <element name="SignatureMethod" type="ds:SignatureMethodType"/>
 * <complexType name="SignatureMethodType" mixed="true">
 *   <sequence>
 *     <element name="HMACOutputLength" minOccurs="0" type="ds:HMACOutputLengthType"/>
 *     <any namespace="##other" minOccurs="0" maxOccurs="unbounded"/>
 *     <!--
 *     (0,unbounded) elements from (1,1) external namespace
 *     -->
 *   </sequence>
 *   <attribute name="Algorithm" type="anyURI" use="required"/>
 * </complexType>
 *
 */
var SignatureMethodOther = /** @class */ (function (_super) {
    tslib_1.__extends(SignatureMethodOther, _super);
    function SignatureMethodOther() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignatureMethodOther.prototype.OnLoadXml = function (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var node = element.childNodes.item(i);
            if (node.nodeType !== XmlCore.XmlNodeType.Element ||
                node.nodeName === XmlSignature.ElementNames.HMACOutputLength) { // Exclude HMACOutputLength
                continue;
            }
            var ParserClass = void 0;
            switch (node.localName) {
                case XmlSignature.ElementNames.RSAPSSParams:
                    ParserClass = PssAlgorithmParams;
                    break;
                default:
                    break;
            }
            if (ParserClass) {
                var xml = new ParserClass();
                xml.LoadXml(node);
                this.Add(xml);
            }
        }
    };
    SignatureMethodOther = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: "Other",
        })
    ], SignatureMethodOther);
    return SignatureMethodOther;
}(XmlSignatureCollection));
var SignatureMethod = /** @class */ (function (_super) {
    tslib_1.__extends(SignatureMethod, _super);
    function SignatureMethod() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Algorithm,
            required: true,
            defaultValue: "",
        })
    ], SignatureMethod.prototype, "Algorithm", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.HMACOutputLength,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            converter: XmlCore.XmlNumberConverter,
        })
    ], SignatureMethod.prototype, "HMACOutputLength", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: SignatureMethodOther,
            noRoot: true,
            minOccurs: 0,
        })
    ], SignatureMethod.prototype, "Any", void 0);
    SignatureMethod = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.SignatureMethod,
        })
    ], SignatureMethod);
    return SignatureMethod;
}(XmlSignatureObject));

/**
 *
 * <complexType name="SignedInfoType">
 *   <sequence>
 *     <element ref="ds:CanonicalizationMethod"/>
 *     <element ref="ds:SignatureMethod"/>
 *     <element ref="ds:Reference" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 *
 */
/**
 * The SignedInfo class represents the <SignedInfo> element
 * of an XML signature defined by the XML digital signature specification
 *
 * @export
 * @class SignedInfo
 * @extends {XmlSignatureObject}
 */
var SignedInfo = /** @class */ (function (_super) {
    tslib_1.__extends(SignedInfo, _super);
    function SignedInfo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Id,
            defaultValue: "",
        })
    ], SignedInfo.prototype, "Id", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: CanonicalizationMethod,
            required: true,
        })
    ], SignedInfo.prototype, "CanonicalizationMethod", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: SignatureMethod,
            required: true,
        })
    ], SignedInfo.prototype, "SignatureMethod", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: References,
            minOccurs: 1,
            noRoot: true,
        })
    ], SignedInfo.prototype, "References", void 0);
    SignedInfo = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.SignedInfo,
        })
    ], SignedInfo);
    return SignedInfo;
}(XmlSignatureObject));

/**
 *
 * <element name="Signature" type="ds:SignatureType"/>
 * <complexType name="SignatureType">
 *   <sequence>
 *     <element ref="ds:SignedInfo"/>
 *     <element ref="ds:SignatureValue"/>
 *     <element ref="ds:KeyInfo" minOccurs="0"/>
 *     <element ref="ds:Object" minOccurs="0" maxOccurs="unbounded"/>
 *   </sequence>
 *   <attribute name="Id" type="ID" use="optional"/>
 * </complexType>
 *
 */
/**
 * Represents the <Signature> element of an XML signature.
 */
var Signature = /** @class */ (function (_super) {
    tslib_1.__extends(Signature, _super);
    function Signature() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Id,
            defaultValue: "",
        })
    ], Signature.prototype, "Id", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: SignedInfo,
            required: true,
        })
    ], Signature.prototype, "SignedInfo", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.SignatureValue,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            required: true,
            converter: XmlCore.XmlBase64Converter,
            defaultValue: null,
        })
    ], Signature.prototype, "SignatureValue", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: KeyInfo,
        })
    ], Signature.prototype, "KeyInfo", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: DataObjects,
            noRoot: true,
        })
    ], Signature.prototype, "ObjectList", void 0);
    Signature = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.Signature,
        })
    ], Signature);
    return Signature;
}(XmlSignatureObject));

/**
 *
 * <xs:element name="ECDSAKeyValue" type="ecdsa:ECDSAKeyValueType"/>
 * <xs:complexType name="ECDSAKeyValueType">
 *   <xs:sequence>
 *     <xs:element name="DomainParameters" type="ecdsa:DomainParamsType"
 *                 minOccurs="0"/>
 *     <xs:element name="PublicKey" type="ecdsa:ECPointType"/>
 *   </xs:sequence>
 * </xs:complexType>
 *
 * <xs:complexType name="DomainParamsType">
 *   <xs:choice>
 *     <xs:element name="ExplicitParams"
 *                 type="ecdsa:ExplicitParamsType"/>
 *     <xs:element name="NamedCurve">
 *       <xs:complexType>
 *         <xs:attribute name="URN" type="xs:anyURI" use="required"/>
 *       </xs:complexType>
 *     </xs:element>
 *   </xs:choice>
 * </xs:complexType>
 *
 * <xs:complexType name="ECPointType">
 *   <xs:sequence minOccurs="0">
 *     <xs:element name="X" type="ecdsa:FieldElemType"/>
 *     <xs:element name="Y" type="ecdsa:FieldElemType"/>
 *   </xs:sequence>
 * </xs:complexType>
 *
 */
var NAMESPACE_URI = "http://www.w3.org/2001/04/xmldsig-more#";
var PREFIX = "ecdsa";
var EcdsaPublicKey = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaPublicKey, _super);
    function EcdsaPublicKey() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.X,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
            required: true,
            converter: XmlCore.XmlBase64Converter,
        })
    ], EcdsaPublicKey.prototype, "X", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.Y,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
            required: true,
            converter: XmlCore.XmlBase64Converter,
        })
    ], EcdsaPublicKey.prototype, "Y", void 0);
    EcdsaPublicKey = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.PublicKey,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
        })
    ], EcdsaPublicKey);
    return EcdsaPublicKey;
}(XmlCore.XmlObject));
var NamedCurve = /** @class */ (function (_super) {
    tslib_1.__extends(NamedCurve, _super);
    function NamedCurve() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.URI,
            required: true,
        })
    ], NamedCurve.prototype, "Uri", void 0);
    NamedCurve = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.NamedCurve,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
        })
    ], NamedCurve);
    return NamedCurve;
}(XmlCore.XmlObject));
var DomainParameters = /** @class */ (function (_super) {
    tslib_1.__extends(DomainParameters, _super);
    function DomainParameters() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: NamedCurve,
        })
    ], DomainParameters.prototype, "NamedCurve", void 0);
    DomainParameters = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.DomainParameters,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
        })
    ], DomainParameters);
    return DomainParameters;
}(XmlCore.XmlObject));
/**
 * Represents the <ECKeyValue> element of an XML signature.
 */
var EcdsaKeyValue = /** @class */ (function (_super) {
    tslib_1.__extends(EcdsaKeyValue, _super);
    function EcdsaKeyValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = XmlSignature.ElementNames.ECDSAKeyValue;
        _this.key = null;
        _this.jwk = null;
        _this.keyUsage = null;
        return _this;
    }
    Object.defineProperty(EcdsaKeyValue.prototype, "NamedCurve", {
        /**
         * Gets the NamedCurve value of then public key
         */
        get: function () {
            return GetNamedCurveOid(this.DomainParameters.NamedCurve.Uri);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Imports key to the ECKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    EcdsaKeyValue.prototype.importKey = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (key.algorithm.name.toUpperCase() !== "ECDSA") {
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            }
            _this.key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then(function (jwk) {
                _this.jwk = jwk;
                _this.PublicKey = new EcdsaPublicKey();
                _this.PublicKey.X = XmlCore.Convert.FromString(jwk.x, "base64url");
                _this.PublicKey.Y = XmlCore.Convert.FromString(jwk.y, "base64url");
                if (!_this.DomainParameters) {
                    _this.DomainParameters = new DomainParameters();
                }
                if (!_this.DomainParameters.NamedCurve) {
                    _this.DomainParameters.NamedCurve = new NamedCurve();
                }
                _this.DomainParameters.NamedCurve.Uri = GetNamedCurveOid(jwk.crv);
                _this.keyUsage = key.usages;
                return Promise.resolve(_this);
            })
                .then(resolve, reject);
        });
    };
    /**
     * Exports key from the ECKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    EcdsaKeyValue.prototype.exportKey = function (alg) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (_this.key) {
                return _this.key;
            }
            // fill jwk
            var x = XmlCore.Convert.ToBase64Url(_this.PublicKey.X);
            var y = XmlCore.Convert.ToBase64Url(_this.PublicKey.Y);
            var crv = GetNamedCurveFromOid(_this.DomainParameters.NamedCurve.Uri);
            var jwk = {
                kty: "EC",
                crv: crv,
                x: x,
                y: y,
                ext: true,
            };
            _this.keyUsage = ["verify"];
            return Application.crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: crv }, true, _this.keyUsage);
        })
            .then(function (key) {
            _this.key = key;
            return _this.key;
        });
    };
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: DomainParameters,
        })
    ], EcdsaKeyValue.prototype, "DomainParameters", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: EcdsaPublicKey,
            required: true,
        })
    ], EcdsaKeyValue.prototype, "PublicKey", void 0);
    EcdsaKeyValue = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.ECDSAKeyValue,
            namespaceURI: NAMESPACE_URI,
            prefix: PREFIX,
        })
    ], EcdsaKeyValue);
    return EcdsaKeyValue;
}(KeyInfoClause));
function GetNamedCurveOid(namedCurve) {
    switch (namedCurve) {
        case "P-256":
            return "urn:oid:1.2.840.10045.3.1.7";
        case "P-384":
            return "urn:oid:1.3.132.0.34";
        case "P-521":
            return "urn:oid:1.3.132.0.35";
    }
    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Unknown NamedCurve");
}
function GetNamedCurveFromOid(oid) {
    switch (oid) {
        case "urn:oid:1.2.840.10045.3.1.7":
            return "P-256";
        case "urn:oid:1.3.132.0.34":
            return "P-384";
        case "urn:oid:1.3.132.0.35":
            return "P-521";
    }
    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Unknown NamedCurve OID");
}

/**
 * Represents the <RSAKeyValue> element of an XML signature.
 */
var RsaKeyValue = /** @class */ (function (_super) {
    tslib_1.__extends(RsaKeyValue, _super);
    function RsaKeyValue() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.key = null;
        _this.jwk = null;
        _this.keyUsage = [];
        return _this;
    }
    /**
     * Imports key to the RSAKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    RsaKeyValue.prototype.importKey = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var algName = key.algorithm.name.toUpperCase();
            if (algName !== RSA_PKCS1.toUpperCase() && algName !== RSA_PSS.toUpperCase()) {
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            }
            _this.key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then(function (jwk) {
                _this.jwk = jwk;
                _this.Modulus = XmlCore.Convert.FromBase64Url(jwk.n);
                _this.Exponent = XmlCore.Convert.FromBase64Url(jwk.e);
                _this.keyUsage = key.usages;
                return Promise.resolve(_this);
            })
                .then(resolve, reject);
        });
    };
    /**
     * Exports key from the RSAKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    RsaKeyValue.prototype.exportKey = function (alg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.key) {
                return resolve(_this.key);
            }
            // fill jwk
            if (!_this.Modulus) {
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
            }
            var modulus = XmlCore.Convert.ToBase64Url(_this.Modulus);
            if (!_this.Exponent) {
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
            }
            var exponent = XmlCore.Convert.ToBase64Url(_this.Exponent);
            var algJwk;
            switch (alg.name.toUpperCase()) {
                case RSA_PKCS1.toUpperCase():
                    algJwk = "R";
                    break;
                case RSA_PSS.toUpperCase():
                    algJwk = "P";
                    break;
                default:
                    throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, alg.name);
            }
            // Convert hash to JWK name
            switch (alg.hash.name.toUpperCase()) {
                case SHA1:
                    algJwk += "S1";
                    break;
                case SHA256:
                    algJwk += "S256";
                    break;
                case SHA384:
                    algJwk += "S384";
                    break;
                case SHA512:
                    algJwk += "S512";
                    break;
            }
            var jwk = {
                kty: "RSA",
                alg: algJwk,
                n: modulus,
                e: exponent,
                ext: true,
            };
            Application.crypto.subtle.importKey("jwk", jwk, alg, true, _this.keyUsage)
                .then(resolve, reject);
        });
    };
    /**
     * Loads an RSA key clause from an XML element.
     * @param  {Element | string} element
     * @returns void
     */
    RsaKeyValue.prototype.LoadXml = function (node) {
        _super.prototype.LoadXml.call(this, node);
        this.keyUsage = ["verify"];
    };
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.Modulus,
            prefix: XmlSignature.DefaultPrefix,
            namespaceURI: XmlSignature.NamespaceURI,
            required: true,
            converter: XmlCore.XmlBase64Converter,
        })
    ], RsaKeyValue.prototype, "Modulus", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.Exponent,
            prefix: XmlSignature.DefaultPrefix,
            namespaceURI: XmlSignature.NamespaceURI,
            required: true,
            converter: XmlCore.XmlBase64Converter,
        })
    ], RsaKeyValue.prototype, "Exponent", void 0);
    RsaKeyValue = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.RSAKeyValue,
        })
    ], RsaKeyValue);
    return RsaKeyValue;
}(KeyInfoClause));
/**
 *
 *  Schema Definition (target namespace
 *  http://www.w3.org/2007/05/xmldsig-more#):
 *
 *  <xs:element name="RSAPSSParams" type="pss:RSAPSSParamsType">
 *      <xs:annotation>
 *          <xs:documentation>
 *  Top level element that can be used in xs:any namespace="#other"
 *  wildcard of ds:SignatureMethod content.
 *          </xs:documentation>
 *      </xs:annotation>
 *  </xs:element>
 *  <xs:complexType name="RSAPSSParamsType">
 *      <xs:sequence>
 *          <xs:element ref="ds:DigestMethod" minOccurs="0"/>
 *          <xs:element name="MaskGenerationFunction"
 *             type="pss:MaskGenerationFunctionType" minOccurs="0"/>
 *          <xs:element name="SaltLength" type="xs:int"
 *             minOccurs="0"/>
 *          <xs:element name="TrailerField" type="xs:int"
 *             minOccurs="0"/>
 *      </xs:sequence>
 *  </xs:complexType>
 *  <xs:complexType name="MaskGenerationFunctionType">
 *      <xs:sequence>
 *          <xs:element ref="ds:DigestMethod" minOccurs="0"/>
 *      </xs:sequence>
 *      <xs:attribute name="Algorithm" type="xs:anyURI"
 *         default="http://www.w3.org/2007/05/xmldsig-more#MGF1"/>
 *  </xs:complexType>
 *
 */
var NAMESPACE_URI$1 = "http://www.w3.org/2007/05/xmldsig-more#";
var PREFIX$1 = "pss";
var MaskGenerationFunction = /** @class */ (function (_super) {
    tslib_1.__extends(MaskGenerationFunction, _super);
    function MaskGenerationFunction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: DigestMethod,
        })
    ], MaskGenerationFunction.prototype, "DigestMethod", void 0);
    tslib_1.__decorate([
        XmlCore.XmlAttribute({
            localName: XmlSignature.AttributeNames.Algorithm,
            defaultValue: "http://www.w3.org/2007/05/xmldsig-more#MGF1",
        })
    ], MaskGenerationFunction.prototype, "Algorithm", void 0);
    MaskGenerationFunction = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.MaskGenerationFunction,
            prefix: PREFIX$1,
            namespaceURI: NAMESPACE_URI$1,
        })
    ], MaskGenerationFunction);
    return MaskGenerationFunction;
}(XmlCore.XmlObject));
var PssAlgorithmParams = /** @class */ (function (_super) {
    tslib_1.__extends(PssAlgorithmParams, _super);
    function PssAlgorithmParams(algorithm) {
        var _this = _super.call(this) || this;
        if (algorithm) {
            _this.FromAlgorithm(algorithm);
        }
        return _this;
    }
    PssAlgorithmParams_1 = PssAlgorithmParams;
    PssAlgorithmParams.FromAlgorithm = function (algorithm) {
        return new PssAlgorithmParams_1(algorithm);
    };
    PssAlgorithmParams.prototype.FromAlgorithm = function (algorithm) {
        this.DigestMethod = new DigestMethod();
        var digest = CryptoConfig.GetHashAlgorithm(algorithm.hash);
        this.DigestMethod.Algorithm = digest.namespaceURI;
        if (algorithm.saltLength) {
            this.SaltLength = algorithm.saltLength;
        }
    };
    var PssAlgorithmParams_1;
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: DigestMethod,
        })
    ], PssAlgorithmParams.prototype, "DigestMethod", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            parser: MaskGenerationFunction,
        })
    ], PssAlgorithmParams.prototype, "MGF", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            converter: XmlCore.XmlNumberConverter,
            prefix: PREFIX$1,
            namespaceURI: NAMESPACE_URI$1,
        })
    ], PssAlgorithmParams.prototype, "SaltLength", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            converter: XmlCore.XmlNumberConverter,
        })
    ], PssAlgorithmParams.prototype, "TrailerField", void 0);
    PssAlgorithmParams = PssAlgorithmParams_1 = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.RSAPSSParams,
            prefix: PREFIX$1,
            namespaceURI: NAMESPACE_URI$1,
        })
    ], PssAlgorithmParams);
    return PssAlgorithmParams;
}(XmlCore.XmlObject));

/**
 * Represents the <KeyValue> element of an XML signature.
 */
var KeyValue = /** @class */ (function (_super) {
    tslib_1.__extends(KeyValue, _super);
    function KeyValue(value) {
        var _this = _super.call(this) || this;
        if (value) {
            _this.Value = value;
        }
        return _this;
    }
    Object.defineProperty(KeyValue.prototype, "Value", {
        get: function () {
            return this.value;
        },
        set: function (v) {
            this.element = null;
            this.value = v;
        },
        enumerable: true,
        configurable: true
    });
    KeyValue.prototype.importKey = function (key) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            switch (key.algorithm.name.toUpperCase()) {
                case RSA_PSS.toUpperCase():
                case RSA_PKCS1.toUpperCase():
                    _this.Value = new RsaKeyValue();
                    return _this.Value.importKey(key);
                case ECDSA.toUpperCase():
                    _this.Value = new EcdsaKeyValue();
                    return _this.Value.importKey(key);
                default:
                    throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
            }
        })
            .then(function () {
            return _this;
        });
    };
    KeyValue.prototype.exportKey = function (alg) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (!_this.Value) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_REFERENCE);
            }
            return _this.Value.exportKey(alg);
        });
    };
    KeyValue.prototype.OnGetXml = function (element) {
        if (!this.Value) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "KeyValue has empty value");
        }
        var node = this.Value.GetXml();
        if (node) {
            element.appendChild(node);
        }
    };
    KeyValue = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.KeyValue,
        })
    ], KeyValue);
    return KeyValue;
}(KeyInfoClause));

// tslint:disable-next-line:no-reference
/**
 * List of OIDs
 * Source: https://msdn.microsoft.com/ru-ru/library/windows/desktop/aa386991(v=vs.85).aspx
 */
var OID = {
    "2.5.4.3": {
        short: "CN",
        long: "CommonName",
    },
    "2.5.4.6": {
        short: "C",
        long: "Country",
    },
    "2.5.4.5": {
        long: "DeviceSerialNumber",
    },
    "0.9.2342.19200300.100.1.25": {
        short: "DC",
        long: "DomainComponent",
    },
    "1.2.840.113549.1.9.1": {
        short: "E",
        long: "EMail",
    },
    "2.5.4.42": {
        short: "G",
        long: "GivenName",
    },
    "2.5.4.43": {
        short: "I",
        long: "Initials",
    },
    "2.5.4.7": {
        short: "L",
        long: "Locality",
    },
    "2.5.4.10": {
        short: "O",
        long: "Organization",
    },
    "2.5.4.11": {
        short: "OU",
        long: "OrganizationUnit",
    },
    "2.5.4.8": {
        short: "ST",
        long: "State",
    },
    "2.5.4.9": {
        short: "Street",
        long: "StreetAddress",
    },
    "2.5.4.4": {
        short: "SN",
        long: "SurName",
    },
    "2.5.4.12": {
        short: "T",
        long: "Title",
    },
    "1.2.840.113549.1.9.8": {
        long: "UnstructuredAddress",
    },
    "1.2.840.113549.1.9.2": {
        long: "UnstructuredName",
    },
};
/**
 * Represents an <X509Certificate> element.
 */
var X509Certificate = /** @class */ (function () {
    function X509Certificate(rawData) {
        this.publicKey = null;
        if (rawData) {
            var buf = new Uint8Array(rawData);
            this.LoadRaw(buf);
            this.raw = buf;
        }
    }
    Object.defineProperty(X509Certificate.prototype, "SerialNumber", {
        /**
         * Gets a serial number of the certificate in BIG INTEGER string format
         */
        get: function () {
            return this.simpl.serialNumber.valueBlock.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(X509Certificate.prototype, "Issuer", {
        /**
         * Gets a issuer name of the certificate
         */
        get: function () {
            return this.NameToString(this.simpl.issuer);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(X509Certificate.prototype, "Subject", {
        /**
         * Gets a subject name of the certificate
         */
        get: function () {
            return this.NameToString(this.simpl.subject);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a thumbprint of the certificate
     * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
     * @returns PromiseLike
     */
    X509Certificate.prototype.Thumbprint = function (algName) {
        if (algName === void 0) { algName = "SHA-1"; }
        return Application.crypto.subtle.digest(algName, this.raw);
    };
    Object.defineProperty(X509Certificate.prototype, "PublicKey", {
        /**
         * Gets the public key from the X509Certificate
         */
        get: function () {
            return this.publicKey;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns DER raw of X509Certificate
     */
    X509Certificate.prototype.GetRaw = function () {
        return this.raw;
    };
    /**
     * Returns public key from X509Certificate
     * @param  {Algorithm} algorithm
     * @returns Promise
     */
    X509Certificate.prototype.exportKey = function (algorithm) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            var alg = {
                algorithm: algorithm,
                usages: ["verify"],
            };
            if (alg.algorithm.name.toUpperCase() === ECDSA) {
                // Set named curve
                var namedCurveOid = _this.simpl.subjectPublicKeyInfo.toJSON().algorithm.algorithmParams.valueBlock.value;
                switch (namedCurveOid) {
                    case "1.2.840.10045.3.1.7": // P-256
                        alg.algorithm.namedCurve = "P-256";
                        break;
                    case "1.3.132.0.34": // P-384
                        alg.algorithm.namedCurve = "P-384";
                        break;
                    case "1.3.132.0.35": // P-521
                        alg.algorithm.namedCurve = "P-521";
                        break;
                    default:
                        throw new Error("Unsupported named curve OID '" + namedCurveOid + "'");
                }
            }
            return _this.simpl.getPublicKey({ algorithm: alg })
                .then(function (key) {
                _this.publicKey = key;
                return key;
            });
        });
    };
    //#region Protected methods
    /**
     * Converts X500Name to string
     * @param  {RDN} name X500Name
     * @param  {string} splitter Splitter char. Default ','
     * @returns string Formated string
     * Example:
     * > C=Some name, O=Some organization name, C=RU
     */
    X509Certificate.prototype.NameToString = function (name, splitter) {
        if (splitter === void 0) { splitter = ","; }
        var res = [];
        name.typesAndValues.forEach(function (typeAndValue) {
            var type = typeAndValue.type;
            var oid = OID[type.toString()];
            var name2 = oid ? oid.short : null;
            res.push((name2 ? name2 : type) + "=" + typeAndValue.value.valueBlock.value);
        });
        return res.join(splitter + " ");
    };
    /**
     * Loads X509Certificate from DER data
     * @param  {Uint8Array} rawData
     */
    X509Certificate.prototype.LoadRaw = function (rawData) {
        this.raw = new Uint8Array(rawData);
        var asn1 = Asn1Js.fromBER(this.raw.buffer);
        this.simpl = new pkijs.Certificate({ schema: asn1.result });
    };
    return X509Certificate;
}());

/**
 *
 * <element name="X509Data" type="ds:X509DataType"/>
 * <complexType name="X509DataType">
 *   <sequence maxOccurs="unbounded">
 *     <choice>
 *       <element name="X509IssuerSerial" type="ds:X509IssuerSerialType"/>
 *       <element name="X509SKI" type="base64Binary"/>
 *       <element name="X509SubjectName" type="string"/>
 *       <element name="X509Certificate" type="base64Binary"/>
 *       <element name="X509CRL" type="base64Binary"/>
 *       <any namespace="##other" processContents="lax"/>
 *     </choice>
 *   </sequence>
 * </complexType>
 *
 *  <complexType name="X509IssuerSerialType">
 *    <sequence>
 *      <element name="X509IssuerName" type="string"/>
 *      <element name="X509SerialNumber" type="integer"/>
 *    </sequence>
 *  </complexType>
 *
 */
var X509IssuerSerial = /** @class */ (function (_super) {
    tslib_1.__extends(X509IssuerSerial, _super);
    function X509IssuerSerial() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.X509IssuerName,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            required: true,
        })
    ], X509IssuerSerial.prototype, "X509IssuerName", void 0);
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.X509SerialNumber,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            required: true,
        })
    ], X509IssuerSerial.prototype, "X509SerialNumber", void 0);
    X509IssuerSerial = tslib_1.__decorate([
        XmlCore.XmlElement({ localName: XmlSignature.ElementNames.X509IssuerSerial })
    ], X509IssuerSerial);
    return X509IssuerSerial;
}(XmlSignatureObject));
(function (X509IncludeOption) {
    X509IncludeOption[X509IncludeOption["None"] = 0] = "None";
    X509IncludeOption[X509IncludeOption["EndCertOnly"] = 1] = "EndCertOnly";
    X509IncludeOption[X509IncludeOption["ExcludeRoot"] = 2] = "ExcludeRoot";
    X509IncludeOption[X509IncludeOption["WholeChain"] = 3] = "WholeChain";
})(exports.X509IncludeOption || (exports.X509IncludeOption = {}));
/**
 * Represents an <X509Data> sub element of an XMLDSIG or XML Encryption <KeyInfo> element.
 */
var KeyInfoX509Data = /** @class */ (function (_super) {
    tslib_1.__extends(KeyInfoX509Data, _super);
    function KeyInfoX509Data(cert, includeOptions) {
        if (includeOptions === void 0) { includeOptions = exports.X509IncludeOption.None; }
        var _this = _super.call(this) || this;
        _this.x509crl = null;
        _this.SubjectKeyIdList = [];
        _this.key = null;
        if (cert) {
            if (cert instanceof Uint8Array) {
                _this.AddCertificate(new X509Certificate(cert));
            }
            else if (cert instanceof X509Certificate) {
                switch (includeOptions) {
                    case exports.X509IncludeOption.None:
                    case exports.X509IncludeOption.EndCertOnly:
                        _this.AddCertificate(cert);
                        break;
                    case exports.X509IncludeOption.ExcludeRoot:
                        _this.AddCertificatesChainFrom(cert, false);
                        break;
                    case exports.X509IncludeOption.WholeChain:
                        _this.AddCertificatesChainFrom(cert, true);
                        break;
                }
            }
        }
        return _this;
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
        return Promise.reject(new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_SUPPORTED));
    };
    /**
     * Exports key from X509Data object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    KeyInfoX509Data.prototype.exportKey = function (alg) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (_this.Certificates.length) {
                return _this.Certificates[0].exportKey(alg);
            }
            throw new XmlCore.XmlError(XmlCore.XE.NULL_REFERENCE);
        })
            .then(function (key) {
            _this.key = key;
            return key;
        });
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
        if (!certificate) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "certificate");
        }
        if (!this.X509CertificateList) {
            this.X509CertificateList = [];
        }
        this.X509CertificateList.push(certificate);
    };
    /**
     * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
     * @param  {string} issuerName
     * @param  {string} serialNumber
     * @returns void
     */
    KeyInfoX509Data.prototype.AddIssuerSerial = function (issuerName, serialNumber) {
        if (issuerName == null) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "issuerName");
        }
        if (this.IssuerSerialList == null) {
            this.IssuerSerialList = [];
        }
        var xis = { issuerName: issuerName, serialNumber: serialNumber };
        this.IssuerSerialList.push(xis);
    };
    /**
     * Adds the specified subject key identifier (SKI) to the KeyInfoX509Data object.
     * @param  {string | Uint8Array} subjectKeyId
     * @returns void
     */
    KeyInfoX509Data.prototype.AddSubjectKeyId = function (subjectKeyId) {
        if (this.SubjectKeyIdList) {
            this.SubjectKeyIdList = [];
        }
        if (typeof subjectKeyId === "string") {
            if (subjectKeyId != null) {
                var id = void 0;
                id = XmlCore.Convert.FromBase64(subjectKeyId);
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
        if (this.SubjectNameList == null) {
            this.SubjectNameList = [];
        }
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
            this.IssuerSerialList.forEach(function (iser) {
                var isl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerSerial);
                var xin = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerName);
                xin.textContent = iser.issuerName;
                isl.appendChild(xin);
                var xsn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SerialNumber);
                xsn.textContent = iser.serialNumber;
                isl.appendChild(xsn);
                xel.appendChild(isl);
            });
        }
        // <X509SKI>
        if ((this.SubjectKeyIdList != null) && (this.SubjectKeyIdList.length > 0)) {
            this.SubjectKeyIdList.forEach(function (skid) {
                var ski = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SKI);
                ski.textContent = XmlCore.Convert.ToBase64(skid);
                xel.appendChild(ski);
            });
        }
        // <X509SubjectName>
        if ((this.SubjectNameList != null) && (this.SubjectNameList.length > 0)) {
            this.SubjectNameList.forEach(function (subject) {
                var sn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SubjectName);
                sn.textContent = subject;
                xel.appendChild(sn);
            });
        }
        // <X509Certificate>
        if ((this.X509CertificateList != null) && (this.X509CertificateList.length > 0)) {
            this.X509CertificateList.forEach(function (x509) {
                var cert = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509Certificate);
                cert.textContent = XmlCore.Convert.ToBase64(x509.GetRaw());
                xel.appendChild(cert);
            });
        }
        // only one <X509CRL>
        if (this.x509crl != null) {
            var crl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509CRL);
            crl.textContent = XmlCore.Convert.ToBase64(this.x509crl);
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
        var _this = this;
        _super.prototype.LoadXml.call(this, element);
        if (this.IssuerSerialList) {
            this.IssuerSerialList = [];
        }
        if (this.SubjectKeyIdList) {
            this.SubjectKeyIdList = [];
        }
        if (this.SubjectNameList) {
            this.SubjectNameList = [];
        }
        if (this.X509CertificateList) {
            this.X509CertificateList = [];
        }
        this.x509crl = null;
        // <X509IssuerSerial>
        var xnl = this.GetChildren(XmlSignature.ElementNames.X509IssuerSerial);
        if (xnl) {
            xnl.forEach(function (xel) {
                var issuer = XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509IssuerName, XmlSignature.NamespaceURI, true);
                var serial = XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509SerialNumber, XmlSignature.NamespaceURI, true);
                if (issuer && issuer.textContent && serial && serial.textContent) {
                    _this.AddIssuerSerial(issuer.textContent, serial.textContent);
                }
            });
        }
        // <X509SKI>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509SKI);
        if (xnl) {
            xnl.forEach(function (xel) {
                if (xel.textContent) {
                    var skid = XmlCore.Convert.FromBase64(xel.textContent);
                    _this.AddSubjectKeyId(skid);
                }
            });
        }
        // <X509SubjectName>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509SubjectName);
        if (xnl != null) {
            xnl.forEach(function (xel) {
                if (xel.textContent) {
                    _this.AddSubjectName(xel.textContent);
                }
            });
        }
        // <X509Certificate>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509Certificate);
        if (xnl) {
            xnl.forEach(function (xel) {
                if (xel.textContent) {
                    var cert = XmlCore.Convert.FromBase64(xel.textContent);
                    _this.AddCertificate(new X509Certificate(cert));
                }
            });
        }
        // only one <X509CRL>
        var x509el = this.GetChild(XmlSignature.ElementNames.X509CRL, false);
        if (x509el && x509el.textContent) {
            this.x509crl = XmlCore.Convert.FromBase64(x509el.textContent);
        }
    };
    // this gets complicated because we must:
    // 1. build the chain using a X509Certificate2 class;
    // 2. test for root using the Mono.Security.X509.X509Certificate class;
    // 3. add the certificates as X509Certificate instances;
    KeyInfoX509Data.prototype.AddCertificatesChainFrom = function (cert, root) {
        throw new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_IMPLEMENTED);
    };
    KeyInfoX509Data = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.X509Data,
        })
    ], KeyInfoX509Data);
    return KeyInfoX509Data;
}(KeyInfoClause));

/**
 *
 * <element name="SPKIData" type="ds:SPKIDataType"/>
 * <complexType name="SPKIDataType">
 *   <sequence maxOccurs="unbounded">
 *     <element name="SPKISexp" type="base64Binary"/>
 *     <any namespace="##other" processContents="lax" minOccurs="0"/>
 *   </sequence>
 * </complexType>
 *
 */
var SPKIData = /** @class */ (function (_super) {
    tslib_1.__extends(SPKIData, _super);
    function SPKIData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SPKIData.prototype.importKey = function (key) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            return Application.crypto.subtle.exportKey("spki", key);
        })
            .then(function (spki) {
            _this.SPKIexp = new Uint8Array(spki);
            _this.Key = key;
            return _this;
        });
    };
    SPKIData.prototype.exportKey = function (alg) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            return Application.crypto.subtle.importKey("spki", _this.SPKIexp, alg, true, ["verify"]);
        })
            .then(function (key) {
            _this.Key = key;
            return key;
        });
    };
    tslib_1.__decorate([
        XmlCore.XmlChildElement({
            localName: XmlSignature.ElementNames.SPKIexp,
            namespaceURI: XmlSignature.NamespaceURI,
            prefix: XmlSignature.DefaultPrefix,
            required: true,
            converter: XmlCore.XmlBase64Converter,
        })
    ], SPKIData.prototype, "SPKIexp", void 0);
    SPKIData = tslib_1.__decorate([
        XmlCore.XmlElement({
            localName: XmlSignature.ElementNames.SPKIData,
        })
    ], SPKIData);
    return SPKIData;
}(KeyInfoClause));

var SignatureAlgorithms = {};
SignatureAlgorithms[RSA_PKCS1_SHA1_NAMESPACE] = RsaPkcs1Sha1;
SignatureAlgorithms[RSA_PKCS1_SHA256_NAMESPACE] = RsaPkcs1Sha256;
SignatureAlgorithms[RSA_PKCS1_SHA384_NAMESPACE] = RsaPkcs1Sha384;
SignatureAlgorithms[RSA_PKCS1_SHA512_NAMESPACE] = RsaPkcs1Sha512;
SignatureAlgorithms[ECDSA_SHA1_NAMESPACE] = EcdsaSha1;
SignatureAlgorithms[ECDSA_SHA256_NAMESPACE] = EcdsaSha256;
SignatureAlgorithms[ECDSA_SHA384_NAMESPACE] = EcdsaSha384;
SignatureAlgorithms[ECDSA_SHA512_NAMESPACE] = EcdsaSha512;
SignatureAlgorithms[HMAC_SHA1_NAMESPACE] = HmacSha1;
SignatureAlgorithms[HMAC_SHA256_NAMESPACE] = HmacSha256;
SignatureAlgorithms[HMAC_SHA384_NAMESPACE] = HmacSha384;
SignatureAlgorithms[HMAC_SHA512_NAMESPACE] = HmacSha512;
var HashAlgorithms = {};
HashAlgorithms[SHA1_NAMESPACE] = Sha1;
HashAlgorithms[SHA256_NAMESPACE] = Sha256;
HashAlgorithms[SHA384_NAMESPACE] = Sha384;
HashAlgorithms[SHA512_NAMESPACE] = Sha512;
var CryptoConfig = /** @class */ (function () {
    function CryptoConfig() {
    }
    /**
     * Creates Transform from given name
     * if name is not exist then throws error
     *
     * @static
     * @param {(string |)} [name=null]
     * @returns
     *
     * @memberOf CryptoConfig
     */
    CryptoConfig.CreateFromName = function (name) {
        var transform;
        switch (name) {
            case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                transform = new XmlDsigBase64Transform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                transform = new XmlDsigC14NTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                transform = new XmlDsigC14NWithCommentsTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                transform = new XmlDsigEnvelopedSignatureTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXPathTransform();
            // break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigXsltTransform:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXsltTransform();
            // break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                transform = new XmlDsigExcC14NTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                transform = new XmlDsigExcC14NWithCommentsTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDecryptionTransform:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDecryptionTransform();
            // break;
            default:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, name);
        }
        return transform;
    };
    CryptoConfig.CreateSignatureAlgorithm = function (method) {
        var alg = SignatureAlgorithms[method.Algorithm] || null;
        if (alg) {
            return new alg();
        }
        else if (method.Algorithm === RSA_PSS_WITH_PARAMS_NAMESPACE) {
            var pssParams_1;
            method.Any.Some(function (item) {
                if (item instanceof PssAlgorithmParams) {
                    pssParams_1 = item;
                }
                return !!pssParams_1;
            });
            if (pssParams_1) {
                switch (pssParams_1.DigestMethod.Algorithm) {
                    case SHA1_NAMESPACE:
                        return new RsaPssSha1(pssParams_1.SaltLength);
                    case SHA256_NAMESPACE:
                        return new RsaPssSha256(pssParams_1.SaltLength);
                    case SHA384_NAMESPACE:
                        return new RsaPssSha384(pssParams_1.SaltLength);
                    case SHA512_NAMESPACE:
                        return new RsaPssSha512(pssParams_1.SaltLength);
                }
            }
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Cannot get params for RSA-PSS algoriithm");
        }
        throw new Error("signature algorithm '" + method.Algorithm + "' is not supported");
    };
    CryptoConfig.CreateHashAlgorithm = function (namespace) {
        var alg = HashAlgorithms[namespace];
        if (alg) {
            return new alg();
        }
        else {
            throw new Error("hash algorithm '" + namespace + "' is not supported");
        }
    };
    CryptoConfig.GetHashAlgorithm = function (algorithm) {
        var alg = typeof algorithm === "string" ? { name: algorithm } : algorithm;
        switch (alg.name.toUpperCase()) {
            case SHA1:
                return new Sha1();
            case SHA256:
                return new Sha256();
            case SHA384:
                return new Sha384();
            case SHA512:
                return new Sha512();
            default:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, alg.name);
        }
    };
    CryptoConfig.GetSignatureAlgorithm = function (algorithm) {
        if (typeof algorithm.hash === "string") {
            algorithm.hash = {
                name: algorithm.hash,
            };
        }
        var hashName = algorithm.hash.name;
        if (!hashName) {
            throw new Error("Signing algorithm doesn't have name for hash");
        }
        var alg;
        switch (algorithm.name.toUpperCase()) {
            case RSA_PKCS1.toUpperCase():
                switch (hashName.toUpperCase()) {
                    case SHA1:
                        alg = new RsaPkcs1Sha1();
                        break;
                    case SHA256:
                        alg = new RsaPkcs1Sha256();
                        break;
                    case SHA384:
                        alg = new RsaPkcs1Sha384();
                        break;
                    case SHA512:
                        alg = new RsaPkcs1Sha512();
                        break;
                    default:
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
                }
                break;
            case RSA_PSS.toUpperCase():
                var saltLength = algorithm.saltLength;
                switch (hashName.toUpperCase()) {
                    case SHA1:
                        alg = new RsaPssSha1(saltLength);
                        break;
                    case SHA256:
                        alg = new RsaPssSha256(saltLength);
                        break;
                    case SHA384:
                        alg = new RsaPssSha384(saltLength);
                        break;
                    case SHA512:
                        alg = new RsaPssSha512(saltLength);
                        break;
                    default:
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
                }
                break;
            case ECDSA:
                switch (hashName.toUpperCase()) {
                    case SHA1:
                        alg = new EcdsaSha1();
                        break;
                    case SHA256:
                        alg = new EcdsaSha256();
                        break;
                    case SHA384:
                        alg = new EcdsaSha384();
                        break;
                    case SHA512:
                        alg = new EcdsaSha512();
                        break;
                    default:
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
                }
                break;
            case HMAC:
                switch (hashName.toUpperCase()) {
                    case SHA1:
                        alg = new HmacSha1();
                        break;
                    case SHA256:
                        alg = new HmacSha256();
                        break;
                    case SHA384:
                        alg = new HmacSha384();
                        break;
                    case SHA512:
                        alg = new HmacSha512();
                        break;
                    default:
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name + ":" + hashName);
                }
                break;
            default:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name);
        }
        return alg;
    };
    return CryptoConfig;
}());

// tslint:disable:no-console
/**
 * Provides a wrapper on a core XML signature object to facilitate creating XML signatures.
 */
var SignedXml = /** @class */ (function () {
    /**
     * Creates an instance of SignedXml.
     *
     * @param {(Document | Element)} [node]
     *
     * @memberOf SignedXml
     */
    function SignedXml(node) {
        this.signature = new Signature();
        // constructor();
        if (node && node.nodeType === XmlCore.XmlNodeType.Document) {
            // constructor(node: Document);
            this.document = node;
        }
        else if (node && node.nodeType === XmlCore.XmlNodeType.Element) {
            // constructor(node: Element);
            var xmlText = new XMLSerializer().serializeToString(node);
            this.document = new DOMParser().parseFromString(xmlText, XmlCore.APPLICATION_XML);
        }
    }
    Object.defineProperty(SignedXml.prototype, "XmlSignature", {
        get: function () {
            return this.signature;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignedXml.prototype, "Signature", {
        get: function () {
            return this.XmlSignature.SignatureValue;
        },
        enumerable: true,
        configurable: true
    });
    SignedXml.prototype.Sign = function (algorithm, key, data, options) {
        var _this = this;
        var alg;
        var signedInfo;
        return Promise.resolve()
            .then(function () {
            var signingAlg = XmlCore.assign({}, key.algorithm, algorithm);
            alg = CryptoConfig.GetSignatureAlgorithm(signingAlg);
            return _this.ApplySignOptions(_this.XmlSignature, algorithm, key, options);
        })
            .then(function () {
            signedInfo = _this.XmlSignature.SignedInfo;
            return _this.DigestReferences(data.documentElement);
        })
            .then(function () {
            // Add signature method
            signedInfo.SignatureMethod.Algorithm = alg.namespaceURI;
            if (RSA_PSS.toUpperCase() === algorithm.name.toUpperCase()) {
                // Add RSA-PSS params
                var alg2 = XmlCore.assign({}, key.algorithm, algorithm);
                if (typeof alg2.hash === "string") {
                    alg2.hash = { name: alg2.hash };
                }
                var params = new PssAlgorithmParams(alg2);
                _this.XmlSignature.SignedInfo.SignatureMethod.Any.Add(params);
            }
            else if (HMAC.toUpperCase() === algorithm.name.toUpperCase()) {
                // Add HMAC params
                var outputLength = 0;
                var hmacAlg = key.algorithm;
                switch (hmacAlg.hash.name.toUpperCase()) {
                    case SHA1:
                        outputLength = hmacAlg.length || 160;
                        break;
                    case SHA256:
                        outputLength = hmacAlg.length || 256;
                        break;
                    case SHA384:
                        outputLength = hmacAlg.length || 384;
                        break;
                    case SHA512:
                        outputLength = hmacAlg.length || 512;
                        break;
                }
                _this.XmlSignature.SignedInfo.SignatureMethod.HMACOutputLength = outputLength;
            }
            var si = _this.TransformSignedInfo(data);
            return alg.Sign(si, key, algorithm);
        })
            .then(function (signature) {
            _this.Key = key;
            _this.XmlSignature.SignatureValue = new Uint8Array(signature);
            _this.document = data;
            return _this.XmlSignature;
        });
    };
    SignedXml.prototype.Verify = function (key) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            var xml = _this.document;
            if (!(xml && xml.documentElement)) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "SignedXml", "document");
            }
            return _this.ValidateReferences(xml.documentElement);
        })
            .then(function (res) {
            if (res) {
                var promise = Promise.resolve([]);
                if (key) {
                    promise = promise.then(function () {
                        return [key];
                    });
                }
                else {
                    promise = promise.then(function () {
                        return _this.GetPublicKeys();
                    });
                }
                return promise.then(function (keys) {
                    return _this.ValidateSignatureValue(keys);
                });
            }
            else {
                return false;
            }
        });
    };
    SignedXml.prototype.GetXml = function () {
        return this.signature.GetXml();
    };
    /**
     * Loads a SignedXml state from an XML element.
     * @param  {Element | string} value The XML to load the SignedXml state from.
     * @returns void
     */
    SignedXml.prototype.LoadXml = function (value) {
        this.signature = Signature.LoadXml(value);
    };
    SignedXml.prototype.toString = function () {
        // Check for EnvelopedTransform
        var signature = this.XmlSignature;
        var enveloped = signature.SignedInfo.References && signature.SignedInfo.References.Some(function (r) {
            return r.Transforms && r.Transforms.Some(function (t) { return t instanceof XmlDsigEnvelopedSignatureTransform; });
        });
        if (enveloped) {
            var doc = this.document.documentElement.cloneNode(true);
            var node = this.XmlSignature.GetXml();
            if (!node) {
                throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from Signature");
            }
            // console.log('Node before clone', node.outerHTML);
            var sig = node.cloneNode(true);
            // console.log('Sig after clone', (sig as Element).outerHTML);
            doc.appendChild(sig);
            // console.log('doc before serializing', (doc as Element).outerHTML);
            return new XMLSerializer().serializeToString(doc);
        }
        return this.XmlSignature.toString();
    };
    //#region Protected methods
    /**
     * Returns the public key of a signature.
     */
    SignedXml.prototype.GetPublicKeys = function () {
        var _this = this;
        var keys = [];
        return Promise.resolve()
            .then(function () {
            var pkEnumerator = _this.XmlSignature.KeyInfo.GetIterator();
            var promises = [];
            pkEnumerator.forEach(function (kic) {
                var alg = CryptoConfig.CreateSignatureAlgorithm(_this.XmlSignature.SignedInfo.SignatureMethod);
                if (kic instanceof KeyInfoX509Data) {
                    kic.Certificates.forEach(function (cert) {
                        promises.push(cert.exportKey(alg.algorithm)
                            .then(function (key) { keys.push(key); }));
                    });
                }
                else {
                    promises.push(kic.exportKey(alg.algorithm)
                        .then(function (key) { keys.push(key); }));
                }
            });
            return Promise.all(promises);
        })
            .then(function () { return keys; });
    };
    /**
     * Returns dictionary of namespaces used in signature
     */
    SignedXml.prototype.GetSignatureNamespaces = function () {
        var namespaces = {};
        if (this.XmlSignature.NamespaceURI) {
            namespaces[this.XmlSignature.Prefix || ""] = this.XmlSignature.NamespaceURI;
        }
        return namespaces;
    };
    /**
     * Copies namespaces from source element and its parents into destination element
     */
    SignedXml.prototype.CopyNamespaces = function (src, dst, ignoreDefault) {
        // this.InjectNamespaces(XmlCore.SelectNamespaces(src), dst, ignoreDefault);
        this.InjectNamespaces(SelectRootNamespaces(src), dst, ignoreDefault);
    };
    /**
     * Injects namespaces from dictionary to the target element
     */
    SignedXml.prototype.InjectNamespaces = function (namespaces, target, ignoreDefault) {
        for (var i in namespaces) {
            var uri = namespaces[i];
            if (ignoreDefault && i === "") {
                continue;
            }
            target.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    };
    SignedXml.prototype.DigestReference = function (doc, reference, checkHmac) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (reference.Uri) {
                var objectName = void 0;
                if (!reference.Uri.indexOf("#xpointer")) {
                    var uri = reference.Uri;
                    uri = uri.substring(9).replace(/[\r\n\t\s]/g, "");
                    if (uri.length < 2 || uri[0] !== "(" || uri[uri.length - 1] !== ")") {
                        // FIXME: how to handle invalid xpointer?
                        uri = ""; // String.Empty
                    }
                    else {
                        uri = uri.substring(1, uri.length - 1);
                    }
                    if (uri.length > 6 && uri.indexOf("id(") === 0 && uri[uri.length - 1] === ")") {
                        // id('foo'), id("foo")
                        objectName = uri.substring(4, uri.length - 2);
                    }
                }
                else if (reference.Uri[0] === "#") {
                    objectName = reference.Uri.substring(1);
                }
                if (objectName) {
                    var found = null;
                    var xmlSignatureObjects_2 = [_this.XmlSignature.KeyInfo.GetXml()];
                    _this.XmlSignature.ObjectList.ForEach(function (object) {
                        xmlSignatureObjects_2.push(object.GetXml());
                    });
                    for (var _i = 0, xmlSignatureObjects_1 = xmlSignatureObjects_2; _i < xmlSignatureObjects_1.length; _i++) {
                        var xmlSignatureObject = xmlSignatureObjects_1[_i];
                        if (xmlSignatureObject) {
                            found = findById(xmlSignatureObject, objectName);
                            if (found) {
                                var el = found.cloneNode(true);
                                // Copy xmlns from Document
                                _this.CopyNamespaces(doc, el, false);
                                // Copy xmlns from Parent
                                if (_this.Parent) {
                                    var parent = (_this.Parent instanceof XmlCore.XmlObject)
                                        ? _this.Parent.GetXml()
                                        : _this.Parent;
                                    _this.CopyNamespaces(parent, el, true);
                                }
                                _this.CopyNamespaces(found, el, false);
                                _this.InjectNamespaces(_this.GetSignatureNamespaces(), el, true);
                                doc = el;
                                break;
                            }
                        }
                    }
                    if (!found && doc) {
                        found = XmlCore.XmlObject.GetElementById(doc, objectName);
                        if (found) {
                            var el = found.cloneNode(true);
                            _this.CopyNamespaces(found, el, false);
                            _this.CopyNamespaces(doc, el, false);
                            doc = el;
                        }
                    }
                    if (found == null) {
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Cannot get object by reference: " + objectName);
                    }
                }
            }
            var canonOutput = null;
            if (reference.Transforms && reference.Transforms.Count) {
                canonOutput = _this.ApplyTransforms(reference.Transforms, doc);
            }
            else {
                // we must not C14N references from outside the document
                // e.g. non-xml documents
                if (reference.Uri && reference.Uri[0] !== "#") {
                    canonOutput = new XMLSerializer().serializeToString(doc.ownerDocument);
                }
                else {
                    // apply default C14N transformation
                    var excC14N = new XmlDsigC14NTransform();
                    excC14N.LoadInnerXml(doc);
                    canonOutput = excC14N.GetOutput();
                }
            }
            if (!reference.DigestMethod.Algorithm) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "Reference", "DigestMethod");
            }
            var digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
            return digest.Digest(canonOutput);
        });
    };
    SignedXml.prototype.DigestReferences = function (data) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            // we must tell each reference which hash algorithm to use
            // before asking for the SignedInfo XML !
            var promises = _this.XmlSignature.SignedInfo.References.Map(function (ref) {
                // assume SHA-256 if nothing is specified
                if (!ref.DigestMethod.Algorithm) {
                    ref.DigestMethod.Algorithm = new Sha256().namespaceURI;
                }
                return _this.DigestReference(data, ref, false)
                    .then(function (hashValue) {
                    ref.DigestValue = hashValue;
                });
            }).GetIterator();
            return Promise.all(promises);
        });
    };
    SignedXml.prototype.TransformSignedInfo = function (data) {
        var t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);
        var xml = this.XmlSignature.SignedInfo.GetXml();
        if (!xml) {
            throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");
        }
        var node = xml.cloneNode(true);
        //#region Get root namespaces
        // Get xmlns from SignedInfo
        this.CopyNamespaces(xml, node, false);
        if (data) {
            // Get xmlns from Document
            if (data.nodeType === XmlCore.XmlNodeType.Document) {
                this.CopyNamespaces(data.documentElement, node, false);
            }
            else {
                this.CopyNamespaces(data, node, false);
            }
        }
        if (this.Parent) {
            // Get xmlns from Parent
            var parentXml = (this.Parent instanceof XmlCore.XmlObject)
                ? this.Parent.GetXml()
                : this.Parent;
            if (parentXml) {
                this.CopyNamespaces(parentXml, node, false);
            }
        }
        //#endregion
        var childNamespaces = XmlCore.SelectNamespaces(xml);
        for (var i in childNamespaces) {
            var uri = childNamespaces[i];
            if (i === node.prefix) {
                continue;
            }
            node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
        t.LoadInnerXml(node);
        var res = t.GetOutput();
        return res;
    };
    SignedXml.prototype.ResolveFilterTransform = function (transform) {
        var split = transform.split(" ");
        if (split.length !== 3) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_TRANSFORM_FILTER, transform);
        }
        var filterMethod = split[1].trim();
        var xPath = split[2].trim();
        return new XmlDsigDisplayFilterTransform({
            Filter: filterMethod,
            XPath: xPath,
        });
    };
    SignedXml.prototype.ResolveTransform = function (transform) {
        switch (transform) {
            case "enveloped":
                return new XmlDsigEnvelopedSignatureTransform();
            case "c14n":
                return new XmlDsigC14NTransform();
            case "c14n-com":
                return new XmlDsigC14NWithCommentsTransform();
            case "exc-c14n":
                return new XmlDsigExcC14NTransform();
            case "exc-c14n-com":
                return new XmlDsigExcC14NWithCommentsTransform();
            case "base64":
                return new XmlDsigBase64Transform();
            default:
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, transform);
        }
    };
    SignedXml.prototype.ApplyTransforms = function (transforms, input) {
        var output = null;
        // console.log('before applying reordering:');
        // console.log(transforms.items.map(item => item._Algorithm).join(', '));
        var ordered = new Transforms();
        transforms.Filter(function (element) { return element instanceof XmlDsigDisplayFilterTransform; }) //
            .ForEach(function (element) { return ordered.Add(element); });
        transforms.Filter(function (element) { return element instanceof XmlDsigEnvelopedSignatureTransform; }) //
            .ForEach(function (element) { return ordered.Add(element); });
        transforms.Filter(function (element) {
            return !(element instanceof XmlDsigEnvelopedSignatureTransform || //
                element instanceof XmlDsigDisplayFilterTransform);
        }).ForEach(function (element) { return ordered.Add(element); });
        ordered.ForEach(function (transform) {
            // Apply transforms
            if (transform instanceof XmlDsigC14NWithCommentsTransform) {
                transform = new XmlDsigC14NTransform(); // TODO: Check RFC for it
            }
            if (transform instanceof XmlDsigExcC14NWithCommentsTransform) {
                transform = new XmlDsigExcC14NTransform(); // TODO: Check RFC for it
            }
            transform.LoadInnerXml(input);
            output = transform.GetOutput();
        });
        // console.log('after applying reordering:');
        // console.log(ordered.items.map(item => item._Algorithm).join(', '));
        // Apply C14N transform if Reference has only one transform EnvelopedSignature
        if (ordered.Count === 1 && ordered.Item(0) instanceof XmlDsigEnvelopedSignatureTransform) {
            var c14n = new XmlDsigC14NTransform();
            c14n.LoadInnerXml(input);
            output = c14n.GetOutput();
        }
        return output;
    };
    SignedXml.prototype.ApplySignOptions = function (signature, algorithm, key, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Promise.resolve()
            .then(function () {
            // id
            if (options.id) {
                _this.XmlSignature.Id = options.id;
            }
            // keyValue
            if (options.keyValue && key.algorithm.name.toUpperCase() !== HMAC) {
                if (!signature.KeyInfo) {
                    signature.KeyInfo = new KeyInfo();
                }
                var keyInfo = signature.KeyInfo;
                var keyValue = new KeyValue();
                keyInfo.Add(keyValue);
                return keyValue.importKey(options.keyValue);
            }
            else {
                return Promise.resolve();
            }
        })
            .then(function () {
            // x509
            if (options.x509) {
                if (!signature.KeyInfo) {
                    signature.KeyInfo = new KeyInfo();
                }
                var keyInfo_1 = signature.KeyInfo;
                options.x509.forEach(function (x509) {
                    var raw = XmlCore.Convert.FromBase64(x509);
                    var x509Data = new KeyInfoX509Data(raw);
                    keyInfo_1.Add(x509Data);
                });
            }
            return Promise.resolve();
        })
            .then(function () {
            // references
            if (options.references) {
                options.references.forEach(function (item) {
                    var reference = new Reference();
                    // Id
                    if (item.id) {
                        reference.Id = item.id;
                    }
                    // Uri
                    if (item.uri !== null && item.uri !== undefined) {
                        reference.Uri = item.uri;
                    }
                    // Type
                    if (item.type) {
                        reference.Type = item.type;
                    }
                    // DigestMethod
                    var digestAlgorithm = CryptoConfig.GetHashAlgorithm(item.hash);
                    reference.DigestMethod.Algorithm = digestAlgorithm.namespaceURI;
                    // transforms
                    if (item.transforms && item.transforms.length) {
                        var transforms_1 = new Transforms();
                        item.transforms.forEach(function (transform) {
                            if (transform.startsWith("filter")) {
                                transforms_1.Add(_this.ResolveFilterTransform(transform));
                            }
                            else {
                                transforms_1.Add(_this.ResolveTransform(transform));
                            }
                        });
                        reference.Transforms = transforms_1;
                    }
                    if (!signature.SignedInfo.References) {
                        signature.SignedInfo.References = new References();
                    }
                    signature.SignedInfo.References.Add(reference);
                });
            }
            // Set default values
            if (!signature.SignedInfo.References.Count) {
                // Add default Reference
                var reference = new Reference();
                signature.SignedInfo.References.Add(reference);
            }
            return Promise.resolve();
        });
    };
    SignedXml.prototype.ValidateReferences = function (doc) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            return Promise.all(_this.XmlSignature.SignedInfo.References.Map(function (ref) {
                return _this.DigestReference(doc, ref, false)
                    .then(function (digest) {
                    var b64Digest = XmlCore.Convert.ToBase64(digest);
                    var b64DigestValue = XmlCore.Convert.ToString(ref.DigestValue, "base64");
                    if (b64Digest !== b64DigestValue) {
                        var errText = "Invalid digest for uri '" + ref.Uri + "'. Calculated digest is " + b64Digest + " but the xml to validate supplies digest " + b64DigestValue;
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, errText);
                    }
                    return Promise.resolve(true);
                });
            }).GetIterator());
        })
            .then(function () { return true; });
    };
    SignedXml.prototype.ValidateSignatureValue = function (keys) {
        var _this = this;
        var signer;
        var signedInfoCanon;
        return Promise.resolve()
            .then(function () {
            signedInfoCanon = _this.TransformSignedInfo(_this.document);
            signer = CryptoConfig.CreateSignatureAlgorithm(_this.XmlSignature.SignedInfo.SignatureMethod);
            // Verify signature for all exported keys
            var chain = Promise.resolve(false);
            keys.forEach(function (key) {
                chain = chain.then(function (v) {
                    if (!v) {
                        return signer.Verify(signedInfoCanon, key, _this.Signature);
                    }
                    return Promise.resolve(v);
                });
            });
            return chain;
        });
    };
    return SignedXml;
}());
function findById(element, id) {
    if (element.nodeType !== XmlCore.XmlNodeType.Element) {
        return null;
    }
    if (element.hasAttribute("Id") && element.getAttribute("Id") === id) {
        return element;
    }
    if (element.childNodes && element.childNodes.length) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var el = findById(element.childNodes[i], id);
            if (el) {
                return el;
            }
        }
    }
    return null;
}
/**
 * Adding new namespace to assoc array.
 * If `name` exists in array then ignore it
 * @param selectedNodes assoc array of namespaces
 * @param name          name of namespace
 * @param namespace     namespace value
 */
function addNamespace(selectedNodes, name, namespace) {
    if (!(name in selectedNodes)) {
        selectedNodes[name] = namespace;
    }
}
// TODO it can be moved to XmlCore
function _SelectRootNamespaces(node, selectedNodes) {
    if (selectedNodes === void 0) { selectedNodes = {}; }
    if (node && node.nodeType === XmlCore.XmlNodeType.Element) {
        var el = node;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
            addNamespace(selectedNodes, el.prefix ? el.prefix : "", node.namespaceURI);
        }
        //#region Select all xmlns attrs
        for (var i = 0; i < el.attributes.length; i++) {
            var attr = el.attributes.item(i);
            if (attr && attr.prefix === "xmlns") {
                addNamespace(selectedNodes, attr.localName ? attr.localName : "", attr.value);
            }
        }
        //#endregion
        if (node.parentNode) {
            _SelectRootNamespaces(node.parentNode, selectedNodes);
        }
    }
}
function SelectRootNamespaces(node) {
    var attrs = {};
    _SelectRootNamespaces(node, attrs);
    return attrs;
}

exports.Select = XmlCore.Select;
exports.Parse = XmlCore.Parse;
exports.Stringify = XmlCore.Stringify;
exports.Application = Application;
exports.XmlCanonicalizer = XmlCanonicalizer;
exports.CryptoConfig = CryptoConfig;
exports.XmlSignature = XmlSignature;
exports.XmlSignatureObject = XmlSignatureObject;
exports.XmlSignatureCollection = XmlSignatureCollection;
exports.CanonicalizationMethod = CanonicalizationMethod;
exports.DataObject = DataObject;
exports.DataObjects = DataObjects;
exports.DigestMethod = DigestMethod;
exports.KeyInfo = KeyInfo;
exports.Reference = Reference;
exports.References = References;
exports.Signature = Signature;
exports.SignatureMethodOther = SignatureMethodOther;
exports.SignatureMethod = SignatureMethod;
exports.SignedInfo = SignedInfo;
exports.XmlDsigBase64Transform = XmlDsigBase64Transform;
exports.XmlDsigC14NTransform = XmlDsigC14NTransform;
exports.XmlDsigC14NWithCommentsTransform = XmlDsigC14NWithCommentsTransform;
exports.XmlDsigEnvelopedSignatureTransform = XmlDsigEnvelopedSignatureTransform;
exports.XmlDsigExcC14NTransform = XmlDsigExcC14NTransform;
exports.XmlDsigExcC14NWithCommentsTransform = XmlDsigExcC14NWithCommentsTransform;
exports.XmlDsigDisplayFilterTransform = XmlDsigDisplayFilterTransform;
exports.Transform = Transform;
exports.Transforms = Transforms;
exports.X509Certificate = X509Certificate;
exports.KeyInfoClause = KeyInfoClause;
exports.KeyValue = KeyValue;
exports.EcdsaPublicKey = EcdsaPublicKey;
exports.NamedCurve = NamedCurve;
exports.DomainParameters = DomainParameters;
exports.EcdsaKeyValue = EcdsaKeyValue;
exports.RsaKeyValue = RsaKeyValue;
exports.MaskGenerationFunction = MaskGenerationFunction;
exports.PssAlgorithmParams = PssAlgorithmParams;
exports.X509IssuerSerial = X509IssuerSerial;
exports.KeyInfoX509Data = KeyInfoX509Data;
exports.SPKIData = SPKIData;
exports.SelectRootNamespaces = SelectRootNamespaces;
exports.SignedXml = SignedXml;

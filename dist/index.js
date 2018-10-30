'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pkijs = require('pkijs');
var XmlCore = require('xml-core');
var tslib_1 = require('tslib');
var Asn1Js = require('asn1js');

let engineCrypto = null;
class Application {
    /**
     * Sets crypto engine for the current Application
     * @param  {string} name
     * @param  {Crypto} crypto
     * @returns void
     */
    static setEngine(name, crypto) {
        engineCrypto = {
            getRandomValues: crypto.getRandomValues.bind(crypto),
            subtle: crypto.subtle,
            name,
        };
        pkijs.setEngine(name, new pkijs.CryptoEngine({ name, crypto, subtle: crypto.subtle }), new pkijs.CryptoEngine({ name, crypto, subtle: crypto.subtle }));
    }
    /**
     * Gets the crypto module from the Application
     */
    static get crypto() {
        if (!engineCrypto) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_NO_MODULE);
        }
        return engineCrypto;
    }
    static isNodePlugin() {
        return (typeof self === "undefined" && typeof window === "undefined");
    }
}
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
class XmlCanonicalizer {
    constructor(withComments, excC14N, propagatedNamespaces = new XmlCore.NamespaceManager()) {
        this.propagatedNamespaces = new XmlCore.NamespaceManager();
        this.result = [];
        this.visibleNamespaces = new XmlCore.NamespaceManager();
        this.inclusiveNamespacesPrefixList = [];
        this.state = exports.XmlCanonicalizerState.BeforeDocElement;
        this.withComments = withComments;
        this.exclusive = excC14N;
        this.propagatedNamespaces = propagatedNamespaces;
    }
    // See xml-enc-c14n specification
    get InclusiveNamespacesPrefixList() {
        return this.inclusiveNamespacesPrefixList.join(" ");
    }
    set InclusiveNamespacesPrefixList(value) {
        this.inclusiveNamespacesPrefixList = value.split(" ");
    }
    Canonicalize(node) {
        if (!node) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Parameter 1 is not Node");
        }
        let node2;
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
        const res = this.result.join("");
        return res;
    }
    WriteNode(node) {
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
                for (let i = 0; i < node.childNodes.length; i++) {
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
    }
    WriteDocumentNode(node) {
        this.state = exports.XmlCanonicalizerState.BeforeDocElement;
        for (let child = node.firstChild; child != null; child = child.nextSibling) {
            this.WriteNode(child);
        }
    }
    WriteCommentNode(node) {
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
    }
    // Text Nodes
    // the string value, except all ampersands are replaced
    // by &amp;, all open angle brackets (<) are replaced by &lt;, all closing
    // angle brackets (>) are replaced by &gt;, and all #xD characters are
    // replaced by &#xD;.
    WriteTextNode(node) {
        // console.log(`WriteTextNode: ${node.nodeName}`);
        this.result.push(this.NormalizeString(node.nodeValue, node.nodeType));
    }
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
    WriteProcessingInstructionNode(node) {
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
    }
    WriteElementNode(node) {
        // console.log(`WriteElementNode: ${node.nodeName}`);
        if (this.state === exports.XmlCanonicalizerState.BeforeDocElement) {
            this.state = exports.XmlCanonicalizerState.InsideDocElement;
        }
        // open tag
        this.result.push("<");
        this.result.push(node.nodeName);
        // namespaces
        let visibleNamespacesCount = this.WriteNamespacesAxis(node);
        // attributes
        this.WriteAttributesAxis(node);
        this.result.push(">");
        for (let n = node.firstChild; n != null; n = n.nextSibling) {
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
    }
    WriteNamespacesAxis(node) {
        const list = [];
        let visibleNamespacesCount = 0;
        for (let i = 0; i < node.attributes.length; i++) {
            const attribute = node.attributes[i];
            if (!IsNamespaceNode(attribute)) {
                // render namespace for attribute, if needed
                if (attribute.prefix && !this.IsNamespaceRendered(attribute.prefix, attribute.namespaceURI)) {
                    const ns = { prefix: attribute.prefix, namespace: attribute.namespaceURI };
                    list.push(ns);
                    this.visibleNamespaces.Add(ns);
                    visibleNamespacesCount++;
                }
                continue;
            }
            if (attribute.localName === "xmlns" && !attribute.prefix && !attribute.nodeValue) {
                const ns = { prefix: attribute.prefix, namespace: attribute.nodeValue };
                list.push(ns);
                this.visibleNamespaces.Add(ns);
                visibleNamespacesCount++;
            }
            // if (attribute.localName === "xmlns")
            //     continue;
            // get namespace prefix
            let prefix = null;
            let matches;
            if (matches = /xmlns:([\w\.]+)/.exec(attribute.nodeName)) {
                prefix = matches[1];
            }
            let printable = true;
            if (this.exclusive && !this.IsNamespaceInclusive(node, prefix)) {
                const used = IsNamespaceUsed(node, prefix);
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
                const ns = { prefix, namespace: attribute.nodeValue };
                list.push(ns);
                this.visibleNamespaces.Add(ns);
                visibleNamespacesCount++;
            }
        }
        if (!this.IsNamespaceRendered(node.prefix, node.namespaceURI) && node.namespaceURI !== "http://www.w3.org/2000/xmlns/") {
            const ns = { prefix: node.prefix, namespace: node.namespaceURI };
            list.push(ns);
            this.visibleNamespaces.Add(ns);
            visibleNamespacesCount++;
        }
        // sort nss
        list.sort(XmlDsigC14NTransformNamespacesComparer);
        let prevPrefix = null;
        list.forEach((n) => {
            if (n.prefix === prevPrefix) {
                return;
            }
            prevPrefix = n.prefix;
            this.result.push(" xmlns");
            if (n.prefix) {
                this.result.push(":" + n.prefix);
            }
            this.result.push("=\"");
            this.result.push(n.namespace); // TODO namespace can be null
            this.result.push("\"");
        });
        return visibleNamespacesCount;
    }
    WriteAttributesAxis(node) {
        // Console.WriteLine ("Debug: attributes");
        const list = [];
        for (let i = 0; i < node.attributes.length; i++) {
            const attribute = node.attributes[i];
            if (!IsNamespaceNode(attribute)) {
                list.push(attribute);
            }
        }
        // sort namespaces and write results
        list.sort(XmlDsigC14NTransformAttributesComparer);
        list.forEach((attribute) => {
            if (attribute != null) {
                this.result.push(" ");
                this.result.push(attribute.nodeName);
                this.result.push("=\"");
                this.result.push(this.NormalizeString(attribute.nodeValue, XmlCore.XmlNodeType.Attribute));
                this.result.push("\"");
            }
        });
    }
    NormalizeString(input, type) {
        const sb = [];
        if (input) {
            for (let i = 0; i < input.length; i++) {
                const ch = input[i];
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
    }
    IsTextNode(type) {
        switch (type) {
            case XmlCore.XmlNodeType.Text:
            case XmlCore.XmlNodeType.CDATA:
            case XmlCore.XmlNodeType.SignificantWhitespace:
            case XmlCore.XmlNodeType.Whitespace:
                return true;
        }
        return false;
    }
    IsNamespaceInclusive(node, prefix) {
        const prefix2 = prefix || null;
        if (node.prefix === prefix2) {
            return false;
        }
        return this.inclusiveNamespacesPrefixList.indexOf(prefix2 || "") !== -1; // && node.prefix === prefix;
    }
    IsNamespaceRendered(prefix, uri) {
        prefix = prefix || "";
        uri = uri || "";
        if (!prefix && !uri) {
            return true;
        }
        if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace") {
            return true;
        }
        const ns = this.visibleNamespaces.GetPrefix(prefix);
        if (ns) {
            return ns.namespace === uri;
        }
        return false;
    }
}
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
    const left = x.namespaceURI + x.localName;
    const right = y.namespaceURI + y.localName;
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
function IsNamespaceUsed(node, prefix, result = 0) {
    const prefix2 = prefix || null;
    if (node.prefix === prefix2) {
        return ++result;
    }
    // prefix of attributes
    if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (!IsNamespaceNode(attr) && prefix && node.attributes[i].prefix === prefix) {
                return ++result;
            }
        }
    }
    // check prefix of Element
    for (let n = node.firstChild; !!n; n = n.nextSibling) {
        if (n.nodeType === XmlCore.XmlNodeType.Element) {
            const el = n;
            const res = IsNamespaceUsed(el, prefix, result);
            if (n.nodeType === XmlCore.XmlNodeType.Element && res) {
                return ++result + res;
            }
        }
    }
    return result;
}
function IsNamespaceNode(node) {
    const reg = /xmlns:/;
    if (node !== null && node.nodeType === XmlCore.XmlNodeType.Attribute && (node.nodeName === "xmlns" || reg.test(node.nodeName))) {
        return true;
    }
    return false;
}

const XmlSignature = {
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

exports.XmlSignatureObject = class XmlSignatureObject extends XmlCore.XmlObject {
};
exports.XmlSignatureObject = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: "xmldsig",
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
    })
], exports.XmlSignatureObject);
exports.XmlSignatureCollection = class XmlSignatureCollection extends XmlCore.XmlCollection {
};
exports.XmlSignatureCollection = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: "xmldsig_collection",
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
    })
], exports.XmlSignatureCollection);

class KeyInfoClause extends exports.XmlSignatureObject {
}

class XmlAlgorithm {
    getAlgorithmName() {
        return this.namespaceURI;
    }
}
class HashAlgorithm extends XmlAlgorithm {
    Digest(xml) {
        return Promise.resolve()
            .then(() => {
            // console.log("HashedInfo:", xml);
            let buf;
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
                const txt = new XMLSerializer().serializeToString(xml);
                buf = XmlCore.Convert.FromString(txt, "utf8");
            }
            return Application.crypto.subtle.digest(this.algorithm, buf);
        })
            .then((hash) => {
            return new Uint8Array(hash);
        });
    }
}
class SignatureAlgorithm extends XmlAlgorithm {
    /**
     * Sign the given string using the given key
     */
    Sign(signedInfo, signingKey, algorithm) {
        // console.log("Sign:\n%s\n", signedInfo);
        const info = XmlCore.Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.sign(algorithm, signingKey, info);
    }
    /**
     * Verify the given signature of the given string using key
     */
    Verify(signedInfo, key, signatureValue, algorithm) {
        // console.log("Verify:\n%s\n", signedInfo);
        const info = XmlCore.Convert.FromString(signedInfo, "utf8");
        return Application.crypto.subtle.verify((algorithm || this.algorithm), key, signatureValue, info);
    }
}

const SHA1 = "SHA-1";
const SHA256 = "SHA-256";
const SHA384 = "SHA-384";
const SHA512 = "SHA-512";
const SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
const SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
const SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#sha384";
const SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";
class Sha1 extends HashAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = { name: SHA1 };
        this.namespaceURI = SHA1_NAMESPACE;
    }
}
class Sha256 extends HashAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = { name: SHA256 };
        this.namespaceURI = SHA256_NAMESPACE;
    }
}
class Sha384 extends HashAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = { name: SHA384 };
        this.namespaceURI = SHA384_NAMESPACE;
    }
}
class Sha512 extends HashAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = { name: SHA512 };
        this.namespaceURI = SHA512_NAMESPACE;
    }
}

const ECDSA = "ECDSA";
const ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
const ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
const ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
const ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
class EcdsaSha1 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA1,
            },
        };
        this.namespaceURI = ECDSA_SHA1_NAMESPACE;
    }
}
class EcdsaSha256 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA256,
            },
        };
        this.namespaceURI = ECDSA_SHA256_NAMESPACE;
    }
}
class EcdsaSha384 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA384,
            },
        };
        this.namespaceURI = ECDSA_SHA384_NAMESPACE;
    }
}
class EcdsaSha512 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: ECDSA,
            hash: {
                name: SHA512,
            },
        };
        this.namespaceURI = ECDSA_SHA512_NAMESPACE;
    }
}

const HMAC = "HMAC";
const HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
const HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
const HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
const HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
class HmacSha1 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA1,
            },
        };
        this.namespaceURI = HMAC_SHA1_NAMESPACE;
    }
}
class HmacSha256 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA256,
            },
        };
        this.namespaceURI = HMAC_SHA256_NAMESPACE;
    }
}
class HmacSha384 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA384,
            },
        };
        this.namespaceURI = HMAC_SHA384_NAMESPACE;
    }
}
class HmacSha512 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: HMAC,
            hash: {
                name: SHA512,
            },
        };
        this.namespaceURI = HMAC_SHA512_NAMESPACE;
    }
}

const RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
const RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
const RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
const RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
const RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
class RsaPkcs1Sha1 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA1,
            },
        };
        this.namespaceURI = RSA_PKCS1_SHA1_NAMESPACE;
    }
}
class RsaPkcs1Sha256 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA256,
            },
        };
        this.namespaceURI = RSA_PKCS1_SHA256_NAMESPACE;
    }
}
class RsaPkcs1Sha384 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA384,
            },
        };
        this.namespaceURI = RSA_PKCS1_SHA384_NAMESPACE;
    }
}
class RsaPkcs1Sha512 extends SignatureAlgorithm {
    constructor() {
        super(...arguments);
        this.algorithm = {
            name: RSA_PKCS1,
            hash: {
                name: SHA512,
            },
        };
        this.namespaceURI = RSA_PKCS1_SHA512_NAMESPACE;
    }
}

const RSA_PSS = "RSA-PSS";
const RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
class RsaPssBase extends SignatureAlgorithm {
    constructor(saltLength) {
        super();
        this.algorithm = {
            name: RSA_PSS,
            hash: {
                name: SHA1,
            },
        };
        this.namespaceURI = RSA_PSS_WITH_PARAMS_NAMESPACE;
        if (saltLength) {
            this.algorithm.saltLength = saltLength;
        }
    }
}
class RsaPssSha1 extends RsaPssBase {
    constructor(saltLength) {
        super(saltLength);
        this.algorithm.hash.name = SHA1;
    }
}
class RsaPssSha256 extends RsaPssBase {
    constructor(saltLength) {
        super(saltLength);
        this.algorithm.hash.name = SHA256;
    }
}
class RsaPssSha384 extends RsaPssBase {
    constructor(saltLength) {
        super(saltLength);
        this.algorithm.hash.name = SHA384;
    }
}
class RsaPssSha512 extends RsaPssBase {
    constructor(saltLength) {
        super(saltLength);
        this.algorithm.hash.name = SHA512;
    }
}

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
exports.CanonicalizationMethod = class CanonicalizationMethod extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: XmlSignature.DefaultCanonMethod,
    })
], exports.CanonicalizationMethod.prototype, "Algorithm", void 0);
exports.CanonicalizationMethod = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.CanonicalizationMethod,
    })
], exports.CanonicalizationMethod);

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
exports.DataObject = class DataObject extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: "",
    })
], exports.DataObject.prototype, "Id", void 0);
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.MimeType,
        defaultValue: "",
    })
], exports.DataObject.prototype, "MimeType", void 0);
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Encoding,
        defaultValue: "",
    })
], exports.DataObject.prototype, "Encoding", void 0);
exports.DataObject = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.Object,
    })
], exports.DataObject);
exports.DataObjects = class DataObjects extends exports.XmlSignatureCollection {
};
exports.DataObjects = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: "xmldsig_objects",
        parser: exports.DataObject,
    })
], exports.DataObjects);

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
exports.DigestMethod = class DigestMethod extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: XmlSignature.DefaultDigestMethod,
    })
], exports.DigestMethod.prototype, "Algorithm", void 0);
exports.DigestMethod = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.DigestMethod,
    })
], exports.DigestMethod);

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
exports.KeyInfo = class KeyInfo extends exports.XmlSignatureCollection {
    OnLoadXml(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes.item(i);
            if (node.nodeType !== XmlCore.XmlNodeType.Element) {
                continue;
            }
            let KeyInfoClass = null;
            switch (node.localName) {
                case XmlSignature.ElementNames.KeyValue:
                    KeyInfoClass = exports.KeyValue;
                    break;
                case XmlSignature.ElementNames.X509Data:
                    KeyInfoClass = exports.KeyInfoX509Data;
                    break;
                case XmlSignature.ElementNames.SPKIData:
                    KeyInfoClass = exports.SPKIData;
                    break;
                case XmlSignature.ElementNames.KeyName:
                case XmlSignature.ElementNames.RetrievalMethod:
                case XmlSignature.ElementNames.PGPData:
                case XmlSignature.ElementNames.MgmtData:
            }
            if (KeyInfoClass) {
                const item = new KeyInfoClass();
                item.LoadXml(node);
                if (item instanceof exports.KeyValue) {
                    // Read KeyValue
                    let keyValue = null;
                    [exports.RsaKeyValue, exports.EcdsaKeyValue].some((KeyClass) => {
                        try {
                            const k = new KeyClass();
                            for (let j = 0; j < node.childNodes.length; j++) {
                                const nodeKey = node.childNodes.item(j);
                                if (nodeKey.nodeType !== XmlCore.XmlNodeType.Element) {
                                    continue;
                                }
                                k.LoadXml(nodeKey);
                                keyValue = k;
                                return true;
                            }
                        }
                        catch (e) { /* none */ }
                        return false;
                    });
                    if (keyValue) {
                        item.Value = keyValue;
                    }
                    else {
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "Unsupported KeyValue in use");
                    }
                    item.GetXml();
                }
                this.Add(item);
            }
        }
    }
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: "",
    })
], exports.KeyInfo.prototype, "Id", void 0);
exports.KeyInfo = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.KeyInfo,
    })
], exports.KeyInfo);

/**
 * The Transform element contains a single transformation
 */
exports.Transform = class Transform extends exports.XmlSignatureObject {
    /**
     * The Transform element contains a single transformation
     */
    constructor() {
        super(...arguments);
        this.innerXml = null;
    }
    // Public methods
    /**
     * When overridden in a derived class, returns the output of the current Transform object.
     */
    GetOutput() {
        throw new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_IMPLEMENTED);
    }
    LoadInnerXml(node) {
        if (!node) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "node");
        }
        this.innerXml = node;
    }
    GetInnerXml() {
        return this.innerXml;
    }
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        defaultValue: "",
    })
], exports.Transform.prototype, "Algorithm", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.XPath,
        defaultValue: "",
    })
], exports.Transform.prototype, "XPath", void 0);
exports.Transform = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.Transform,
    })
], exports.Transform);

class XmlDsigBase64Transform extends exports.Transform {
    constructor() {
        super(...arguments);
        this.Algorithm = XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform;
    }
    /**
     * Returns the output of the current XmlDsigBase64Transform object
     */
    GetOutput() {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return XmlCore.Convert.FromString(this.innerXml.textContent || "", "base64");
    }
}

/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
class XmlDsigC14NTransform extends exports.Transform {
    constructor() {
        super(...arguments);
        this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
        this.xmlCanonicalizer = new XmlCanonicalizer(false, false);
    }
    /**
     * Returns the output of the current XmlDSigC14NTransform object.
     * @returns string
     */
    GetOutput() {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    }
}
/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
class XmlDsigC14NWithCommentsTransform extends XmlDsigC14NTransform {
    constructor() {
        super(...arguments);
        this.Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments";
        this.xmlCanonicalizer = new XmlCanonicalizer(true, false);
    }
}

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
class XmlDsigEnvelopedSignatureTransform extends exports.Transform {
    constructor() {
        super(...arguments);
        this.Algorithm = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
    }
    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    GetOutput() {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        const signature = XmlCore.Select(this.innerXml, ".//*[local-name(.)='Signature' and namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']")[0];
        if (signature) {
            signature.parentNode.removeChild(signature);
        }
        return this.innerXml;
    }
}

/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
class XmlDsigExcC14NTransform extends exports.Transform {
    constructor() {
        super(...arguments);
        this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
        this.xmlCanonicalizer = new XmlCanonicalizer(false, true);
    }
    /**
     * Gets or sets a string that contains namespace prefixes to canonicalize
     * using the standard canonicalization algorithm.
     */
    get InclusiveNamespacesPrefixList() {
        return this.xmlCanonicalizer.InclusiveNamespacesPrefixList;
    }
    set InclusiveNamespacesPrefixList(value) {
        this.xmlCanonicalizer.InclusiveNamespacesPrefixList = value;
    }
    /**
     * Returns the output of the current XmlDsigExcC14NTransform object
     */
    GetOutput() {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    }
}
/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
class XmlDsigExcC14NWithCommentsTransform extends XmlDsigExcC14NTransform {
    constructor() {
        super(...arguments);
        this.Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
        this.xmlCanonicalizer = new XmlCanonicalizer(true, true);
    }
}

//N.B. This does not apply any XPath filters to the original doc, it exists only to ensure that the XPath filter information is included in the signature
let XPathDisplayFilterObject = class XPathDisplayFilterObject extends exports.XmlSignatureObject {
};
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

/*
<Transform Algorithm="http://www.w3.org/2002/06/xmldsig-filter2">
    <XPath xmlns="http://www.w3.org/2002/06/xmldsig-filter2" Filter="intersect">//RenderedData</XPath>
</Transform>
*/
//N.B. This does not apply any XPath filters to the original doc, it exists only to ensure that the XPath filter information is included in the signature
class XmlDsigDisplayFilterTransform extends exports.Transform {
    constructor(params) {
        super();
        this.Algorithm = "http://www.w3.org/2002/06/xmldsig-filter2";
        if (params == null)
            throw Error("params is undefined");
        this.XPathFilter = new XPathDisplayFilterObject();
        this.XPathFilter.Prefix = "";
        this.XPathFilter.XPath = params.XPath;
        this.XPathFilter.Filter = params.Filter;
    }
    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    GetOutput() {
        if (!this.innerXml) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "innerXml");
        }
        return this.innerXml;
    }
}
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: "XPath",
        required: true,
        parser: XPathDisplayFilterObject,
        prefix: "",
        namespaceURI: XmlSignature.NamespaceURI
    })
], XmlDsigDisplayFilterTransform.prototype, "XPathFilter", void 0);

/**
 * The Transforms element contains a collection of transformations
 */
exports.Transforms = class Transforms extends exports.XmlSignatureCollection {
    OnLoadXml(element) {
        super.OnLoadXml(element);
        // Update parsed objects
        this.items = this.GetIterator().map((item) => {
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
    }
};
exports.Transforms = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.Transforms,
        parser: exports.Transform,
    })
], exports.Transforms);
function ChangeTransform(t1, t2) {
    const t = new t2();
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
exports.Reference = class Reference extends exports.XmlSignatureObject {
    constructor(uri) {
        super();
        if (uri) {
            this.Uri = uri;
        }
    }
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        defaultValue: "",
    })
], exports.Reference.prototype, "Id", void 0);
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.URI,
    })
], exports.Reference.prototype, "Uri", void 0);
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Type,
        defaultValue: "",
    })
], exports.Reference.prototype, "Type", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.Transforms,
    })
], exports.Reference.prototype, "Transforms", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        required: true,
        parser: exports.DigestMethod,
    })
], exports.Reference.prototype, "DigestMethod", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        required: true,
        localName: XmlSignature.ElementNames.DigestValue,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.Reference.prototype, "DigestValue", void 0);
exports.Reference = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.Reference,
    })
], exports.Reference);
exports.References = class References extends exports.XmlSignatureCollection {
};
exports.References = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: "References",
        parser: exports.Reference,
    })
], exports.References);

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
exports.SignatureMethodOther = class SignatureMethodOther extends exports.XmlSignatureCollection {
    OnLoadXml(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const node = element.childNodes.item(i);
            if (node.nodeType !== XmlCore.XmlNodeType.Element ||
                node.nodeName === XmlSignature.ElementNames.HMACOutputLength) { // Exclude HMACOutputLength
                continue;
            }
            let ParserClass;
            switch (node.localName) {
                case XmlSignature.ElementNames.RSAPSSParams:
                    ParserClass = exports.PssAlgorithmParams;
                    break;
                default:
                    break;
            }
            if (ParserClass) {
                const xml = new ParserClass();
                xml.LoadXml(node);
                this.Add(xml);
            }
        }
    }
};
exports.SignatureMethodOther = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: "Other",
    })
], exports.SignatureMethodOther);
exports.SignatureMethod = class SignatureMethod extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        required: true,
        defaultValue: "",
    })
], exports.SignatureMethod.prototype, "Algorithm", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.HMACOutputLength,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        converter: XmlCore.XmlNumberConverter,
    })
], exports.SignatureMethod.prototype, "HMACOutputLength", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.SignatureMethodOther,
        noRoot: true,
        minOccurs: 0,
    })
], exports.SignatureMethod.prototype, "Any", void 0);
exports.SignatureMethod = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.SignatureMethod,
    })
], exports.SignatureMethod);

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
exports.SignedInfo = class SignedInfo extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: "",
    })
], exports.SignedInfo.prototype, "Id", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.CanonicalizationMethod,
        required: true,
    })
], exports.SignedInfo.prototype, "CanonicalizationMethod", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.SignatureMethod,
        required: true,
    })
], exports.SignedInfo.prototype, "SignatureMethod", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.References,
        minOccurs: 1,
        noRoot: true,
    })
], exports.SignedInfo.prototype, "References", void 0);
exports.SignedInfo = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.SignedInfo,
    })
], exports.SignedInfo);

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
exports.Signature = class Signature extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Id,
        defaultValue: "",
    })
], exports.Signature.prototype, "Id", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.SignedInfo,
        required: true,
    })
], exports.Signature.prototype, "SignedInfo", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.SignatureValue,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        required: true,
        converter: XmlCore.XmlBase64Converter,
        defaultValue: null,
    })
], exports.Signature.prototype, "SignatureValue", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.KeyInfo,
    })
], exports.Signature.prototype, "KeyInfo", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.DataObjects,
        noRoot: true,
    })
], exports.Signature.prototype, "ObjectList", void 0);
exports.Signature = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.Signature,
    })
], exports.Signature);

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
const NAMESPACE_URI = "http://www.w3.org/2001/04/xmldsig-more#";
const PREFIX = "ecdsa";
exports.EcdsaPublicKey = class EcdsaPublicKey extends XmlCore.XmlObject {
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.X,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
        required: true,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.EcdsaPublicKey.prototype, "X", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.Y,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
        required: true,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.EcdsaPublicKey.prototype, "Y", void 0);
exports.EcdsaPublicKey = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.PublicKey,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
    })
], exports.EcdsaPublicKey);
exports.NamedCurve = class NamedCurve extends XmlCore.XmlObject {
};
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.URI,
        required: true,
    })
], exports.NamedCurve.prototype, "Uri", void 0);
exports.NamedCurve = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.NamedCurve,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
    })
], exports.NamedCurve);
exports.DomainParameters = class DomainParameters extends XmlCore.XmlObject {
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.NamedCurve,
    })
], exports.DomainParameters.prototype, "NamedCurve", void 0);
exports.DomainParameters = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.DomainParameters,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
    })
], exports.DomainParameters);
/**
 * Represents the <ECKeyValue> element of an XML signature.
 */
exports.EcdsaKeyValue = class EcdsaKeyValue extends KeyInfoClause {
    /**
     * Represents the <ECKeyValue> element of an XML signature.
     */
    constructor() {
        super(...arguments);
        this.name = XmlSignature.ElementNames.ECDSAKeyValue;
        this.key = null;
        this.jwk = null;
        this.keyUsage = null;
    }
    /**
     * Gets the NamedCurve value of then public key
     */
    get NamedCurve() {
        return GetNamedCurveOid(this.DomainParameters.NamedCurve.Uri);
    }
    /**
     * Imports key to the ECKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    importKey(key) {
        return new Promise((resolve, reject) => {
            if (key.algorithm.name.toUpperCase() !== "ECDSA") {
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            }
            this.key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then((jwk) => {
                this.jwk = jwk;
                this.PublicKey = new exports.EcdsaPublicKey();
                this.PublicKey.X = XmlCore.Convert.FromString(jwk.x, "base64url");
                this.PublicKey.Y = XmlCore.Convert.FromString(jwk.y, "base64url");
                if (!this.DomainParameters) {
                    this.DomainParameters = new exports.DomainParameters();
                }
                if (!this.DomainParameters.NamedCurve) {
                    this.DomainParameters.NamedCurve = new exports.NamedCurve();
                }
                this.DomainParameters.NamedCurve.Uri = GetNamedCurveOid(jwk.crv);
                this.keyUsage = key.usages;
                return Promise.resolve(this);
            })
                .then(resolve, reject);
        });
    }
    /**
     * Exports key from the ECKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    exportKey(alg) {
        return Promise.resolve()
            .then(() => {
            if (this.key) {
                return this.key;
            }
            // fill jwk
            const x = XmlCore.Convert.ToBase64Url(this.PublicKey.X);
            const y = XmlCore.Convert.ToBase64Url(this.PublicKey.Y);
            const crv = GetNamedCurveFromOid(this.DomainParameters.NamedCurve.Uri);
            const jwk = {
                kty: "EC",
                crv: crv,
                x,
                y,
                ext: true,
            };
            this.keyUsage = ["verify"];
            return Application.crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: crv }, true, this.keyUsage);
        })
            .then((key) => {
            this.key = key;
            return this.key;
        });
    }
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.DomainParameters,
    })
], exports.EcdsaKeyValue.prototype, "DomainParameters", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.EcdsaPublicKey,
        required: true,
    })
], exports.EcdsaKeyValue.prototype, "PublicKey", void 0);
exports.EcdsaKeyValue = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.ECDSAKeyValue,
        namespaceURI: NAMESPACE_URI,
        prefix: PREFIX,
    })
], exports.EcdsaKeyValue);
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

var PssAlgorithmParams_1;
/**
 * Represents the <RSAKeyValue> element of an XML signature.
 */
exports.RsaKeyValue = class RsaKeyValue extends KeyInfoClause {
    /**
     * Represents the <RSAKeyValue> element of an XML signature.
     */
    constructor() {
        super(...arguments);
        this.key = null;
        this.jwk = null;
        this.keyUsage = [];
    }
    /**
     * Imports key to the RSAKeyValue object
     * @param  {CryptoKey} key
     * @returns Promise
     */
    importKey(key) {
        return new Promise((resolve, reject) => {
            const algName = key.algorithm.name.toUpperCase();
            if (algName !== RSA_PKCS1.toUpperCase() && algName !== RSA_PSS.toUpperCase()) {
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_WRONG_NAME, key.algorithm.name);
            }
            this.key = key;
            Application.crypto.subtle.exportKey("jwk", key)
                .then((jwk) => {
                this.jwk = jwk;
                this.Modulus = XmlCore.Convert.FromBase64Url(jwk.n);
                this.Exponent = XmlCore.Convert.FromBase64Url(jwk.e);
                this.keyUsage = key.usages;
                return Promise.resolve(this);
            })
                .then(resolve, reject);
        });
    }
    /**
     * Exports key from the RSAKeyValue object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    exportKey(alg) {
        return new Promise((resolve, reject) => {
            if (this.key) {
                return resolve(this.key);
            }
            // fill jwk
            if (!this.Modulus) {
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Modulus");
            }
            const modulus = XmlCore.Convert.ToBase64Url(this.Modulus);
            if (!this.Exponent) {
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "RsaKeyValue has no Exponent");
            }
            const exponent = XmlCore.Convert.ToBase64Url(this.Exponent);
            let algJwk;
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
            const jwk = {
                kty: "RSA",
                alg: algJwk,
                n: modulus,
                e: exponent,
                ext: true,
            };
            Application.crypto.subtle.importKey("jwk", jwk, alg, true, this.keyUsage)
                .then(resolve, reject);
        });
    }
    /**
     * Loads an RSA key clause from an XML element.
     * @param  {Element | string} element
     * @returns void
     */
    LoadXml(node) {
        super.LoadXml(node);
        this.keyUsage = ["verify"];
    }
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.Modulus,
        prefix: XmlSignature.DefaultPrefix,
        namespaceURI: XmlSignature.NamespaceURI,
        required: true,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.RsaKeyValue.prototype, "Modulus", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.Exponent,
        prefix: XmlSignature.DefaultPrefix,
        namespaceURI: XmlSignature.NamespaceURI,
        required: true,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.RsaKeyValue.prototype, "Exponent", void 0);
exports.RsaKeyValue = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.RSAKeyValue,
    })
], exports.RsaKeyValue);
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
const NAMESPACE_URI$1 = "http://www.w3.org/2007/05/xmldsig-more#";
const PREFIX$1 = "pss";
exports.MaskGenerationFunction = class MaskGenerationFunction extends XmlCore.XmlObject {
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.DigestMethod,
    })
], exports.MaskGenerationFunction.prototype, "DigestMethod", void 0);
tslib_1.__decorate([
    XmlCore.XmlAttribute({
        localName: XmlSignature.AttributeNames.Algorithm,
        defaultValue: "http://www.w3.org/2007/05/xmldsig-more#MGF1",
    })
], exports.MaskGenerationFunction.prototype, "Algorithm", void 0);
exports.MaskGenerationFunction = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.MaskGenerationFunction,
        prefix: PREFIX$1,
        namespaceURI: NAMESPACE_URI$1,
    })
], exports.MaskGenerationFunction);
exports.PssAlgorithmParams = PssAlgorithmParams_1 = class PssAlgorithmParams extends XmlCore.XmlObject {
    constructor(algorithm) {
        super();
        if (algorithm) {
            this.FromAlgorithm(algorithm);
        }
    }
    static FromAlgorithm(algorithm) {
        return new PssAlgorithmParams_1(algorithm);
    }
    FromAlgorithm(algorithm) {
        this.DigestMethod = new exports.DigestMethod();
        const digest = CryptoConfig.GetHashAlgorithm(algorithm.hash);
        this.DigestMethod.Algorithm = digest.namespaceURI;
        if (algorithm.saltLength) {
            this.SaltLength = algorithm.saltLength;
        }
    }
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.DigestMethod,
    })
], exports.PssAlgorithmParams.prototype, "DigestMethod", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        parser: exports.MaskGenerationFunction,
    })
], exports.PssAlgorithmParams.prototype, "MGF", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        converter: XmlCore.XmlNumberConverter,
        prefix: PREFIX$1,
        namespaceURI: NAMESPACE_URI$1,
    })
], exports.PssAlgorithmParams.prototype, "SaltLength", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        converter: XmlCore.XmlNumberConverter,
    })
], exports.PssAlgorithmParams.prototype, "TrailerField", void 0);
exports.PssAlgorithmParams = PssAlgorithmParams_1 = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.RSAPSSParams,
        prefix: PREFIX$1,
        namespaceURI: NAMESPACE_URI$1,
    })
], exports.PssAlgorithmParams);

/**
 * Represents the <KeyValue> element of an XML signature.
 */
exports.KeyValue = class KeyValue extends KeyInfoClause {
    constructor(value) {
        super();
        if (value) {
            this.Value = value;
        }
    }
    set Value(v) {
        this.element = null;
        this.value = v;
    }
    get Value() {
        return this.value;
    }
    importKey(key) {
        return Promise.resolve()
            .then(() => {
            switch (key.algorithm.name.toUpperCase()) {
                case RSA_PSS.toUpperCase():
                case RSA_PKCS1.toUpperCase():
                    this.Value = new exports.RsaKeyValue();
                    return this.Value.importKey(key);
                case ECDSA.toUpperCase():
                    this.Value = new exports.EcdsaKeyValue();
                    return this.Value.importKey(key);
                default:
                    throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
            }
        })
            .then(() => {
            return this;
        });
    }
    exportKey(alg) {
        return Promise.resolve()
            .then(() => {
            if (!this.Value) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_REFERENCE);
            }
            return this.Value.exportKey(alg);
        });
    }
    OnGetXml(element) {
        if (!this.Value) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, "KeyValue has empty value");
        }
        const node = this.Value.GetXml();
        if (node) {
            element.appendChild(node);
        }
    }
};
exports.KeyValue = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.KeyValue,
    })
], exports.KeyValue);

// tslint:disable-next-line:no-reference
/**
 * List of OIDs
 * Source: https://msdn.microsoft.com/ru-ru/library/windows/desktop/aa386991(v=vs.85).aspx
 */
const OID = {
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
class X509Certificate {
    constructor(rawData) {
        this.publicKey = null;
        if (rawData) {
            const buf = new Uint8Array(rawData);
            this.LoadRaw(buf);
            this.raw = buf;
        }
    }
    /**
     * Gets a serial number of the certificate in BIG INTEGER string format
     */
    get SerialNumber() {
        return this.simpl.serialNumber.valueBlock.toString();
    }
    /**
     * Gets a issuer name of the certificate
     */
    get Issuer() {
        return this.NameToString(this.simpl.issuer);
    }
    /**
     * Gets a subject name of the certificate
     */
    get Subject() {
        return this.NameToString(this.simpl.subject);
    }
    /**
     * Returns a thumbprint of the certificate
     * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
     * @returns PromiseLike
     */
    Thumbprint(algName = "SHA-1") {
        return Application.crypto.subtle.digest(algName, this.raw);
    }
    /**
     * Gets the public key from the X509Certificate
     */
    get PublicKey() {
        return this.publicKey;
    }
    /**
     * Returns DER raw of X509Certificate
     */
    GetRaw() {
        return this.raw;
    }
    /**
     * Returns public key from X509Certificate
     * @param  {Algorithm} algorithm
     * @returns Promise
     */
    exportKey(algorithm) {
        return Promise.resolve()
            .then(() => {
            const alg = {
                algorithm,
                usages: ["verify"],
            };
            if (alg.algorithm.name.toUpperCase() === ECDSA) {
                // Set named curve
                const namedCurveOid = this.simpl.subjectPublicKeyInfo.toJSON().algorithm.algorithmParams.valueBlock.value;
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
                        throw new Error(`Unsupported named curve OID '${namedCurveOid}'`);
                }
            }
            return this.simpl.getPublicKey({ algorithm: alg })
                .then((key) => {
                this.publicKey = key;
                return key;
            });
        });
    }
    //#region Protected methods
    /**
     * Converts X500Name to string
     * @param  {RDN} name X500Name
     * @param  {string} splitter Splitter char. Default ','
     * @returns string Formated string
     * Example:
     * > C=Some name, O=Some organization name, C=RU
     */
    NameToString(name, splitter = ",") {
        const res = [];
        name.typesAndValues.forEach((typeAndValue) => {
            const type = typeAndValue.type;
            const oid = OID[type.toString()];
            const name2 = oid ? oid.short : null;
            res.push(`${name2 ? name2 : type}=${typeAndValue.value.valueBlock.value}`);
        });
        return res.join(splitter + " ");
    }
    /**
     * Loads X509Certificate from DER data
     * @param  {Uint8Array} rawData
     */
    LoadRaw(rawData) {
        this.raw = new Uint8Array(rawData);
        const asn1 = Asn1Js.fromBER(this.raw.buffer);
        this.simpl = new pkijs.Certificate({ schema: asn1.result });
    }
}

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
exports.X509IssuerSerial = class X509IssuerSerial extends exports.XmlSignatureObject {
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.X509IssuerName,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        required: true,
    })
], exports.X509IssuerSerial.prototype, "X509IssuerName", void 0);
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.X509SerialNumber,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        required: true,
    })
], exports.X509IssuerSerial.prototype, "X509SerialNumber", void 0);
exports.X509IssuerSerial = tslib_1.__decorate([
    XmlCore.XmlElement({ localName: XmlSignature.ElementNames.X509IssuerSerial })
], exports.X509IssuerSerial);
(function (X509IncludeOption) {
    X509IncludeOption[X509IncludeOption["None"] = 0] = "None";
    X509IncludeOption[X509IncludeOption["EndCertOnly"] = 1] = "EndCertOnly";
    X509IncludeOption[X509IncludeOption["ExcludeRoot"] = 2] = "ExcludeRoot";
    X509IncludeOption[X509IncludeOption["WholeChain"] = 3] = "WholeChain";
})(exports.X509IncludeOption || (exports.X509IncludeOption = {}));
/**
 * Represents an <X509Data> sub element of an XMLDSIG or XML Encryption <KeyInfo> element.
 */
exports.KeyInfoX509Data = class KeyInfoX509Data extends KeyInfoClause {
    constructor(cert, includeOptions = exports.X509IncludeOption.None) {
        super();
        this.x509crl = null;
        this.SubjectKeyIdList = [];
        this.key = null;
        if (cert) {
            if (cert instanceof Uint8Array) {
                this.AddCertificate(new X509Certificate(cert));
            }
            else if (cert instanceof X509Certificate) {
                switch (includeOptions) {
                    case exports.X509IncludeOption.None:
                    case exports.X509IncludeOption.EndCertOnly:
                        this.AddCertificate(cert);
                        break;
                    case exports.X509IncludeOption.ExcludeRoot:
                        this.AddCertificatesChainFrom(cert, false);
                        break;
                    case exports.X509IncludeOption.WholeChain:
                        this.AddCertificatesChainFrom(cert, true);
                        break;
                }
            }
        }
    }
    /**
     * Gets public key of the X509Data
     */
    get Key() {
        return this.key;
    }
    importKey(key) {
        return Promise.reject(new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_SUPPORTED));
    }
    /**
     * Exports key from X509Data object
     * @param  {Algorithm} alg
     * @returns Promise
     */
    exportKey(alg) {
        return Promise.resolve()
            .then(() => {
            if (this.Certificates.length) {
                return this.Certificates[0].exportKey(alg);
            }
            throw new XmlCore.XmlError(XmlCore.XE.NULL_REFERENCE);
        })
            .then((key) => {
            this.key = key;
            return key;
        });
    }
    /**
     * Gets a list of the X.509v3 certificates contained in the KeyInfoX509Data object.
     */
    get Certificates() {
        return this.X509CertificateList;
    }
    /**
     * Gets or sets the Certificate Revocation List (CRL) contained within the KeyInfoX509Data object.
     */
    get CRL() {
        return this.x509crl;
    }
    set CRL(value) {
        this.x509crl = value;
    }
    /**
     * Gets a list of X509IssuerSerial structures that represent an issuer name and serial number pair.
     */
    get IssuerSerials() {
        return this.IssuerSerialList;
    }
    /**
     * Gets a list of the subject key identifiers (SKIs) contained in the KeyInfoX509Data object.
     */
    get SubjectKeyIds() {
        return this.SubjectKeyIdList;
    }
    /**
     * Gets a list of the subject names of the entities contained in the KeyInfoX509Data object.
     */
    get SubjectNames() {
        return this.SubjectNameList;
    }
    /**
     * Adds the specified X.509v3 certificate to the KeyInfoX509Data.
     * @param  {X509Certificate} certificate
     * @returns void
     */
    AddCertificate(certificate) {
        if (!certificate) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "certificate");
        }
        if (!this.X509CertificateList) {
            this.X509CertificateList = [];
        }
        this.X509CertificateList.push(certificate);
    }
    /**
     * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
     * @param  {string} issuerName
     * @param  {string} serialNumber
     * @returns void
     */
    AddIssuerSerial(issuerName, serialNumber) {
        if (issuerName == null) {
            throw new XmlCore.XmlError(XmlCore.XE.PARAM_REQUIRED, "issuerName");
        }
        if (this.IssuerSerialList == null) {
            this.IssuerSerialList = [];
        }
        const xis = { issuerName, serialNumber };
        this.IssuerSerialList.push(xis);
    }
    /**
     * Adds the specified subject key identifier (SKI) to the KeyInfoX509Data object.
     * @param  {string | Uint8Array} subjectKeyId
     * @returns void
     */
    AddSubjectKeyId(subjectKeyId) {
        if (this.SubjectKeyIdList) {
            this.SubjectKeyIdList = [];
        }
        if (typeof subjectKeyId === "string") {
            if (subjectKeyId != null) {
                let id;
                id = XmlCore.Convert.FromBase64(subjectKeyId);
                this.SubjectKeyIdList.push(id);
            }
        }
        else {
            this.SubjectKeyIdList.push(subjectKeyId);
        }
    }
    /**
     * Adds the subject name of the entity that was issued an X.509v3 certificate to the KeyInfoX509Data object.
     * @param  {string} subjectName
     * @returns void
     */
    AddSubjectName(subjectName) {
        if (this.SubjectNameList == null) {
            this.SubjectNameList = [];
        }
        this.SubjectNameList.push(subjectName);
    }
    /**
     * Returns an XML representation of the KeyInfoX509Data object.
     * @returns Element
     */
    GetXml() {
        const doc = this.CreateDocument();
        const xel = this.CreateElement(doc);
        const prefix = this.GetPrefix();
        // <X509IssuerSerial>
        if ((this.IssuerSerialList != null) && (this.IssuerSerialList.length > 0)) {
            this.IssuerSerialList.forEach((iser) => {
                const isl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerSerial);
                const xin = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509IssuerName);
                xin.textContent = iser.issuerName;
                isl.appendChild(xin);
                const xsn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SerialNumber);
                xsn.textContent = iser.serialNumber;
                isl.appendChild(xsn);
                xel.appendChild(isl);
            });
        }
        // <X509SKI>
        if ((this.SubjectKeyIdList != null) && (this.SubjectKeyIdList.length > 0)) {
            this.SubjectKeyIdList.forEach((skid) => {
                const ski = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SKI);
                ski.textContent = XmlCore.Convert.ToBase64(skid);
                xel.appendChild(ski);
            });
        }
        // <X509SubjectName>
        if ((this.SubjectNameList != null) && (this.SubjectNameList.length > 0)) {
            this.SubjectNameList.forEach((subject) => {
                const sn = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509SubjectName);
                sn.textContent = subject;
                xel.appendChild(sn);
            });
        }
        // <X509Certificate>
        if ((this.X509CertificateList != null) && (this.X509CertificateList.length > 0)) {
            this.X509CertificateList.forEach((x509) => {
                const cert = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509Certificate);
                cert.textContent = XmlCore.Convert.ToBase64(x509.GetRaw());
                xel.appendChild(cert);
            });
        }
        // only one <X509CRL>
        if (this.x509crl != null) {
            const crl = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.X509CRL);
            crl.textContent = XmlCore.Convert.ToBase64(this.x509crl);
            xel.appendChild(crl);
        }
        return xel;
    }
    /**
     * Parses the input XmlElement object and configures the internal state of the KeyInfoX509Data object to match.
     * @param  {Element} element
     * @returns void
     */
    LoadXml(element) {
        super.LoadXml(element);
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
        let xnl = this.GetChildren(XmlSignature.ElementNames.X509IssuerSerial);
        if (xnl) {
            xnl.forEach((xel) => {
                const issuer = exports.XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509IssuerName, XmlSignature.NamespaceURI, true);
                const serial = exports.XmlSignatureObject.GetChild(xel, XmlSignature.ElementNames.X509SerialNumber, XmlSignature.NamespaceURI, true);
                if (issuer && issuer.textContent && serial && serial.textContent) {
                    this.AddIssuerSerial(issuer.textContent, serial.textContent);
                }
            });
        }
        // <X509SKI>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509SKI);
        if (xnl) {
            xnl.forEach((xel) => {
                if (xel.textContent) {
                    const skid = XmlCore.Convert.FromBase64(xel.textContent);
                    this.AddSubjectKeyId(skid);
                }
            });
        }
        // <X509SubjectName>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509SubjectName);
        if (xnl != null) {
            xnl.forEach((xel) => {
                if (xel.textContent) {
                    this.AddSubjectName(xel.textContent);
                }
            });
        }
        // <X509Certificate>
        xnl = this.GetChildren(XmlSignature.ElementNames.X509Certificate);
        if (xnl) {
            xnl.forEach((xel) => {
                if (xel.textContent) {
                    const cert = XmlCore.Convert.FromBase64(xel.textContent);
                    this.AddCertificate(new X509Certificate(cert));
                }
            });
        }
        // only one <X509CRL>
        const x509el = this.GetChild(XmlSignature.ElementNames.X509CRL, false);
        if (x509el && x509el.textContent) {
            this.x509crl = XmlCore.Convert.FromBase64(x509el.textContent);
        }
    }
    // this gets complicated because we must:
    // 1. build the chain using a X509Certificate2 class;
    // 2. test for root using the Mono.Security.X509.X509Certificate class;
    // 3. add the certificates as X509Certificate instances;
    AddCertificatesChainFrom(cert, root) {
        throw new XmlCore.XmlError(XmlCore.XE.METHOD_NOT_IMPLEMENTED);
    }
};
exports.KeyInfoX509Data = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.X509Data,
    })
], exports.KeyInfoX509Data);

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
exports.SPKIData = class SPKIData extends KeyInfoClause {
    importKey(key) {
        return Promise.resolve()
            .then(() => {
            return Application.crypto.subtle.exportKey("spki", key);
        })
            .then((spki) => {
            this.SPKIexp = new Uint8Array(spki);
            this.Key = key;
            return this;
        });
    }
    exportKey(alg) {
        return Promise.resolve()
            .then(() => {
            return Application.crypto.subtle.importKey("spki", this.SPKIexp, alg, true, ["verify"]);
        })
            .then((key) => {
            this.Key = key;
            return key;
        });
    }
};
tslib_1.__decorate([
    XmlCore.XmlChildElement({
        localName: XmlSignature.ElementNames.SPKIexp,
        namespaceURI: XmlSignature.NamespaceURI,
        prefix: XmlSignature.DefaultPrefix,
        required: true,
        converter: XmlCore.XmlBase64Converter,
    })
], exports.SPKIData.prototype, "SPKIexp", void 0);
exports.SPKIData = tslib_1.__decorate([
    XmlCore.XmlElement({
        localName: XmlSignature.ElementNames.SPKIData,
    })
], exports.SPKIData);

const SignatureAlgorithms = {};
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
const HashAlgorithms = {};
HashAlgorithms[SHA1_NAMESPACE] = Sha1;
HashAlgorithms[SHA256_NAMESPACE] = Sha256;
HashAlgorithms[SHA384_NAMESPACE] = Sha384;
HashAlgorithms[SHA512_NAMESPACE] = Sha512;
class CryptoConfig {
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
    static CreateFromName(name) {
        let transform;
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
    }
    static CreateSignatureAlgorithm(method) {
        const alg = SignatureAlgorithms[method.Algorithm] || null;
        if (alg) {
            return new alg();
        }
        else if (method.Algorithm === RSA_PSS_WITH_PARAMS_NAMESPACE) {
            let pssParams;
            method.Any.Some((item) => {
                if (item instanceof exports.PssAlgorithmParams) {
                    pssParams = item;
                }
                return !!pssParams;
            });
            if (pssParams) {
                switch (pssParams.DigestMethod.Algorithm) {
                    case SHA1_NAMESPACE:
                        return new RsaPssSha1(pssParams.SaltLength);
                    case SHA256_NAMESPACE:
                        return new RsaPssSha256(pssParams.SaltLength);
                    case SHA384_NAMESPACE:
                        return new RsaPssSha384(pssParams.SaltLength);
                    case SHA512_NAMESPACE:
                        return new RsaPssSha512(pssParams.SaltLength);
                }
            }
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, `Cannot get params for RSA-PSS algoriithm`);
        }
        throw new Error(`signature algorithm '${method.Algorithm}' is not supported`);
    }
    static CreateHashAlgorithm(namespace) {
        const alg = HashAlgorithms[namespace];
        if (alg) {
            return new alg();
        }
        else {
            throw new Error("hash algorithm '" + namespace + "' is not supported");
        }
    }
    static GetHashAlgorithm(algorithm) {
        const alg = typeof algorithm === "string" ? { name: algorithm } : algorithm;
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
    }
    static GetSignatureAlgorithm(algorithm) {
        if (typeof algorithm.hash === "string") {
            algorithm.hash = {
                name: algorithm.hash,
            };
        }
        const hashName = algorithm.hash.name;
        if (!hashName) {
            throw new Error("Signing algorithm doesn't have name for hash");
        }
        let alg;
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
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, `${algorithm.name}:${hashName}`);
                }
                break;
            case RSA_PSS.toUpperCase():
                const saltLength = algorithm.saltLength;
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
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, `${algorithm.name}:${hashName}`);
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
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, `${algorithm.name}:${hashName}`);
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
                        throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, `${algorithm.name}:${hashName}`);
                }
                break;
            default:
                throw new XmlCore.XmlError(XmlCore.XE.ALGORITHM_NOT_SUPPORTED, algorithm.name);
        }
        return alg;
    }
}

// tslint:disable:no-console
/**
 * Provides a wrapper on a core XML signature object to facilitate creating XML signatures.
 */
class SignedXml {
    /**
     * Creates an instance of SignedXml.
     *
     * @param {(Document | Element)} [node]
     *
     * @memberOf SignedXml
     */
    constructor(node) {
        this.signature = new exports.Signature();
        // constructor();
        if (node && node.nodeType === XmlCore.XmlNodeType.Document) {
            // constructor(node: Document);
            this.document = node;
        }
        else if (node && node.nodeType === XmlCore.XmlNodeType.Element) {
            // constructor(node: Element);
            const xmlText = new XMLSerializer().serializeToString(node);
            this.document = new DOMParser().parseFromString(xmlText, XmlCore.APPLICATION_XML);
        }
    }
    get XmlSignature() {
        return this.signature;
    }
    get Signature() {
        return this.XmlSignature.SignatureValue;
    }
    Sign(algorithm, key, data, options) {
        let alg;
        let signedInfo;
        return Promise.resolve()
            .then(() => {
            const signingAlg = XmlCore.assign({}, key.algorithm, algorithm);
            alg = CryptoConfig.GetSignatureAlgorithm(signingAlg);
            return this.ApplySignOptions(this.XmlSignature, algorithm, key, options);
        })
            .then(() => {
            signedInfo = this.XmlSignature.SignedInfo;
            return this.DigestReferences(data.documentElement);
        })
            .then(() => {
            // Add signature method
            signedInfo.SignatureMethod.Algorithm = alg.namespaceURI;
            if (RSA_PSS.toUpperCase() === algorithm.name.toUpperCase()) {
                // Add RSA-PSS params
                const alg2 = XmlCore.assign({}, key.algorithm, algorithm);
                if (typeof alg2.hash === "string") {
                    alg2.hash = { name: alg2.hash };
                }
                const params = new exports.PssAlgorithmParams(alg2);
                this.XmlSignature.SignedInfo.SignatureMethod.Any.Add(params);
            }
            else if (HMAC.toUpperCase() === algorithm.name.toUpperCase()) {
                // Add HMAC params
                let outputLength = 0;
                const hmacAlg = key.algorithm;
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
                this.XmlSignature.SignedInfo.SignatureMethod.HMACOutputLength = outputLength;
            }
            const si = this.TransformSignedInfo(data);
            return alg.Sign(si, key, algorithm);
        })
            .then((signature) => {
            this.Key = key;
            this.XmlSignature.SignatureValue = new Uint8Array(signature);
            this.document = data;
            return this.XmlSignature;
        });
    }
    Verify(key) {
        return Promise.resolve()
            .then(() => {
            const xml = this.document;
            if (!(xml && xml.documentElement)) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "SignedXml", "document");
            }
            return this.ValidateReferences(xml.documentElement);
        })
            .then((res) => {
            if (res) {
                let promise = Promise.resolve([]);
                if (key) {
                    promise = promise.then(() => [key]);
                }
                else {
                    promise = promise.then(() => this.GetPublicKeys());
                }
                return promise.then((keys) => {
                    return this.ValidateSignatureValue(keys);
                });
            }
            else {
                return false;
            }
        });
    }
    GetXml() {
        return this.signature.GetXml();
    }
    /**
     * Loads a SignedXml state from an XML element.
     * @param  {Element | string} value The XML to load the SignedXml state from.
     * @returns void
     */
    LoadXml(value) {
        this.signature = exports.Signature.LoadXml(value);
    }
    toString() {
        // Check for EnvelopedTransform
        const signature = this.XmlSignature;
        const enveloped = signature.SignedInfo.References && signature.SignedInfo.References.Some((r) => r.Transforms && r.Transforms.Some((t) => t instanceof XmlDsigEnvelopedSignatureTransform));
        if (enveloped) {
            const doc = this.document.documentElement.cloneNode(true);
            const node = this.XmlSignature.GetXml();
            if (!node) {
                throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from Signature");
            }
            // console.log('Node before clone', node.outerHTML);
            const sig = node.cloneNode(true);
            // console.log('Sig after clone', (sig as Element).outerHTML);
            doc.appendChild(sig);
            // console.log('doc before serializing', (doc as Element).outerHTML);
            return new XMLSerializer().serializeToString(doc);
        }
        return this.XmlSignature.toString();
    }
    //#region Protected methods
    /**
     * Returns the public key of a signature.
     */
    GetPublicKeys() {
        const keys = [];
        return Promise.resolve()
            .then(() => {
            const pkEnumerator = this.XmlSignature.KeyInfo.GetIterator();
            const promises = [];
            pkEnumerator.forEach((kic) => {
                const alg = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
                if (kic instanceof exports.KeyInfoX509Data) {
                    kic.Certificates.forEach((cert) => {
                        promises.push(cert.exportKey(alg.algorithm)
                            .then((key) => { keys.push(key); }));
                    });
                }
                else {
                    promises.push(kic.exportKey(alg.algorithm)
                        .then((key) => { keys.push(key); }));
                }
            });
            return Promise.all(promises);
        })
            .then(() => keys);
    }
    /**
     * Returns dictionary of namespaces used in signature
     */
    GetSignatureNamespaces() {
        const namespaces = {};
        if (this.XmlSignature.NamespaceURI) {
            namespaces[this.XmlSignature.Prefix || ""] = this.XmlSignature.NamespaceURI;
        }
        return namespaces;
    }
    /**
     * Copies namespaces from source element and its parents into destination element
     */
    CopyNamespaces(src, dst, ignoreDefault) {
        // this.InjectNamespaces(XmlCore.SelectNamespaces(src), dst, ignoreDefault);
        this.InjectNamespaces(SelectRootNamespaces(src), dst, ignoreDefault);
    }
    /**
     * Injects namespaces from dictionary to the target element
     */
    InjectNamespaces(namespaces, target, ignoreDefault) {
        for (const i in namespaces) {
            const uri = namespaces[i];
            if (ignoreDefault && i === "") {
                continue;
            }
            target.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    }
    DigestReference(doc, reference, checkHmac) {
        return Promise.resolve()
            .then(() => {
            if (reference.Uri) {
                let objectName;
                if (!reference.Uri.indexOf("#xpointer")) {
                    let uri = reference.Uri;
                    uri = uri.substring(9).replace(/[\r\n\t\s]/g, "");
                    if (uri.length < 2 || uri[0] !== `(` || uri[uri.length - 1] !== `)`) {
                        // FIXME: how to handle invalid xpointer?
                        uri = ""; // String.Empty
                    }
                    else {
                        uri = uri.substring(1, uri.length - 1);
                    }
                    if (uri.length > 6 && uri.indexOf(`id(`) === 0 && uri[uri.length - 1] === `)`) {
                        // id('foo'), id("foo")
                        objectName = uri.substring(4, uri.length - 2);
                    }
                }
                else if (reference.Uri[0] === `#`) {
                    objectName = reference.Uri.substring(1);
                }
                if (objectName) {
                    let found = null;
                    const xmlSignatureObjects = [this.XmlSignature.KeyInfo.GetXml()];
                    this.XmlSignature.ObjectList.ForEach((object) => {
                        xmlSignatureObjects.push(object.GetXml());
                    });
                    for (const xmlSignatureObject of xmlSignatureObjects) {
                        if (xmlSignatureObject) {
                            found = findById(xmlSignatureObject, objectName);
                            if (found) {
                                const el = found.cloneNode(true);
                                // Copy xmlns from Document
                                this.CopyNamespaces(doc, el, false);
                                // Copy xmlns from Parent
                                if (this.Parent) {
                                    const parent = (this.Parent instanceof XmlCore.XmlObject)
                                        ? this.Parent.GetXml()
                                        : this.Parent;
                                    this.CopyNamespaces(parent, el, true);
                                }
                                this.CopyNamespaces(found, el, false);
                                this.InjectNamespaces(this.GetSignatureNamespaces(), el, true);
                                doc = el;
                                break;
                            }
                        }
                    }
                    if (!found && doc) {
                        found = XmlCore.XmlObject.GetElementById(doc, objectName);
                        if (found) {
                            const el = found.cloneNode(true);
                            this.CopyNamespaces(found, el, false);
                            this.CopyNamespaces(doc, el, false);
                            doc = el;
                        }
                    }
                    if (found == null) {
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, `Cannot get object by reference: ${objectName}`);
                    }
                }
            }
            let canonOutput = null;
            if (reference.Transforms && reference.Transforms.Count) {
                canonOutput = this.ApplyTransforms(reference.Transforms, doc);
            }
            else {
                // we must not C14N references from outside the document
                // e.g. non-xml documents
                if (reference.Uri && reference.Uri[0] !== `#`) {
                    canonOutput = new XMLSerializer().serializeToString(doc.ownerDocument);
                }
                else {
                    // apply default C14N transformation
                    const excC14N = new XmlDsigC14NTransform();
                    excC14N.LoadInnerXml(doc);
                    canonOutput = excC14N.GetOutput();
                }
            }
            if (!reference.DigestMethod.Algorithm) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "Reference", "DigestMethod");
            }
            const digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
            return digest.Digest(canonOutput);
        });
    }
    DigestReferences(data) {
        return Promise.resolve()
            .then(() => {
            // we must tell each reference which hash algorithm to use
            // before asking for the SignedInfo XML !
            const promises = this.XmlSignature.SignedInfo.References.Map((ref) => {
                // assume SHA-256 if nothing is specified
                if (!ref.DigestMethod.Algorithm) {
                    ref.DigestMethod.Algorithm = new Sha256().namespaceURI;
                }
                return this.DigestReference(data, ref, false)
                    .then((hashValue) => {
                    ref.DigestValue = hashValue;
                });
            }).GetIterator();
            return Promise.all(promises);
        });
    }
    TransformSignedInfo(data) {
        const t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);
        const xml = this.XmlSignature.SignedInfo.GetXml();
        if (!xml) {
            throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");
        }
        const node = xml.cloneNode(true);
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
            const parentXml = (this.Parent instanceof XmlCore.XmlObject)
                ? this.Parent.GetXml()
                : this.Parent;
            if (parentXml) {
                this.CopyNamespaces(parentXml, node, false);
            }
        }
        //#endregion
        const childNamespaces = XmlCore.SelectNamespaces(xml);
        for (const i in childNamespaces) {
            const uri = childNamespaces[i];
            if (i === node.prefix) {
                continue;
            }
            node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
        t.LoadInnerXml(node);
        const res = t.GetOutput();
        return res;
    }
    ResolveFilterTransform(transform) {
        const split = transform.split(" ");
        if (split.length !== 3) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_TRANSFORM_FILTER, transform);
        }
        const filterMethod = split[1].trim();
        const xPath = split[2].trim();
        return new XmlDsigDisplayFilterTransform({
            Filter: filterMethod,
            XPath: xPath,
        });
    }
    ResolveTransform(transform) {
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
    }
    ApplyTransforms(transforms, input) {
        let output = null;
        // console.log('before applying reordering:');
        // console.log(transforms.items.map(item => item._Algorithm).join(', '));
        const ordered = new exports.Transforms();
        transforms.Filter((element) => element instanceof XmlDsigDisplayFilterTransform) //
            .ForEach((element) => ordered.Add(element));
        transforms.Filter((element) => element instanceof XmlDsigEnvelopedSignatureTransform) //
            .ForEach((element) => ordered.Add(element));
        transforms.Filter((element) => {
            return !(element instanceof XmlDsigEnvelopedSignatureTransform || //
                element instanceof XmlDsigDisplayFilterTransform);
        }).ForEach((element) => ordered.Add(element));
        ordered.ForEach((transform) => {
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
            const c14n = new XmlDsigC14NTransform();
            c14n.LoadInnerXml(input);
            output = c14n.GetOutput();
        }
        return output;
    }
    ApplySignOptions(signature, algorithm, key, options = {}) {
        return Promise.resolve()
            .then(() => {
            // id
            if (options.id) {
                this.XmlSignature.Id = options.id;
            }
            // keyValue
            if (options.keyValue && key.algorithm.name.toUpperCase() !== HMAC) {
                if (!signature.KeyInfo) {
                    signature.KeyInfo = new exports.KeyInfo();
                }
                const keyInfo = signature.KeyInfo;
                const keyValue = new exports.KeyValue();
                keyInfo.Add(keyValue);
                return keyValue.importKey(options.keyValue);
            }
            else {
                return Promise.resolve();
            }
        })
            .then(() => {
            // x509
            if (options.x509) {
                if (!signature.KeyInfo) {
                    signature.KeyInfo = new exports.KeyInfo();
                }
                const keyInfo = signature.KeyInfo;
                options.x509.forEach((x509) => {
                    const raw = XmlCore.Convert.FromBase64(x509);
                    const x509Data = new exports.KeyInfoX509Data(raw);
                    keyInfo.Add(x509Data);
                });
            }
            return Promise.resolve();
        })
            .then(() => {
            // references
            if (options.references) {
                options.references.forEach((item) => {
                    const reference = new exports.Reference();
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
                    const digestAlgorithm = CryptoConfig.GetHashAlgorithm(item.hash);
                    reference.DigestMethod.Algorithm = digestAlgorithm.namespaceURI;
                    // transforms
                    if (item.transforms && item.transforms.length) {
                        const transforms = new exports.Transforms();
                        item.transforms.forEach((transform) => {
                            if (transform.startsWith("filter")) {
                                transforms.Add(this.ResolveFilterTransform(transform));
                            }
                            else {
                                transforms.Add(this.ResolveTransform(transform));
                            }
                        });
                        reference.Transforms = transforms;
                    }
                    if (!signature.SignedInfo.References) {
                        signature.SignedInfo.References = new exports.References();
                    }
                    signature.SignedInfo.References.Add(reference);
                });
            }
            // Set default values
            if (!signature.SignedInfo.References.Count) {
                // Add default Reference
                const reference = new exports.Reference();
                signature.SignedInfo.References.Add(reference);
            }
            return Promise.resolve();
        });
    }
    ValidateReferences(doc) {
        return Promise.resolve()
            .then(() => {
            return Promise.all(this.XmlSignature.SignedInfo.References.Map((ref) => {
                return this.DigestReference(doc, ref, false)
                    .then((digest) => {
                    const b64Digest = XmlCore.Convert.ToBase64(digest);
                    const b64DigestValue = XmlCore.Convert.ToString(ref.DigestValue, "base64");
                    if (b64Digest !== b64DigestValue) {
                        const errText = `Invalid digest for uri '${ref.Uri}'. Calculated digest is ${b64Digest} but the xml to validate supplies digest ${b64DigestValue}`;
                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, errText);
                    }
                    return Promise.resolve(true);
                });
            }).GetIterator());
        })
            .then(() => true);
    }
    ValidateSignatureValue(keys) {
        let signer;
        let signedInfoCanon;
        return Promise.resolve()
            .then(() => {
            signedInfoCanon = this.TransformSignedInfo(this.document);
            signer = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
            // Verify signature for all exported keys
            let chain = Promise.resolve(false);
            keys.forEach((key) => {
                chain = chain.then((v) => {
                    if (!v) {
                        return signer.Verify(signedInfoCanon, key, this.Signature);
                    }
                    return Promise.resolve(v);
                });
            });
            return chain;
        });
    }
}
function findById(element, id) {
    if (element.nodeType !== XmlCore.XmlNodeType.Element) {
        return null;
    }
    if (element.hasAttribute("Id") && element.getAttribute("Id") === id) {
        return element;
    }
    if (element.childNodes && element.childNodes.length) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const el = findById(element.childNodes[i], id);
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
function _SelectRootNamespaces(node, selectedNodes = {}) {
    if (node && node.nodeType === XmlCore.XmlNodeType.Element) {
        const el = node;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
            addNamespace(selectedNodes, el.prefix ? el.prefix : "", node.namespaceURI);
        }
        //#region Select all xmlns attrs
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes.item(i);
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
    const attrs = {};
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
exports.XmlDsigBase64Transform = XmlDsigBase64Transform;
exports.XmlDsigC14NTransform = XmlDsigC14NTransform;
exports.XmlDsigC14NWithCommentsTransform = XmlDsigC14NWithCommentsTransform;
exports.XmlDsigEnvelopedSignatureTransform = XmlDsigEnvelopedSignatureTransform;
exports.XmlDsigExcC14NTransform = XmlDsigExcC14NTransform;
exports.XmlDsigExcC14NWithCommentsTransform = XmlDsigExcC14NWithCommentsTransform;
exports.XmlDsigDisplayFilterTransform = XmlDsigDisplayFilterTransform;
exports.X509Certificate = X509Certificate;
exports.KeyInfoClause = KeyInfoClause;
exports.SelectRootNamespaces = SelectRootNamespaces;
exports.SignedXml = SignedXml;

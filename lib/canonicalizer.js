"use strict";
var xmljs_1 = require("xmljs");
(function (XmlCanonicalizerState) {
    XmlCanonicalizerState[XmlCanonicalizerState["BeforeDocElement"] = 0] = "BeforeDocElement";
    XmlCanonicalizerState[XmlCanonicalizerState["InsideDocElement"] = 1] = "InsideDocElement";
    XmlCanonicalizerState[XmlCanonicalizerState["AfterDocElement"] = 2] = "AfterDocElement";
})(exports.XmlCanonicalizerState || (exports.XmlCanonicalizerState = {}));
var XmlCanonicalizerState = exports.XmlCanonicalizerState;
var XmlCanonicalizer = (function () {
    function XmlCanonicalizer(withComments, excC14N, propagatedNamespaces) {
        if (propagatedNamespaces === void 0) { propagatedNamespaces = new xmljs_1.NamespaceManager(); }
        this.propagatedNamespaces = new xmljs_1.NamespaceManager();
        this.result = [];
        this.visibleNamespaces = new xmljs_1.NamespaceManager();
        this.inclusiveNamespacesPrefixList = [];
        this.state = XmlCanonicalizerState.BeforeDocElement;
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
        if (!node)
            throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Parameter 1 is not Node");
        var _node;
        if (node.nodeType === xmljs_1.XmlNodeType.Document) {
            this.document = node;
            _node = this.document.documentElement;
        }
        else {
            this.document = node.ownerDocument;
            _node = node;
        }
        // get nss from document
        // this.nsManager = new XmlNamespaceManager(this.document);
        this.WriteNode(_node);
        var res = this.result.join("");
        return res;
    };
    XmlCanonicalizer.prototype.WriteNode = function (node) {
        switch (node.nodeType) {
            case xmljs_1.XmlNodeType.Document:
            case xmljs_1.XmlNodeType.DocumentFragment:
                this.WriteDocumentNode(node);
                break;
            case xmljs_1.XmlNodeType.Element:
                this.WriteElementNode(node);
                break;
            case xmljs_1.XmlNodeType.CDATA:
            case xmljs_1.XmlNodeType.SignificantWhitespace:
            case xmljs_1.XmlNodeType.Text:
                // CDATA sections are processed as text nodes
                this.WriteTextNode(node);
                break;
            case xmljs_1.XmlNodeType.Whitespace:
                if (this.state === XmlCanonicalizerState.InsideDocElement)
                    this.WriteTextNode(node);
                break;
            case xmljs_1.XmlNodeType.Comment:
                this.WriteCommentNode(node);
                break;
            case xmljs_1.XmlNodeType.ProcessingInstruction:
                this.WriteProcessingInstructionNode(node);
                break;
            case xmljs_1.XmlNodeType.EntityReference:
                for (var i = 0; i < node.childNodes.length; i++)
                    this.WriteNode(node.childNodes[i]);
                break;
            case xmljs_1.XmlNodeType.Attribute:
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case xmljs_1.XmlNodeType.EndElement:
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case xmljs_1.XmlNodeType.EndEntity:
                throw new xmljs_1.XmlError(xmljs_1.XE.CRYPTOGRAPHIC, "Attribute node is impossible here");
            case xmljs_1.XmlNodeType.DocumentType:
            case xmljs_1.XmlNodeType.Entity:
            case xmljs_1.XmlNodeType.Notation:
            case xmljs_1.XmlNodeType.XmlDeclaration:
                // just do nothing
                break;
        }
    };
    XmlCanonicalizer.prototype.WriteDocumentNode = function (node) {
        this.state = XmlCanonicalizerState.BeforeDocElement;
        for (var child = node.firstChild; child != null; child = child.nextSibling)
            this.WriteNode(child);
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
    XmlCanonicalizer.prototype.WriteCommentNode = function (node) {
        // console.log(`WriteCommentNode: ${node.nodeName}`);
        // Console.WriteLine ("Debug: comment node");
        if (this.withComments) {
            if (this.state === XmlCanonicalizerState.AfterDocElement)
                this.result.push(String.fromCharCode(10) + "<!--");
            else
                this.result.push("<!--");
            this.result.push(this.NormalizeString(node.nodeValue, xmljs_1.XmlNodeType.Comment));
            if (this.state === XmlCanonicalizerState.BeforeDocElement)
                this.result.push("-->" + String.fromCharCode(10));
            else
                this.result.push("-->");
        }
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
        if (this.state === XmlCanonicalizerState.AfterDocElement)
            this.result.push("\u000A<?");
        else
            this.result.push("<?");
        this.result.push(node.nodeName);
        if (node.nodeValue) {
            this.result.push(" ");
            this.result.push(this.NormalizeString(node.nodeValue, xmljs_1.XmlNodeType.ProcessingInstruction));
        }
        if (this.state === XmlCanonicalizerState.BeforeDocElement)
            this.result.push("?>\u000A");
        else
            this.result.push("?>");
    };
    XmlCanonicalizer.prototype.WriteElementNode = function (node) {
        // console.log(`WriteElementNode: ${node.nodeName}`);
        if (this.state === XmlCanonicalizerState.BeforeDocElement)
            this.state = XmlCanonicalizerState.InsideDocElement;
        // open tag
        this.result.push("<");
        this.result.push(node.nodeName);
        // namespaces
        var visibleNamespacesCount = this.WriteNamespacesAxis(node);
        // attributes
        this.WriteAttributesAxis(node);
        this.result.push(">");
        for (var n = node.firstChild; n != null; n = n.nextSibling) {
            // if (!(n.nodeType === XmlNodeType.Text && node.childNodes.length > 1))
            this.WriteNode(n);
        }
        // close tag
        this.result.push("</");
        this.result.push(node.nodeName);
        this.result.push(">");
        if (this.state === XmlCanonicalizerState.BeforeDocElement)
            this.state = XmlCanonicalizerState.AfterDocElement;
        // remove added namespaces
        while (visibleNamespacesCount--)
            this.visibleNamespaces.Pop();
    };
    XmlCanonicalizer.prototype.WriteNamespacesAxis = function (node) {
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
            if (matches = /xmlns:(\w+)/.exec(attribute.nodeName))
                prefix = matches[1];
            var printable = true;
            if (this.exclusive && !this.IsNamespaceInclusive(node, prefix)) {
                var used = IsNamespaceUsed(node, prefix);
                if (used > 1)
                    printable = false;
                else if (used === 0)
                    continue;
            }
            if (this.IsNamespaceRendered(prefix, attribute.nodeValue))
                continue;
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
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var n = list_1[_i];
            if (n.prefix === prevPrefix) {
                continue;
            }
            prevPrefix = n.prefix;
            this.result.push(" xmlns");
            if (n.prefix)
                this.result.push(":" + n.prefix);
            this.result.push("=\"");
            this.result.push(n.namespace); // TODO namespace can be null
            this.result.push("\"");
        }
        return visibleNamespacesCount;
    };
    XmlCanonicalizer.prototype.WriteAttributesAxis = function (node) {
        // Console.WriteLine ("Debug: attributes");
        var list = [];
        for (var i = 0; i < node.attributes.length; i++) {
            var attribute = node.attributes[i];
            if (!IsNamespaceNode(attribute))
                list.push(attribute);
        }
        // sort namespaces and write results	    
        list.sort(XmlDsigC14NTransformAttributesComparer);
        for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
            var attribute = list_2[_i];
            if (attribute != null) {
                this.result.push(" ");
                this.result.push(attribute.nodeName);
                this.result.push("=\"");
                this.result.push(this.NormalizeString(attribute.nodeValue, xmljs_1.XmlNodeType.Attribute));
                this.result.push("\"");
            }
        }
    };
    XmlCanonicalizer.prototype.NormalizeString = function (input, type) {
        if (!input) {
            throw new xmljs_1.XmlError(xmljs_1.XE.NULL_REFERENCE, "Parameter 'input' is null");
        }
        var sb = [];
        for (var i = 0; i < input.length; i++) {
            var ch = input[i];
            if (ch === "<" && (type === xmljs_1.XmlNodeType.Attribute || this.IsTextNode(type)))
                sb.push("&lt;");
            else if (ch === ">" && this.IsTextNode(type))
                sb.push("&gt;");
            else if (ch === "&" && (type === xmljs_1.XmlNodeType.Attribute || this.IsTextNode(type)))
                sb.push("&amp;");
            else if (ch === "\"" && type === xmljs_1.XmlNodeType.Attribute)
                sb.push("&quot;");
            else if (ch === "\u0009" && type === xmljs_1.XmlNodeType.Attribute)
                sb.push("&#x9;");
            else if (ch === "\u000A" && type === xmljs_1.XmlNodeType.Attribute)
                sb.push("&#xA;");
            else if (ch === "\u000D")
                sb.push("&#xD;");
            else
                sb.push(ch);
        }
        return sb.join("");
    };
    XmlCanonicalizer.prototype.IsTextNode = function (type) {
        switch (type) {
            case xmljs_1.XmlNodeType.Text:
            case xmljs_1.XmlNodeType.CDATA:
            case xmljs_1.XmlNodeType.SignificantWhitespace:
            case xmljs_1.XmlNodeType.Whitespace:
                return true;
        }
        return false;
    };
    XmlCanonicalizer.prototype.IsNamespaceInclusive = function (node, prefix) {
        var _prefix = prefix || null;
        if (node.prefix === _prefix)
            return false;
        return this.inclusiveNamespacesPrefixList.indexOf(_prefix || "") !== -1; // && node.prefix === prefix;
    };
    XmlCanonicalizer.prototype.IsNamespaceRendered = function (prefix, uri) {
        prefix = prefix || "";
        uri = uri || "";
        if (!prefix && !uri)
            return true;
        if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace")
            return true;
        var ns = this.visibleNamespaces.GetPrefix(prefix);
        if (ns)
            return ns.namespace === uri;
        return false;
    };
    return XmlCanonicalizer;
}());
exports.XmlCanonicalizer = XmlCanonicalizer;
function XmlDsigC14NTransformNamespacesComparer(x, y) {
    // simple cases
    if (x == y)
        return 0;
    else if (!x)
        return -1;
    else if (!y)
        return 1;
    else if (!x.prefix)
        return -1;
    else if (!y.prefix)
        return 1;
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
    if (left === right)
        return 0;
    else if (left < right)
        return -1;
    else
        return 1;
}
function IsNamespaceUsed(node, prefix, result) {
    if (result === void 0) { result = 0; }
    var _prefix = prefix || null;
    if (node.prefix === _prefix)
        return ++result;
    // prefix of attributes
    if (node.attributes)
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (!IsNamespaceNode(attr) && prefix && node.attributes[i].prefix === prefix)
                return ++result;
        }
    // check prefix of Element
    for (var n = node.firstChild; !!n; n = n.nextSibling) {
        if (n.nodeType === xmljs_1.XmlNodeType.Element) {
            var el = n;
            var res = IsNamespaceUsed(el, prefix, result);
            if (n.nodeType === xmljs_1.XmlNodeType.Element && res)
                return ++result + res;
        }
    }
    return result;
}
function IsNamespaceNode(node) {
    var reg = /xmlns:/;
    if (node !== null && node.nodeType === xmljs_1.XmlNodeType.Attribute && (node.nodeName === "xmlns" || reg.test(node.nodeName)))
        return true;
    return false;
}

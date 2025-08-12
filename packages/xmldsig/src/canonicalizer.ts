import * as XmlCore from 'xml-core';

export enum XmlCanonicalizerState {
  BeforeDocElement,
  InsideDocElement,
  AfterDocElement,
}

export class XmlCanonicalizer {
  protected withComments: boolean;
  protected exclusive: boolean;
  protected propagatedNamespaces = new XmlCore.NamespaceManager();
  protected document: Document;
  protected result: string[] = [];
  protected visibleNamespaces = new XmlCore.NamespaceManager();
  protected inclusiveNamespacesPrefixList: string[] = [];
  protected state = XmlCanonicalizerState.BeforeDocElement;

  constructor(
    withComments: boolean,
    excC14N: boolean,
    propagatedNamespaces: XmlCore.NamespaceManager = new XmlCore.NamespaceManager(),
  ) {
    this.withComments = withComments;
    this.exclusive = excC14N;
    this.propagatedNamespaces = propagatedNamespaces;
  }

  // See xml-enc-c14n specification
  public get InclusiveNamespacesPrefixList(): string {
    return this.inclusiveNamespacesPrefixList.join(' ');
  }

  public set InclusiveNamespacesPrefixList(value: string) {
    this.inclusiveNamespacesPrefixList = value.split(' ');
  }

  public Canonicalize(node: Node): string {
    if (!node) {
      throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, 'Parameter 1 is not Node');
    }
    this.WriteNode(node);
    // get nss from document
    // this.nsManager = new XmlNamespaceManager(this.document);

    const res = this.result.join('');
    return res;
  }

  protected WriteNode(node: Node) {
    switch (node.nodeType) {
      case XmlCore.XmlNodeType.Document:
      case XmlCore.XmlNodeType.DocumentFragment:
        this.WriteDocumentNode(node);
        break;
      case XmlCore.XmlNodeType.Element:
        this.WriteElementNode(node as Element);
        break;
      case XmlCore.XmlNodeType.CDATA:
      case XmlCore.XmlNodeType.SignificantWhitespace:
      case XmlCore.XmlNodeType.Text:
        // CDATA sections are processed as text nodes
        if (!XmlCore.isDocument(node.parentNode)) {
          this.WriteTextNode(node);
        }
        break;
      case XmlCore.XmlNodeType.Whitespace:
        if (this.state === XmlCanonicalizerState.InsideDocElement) {
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
        for (let i = 0; i < node.childNodes.length; i++) {
          this.WriteNode(node.childNodes[i]);
        }
        break;
      case XmlCore.XmlNodeType.Attribute:
        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, 'Attribute node is impossible here');
      case XmlCore.XmlNodeType.EndElement:
        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, 'Attribute node is impossible here');
      case XmlCore.XmlNodeType.EndEntity:
        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, 'Attribute node is impossible here');
      case XmlCore.XmlNodeType.DocumentType:
      case XmlCore.XmlNodeType.Entity:
      case XmlCore.XmlNodeType.Notation:
      case XmlCore.XmlNodeType.XmlDeclaration:
        // just do nothing
        break;
    }
  }

  protected WriteDocumentNode(node: Node) {
    this.state = XmlCanonicalizerState.BeforeDocElement;
    for (let child = node.firstChild; child != null; child = child.nextSibling) {
      this.WriteNode(child);
    }
  }

  protected WriteCommentNode(node: Node) {
    // console.log(`WriteCommentNode: ${node.nodeName}`);
    // Console.WriteLine ("Debug: comment node");
    if (this.withComments) {
      if (this.state === XmlCanonicalizerState.AfterDocElement) {
        this.result.push(String.fromCharCode(10) + '<!--');
      } else {
        this.result.push('<!--');
      }

      this.result.push(this.NormalizeString(node.nodeValue, XmlCore.XmlNodeType.Comment));

      if (this.state === XmlCanonicalizerState.BeforeDocElement) {
        this.result.push('-->' + String.fromCharCode(10));
      } else {
        this.result.push('-->');
      }
    }
  }

  // Text Nodes
  // the string value, except all ampersands are replaced
  // by &amp;, all open angle brackets (<) are replaced by &lt;, all closing
  // angle brackets (>) are replaced by &gt;, and all #xD characters are
  // replaced by &#xD;.
  protected WriteTextNode(node: Node): void {
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
  protected WriteProcessingInstructionNode(node: Node): void {
    // console.log(`WriteProcessingInstructionNode: ${node.nodeName}`);
    const nodeName = node.nodeName || (node as Element).tagName;
    if (nodeName === 'xml') {
      return;
    }

    if (this.state === XmlCanonicalizerState.AfterDocElement) {
      this.result.push('\u000A<?');
    } else {
      this.result.push('<?');
    }

    this.result.push(nodeName);
    if (node.nodeValue) {
      this.result.push(' ');
      this.result.push(
        this.NormalizeString(node.nodeValue, XmlCore.XmlNodeType.ProcessingInstruction),
      );
    }

    if (this.state === XmlCanonicalizerState.BeforeDocElement) {
      this.result.push('?>\u000A');
    } else {
      this.result.push('?>');
    }
  }

  protected WriteElementNode(node: Element) {
    // console.log(`WriteElementNode: ${node.nodeName}`);

    const state = this.state;
    if (this.state === XmlCanonicalizerState.BeforeDocElement) {
      this.state = XmlCanonicalizerState.InsideDocElement;
    }

    // open tag
    this.result.push('<');
    this.result.push(node.nodeName);
    // namespaces
    let visibleNamespacesCount = this.WriteNamespacesAxis(node);
    // attributes
    this.WriteAttributesAxis(node);
    this.result.push('>');

    for (let n = node.firstChild; n != null; n = n.nextSibling) {
      // if (!(n.nodeType === XmlCore.XmlNodeType.Text && node.childNodes.length > 1))
      this.WriteNode(n);
    }

    // close tag
    this.result.push('</');
    this.result.push(node.nodeName);
    this.result.push('>');

    if (state === XmlCanonicalizerState.BeforeDocElement) {
      this.state = XmlCanonicalizerState.AfterDocElement;
    }

    // remove added namespaces
    while (visibleNamespacesCount--) {
      this.visibleNamespaces.Pop();
    }
  }

  protected WriteNamespacesAxis(node: Element): number {
    const list: XmlCore.XmlNamespace[] = [];
    let visibleNamespacesCount = 0;
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i];

      if (!IsNamespaceNode(attribute)) {
        // render namespace for attribute, if needed
        if (
          attribute.prefix &&
          !this.IsNamespaceRendered(attribute.prefix, attribute.namespaceURI)
        ) {
          const ns = { prefix: attribute.prefix, namespace: attribute.namespaceURI };
          list.push(ns);
          this.visibleNamespaces.Add(ns);
          visibleNamespacesCount++;
        }
        continue;
      }

      if (attribute.localName === 'xmlns' && !attribute.prefix && !attribute.nodeValue) {
        const ns = { prefix: attribute.prefix, namespace: attribute.nodeValue };
        list.push(ns);
        this.visibleNamespaces.Add(ns);
        visibleNamespacesCount++;
      }

      // if (attribute.localName === "xmlns")
      //     continue;

      // get namespace prefix
      let prefix: string | null = null;
      let matches: RegExpExecArray | null;
      if ((matches = /xmlns:([\w.-]+)/.exec(attribute.nodeName))) {
        prefix = matches[1];
      }

      let printable = true;
      if (this.exclusive && !this.IsNamespaceInclusive(node, prefix)) {
        const used = IsNamespaceUsed(node, prefix);
        if (used > 1) {
          printable = false;
        } else if (used === 0) {
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

    if (
      !this.IsNamespaceRendered(node.prefix, node.namespaceURI) &&
      node.namespaceURI !== 'http://www.w3.org/2000/xmlns/'
    ) {
      const ns = { prefix: node.prefix, namespace: node.namespaceURI };
      list.push(ns);
      this.visibleNamespaces.Add(ns);
      visibleNamespacesCount++;
    }

    // sort nss
    list.sort(XmlDsigC14NTransformNamespacesComparer);

    let prevPrefix: string | null = null;
    list.forEach((n) => {
      if (n.prefix === prevPrefix) {
        return;
      }
      prevPrefix = n.prefix;
      this.result.push(' xmlns');
      if (n.prefix) {
        this.result.push(':' + n.prefix);
      }
      this.result.push('="');
      this.result.push(n.namespace || ''); // TODO namespace can be null
      this.result.push('"');
    });

    return visibleNamespacesCount;
  }

  protected WriteAttributesAxis(node: Element): void {
    // Console.WriteLine ("Debug: attributes");

    const list: Attr[] = [];
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
        this.result.push(' ');
        this.result.push(attribute.nodeName);
        this.result.push('="');
        this.result.push(this.NormalizeString(attribute.nodeValue, XmlCore.XmlNodeType.Attribute));
        this.result.push('"');
      }
    });
  }

  protected NormalizeString(input: string | null, type: XmlCore.XmlNodeType): string {
    const sb: string[] = [];
    if (input) {
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === '<' && (type === XmlCore.XmlNodeType.Attribute || this.IsTextNode(type))) {
          sb.push('&lt;');
        } else if (ch === '>' && this.IsTextNode(type)) {
          sb.push('&gt;');
        } else if (
          ch === '&' &&
          (type === XmlCore.XmlNodeType.Attribute || this.IsTextNode(type))
        ) {
          sb.push('&amp;');
        } else if (ch === '"' && type === XmlCore.XmlNodeType.Attribute) {
          sb.push('&quot;');
        } else if (ch === '\u0009' && type === XmlCore.XmlNodeType.Attribute) {
          sb.push('&#x9;');
        } else if (ch === '\u000A' && type === XmlCore.XmlNodeType.Attribute) {
          sb.push('&#xA;');
        } else if (ch === '\u000D') {
          sb.push('&#xD;');
        } else {
          sb.push(ch);
        }
      }
    }

    return sb.join('');
  }

  private IsTextNode(type: XmlCore.XmlNodeType): boolean {
    switch (type) {
      case XmlCore.XmlNodeType.Text:
      case XmlCore.XmlNodeType.CDATA:
      case XmlCore.XmlNodeType.SignificantWhitespace:
      case XmlCore.XmlNodeType.Whitespace:
        return true;
    }
    return false;
  }

  private IsNamespaceInclusive(node: Element | Attr, prefix: string | null): boolean {
    const prefix2 = prefix || null;
    if (node.prefix === prefix2) {
      return false;
    }
    return this.inclusiveNamespacesPrefixList.indexOf(prefix2 || '') !== -1; // && node.prefix === prefix;
  }

  private IsNamespaceRendered(prefix: string | null, uri: string | null): boolean {
    prefix = prefix || '';
    uri = uri || '';
    if (!prefix && !uri) {
      return true;
    }
    if (prefix === 'xml' && uri === 'http://www.w3.org/XML/1998/namespace') {
      return true;
    }
    const ns = this.visibleNamespaces.GetPrefix(prefix);
    if (ns) {
      return ns.namespace === uri;
    }
    return false;
  }
}

function XmlDsigC14NTransformNamespacesComparer(x: XmlCore.XmlNamespace, y: XmlCore.XmlNamespace) {
  // simple cases
  if (x == y) {
    return 0;
  } else if (!x) {
    return -1;
  } else if (!y) {
    return 1;
  } else if (!x.prefix) {
    return -1;
  } else if (!y.prefix) {
    return 1;
  } else if (x.prefix < y.prefix) {
    return -1;
  } else if (x.prefix > y.prefix) {
    return 1;
  } else {
    return 0;
  }
}

function XmlDsigC14NTransformAttributesComparer(x: Attr, y: Attr): number {
  if (!x.namespaceURI && y.namespaceURI) {
    return -1;
  }
  if (!y.namespaceURI && x.namespaceURI) {
    return 1;
  }

  const left = (x.namespaceURI || '') + x.localName;
  const right = (y.namespaceURI || '') + y.localName;

  if (left === right) {
    return 0;
  } else if (left < right) {
    return -1;
  } else {
    return 1;
  }
}

function IsNamespaceUsed(node: Element, prefix: string | null, result = 0): number {
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
  for (let n = node.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === XmlCore.XmlNodeType.Element) {
      const el = n as Element;
      const res = IsNamespaceUsed(el, prefix, result);
      if (n.nodeType === XmlCore.XmlNodeType.Element && res) {
        return ++result + res;
      }
    }
  }
  return result;
}

function IsNamespaceNode(node: Node): boolean {
  const reg = /xmlns:/;
  if (
    node !== null &&
    node.nodeType === XmlCore.XmlNodeType.Attribute &&
    (node.nodeName === 'xmlns' || reg.test(node.nodeName))
  ) {
    return true;
  }
  return false;
}

import { XE, XmlError } from "xml-core";

import { XmlCanonicalizer } from "../../canonicalizer";
import { Transform } from "../transform";

/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
export class XmlDsigExcC14NTransform extends Transform {

    public Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";

    protected xmlCanonicalizer = new XmlCanonicalizer(false, true);

    /**
     * Gets or sets a string that contains namespace prefixes to canonicalize
     * using the standard canonicalization algorithm.
     */
    public get InclusiveNamespacesPrefixList(): string {
        return this.xmlCanonicalizer.InclusiveNamespacesPrefixList;
    }
    public set InclusiveNamespacesPrefixList(value: string) {
        this.xmlCanonicalizer.InclusiveNamespacesPrefixList = value;
    }

    public LoadXml(param: string | Element) {
        super.LoadXml(param);
        if (this.Element && this.Element.childNodes) {
            for (let i = 0; i < this.Element.childNodes.length; i++) {
                const element = this.Element.childNodes[i] as HTMLElement;
                if (element && element.nodeType === 1) {
                    switch (element.localName) {
                        case 'InclusiveNamespaces':
                            this.setInclusiveNamespacesElement(element);
                            break;
                    }
                }
            }
        }
    }

    /**
     * Returns the output of the current XmlDsigExcC14NTransform object
     */
    public GetOutput(): string {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    }

    private setInclusiveNamespacesElement(element: HTMLElement) {
        const prefixList = element.getAttribute('PrefixList');
        if (prefixList && prefixList.length > 0) {
            this.xmlCanonicalizer.InclusiveNamespacesPrefixList = prefixList;
        }
    }
}

/**
 * Represents the exclusive C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
export class XmlDsigExcC14NWithCommentsTransform extends XmlDsigExcC14NTransform {
    public Algorithm = "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
    protected xmlCanonicalizer = new XmlCanonicalizer(true, true);
}

import { XE, XmlError } from "xml-core";

import { XmlCanonicalizer } from "../../canonicalizer";
import { Transform } from "../transform";

/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), without comments.
 */
export class XmlDsigC14NTransform extends Transform {

    public Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";

    protected xmlCanonicalizer = new XmlCanonicalizer(false, false);

    /**
     * Returns the output of the current XmlDSigC14NTransform object.
     * @returns string
     */
    public GetOutput(): string {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }
        return this.xmlCanonicalizer.Canonicalize(this.innerXml);
    }

}

/**
 * Represents the C14N XML canonicalization transform for a digital signature
 * as defined by the World Wide Web Consortium (W3C), with comments.
 */
export class XmlDsigC14NWithCommentsTransform extends XmlDsigC14NTransform {
    public Algorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments";
    protected xmlCanonicalizer = new XmlCanonicalizer(true, false);
}

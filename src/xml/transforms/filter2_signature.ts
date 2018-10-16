import { Select, XE, XmlError } from "xml-core";

import { Transform } from "../transform";

/**
 * Represents the XML-Signature XPath Filter 2.0 transform for an XML digital signature as defined by the W3C.
 */
export class XmlDsigXPathFilter2Transform extends Transform {

    public Algorithm = "http://www.w3.org/2002/06/xmldsig-filter2";

    /**
     * Returns the output of the current XmlDsigXPathFilter2Transform object.
     * @returns string
     */
    public GetOutput(): any {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }

        if (!this.Element) {
            return this.innerXml;
        }

        const filterNode = Select(this.Element as Node, ".//*[local-name(.)='XPath']/@Filter")[0];
        const xpathNode = Select(this.Element as Node, ".//*[local-name(.)='XPath']/text()")[0];

        if (!filterNode || !xpathNode) {
            return this.innerXml;
        }

        const xpath = xpathNode.nodeValue;
        const filter = filterNode.nodeValue;

        if (!filter || !xpath) {
            return this.innerXml;
        }

        // make ds namespace searchable
        this.innerXml.setAttribute('xmlns:ds', 'http://www.w3.org/2000/09/xmldsig#');
        const signature = Select(this.innerXml, xpath)[0];
        this.innerXml.removeAttribute('xmlns:ds');

        if (filter === 'subtract') {
            if (signature && signature.parentNode) {
                signature.parentNode.removeChild(signature);
            }
        } else {
            new XmlError(XE.METHOD_NOT_SUPPORTED, `filter=${filter}`)
        }

        return this.innerXml;
    }
}
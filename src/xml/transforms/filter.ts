import { XE, XmlError, XmlChildElement  } from "xml-core";
import { Transform } from "../transform";
import { XPathFilterObject } from "./children/xpath_filter";
import { XmlSignature } from "../xml_names";

/*
<Transform Algorithm="http://www.w3.org/2002/06/xmldsig-filter2">
    <XPath xmlns="http://www.w3.org/2002/06/xmldsig-filter2" Filter="intersect">//RenderedData</XPath>
</Transform>
*/

/**
 * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
 */
export class XmlDsigFilterTransform extends Transform {

    public Algorithm: string = "http://www.w3.org/2002/06/xmldsig-filter2";

    @XmlChildElement({
        localName:"XPath",
        required: true,
        parser: XPathFilterObject,
        prefix: "",
        namespaceURI: XmlSignature.NamespaceURI
    })
    public XPathFilter: XPathFilterObject;

    /**
     * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
     * @returns string
     */
    public GetOutput(): any {
        if (!this.innerXml) {
            throw new XmlError(XE.PARAM_REQUIRED, "innerXml");
        }

        if(!this.XPathFilter){
            this.XPathFilter = new XPathFilterObject()
            this.XPathFilter.Prefix = "";
            this.XPathFilter.Filter = "intersect";
            this.XPathFilter.XPath = "//CounterpartData";
        }

        return this.innerXml;
    }   
}




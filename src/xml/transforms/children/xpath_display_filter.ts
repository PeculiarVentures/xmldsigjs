import { XmlAttribute, XmlElement, XmlContent } from "xml-core";
import { XmlSignature } from "../../xml_names";
import { XmlSignatureObject } from "../../xml_object";

//N.B. This does not apply any XPath filters to the original doc, it exists only to ensure that the XPath filter information is included in the signature

@XmlElement({
    localName: XmlSignature.ElementNames.XPath,
    prefix: "",
    namespaceURI: "http://www.w3.org/2002/06/xmldsig-filter2",
})
export class XPathDisplayFilterObject extends XmlSignatureObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Filter,
        required: true,
    })
    public Filter: string;

    //TODO: This needs to be the content
    @XmlContent({
        required:true       
    })
    public XPath: string;
}
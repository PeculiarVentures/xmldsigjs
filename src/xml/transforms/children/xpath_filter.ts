import { XmlAttribute, XmlElement, XmlContent } from "xml-core";
import { XmlSignature } from "../../xml_names";
import { XmlSignatureObject } from "../../xml_object";

@XmlElement({
    localName: XmlSignature.ElementNames.XPath,
    prefix: "",
    namespaceURI: "http://www.w3.org/2002/06/xmldsig-filter2",
})
export class XPathFilterObject extends XmlSignatureObject {

    @XmlAttribute({
        localName: XmlSignature.AttributeNames.Filter,
        required: true,
    })
    public Filter: string = "intersect";

    //TODO: This needs to be the content
    @XmlContent({
        required:true       
    })
    public XPath: string = "//CounterpartData";
}
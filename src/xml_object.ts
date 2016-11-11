import { XmlObject, XmlCollection } from "xmljs";
import { XmlSignature } from "./xml";

export abstract class XmlSignatureObject extends XmlObject {

    protected prefix = XmlSignature.DefaultPrefix;
    protected namespaceUri = XmlSignature.NamespaceURI;

}

export abstract class XmlSignatureCollection<I extends XmlSignatureObject> extends XmlCollection<I> {

    protected prefix = XmlSignature.DefaultPrefix;
    protected namespaceUri = XmlSignature.NamespaceURI;

}
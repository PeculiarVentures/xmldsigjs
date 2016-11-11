import { XmlError } from "xmljs";

export class XmlSignatureError extends XmlError {
    protected readonly prefix = "XMLDSIG";
}
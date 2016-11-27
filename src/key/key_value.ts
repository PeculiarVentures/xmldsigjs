import { XmlError, XE } from "xmljs";
import { XmlSignatureObject } from "../xml_object";
import { KeyInfoClause } from "../key_info";

/**
 * Represents the <KeyValue> element of an XML signature.
 */
export class KeyValue extends XmlSignatureObject {

    protected name = "KeyValue";
    protected value: KeyInfoClause;

    public set Value(v: KeyInfoClause) {
        this.element = null;
        this.value = v;
    }

    public get Value(): KeyInfoClause {
        return this.value;
    }

    constructor(value?: KeyInfoClause) {
        super();
        if (value)
            this.Value = value;
    }

    /**
     * Returns the XML representation of the KeyValue.
     * @returns Element
     */
    GetXml(): Element {
        if (this.element)
            return this.element;

        let doc = this.CreateDocument();

        // RsaKeyValue
        let keyValue = this.CreateElement(doc);

        if (!this.Value)
            throw new XmlError(XE.CRYPTOGRAPHIC, "KeyValue has no Value parameter.");

        keyValue.appendChild(this.Value.GetXml());

        return keyValue;
    }

    /**
     * Loads an KeyValue from an XML element.
     * @param  {Element} element
     * @returns void
     */
    LoadXml(element: Element): void {

    }

}
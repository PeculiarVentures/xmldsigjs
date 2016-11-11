import { XmlError, XE } from "xmljs";
import { XmlSignature } from "./xml";
import { XmlSignatureObject } from "./xml_object";

export interface ITransform extends IXmlSerializable {
    Algorithm: string;
    LoadInnerXml(node: Node): void;
    GetInnerXml(): Node | null;
    GetOutput(): any;
}

export interface ITransformConstructable {
    new (): Transform;
}

/**
 * The Transform element contains a single transformation
 */
export class Transform extends XmlSignatureObject implements ITransform {

    protected name = XmlSignature.ElementNames.Transform;
    protected innerXml: Node | null = null;

    // Private variables

    // Public properties
    /**
     * Algorithm of the transformation
     */
    public Algorithm: string;

    /**
     * XPath of the transformation
     */
    public XPath: string;


    // Constructors
    /**
     * Default constructor
     */
    public constructor() {
        super();
    }

    // Public methods

    /**
     * When overridden in a derived class, returns the output of the current Transform object.
     */
    GetOutput(): string {
        throw new XmlError(XE.METHOD_NOT_IMPLEMENTED);
    }

    LoadInnerXml(node: Node) {
        if (!node)
            throw new XmlError(XE.PARAM_REQUIRED, "node");
        this.innerXml = node;
    }

    GetInnerXml(): Node | null {
        return this.innerXml;
    }

    /**
     * Check to see if something has changed in this instance and needs to be serialized
     * @returns Flag indicating if a member needs serialization
     */
    public HasChanged(): boolean {
        let retVal = false;

        if (this.Algorithm) {
            retVal = true;
        }

        if (this.XPath) {
            retVal = true;
        }

        return retVal;
    }

    /**
     * Load state from an XML element
     * @param {Element} element XML element containing new state
     */
    public LoadXml(element: Element): void {
        super.LoadXml(element);

        this.Algorithm = this.GetAttribute(XmlSignature.AttributeNames.Algorithm, "", false) !;
        let xpath = this.GetElement(XmlSignature.ElementNames.XPath, false);
        this.XPath = xpath && xpath.textContent ? xpath.textContent : "";

    }

    /**
     * Returns the XML representation of the this object
     * @returns XML element containing the state of this object
     */
    public GetXml(): Element {
        const document = this.CreateDocument();
        const element = this.CreateElement(document);

        // @Algorithm
        element.setAttribute(XmlSignature.AttributeNames.Algorithm, this.Algorithm || "");

        if (this.XPath) {
            let xmlXPath = document.createElementNS(XmlSignature.NamespaceURI, this.GetPrefix() + "XPath");
            xmlXPath.textContent = this.XPath;
            element.appendChild(xmlXPath);
        }

        return element;
    }

}
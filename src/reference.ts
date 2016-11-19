import { XmlError, XE } from "xmljs";
import { Convert } from "xmljs";
import { XmlSignature } from "./xml";
import { XmlSignatureObject } from "./xml_object";
import { Transform } from "./transform";
import { Transforms } from "./transforms";

/**
 * Represents the <reference> element of an XML signature.
 */
export class Reference extends XmlSignatureObject {

    protected name = XmlSignature.ElementNames.Reference;

    private transforms: Transforms;
    private digestMethod: string | null;
    private digestValue: ArrayBuffer;
    private id: string | null;
    private uri: string | null;
    private type: string | null;

    public constructor(p?: string) {
        super();
        this.transforms = new Transforms();
        this.digestMethod = "http://www.w3.org/2001/04/xmlenc#sha256";
        if (typeof p === "string") {
            this.uri = p;
        }
    }

    /**
     * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
     */
    get DigestMethod(): string | null {
        return this.digestMethod;
    }
    set DigestMethod(value: string | null) {
        this.element = null;
        this.digestMethod = value;
    }

    /**
     * Gets or sets the digest value of the current Reference.
     */
    get DigestValue(): ArrayBuffer {
        return this.digestValue;
    }
    set DigestValue(value: ArrayBuffer) {
        this.element = null;
        this.digestValue = value;
    }

    /**
     * Gets or sets the ID of the current Reference.
     */
    get Id(): string | null {
        return this.id;
    }
    set Id(value: string | null) {
        this.element = null;
        this.id = value;
    }

    /**
     * Gets the transform chain of the current Reference.
     */
    get TransformChain(): Transforms {
        return this.transforms;
    }

    /**
     * Gets or sets the type of the object being signed.
     */
    get Type(): string | null {
        return this.type;
    }
    set Type(value: string | null) {
        this.element = null;
        this.type = value;
    }

    /**
     * Gets or sets the Uri of the current Reference.
     */
    get Uri(): string | null {
        return this.uri;
    }
    set Uri(value: string | null) {
        this.element = null;
        this.uri = value;
    }

    /**
     * Adds a Transform object to the list of transforms to be performed 
     * on the data before passing it to the digest algorithm.
     * @param  {Transform} transform The transform to be added to the list of transforms.
     * @returns void
     */
    AddTransform(transform: Transform): void {
        this.transforms.Add(transform);
    }

    /**
     * Returns the XML representation of the Reference.
     * @returns Element
     */
    GetXml(): Element {
        if (this.element != null)
            return this.element;

        if (this.digestMethod == null)
            throw new XmlError(XE.CRYPTOGRAPHIC, "DigestMethod");
        if (this.digestValue == null)
            throw new XmlError(XE.PARAM_REQUIRED, "DigestValue");

        const doc = this.CreateDocument();
        const xel = this.CreateElement(doc);

        let prefix = this.GetPrefix();

        // @id
        if (this.id != null)
            xel.setAttribute(XmlSignature.AttributeNames.Id, this.id);

        // @uri
        if (this.uri != null)
            xel.setAttribute(XmlSignature.AttributeNames.URI, this.uri);

        // @type
        if (this.type != null)
            xel.setAttribute(XmlSignature.AttributeNames.Type, this.type);

        // Transforms
        if (this.transforms.Count > 0) {
            let ts = this.transforms.GetXml();
            xel.appendChild(ts);
        }

        // DigestMethod
        let dm = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.DigestMethod);
        dm.setAttribute(XmlSignature.AttributeNames.Algorithm, this.digestMethod);
        xel.appendChild(dm);

        // DigestValue
        let dv = doc.createElementNS(XmlSignature.NamespaceURI, prefix + XmlSignature.ElementNames.DigestValue);
        dv.textContent = Convert.ToString(this.digestValue, "base64");
        xel.appendChild(dv);

        return xel;
    }

    /**
     * Loads a Reference state from an XML element.
     * @param  {Element} value
     */
    LoadXml(value: Element) {
        super.LoadXml(value);

        this.id = this.GetAttribute(XmlSignature.AttributeNames.Id, null, false);
        this.uri = this.GetAttribute(XmlSignature.AttributeNames.URI, null, false);
        this.type = this.GetAttribute(XmlSignature.AttributeNames.Type, null, false);

        const transforms = this.GetChild(XmlSignature.ElementNames.Transforms, false);
        if (transforms) {
            this.transforms.LoadXml(transforms);
        }
        // get DigestMethod
        const digest = this.GetChild(XmlSignature.ElementNames.DigestMethod, true) !;
        this.digestMethod = XmlSignatureObject.GetAttribute(digest, XmlSignature.AttributeNames.Algorithm, null, true) !;
        // get DigestValue
        let dig = this.GetChild(XmlSignature.ElementNames.DigestValue, false);
        if (dig)
            this.DigestValue = Convert.FromString(dig.textContent || "", "base64").buffer;
    }
}

import * as XmlCore from "xml-core";

import { ISignatureAlgorithm } from "./algorithm";
import * as Alg from "./algorithms";
import { RsaPssBase } from "./algorithms";
import { CryptoConfig } from "./crypto_config";
import { KeyInfo, Reference, References, Signature, SignedInfo, Transform as XmlTransform, Transforms as XmlTransforms, XmlDsigC14NWithCommentsTransform, XmlDsigExcC14NWithCommentsTransform } from "./xml";
import { KeyInfoX509Data, KeyValue } from "./xml/key_infos";
import * as KeyInfos from "./xml/key_infos";
import * as Transforms from "./xml/transforms";
import { BufferSourceConverter, Convert } from "pvtsutils";
import { Application } from "./application";

export interface OptionsXPathSignTransform {
    name: "xpath";
    selector: string;
    namespaces?: Record<string, string>;
}

export type OptionsSignTransform = "enveloped" | "c14n" | "exc-c14n" | "c14n-com" | "exc-c14n-com" | "base64" | OptionsXPathSignTransform;

export type DigestReferenceSource = Element | BufferSource;

export interface OptionsVerify {
    key?: CryptoKey;
    content?: DigestReferenceSource;
}

export interface OptionsSignReference {
    /**
     * Id of Reference
     *
     * @type {string}
     * @memberOf OptionsSignReference
     */
    id?: string;
    uri?: string;
    type?: string;
    /**
     * Hash algorithm
     */
    hash: AlgorithmIdentifier;
    /**
     * List of transforms
     */
    transforms?: OptionsSignTransform[];
}

export interface OptionsSign {
    /**
     * Id of Signature
     */
    id?: string;
    /**
     * Public key for KeyInfo block
     *
     * @type {boolean}
     * @memberOf OptionsSign
     */
    keyValue?: CryptoKey;
    /**
     * List of X509 Certificates
     *
     * @type {string[]}
     * @memberOf OptionsSign
     */
    x509?: string[];
    /**
     * List of Reference
     * Default is Reference with hash alg SHA-256 and exc-c14n transform
     *
     * @type {OptionsSignReference[]}
     * @memberOf OptionsSign
     */
    references?: OptionsSignReference[];
}

/**
 * Provides a wrapper on a core XML signature object to facilitate creating XML signatures.
 */
export class SignedXml implements XmlCore.IXmlSerializable {

    public get XmlSignature() {
        return this.signature;
    }

    public contentHandler?: (reference: Reference, target: this) => Promise<Document | DigestReferenceSource | null>;

    public Parent?: Element | XmlCore.XmlObject;
    public Key?: CryptoKey;
    public Algorithm?: Algorithm | RsaPssParams | EcdsaParams;
    public get Signature() {
        return this.XmlSignature.SignatureValue;
    }

    protected signature = new Signature();
    protected document?: Document;

    /**
     * Creates an instance of SignedXml.
     *
     * @param {(Document | Element)} [node]
     *
     * @memberOf SignedXml
     */
    constructor(node?: Document | Element) {
        // constructor();
        if (node && (node as Node).nodeType === XmlCore.XmlNodeType.Document) {
            // constructor(node: Document);
            this.document = node as Document;
        } else if (node && (node as Node).nodeType === XmlCore.XmlNodeType.Element) {
            // constructor(node: Element);
            const xmlText = new XMLSerializer().serializeToString(node);
            this.document = new DOMParser().parseFromString(xmlText, XmlCore.APPLICATION_XML);
        }
    }

    public async Sign(algorithm: Algorithm | EcdsaParams | RsaPssParams, key: CryptoKey, data: Document | DigestReferenceSource, options: OptionsSign = {}) {
        if (XmlCore.isDocument(data)) {
            data = (data.cloneNode(true) as Document).documentElement;
        } else if (XmlCore.isElement(data)) {
            data = data.cloneNode(true) as Element;
        }
        let alg: ISignatureAlgorithm;
        let signedInfo: SignedInfo;
        const signingAlg = XmlCore.assign({}, algorithm);

        if (key.algorithm["hash"]) {
            signingAlg.hash = key.algorithm["hash"];
        }
        alg = CryptoConfig.GetSignatureAlgorithm(signingAlg);
        await this.ApplySignOptions(this.XmlSignature, algorithm, key, options);

        signedInfo = this.XmlSignature.SignedInfo;

        await this.DigestReferences(data);

        // Add signature method
        signedInfo.SignatureMethod.Algorithm = alg.namespaceURI;
        if (alg instanceof RsaPssBase) {
            // Add RSA-PSS params
            const alg2 = XmlCore.assign({}, key.algorithm, signingAlg);
            if (typeof alg2.hash === "string") {
                alg2.hash = { name: alg2.hash };
            }
            const params = new KeyInfos.PssAlgorithmParams(alg2);
            this.XmlSignature.SignedInfo.SignatureMethod.Any.Add(params);
        } else if (Alg.HMAC.toUpperCase() === algorithm.name.toUpperCase()) {
            // Add HMAC params
            let outputLength = 0;
            const hmacAlg = key.algorithm as any;
            switch (hmacAlg.hash.name.toUpperCase()) {
                case Alg.SHA1:
                    outputLength = hmacAlg.length || 160;
                    break;
                case Alg.SHA256:
                    outputLength = hmacAlg.length || 256;
                    break;
                case Alg.SHA384:
                    outputLength = hmacAlg.length || 384;
                    break;
                case Alg.SHA512:
                    outputLength = hmacAlg.length || 512;
                    break;
            }
            this.XmlSignature.SignedInfo.SignatureMethod.HMACOutputLength = outputLength;
        }
        const si = this.TransformSignedInfo(data);
        const signature = await alg.Sign(si, key, signingAlg);

        this.Key = key;
        this.Algorithm = algorithm;
        this.XmlSignature.SignatureValue = new Uint8Array(signature);
        if (XmlCore.isElement(data)) {
            this.document = data.ownerDocument;
        }
        return this.XmlSignature;
    }

    private async reimportKey(key: CryptoKey, alg: Algorithm) {
        if (key.algorithm.name === alg.name) {
            return key;
        }
        const spki = await Application.crypto.subtle.exportKey("spki", key);
        return Application.crypto.subtle.importKey("spki", spki, alg, true, ["verify"]);
    }

    public Verify(params: OptionsVerify): Promise<boolean>;
    public Verify(key: CryptoKey): Promise<boolean>;
    public Verify(): Promise<boolean>;
    public async Verify(params?: CryptoKey | OptionsVerify) {
        let content: DigestReferenceSource | undefined;
        let key: CryptoKey | undefined;
        if (params) {
            if ("algorithm" in params && "usages" in params && "type" in params) {
                key = params;
            } else {
                key = params.key;
                content = params.content;
            }
        }

        if (key && this.Algorithm) {
            key = await this.reimportKey(key, this.Algorithm);
        }

        if (!content) {
            const xml = this.document;
            if (!(xml && xml.documentElement)) {
                throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "SignedXml", "document");
            }
            content = xml.documentElement;
        }
        if (XmlCore.isDocument(content) || XmlCore.isElement(content)) {
            content = content.cloneNode(true) as Element;
        }

        const res = await this.ValidateReferences(content);

        if (res) {
            const keys: CryptoKey[] = key
                ? [key]
                : await this.GetPublicKeys();

            return this.ValidateSignatureValue(keys);
        } else {
            return false;
        }
    }

    public GetXml() {
        return this.signature.GetXml();
    }

    /**
     * Loads a SignedXml state from an XML element.
     * @param  {Element | string} value The XML to load the SignedXml state from.
     * @returns void
     */
    public LoadXml(value: Element | string) {
        this.signature = Signature.LoadXml(value);

        // Load signature algorithm
        this.Algorithm = CryptoConfig
            .CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod)
            .algorithm;
    }

    public toString() {
        // Check for EnvelopedTransform
        const signature = this.XmlSignature;
        const enveloped = signature.SignedInfo.References && signature.SignedInfo.References.Some((r) =>
            r.Transforms && r.Transforms.Some((t) => t instanceof Transforms.XmlDsigEnvelopedSignatureTransform),
        );

        if (enveloped) {
            const doc = this.document!.documentElement.cloneNode(true);
            const node = this.XmlSignature.GetXml();
            if (!node) {
                throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from Signature");
            }
            const sig = node.cloneNode(true);
            doc.appendChild(sig);
            return new XMLSerializer().serializeToString(doc);
        }
        return this.XmlSignature.toString();
    }

    //#region Protected methods
    /**
     * Returns the public key of a signature.
     */
    protected async GetPublicKeys() {
        const keys: CryptoKey[] = [];

        const alg = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
        for (const kic of this.XmlSignature.KeyInfo.GetIterator()) {
            if (kic instanceof KeyInfos.KeyInfoX509Data) {
                for (const cert of kic.Certificates) {
                    const key = await cert.exportKey();
                    keys.push(key);
                }
            } else {
                const key = await kic.exportKey();
                keys.push(key);
            }
        }

        if (alg.algorithm.name.startsWith("RSA")) {
            // Reimport RSA public keys. They should use the same hash algorithms like Signature.
            // Note: It's possible toe set hash algorithm for RSA key on key importing only
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key.algorithm.name.startsWith("RSA")) {
                    // Reimport key
                    const spki = await Application.crypto.subtle.exportKey("spki", key);
                    const updatedKey = await Application.crypto.subtle.importKey("spki", spki, alg.algorithm, true, ["verify"]);

                    // Replace key
                    keys[i] = updatedKey;
                }
            }
        }

        return keys;
    }

    /**
     * Returns dictionary of namespaces used in signature
     */
    protected GetSignatureNamespaces(): XmlCore.AssocArray<string> {
        const namespaces: XmlCore.AssocArray<string> = {};
        if (this.XmlSignature.NamespaceURI) {
            namespaces[this.XmlSignature.Prefix || ""] = this.XmlSignature.NamespaceURI;
        }
        return namespaces;
    }

    /**
     * Copies namespaces from source element and its parents into destination element
     */
    protected CopyNamespaces(src: Element, dst: Element, ignoreDefault: boolean): void {
        // this.InjectNamespaces(XmlCore.SelectNamespaces(src), dst, ignoreDefault);
        this.InjectNamespaces(SelectRootNamespaces(src), dst, ignoreDefault);
    }

    /**
     * Injects namespaces from dictionary to the target element
     */
    protected InjectNamespaces(namespaces: { [index: string]: string; }, target: Element, ignoreDefault: boolean): void {
        for (const i in namespaces) {
            const uri = namespaces[i];
            if (ignoreDefault && i === "") {
                continue;
            }
            target.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    }

    // public getReferenceData(reference: Reference): Promise<ArrayBuffer | Element> {
    // }

    protected async DigestReference(source: DigestReferenceSource, reference: Reference, checkHmac: boolean) {
        if (this.contentHandler) {
            const content = await this.contentHandler(reference, this);
            if (content) {
                source = XmlCore.isDocument(content)
                    ? content.documentElement
                    : content;
            }
        }

        if (reference.Uri) {
            let objectName: string | undefined;
            if (!reference.Uri.indexOf("#xpointer")) {
                let uri: string = reference.Uri;
                uri = uri.substring(9).replace(/[\r\n\t\s]/g, "");
                if (uri.length < 2 || uri[0] !== `(` || uri[uri.length - 1] !== `)`) {
                    // FIXME: how to handle invalid xpointer?
                    uri = ""; // String.Empty
                } else {
                    uri = uri.substring(1, uri.length - 1);
                }
                if (uri.length > 6 && uri.indexOf(`id(`) === 0 && uri[uri.length - 1] === `)`) {
                    // id('foo'), id("foo")
                    objectName = uri.substring(4, uri.length - 2);
                }
            } else if (reference.Uri[0] === `#`) {
                objectName = reference.Uri.substring(1);
            }
            if (objectName) {
                let found: Element | null = null;
                const xmlSignatureObjects = [this.XmlSignature.KeyInfo.GetXml()];
                this.XmlSignature.ObjectList.ForEach((object) => {
                    xmlSignatureObjects.push(object.GetXml());
                });
                for (const xmlSignatureObject of xmlSignatureObjects) {
                    if (xmlSignatureObject) {
                        found = findById(xmlSignatureObject, objectName!);
                        if (found) {
                            const el = found.cloneNode(true) as Element;

                            // Copy xmlns from Document
                            if (XmlCore.isElement(source)) {
                                this.CopyNamespaces(source, el, false);
                            }

                            // Copy xmlns from Parent
                            if (this.Parent) {
                                const parent = (this.Parent instanceof XmlCore.XmlObject)
                                    ? this.Parent.GetXml()!
                                    : this.Parent;
                                this.CopyNamespaces(parent, el, true);
                            }

                            this.CopyNamespaces(found, el, false);
                            this.InjectNamespaces(this.GetSignatureNamespaces(), el, true);
                            source = el;
                            break;
                        }
                    }
                }
                if (!found && (source && XmlCore.isElement(source))) {
                    found = XmlCore.XmlObject.GetElementById(source, objectName);
                    if (found) {
                        const el = found.cloneNode(true) as Element;
                        this.CopyNamespaces(found, el, false);
                        this.CopyNamespaces(source, el, false);
                        source = el;
                    }
                }
                if (found == null) {
                    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, `Cannot get object by reference: ${objectName}`);
                }
            }
        }

        let canonOutput: any = null;
        if (reference.Transforms && reference.Transforms.Count) {
            if (BufferSourceConverter.isBufferSource(source)) {
                throw new Error("Transformation for argument 'source' of type BufferSource is not implemented");
            }
            canonOutput = this.ApplyTransforms(reference.Transforms, source);
        } else {
            // we must not apply C14N transform to references out of the document
            // e.g. non-xml documents
            if (reference.Uri && reference.Uri[0] !== `#`) {
                if (XmlCore.isElement(source)) {
                    if (!source.ownerDocument) {
                        throw new Error("Cannot get ownerDocument from the XML document");
                    }
                    canonOutput = new XMLSerializer().serializeToString(source.ownerDocument);
                } else {
                    canonOutput = BufferSourceConverter.toArrayBuffer(source);
                }
            } else {
                // apply default C14N transformation
                const excC14N = new Transforms.XmlDsigC14NTransform();
                if (BufferSourceConverter.isBufferSource(source)) {
                    source = XmlCore.Parse(Convert.ToUtf8String(source)).documentElement;
                }
                excC14N.LoadInnerXml(source);
                canonOutput = excC14N.GetOutput();
            }
        }

        if (!reference.DigestMethod.Algorithm) {
            throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "Reference", "DigestMethod");
        }
        const digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
        return digest.Digest(canonOutput);
    }

    protected async DigestReferences(data: DigestReferenceSource) {
        // we must tell each reference which hash algorithm to use
        // before asking for the SignedInfo XML !
        for (const ref of this.XmlSignature.SignedInfo.References.GetIterator()) {
            if (ref.DigestValue) {
                // Skip digest calculating if reference has got a DigestValue
                continue;
            }
            // assume SHA-256 if nothing is specified
            if (!ref.DigestMethod.Algorithm) {
                ref.DigestMethod.Algorithm = new Alg.Sha256().namespaceURI;
            }
            const hash = await this.DigestReference(data, ref, false);
            ref.DigestValue = hash;
        }
    }

    protected TransformSignedInfo(data?: Element | Document | BufferSource): string {
        const t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);

        const xml = this.XmlSignature.SignedInfo.GetXml();
        if (!xml) {
            throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");
        }

        const node = xml.cloneNode(true) as Element;

        //#region Get root namespaces
        // Get xmlns from SignedInfo
        this.CopyNamespaces(xml, node, false);

        if (data && !BufferSourceConverter.isBufferSource(data)) {
            // Get xmlns from Document
            if (data.nodeType === XmlCore.XmlNodeType.Document) {
                this.CopyNamespaces((data as Document).documentElement, node, false);
            } else {
                this.CopyNamespaces(data as Element, node, false);
            }
        }
        if (this.Parent) {
            // Get xmlns from Parent
            const parentXml = (this.Parent instanceof XmlCore.XmlObject)
                ? this.Parent.GetXml()
                : this.Parent;

            if (parentXml) {
                this.CopyNamespaces(parentXml, node, false);
            }
        }
        //#endregion

        const childNamespaces = XmlCore.SelectNamespaces(xml);
        for (const i in childNamespaces) {
            const uri = childNamespaces[i];
            if (i === node.prefix) {
                continue;
            }
            node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
        t.LoadInnerXml(node);
        const res = t.GetOutput();
        return res;
    }

    protected ResolveTransform(transform: OptionsSignTransform): XmlTransform {
        if (typeof transform === "string") {
            switch (transform) {
                case "enveloped":
                    return new Transforms.XmlDsigEnvelopedSignatureTransform();
                case "c14n":
                    return new Transforms.XmlDsigC14NTransform();
                case "c14n-com":
                    return new Transforms.XmlDsigC14NWithCommentsTransform();
                case "exc-c14n":
                    return new Transforms.XmlDsigExcC14NTransform();
                case "exc-c14n-com":
                    return new Transforms.XmlDsigExcC14NWithCommentsTransform();
                case "base64":
                    return new Transforms.XmlDsigBase64Transform();
                default:
                    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, transform);
            }
        }

        switch (transform.name) {
            case "xpath": {
                const xpathTransform = new Transforms.XmlDsigXPathTransform();
                xpathTransform.XPath = transform.selector;

                const transformEl = xpathTransform.GetXml();

                if (transformEl && transform.namespaces) {
                    for (const [prefix, namespace] of Object.entries(transform.namespaces)) {
                        // xpathEl.setAttribute(`xmlns:${prefix}`, namespace);
                        (transformEl.firstChild as Element).setAttributeNS("http://www.w3.org/2000/xmlns/", `xmlns:${prefix}`, namespace);
                    }
                }

                return xpathTransform;
            }
            default:
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, transform.name);
        }
    }

    protected ApplyTransforms(transforms: XmlTransforms, input: Element): any {
        let output: any = null;

        transforms.Sort((a, b) => {
            const c14nTransforms = [Transforms.XmlDsigC14NTransform, XmlDsigC14NWithCommentsTransform,
            Transforms.XmlDsigExcC14NTransform, XmlDsigExcC14NWithCommentsTransform];
            if (c14nTransforms.some((t) => a instanceof t)) {
                return 1;
            }
            if (c14nTransforms.some((t) => b instanceof t)) {
                return -1;
            }
            return 0;
        }).ForEach((transform) => {
            transform.LoadInnerXml(input);
            if (transform instanceof Transforms.XmlDsigXPathTransform) {
                transform.GetOutput();
            } else {
                output = transform.GetOutput();
            }
        });
        // Apply C14N transform if Reference has only one transform EnvelopedSignature
        if (transforms.Count === 1 && transforms.Item(0) instanceof Transforms.XmlDsigEnvelopedSignatureTransform) {
            const c14n = new Transforms.XmlDsigC14NTransform();
            c14n.LoadInnerXml(input);
            output = c14n.GetOutput();
        }

        return output;
    }

    protected async ApplySignOptions(signature: Signature, algorithm: Algorithm, key: CryptoKey, options: OptionsSign) {
        //#region id
        if (options.id) {
            this.XmlSignature.Id = options.id;
        }
        //#endregion

        //#region keyValue
        if (options.keyValue && key.algorithm.name!.toUpperCase() !== Alg.HMAC) {
            if (!signature.KeyInfo) {
                signature.KeyInfo = new KeyInfo();
            }
            const keyInfo = signature.KeyInfo;
            const keyValue = new KeyValue();
            keyInfo.Add(keyValue);
            await keyValue.importKey(options.keyValue);
        }
        //#endregion

        //#region x509
        if (options.x509) {
            if (!signature.KeyInfo) {
                signature.KeyInfo = new KeyInfo();
            }
            const keyInfo = signature.KeyInfo;
            options.x509.forEach((x509) => {
                const raw = XmlCore.Convert.FromBase64(x509);
                const x509Data = new KeyInfoX509Data(raw);
                keyInfo.Add(x509Data);
            });
        }
        //#endregion

        //#region references
        if (options.references) {
            options.references.forEach((item) => {
                const reference = new Reference();
                // Id
                if (item.id) {
                    reference.Id = item.id;
                }
                // Uri
                if (item.uri !== null && item.uri !== undefined) {
                    reference.Uri = item.uri;
                }
                // Type
                if (item.type) {
                    reference.Type = item.type;
                }
                // DigestMethod
                const digestAlgorithm = CryptoConfig.GetHashAlgorithm(item.hash);
                reference.DigestMethod.Algorithm = digestAlgorithm.namespaceURI;
                // transforms
                if (item.transforms && item.transforms.length) {
                    const transforms = new XmlTransforms();
                    item.transforms.forEach((transform) => {
                        transforms.Add(this.ResolveTransform(transform));
                    });
                    reference.Transforms = transforms;
                }
                if (!signature.SignedInfo.References) {
                    signature.SignedInfo.References = new References();
                }
                signature.SignedInfo.References.Add(reference);
            });
        }
        //#endregion

        //#region Set default values
        if (!signature.SignedInfo.References.Count) {
            // Add default Reference
            const reference = new Reference();
            signature.SignedInfo.References.Add(reference);
        }
        //#endregion
    }

    protected async ValidateReferences(doc: DigestReferenceSource) {
        for (const ref of this.XmlSignature.SignedInfo.References.GetIterator()) {
            const digest = await this.DigestReference(doc, ref, false);
            const b64Digest = XmlCore.Convert.ToBase64(digest);
            const b64DigestValue = XmlCore.Convert.ToString(ref.DigestValue, "base64");
            if (b64Digest !== b64DigestValue) {
                const errText = `Invalid digest for uri '${ref.Uri}'. Calculated digest is ${b64Digest} but the xml to validate supplies digest ${b64DigestValue}`;
                throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, errText);
            }
        }
        return true;
    }

    protected async ValidateSignatureValue(keys: CryptoKey[]) {
        let signer: ISignatureAlgorithm;
        let signedInfoCanon: string;

        signedInfoCanon = this.TransformSignedInfo(this.document);
        signer = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);

        // Verify signature for all exported keys
        for (const key of keys) {
            const ok = await signer.Verify(signedInfoCanon, key, this.Signature!);
            if (ok) {
                return true;
            }
        }
        return false;
    }

}

function findById(element: Element, id: string): Element | null {
    if (element.nodeType !== XmlCore.XmlNodeType.Element) {
        return null;
    }
    if (element.hasAttribute("Id") && element.getAttribute("Id") === id) {
        return element;
    }
    if (element.childNodes && element.childNodes.length) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const el = findById(element.childNodes[i] as Element, id);
            if (el) {
                return el;
            }
        }
    }
    return null;
}

/**
 * Adding new namespace to assoc array.
 * If `name` exists in array then ignore it
 * @param selectedNodes assoc array of namespaces
 * @param name          name of namespace
 * @param namespace     namespace value
 */
function addNamespace(selectedNodes: XmlCore.AssocArray<string>, name: string, namespace: string) {
    if (!(name in selectedNodes)) {
        selectedNodes[name] = namespace;
    }
}

// TODO it can be moved to XmlCore
function _SelectRootNamespaces(node: Node, selectedNodes: XmlCore.AssocArray<string> = {}) {
    if (XmlCore.isElement(node)) {
        if (node.namespaceURI && node.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
            addNamespace(selectedNodes, node.prefix ? node.prefix : "", node.namespaceURI!);
        }
        //#region Select all xmlns attrs
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes.item(i);
            if (attr && attr.prefix === "xmlns") {
                addNamespace(selectedNodes, attr.localName ? attr.localName : "", attr.value);
            }
        }
        //#endregion
        if (node.parentNode) {
            _SelectRootNamespaces(node.parentNode, selectedNodes);
        }
    }
}

export function SelectRootNamespaces(node: Element) {
    const attrs: XmlCore.AssocArray<string> = {};
    _SelectRootNamespaces(node, attrs);
    return attrs;
}

import * as XmlCore from "xml-core";
import { XmlNodeType } from "xml-core";

import { ISignatureAlgorithm } from "./algorithm";
import * as Alg from "./algorithm/index";
import { CryptoConfig } from "./crypto_config";
import { KeyInfo, Reference, References, Signature, SignedInfo, Transform as XmlTransform, Transforms as XmlTransforms } from "./xml";
import { KeyInfoX509Data, KeyValue } from "./xml/key_infos";
import * as KeyInfos from "./xml/key_infos";
import * as Transforms from "./xml/transforms";

export type OptionsSignTransform = "enveloped" | "c14n" | "exc-c14n" | "c14n-com" | "exc-c14n-com" | "base64";

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
     *
     * @type {AlgorithmIdentifier}
     * @memberOf OptionsSignReference
     */
    hash: AlgorithmIdentifier;
    /**
     * List of transforms
     *
     * @type {OptionsSignTransform[]}
     * @memberOf OptionsSignReference
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

    public Sign(algorithm: Algorithm, key: CryptoKey, data: Document, options?: OptionsSign): PromiseLike<Signature> {
        let alg: ISignatureAlgorithm;
        let signedInfo: SignedInfo;
        return Promise.resolve()
            .then(() => {
                const signingAlg = XmlCore.assign({}, key.algorithm, algorithm);
                alg = CryptoConfig.GetSignatureAlgorithm(signingAlg);
                return this.ApplySignOptions(this.XmlSignature, algorithm, key, options);
            })
            .then(() => {
                signedInfo = this.XmlSignature.SignedInfo;

                return this.DigestReferences(data.documentElement);
            })
            .then(() => {
                // Add signature method
                signedInfo.SignatureMethod.Algorithm = alg.namespaceURI;
                if (Alg.RSA_PSS.toUpperCase() === algorithm.name.toUpperCase()) {
                    // Add RSA-PSS params
                    const alg2 = XmlCore.assign({}, key.algorithm, algorithm);
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
                return alg.Sign(si, key, algorithm);
            })
            .then((signature) => {
                this.Key = key;
                this.XmlSignature.SignatureValue = new Uint8Array(signature);
                this.document = data;
                return this.XmlSignature;
            });
    }

    public Verify(key?: CryptoKey): PromiseLike<boolean> {
        return Promise.resolve()
            .then(() => {
                const xml = this.document;
                if (!(xml && xml.documentElement)) {
                    throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "SignedXml", "document");
                }

                return this.ValidateReferences(xml.documentElement);
            })
            .then((res) => {
                if (res) {
                    let promise = Promise.resolve<CryptoKey[]>([]);
                    if (key) {
                        promise = promise.then(() =>
                            [key],
                        );
                    } else {
                        promise = promise.then(() =>
                            this.GetPublicKeys(),
                        );
                    }
                    return promise.then((keys: CryptoKey[]) => {
                        return this.ValidateSignatureValue(keys);
                    });
                } else {
                    return false;
                }
            });
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
    protected GetPublicKeys(): PromiseLike<CryptoKey[]> {
        const keys: CryptoKey[] = [];
        return Promise.resolve()
            .then(() => {
                const pkEnumerator = this.XmlSignature.KeyInfo.GetIterator();

                const promises: Array<PromiseLike<void>> = [];
                pkEnumerator.forEach((kic) => {
                    const alg = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
                    if (kic instanceof KeyInfos.KeyInfoX509Data) {
                        kic.Certificates.forEach((cert) => {
                            promises.push(
                                cert.exportKey(alg.algorithm)
                                    .then((key) => { keys.push(key); }),
                            );
                        });
                    } else {
                        promises.push(
                            kic.exportKey(alg.algorithm)
                                .then((key) => { keys.push(key); }),
                        );
                    }
                });
                return Promise.all(promises);
            })
            .then(() => keys);
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
    protected InjectNamespaces(namespaces: { [index: string]: string }, target: Element, ignoreDefault: boolean): void {
        for (const i in namespaces) {
            const uri = namespaces[i];
            if (ignoreDefault && i === "") {
                continue;
            }
            target.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    }

    protected DigestReference(doc: Element, reference: Reference, checkHmac: boolean) {
        return Promise.resolve()
            .then(() => {
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
                                    this.CopyNamespaces(doc, el, false);

                                    // Copy xmlns from Parent
                                    if (this.Parent) {
                                        const parent = (this.Parent instanceof XmlCore.XmlObject)
                                            ? this.Parent.GetXml()!
                                            : this.Parent;
                                        this.CopyNamespaces(parent, el, true);
                                    }

                                    this.CopyNamespaces(found, el, false);
                                    this.InjectNamespaces(this.GetSignatureNamespaces(), el, true);
                                    doc = el;
                                    break;
                                }
                            }
                        }
                        if (!found && doc) {
                            found = XmlCore.XmlObject.GetElementById(doc, objectName);
                            if (found) {
                                const el = found.cloneNode(true) as Element;
                                this.CopyNamespaces(found, el, false);
                                this.CopyNamespaces(doc, el, false);
                                doc = el;
                            }
                        }
                        if (found == null) {
                            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, `Cannot get object by reference: ${objectName}`);
                        }
                    }
                }

                let canonOutput: any = null;
                if (reference.Transforms && reference.Transforms.Count) {
                    canonOutput = this.ApplyTransforms(reference.Transforms, doc);
                } else {
                    // we must not C14N references from outside the document
                    // e.g. non-xml documents
                    if (reference.Uri && reference.Uri[0] !== `#`) {
                        canonOutput = new XMLSerializer().serializeToString(doc.ownerDocument);
                    } else {
                        // apply default C14N transformation
                        const excC14N = new Transforms.XmlDsigC14NTransform();
                        excC14N.LoadInnerXml(doc);
                        canonOutput = excC14N.GetOutput();
                    }
                }

                if (!reference.DigestMethod.Algorithm) {
                    throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "Reference", "DigestMethod");
                }
                const digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
                return digest.Digest(canonOutput);
            });
    }

    protected DigestReferences(data: Element) {
        return Promise.resolve()
            .then(() => {
                // we must tell each reference which hash algorithm to use
                // before asking for the SignedInfo XML !
                const promises = this.XmlSignature.SignedInfo.References.Map((ref) => {
                    // assume SHA-256 if nothing is specified
                    if (!ref.DigestMethod.Algorithm) {
                        ref.DigestMethod.Algorithm = new Alg.Sha256().namespaceURI;
                    }
                    return this.DigestReference(data, ref, false)
                        .then((hashValue) => {
                            ref.DigestValue = hashValue;
                        });
                }).GetIterator();

                return Promise.all(promises);
            });
    }

    protected TransformSignedInfo(data?: Element | Document): string {
        const t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);

        const xml = this.XmlSignature.SignedInfo.GetXml();
        if (!xml) {
            throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");
        }

        const node = xml.cloneNode(true) as Element;

        //#region Get root namespaces
        // Get xmlns from SignedInfo
        this.CopyNamespaces(xml, node, false);

        if (data) {
            // Get xmlns from Document
            if (data.nodeType === XmlNodeType.Document) {
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

    protected ResolveFilterTransform(transform: string) {
        const split = transform.split(" ");

        if (split.length !== 3) {
            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_TRANSFORM_FILTER, transform);
        }

        const filterMethod = split[1].trim();
        const xPath = split[2].trim();

        return new Transforms.XmlDsigDisplayFilterTransform({
            Filter: filterMethod,
            XPath: xPath,
        });
    }

    protected ResolveTransform(transform: string): XmlTransform {
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

    protected ApplyTransforms(transforms: XmlTransforms, input: Element): any {
        let output: any = null;

        // Sort transforms. Enveloped should be first transform
        // Unless there is a Filter transform, in which case it takes precedence
        transforms.Sort((a, b) => {

            // Filter is always the most imporant
            if (a instanceof Transforms.XmlDsigDisplayFilterTransform)            {
                return -1;
            }

            if (b instanceof Transforms.XmlDsigDisplayFilterTransform) {
                return 1;
            }

            // Next comes envelope

            if (b instanceof Transforms.XmlDsigEnvelopedSignatureTransform) {
                return -1;
            }

            if (b instanceof Transforms.XmlDsigEnvelopedSignatureTransform) {
                return 1;
            }

            return 0;
        }).ForEach((transform) => {
            // Apply transforms
            if (transform instanceof Transforms.XmlDsigC14NWithCommentsTransform) {
                transform = new Transforms.XmlDsigC14NTransform(); // TODO: Check RFC for it
            }
            if (transform instanceof Transforms.XmlDsigExcC14NWithCommentsTransform) {
                transform = new Transforms.XmlDsigExcC14NTransform(); // TODO: Check RFC for it
            }
            transform.LoadInnerXml(input);
            output = transform.GetOutput();
        });
        // Apply C14N transform if Reference has only one transform EnvelopedSignature
        if (transforms.Count === 1 && transforms.Item(0) instanceof Transforms.XmlDsigEnvelopedSignatureTransform) {
            const c14n = new Transforms.XmlDsigC14NTransform();
            c14n.LoadInnerXml(input);
            output = c14n.GetOutput();
        }

        return output;
    }

    protected ApplySignOptions(signature: Signature, algorithm: Algorithm, key: CryptoKey, options: OptionsSign = {}): PromiseLike<void> {
        return Promise.resolve()
            .then(() => {
                // id
                if (options.id) {
                    this.XmlSignature.Id = options.id;
                }

                // keyValue
                if (options.keyValue && key.algorithm.name!.toUpperCase() !== Alg.HMAC) {
                    if (!signature.KeyInfo) {
                        signature.KeyInfo = new KeyInfo();
                    }
                    const keyInfo = signature.KeyInfo;
                    const keyValue = new KeyValue();
                    keyInfo.Add(keyValue);
                    return keyValue.importKey(options.keyValue) as PromiseLike<any>;
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                // x509
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
                return Promise.resolve();
            })
            .then(() => {
                // references
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

                                if (transform.startsWith("filter")) {
                                    transforms.Add(this.ResolveFilterTransform(transform));
                                } else {
                                    transforms.Add(this.ResolveTransform(transform));
                                }
                            });
                            reference.Transforms = transforms;
                        }
                        if (!signature.SignedInfo.References) {
                            signature.SignedInfo.References = new References();
                        }
                        signature.SignedInfo.References.Add(reference);
                    });
                }

                // Set default values
                if (!signature.SignedInfo.References.Count) {
                    // Add default Reference
                    const reference = new Reference();
                    signature.SignedInfo.References.Add(reference);
                }

                return Promise.resolve();
            });
    }

    protected ValidateReferences(doc: Element): PromiseLike<boolean> {
        return Promise.resolve()
            .then(() => {
                return Promise.all(
                    this.XmlSignature.SignedInfo.References.Map((ref) => {
                        return this.DigestReference(doc, ref, false)
                            .then((digest) => {
                                const b64Digest = XmlCore.Convert.ToBase64(digest);
                                const b64DigestValue = XmlCore.Convert.ToString(ref.DigestValue, "base64");
                                if (b64Digest !== b64DigestValue) {
                                    const errText = `Invalid digest for uri '${ref.Uri}'. Calculated digest is ${b64Digest} but the xml to validate supplies digest ${b64DigestValue}`;
                                    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, errText);
                                }
                                return Promise.resolve(true);
                            });
                    }).GetIterator(),
                );
            })
            .then(() => true);
    }

    protected ValidateSignatureValue(keys: CryptoKey[]): PromiseLike<boolean> {
        let signer: ISignatureAlgorithm;
        let signedInfoCanon: string;
        return Promise.resolve()
            .then(() => {
                signedInfoCanon = this.TransformSignedInfo(this.document);
                signer = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
                // Verify signature for all exported keys

                let chain = Promise.resolve(false);
                keys.forEach((key) => {
                    chain = chain.then((v: boolean) => {
                        if (!v) {
                            return signer.Verify(signedInfoCanon, key, this.Signature!);
                        }
                        return Promise.resolve(v);
                    });
                });
                return chain;
            });
    }

    //#endregion

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
    if (node && node.nodeType === XmlNodeType.Element) {
        const el = node as Element;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
            addNamespace(selectedNodes, el.prefix ? el.prefix : "", node.namespaceURI!);
        }
        //#region Select all xmlns attrs
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes.item(i);
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

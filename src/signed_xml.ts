import * as XmlCore from "xml-core";
import { Signature, SignedInfo, Reference, References, KeyInfo, Transforms as XmlTransforms } from "./xml";
import { KeyValue, KeyInfoX509Data } from "./xml/key_infos";
import { CryptoConfig } from "./crypto_config";
import { ISignatureAlgorithm } from "./algorithm";
import * as Alg from "./algorithm/index";
import * as Transforms from "./xml/transforms";
import * as KeyInfos from "./xml/key_infos";
import { XmlNodeType } from "xml-core";

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


    protected signature = new Signature();
    protected document?: Document;

    public get XmlSignature() {
        return this.signature;
    }

    public Key?: CryptoKey;
    public Algorithm?: Algorithm | RsaPssParams | EcdsaParams;
    public get Signature() {
        return this.XmlSignature.SignatureValue;
    }

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
        }
        else if (node && (node as Node).nodeType === XmlCore.XmlNodeType.Element) {
            // constructor(node: Element);
            let xmlText = new XMLSerializer().serializeToString(node);
            this.document = new DOMParser().parseFromString(xmlText, XmlCore.APPLICATION_XML);
        }
    }

    // Protected methods
    /**
    * Returns the public key of a signature.
    */
    protected GetPublicKeys(): PromiseLike<CryptoKey[]> {
        let keys: CryptoKey[] = [];
        return Promise.resolve()
            .then(() => {
                let pkEnumerator = this.XmlSignature.KeyInfo.GetIterator();

                let promises: PromiseLike<void>[] = [];
                pkEnumerator.forEach(kic => {
                    let alg = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
                    if (kic instanceof KeyInfos.KeyInfoX509Data) {
                        kic.Certificates.forEach(cert => {
                            promises.push(
                                cert.exportKey(alg.algorithm)
                                    .then(key => { keys.push(key); })
                            );
                        });
                    }
                    else {
                        promises.push(
                            kic.exportKey(alg.algorithm)
                                .then(key => { keys.push(key); })
                        );
                    }
                });
                return Promise.all(promises);
            })
            .then(() => keys);
    }

    protected FixupNamespaceNodes(src: Element, dst: Element, ignoreDefault: boolean): void {
        // add namespace nodes
        let namespaces = XmlCore.SelectNamespaces(dst);
        for (let i in namespaces) {
            let uri = namespaces[i];
            if (ignoreDefault && i === "")
                continue;
            dst.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
    }

    protected DigestReference(doc: Element, reference: Reference, check_hmac: boolean) {
        return Promise.resolve()
            .then(() => {
                let canonOutput: any = null;

                if (reference.Uri) {
                    let objectName: string | undefined;
                    if (!reference.Uri.indexOf("#xpointer")) {
                        let uri: string = reference.Uri;
                        uri = uri.substring(9).replace(/[\r\n\t\s]/g, "");
                        if (uri.length < 2 || uri[0] !== `(` || uri[uri.length - 1] !== `)`)
                            // FIXME: how to handle invalid xpointer?
                            uri = ""; // String.Empty
                        else
                            uri = uri.substring(1, uri.length - 1);
                        if (uri.length > 6 && uri.indexOf(`id(`) === 0 && uri[uri.length - 1] === `)`)
                            // id('foo'), id("foo")
                            objectName = uri.substring(4, uri.length - 2);
                    }
                    else if (reference.Uri[0] === `#`) {
                        objectName = reference.Uri.substring(1);
                    }
                    if (objectName) {
                        let found: Element | null = null;
                        this.XmlSignature.ObjectList && this.XmlSignature.ObjectList.Some(obj => {
                            found = findById(obj.GetXml()!, objectName!);
                            if (found) {
                                let el = found.cloneNode(true) as Element;
                                this.FixupNamespaceNodes(doc as Element, el, true);
                                doc = el;
                                return true;
                            }
                            return false;
                        });
                        if (!found && doc) {
                            found = XmlCore.XmlObject.GetElementById(doc, objectName);
                            if (found) {
                                let el = found.cloneNode(true) as Element;
                                this.FixupNamespaceNodes(doc, el, false);
                                doc = el;
                            }
                        }
                        if (found == null)
                            throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, `Cannot get object by reference: ${objectName}`);
                    }
                }

                if (reference.Transforms && reference.Transforms.Count) {
                    // Sort transforms. Enveloped should be first transform
                    reference.Transforms.Sort((a, b) => {
                        if (b instanceof Transforms.XmlDsigEnvelopedSignatureTransform)
                            return 1;
                        return 0;
                    }).ForEach(transform => {
                        // Apply transforms
                        if (transform instanceof Transforms.XmlDsigC14NWithCommentsTransform)
                            transform = new Transforms.XmlDsigC14NTransform(); // TODO: Check RFC for it
                        if (transform instanceof Transforms.XmlDsigExcC14NWithCommentsTransform)
                            transform = new Transforms.XmlDsigExcC14NTransform(); // TODO: Check RFC for it
                        transform.LoadInnerXml(doc);
                        canonOutput = transform.GetOutput();
                    });
                    // Apply C14N transform if Reference has only one transform EnvelopdeSignature
                    if (reference.Transforms.Count === 1 && reference.Transforms.Item(0) instanceof Transforms.XmlDsigEnvelopedSignatureTransform) {
                        let c14n = new Transforms.XmlDsigC14NTransform();
                        c14n.LoadInnerXml(doc);
                        canonOutput = c14n.GetOutput();
                    }
                }
                else {
                    // we must not C14N references from outside the document
                    // e.g. non-xml documents
                    if (reference.Uri && reference.Uri[0] !== `#`) {
                        canonOutput = new XMLSerializer().serializeToString(doc);
                    }
                    else {
                        // apply default C14N transformation
                        let excC14N = new Transforms.XmlDsigC14NTransform();
                        excC14N.LoadInnerXml(doc);
                        canonOutput = excC14N.GetOutput();
                    }
                }
                if (!reference.DigestMethod.Algorithm) {
                    throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "Reference", "DigestMethod");
                }
                let digest = CryptoConfig.CreateHashAlgorithm(reference.DigestMethod.Algorithm);
                return digest.Digest(canonOutput);
            });
    }

    protected DigestReferences(data: Element) {
        return Promise.resolve()
            .then(() => {
                // we must tell each reference which hash algorithm to use 
                // before asking for the SignedInfo XML !
                let promises = this.XmlSignature.SignedInfo.References.Map(ref => {
                    // assume SHA-256 if nothing is specified
                    if (!ref.DigestMethod.Algorithm)
                        ref.DigestMethod.Algorithm = new Alg.Sha256().namespaceURI;
                    return this.DigestReference(data, ref, false)
                        .then(hashValue => {
                            ref.DigestValue = hashValue;
                        });
                }).GetIterator();

                return Promise.all(promises);
            });
    }

    protected TransformSignedInfo(): string {
        let t = CryptoConfig.CreateFromName(this.XmlSignature.SignedInfo.CanonicalizationMethod.Algorithm);

        const xml = this.XmlSignature.SignedInfo.GetXml();
        if (!xml)
            throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from SignedInfo");

        let node = xml.cloneNode(true) as Element;

        // Get root namespaces
        const rootNamespaces = SelectRootNamespaces(xml);
        for (let i in rootNamespaces) {
            let uri = rootNamespaces[i];
            if (i === node.prefix)
                continue;
            node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }

        let childNamespaces = XmlCore.SelectNamespaces(xml);
        for (let i in childNamespaces) {
            let uri = childNamespaces[i];
            if (i === node.prefix)
                continue;
            node.setAttribute("xmlns" + (i ? ":" + i : ""), uri);
        }
        t.LoadInnerXml(node);
        const res = t.GetOutput();
        return res;
    }

    protected ApplySignOptions(signature: Signature, algorithm: Algorithm, key: CryptoKey, options: OptionsSign = {}): PromiseLike<void> {
        return Promise.resolve()
            .then(() => {
                // keyValue
                if (options.keyValue && key.algorithm.name!.toUpperCase() !== Alg.HMAC) {
                    if (!signature.KeyInfo)
                        signature.KeyInfo = new KeyInfo();
                    const keyInfo = signature.KeyInfo;
                    const keyValue = new KeyValue();
                    keyInfo.Add(keyValue);
                    return keyValue.importKey(options.keyValue) as PromiseLike<any>;
                }
                else
                    return Promise.resolve();
            })
            .then(() => {
                // x509
                if (options.x509) {
                    if (!signature.KeyInfo)
                        signature.KeyInfo = new KeyInfo();
                    const keyInfo = signature.KeyInfo;
                    options.x509.forEach(x509 => {
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
                    options.references.forEach(item => {
                        const reference = new Reference();
                        // Id
                        if (item.id)
                            reference.Id = item.id;
                        // Uri
                        if (item.uri)
                            reference.Uri = item.uri;
                        // Type
                        if (item.type)
                            reference.Type = item.type;
                        // DigestMethod
                        let _alg: Algorithm = typeof item.hash === "string" ? { name: item.hash } : item.hash;
                        const digestAlgorithm = CryptoConfig.GetHashAlgorithm(_alg);
                        reference.DigestMethod.Algorithm = digestAlgorithm.namespaceURI;
                        // transforms
                        if (item.transforms && item.transforms.length) {
                            let transforms = new XmlTransforms();
                            item.transforms.forEach(transform => {
                                switch (transform) {
                                    case "enveloped":
                                        transforms.Add(new Transforms.XmlDsigEnvelopedSignatureTransform());
                                        break;
                                    case "c14n":
                                        transforms.Add(new Transforms.XmlDsigC14NTransform);
                                        break;
                                    case "c14n-com":
                                        transforms.Add(new Transforms.XmlDsigC14NWithCommentsTransform);
                                        break;
                                    case "exc-c14n":
                                        transforms.Add(new Transforms.XmlDsigExcC14NTransform);
                                        break;
                                    case "exc-c14n-com":
                                        transforms.Add(new Transforms.XmlDsigExcC14NWithCommentsTransform);
                                        break;
                                    case "base64":
                                        transforms.Add(new Transforms.XmlDsigBase64Transform);
                                        break;
                                    default:
                                        throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC_UNKNOWN_TRANSFORM, transform);
                                }
                            });
                            reference.Transforms = transforms;
                        }
                        if (!signature.SignedInfo.References)
                            signature.SignedInfo.References = new References();
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

    Sign(algorithm: Algorithm, key: CryptoKey, data: Document, options?: OptionsSign): PromiseLike<Signature> {
        let alg: ISignatureAlgorithm;
        let signedInfo: SignedInfo;
        return Promise.resolve()
            .then(() => {
                let signingAlg = XmlCore.assign({}, key.algorithm, algorithm);
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
                    let _alg = XmlCore.assign({}, key.algorithm, algorithm);
                    if (typeof _alg.hash === "string")
                        _alg.hash = { name: _alg.hash };
                    const params = new KeyInfos.PssAlgorithmParams(_alg);
                    this.XmlSignature.SignedInfo.SignatureMethod.Any.Add(params);
                }
                else if (Alg.HMAC.toUpperCase() === algorithm.name.toUpperCase()) {
                    // Add HMAC params
                    let outputLength = 0;
                    let hmacAlg = key.algorithm as any;
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
                let si = this.TransformSignedInfo();
                return alg.Sign(si, key, algorithm);
            })
            .then((signature) => {
                this.Key = key;
                this.XmlSignature.SignatureValue = new Uint8Array(signature);
                this.document = data;
                return this.XmlSignature;
            });
    }

    protected ValidateReferences(doc: Element): PromiseLike<boolean> {
        return Promise.resolve()
            .then(() => {
                return Promise.all(
                    this.XmlSignature.SignedInfo.References.Map(ref => {
                        return this.DigestReference(doc, ref, false)
                            .then(digest => {
                                let b64Digest = XmlCore.Convert.ToBase64(digest);
                                let b64DigestValue = XmlCore.Convert.ToString(ref.DigestValue, "base64");
                                if (b64Digest !== b64DigestValue) {
                                    let err_text = `Invalid digest for uri '${ref.Uri}'. Calculated digest is ${b64Digest} but the xml to validate supplies digest ${b64DigestValue}`;
                                    throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, err_text);
                                }
                                return Promise.resolve(true);
                            });
                    }).GetIterator()
                );
            })
            .then(() => true);
    }

    protected ValidateSignatureValue(keys: CryptoKey[]): PromiseLike<boolean> {
        let signer: ISignatureAlgorithm;
        let signedInfoCanon: string;
        return Promise.resolve()
            .then(() => {
                signedInfoCanon = this.TransformSignedInfo();
                signer = CryptoConfig.CreateSignatureAlgorithm(this.XmlSignature.SignedInfo.SignatureMethod);
                // Verify signature for all exported keys

                let chain = Promise.resolve(false);
                keys.forEach(key => {
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

    Verify(key?: CryptoKey): PromiseLike<boolean> {
        return Promise.resolve()
            .then(() => {
                let xml = this.document;
                if (!(xml && xml.documentElement))
                    throw new XmlCore.XmlError(XmlCore.XE.NULL_PARAM, "SignedXml", "document");

                return this.ValidateReferences(xml.documentElement);
            })
            .then(res => {
                if (res) {
                    let promise = Promise.resolve([]);
                    if (key) {
                        promise = promise.then(() =>
                            [key]
                        );
                    }
                    else {
                        promise = promise.then(() =>
                            this.GetPublicKeys()
                        );
                    }
                    return promise.then((keys: CryptoKey[]) => {
                        return this.ValidateSignatureValue(keys);
                    });
                }
                else
                    return false;
            });
    }

    GetXml() {
        return this.signature.GetXml();
    }

    /**
     * Loads a SignedXml state from an XML element.
     * @param  {Element | string} value The XML to load the SignedXml state from.
     * @returns void
     */
    LoadXml(value: Element | string) {
        this.signature = Signature.LoadXml(value);
    }

    toString() {
        // Check for EnvelopedTransform
        const signature = this.XmlSignature;
        let enveloped = false;
        if (signature.SignedInfo.References)
            signature.SignedInfo.References.Some(ref => {
                if (ref.Transforms)
                    ref.Transforms.Some(transform => {
                        if (transform instanceof Transforms.XmlDsigEnvelopedSignatureTransform)
                            enveloped = true;
                        return enveloped;
                    });
                return enveloped;
            });

        if (enveloped) {
            let doc = this.document!.documentElement.cloneNode(true);
            let node = this.XmlSignature.GetXml();
            if (!node)
                throw new XmlCore.XmlError(XmlCore.XE.XML_EXCEPTION, "Cannot get Xml element from Signature");
            let sig = node.cloneNode(true);
            doc.appendChild(sig);
            return new XMLSerializer().serializeToString(doc);
        }
        return this.XmlSignature.toString();
    }

}

function findById(element: Element, id: string): Element | null {
    if (element.nodeType !== XmlCore.XmlNodeType.Element)
        return null;
    if (element.hasAttribute("Id") && element.getAttribute("Id") === id)
        return element;
    if (element.childNodes && element.childNodes.length)
        for (let i = 0; i < element.childNodes.length; i++) {
            let el = findById(element.childNodes[i] as Element, id);
            if (el)
                return el;
        }
    return null;
}

// TODO it can be moved to XmlCore
function _SelectRootNamespaces(node: Node, selectedNodes: XmlCore.AssocArray<string> = {}) {
    if (node && node.nodeType === XmlNodeType.Element) {
        const el = node as Element;
        if (el.namespaceURI && el.namespaceURI !== "http://www.w3.org/XML/1998/namespace") {
            selectedNodes[el.prefix ? el.prefix : ""] = node.namespaceURI!;
        }
        if (node.parentNode) {
            _SelectRootNamespaces(node.parentNode, selectedNodes);
        }
    }
}

export function SelectRootNamespaces(node: Element) {
    let attrs: XmlCore.AssocArray<string> = {};
    _SelectRootNamespaces(node, attrs);
    return attrs;
}
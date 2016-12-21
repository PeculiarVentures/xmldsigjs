/// <reference types="xml-core" />

declare namespace XmlDSigJs {

    // algorithm.ts
    export type BASE64 = string;
    export interface IAlgorithm {
        algorithm: Algorithm;
        xmlNamespace: string;
        getAlgorithmName(): string;
    }
    export interface IHashAlgorithm extends IAlgorithm {
        getHash(xml: string): PromiseLike<ArrayBuffer>;
    }
    export interface IHashAlgorithmConstructable {
        new (): IHashAlgorithm;
    }
    export abstract class XmlAlgorithm implements IAlgorithm {
        algorithm: Algorithm;
        xmlNamespace: string;
        getAlgorithmName(): string;
    }
    export abstract class HashAlgorithm extends XmlAlgorithm implements IHashAlgorithm {
        getHash(xml: Uint8Array | string | Node): PromiseLike<ArrayBuffer>;
    }
    export interface ISignatureAlgorithm extends IAlgorithm {
        getSignature(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        verifySignature(signedInfo: string, key: CryptoKey, signatureValue: string, algorithm?: Algorithm): PromiseLike<boolean>;
    }
    export interface ISignatureAlgorithmConstructable {
        new (): ISignatureAlgorithm;
    }
    export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
        /**
         * Sign the given string using the given key
         */
        getSignature(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        /**
        * Verify the given signature of the given string using key
        */
        verifySignature(signedInfo: string, key: CryptoKey, signatureValue: string, algorithm?: Algorithm): PromiseLike<boolean>;
    }

    export interface CryptoEx extends Crypto {
        name: string;
    }
    // application.ts
    export class Application {
        /**
         * Sets crypto engine for the current Application
         * @param  {string} name
         * @param  {Crypto} crypto
         * @returns void
         */
        static setEngine(name: string, crypto: Crypto): void;
        /**
         * Gets the crypto module from the Application
         */
        static readonly crypto: CryptoEx;
        static isNodePlugin(): boolean;
    }

    // canonicalizer.ts

    export enum XmlCanonicalizerState {
        BeforeDocElement = 0,
        InsideDocElement = 1,
        AfterDocElement = 2,
    }
    export class XmlCanonicalizer {
        protected withComments: boolean;
        protected exclusive: boolean;
        protected propagatedNamespaces: XmlCore.NamespaceManager;
        protected document: Document;
        protected result: string[];
        protected visibleNamespaces: XmlCore.NamespaceManager;
        protected inclusiveNamespacesPrefixList: string[];
        protected state: XmlCanonicalizerState;
        constructor(withComments: boolean, excC14N: boolean, propagatedNamespaces?: XmlCore.NamespaceManager);
        InclusiveNamespacesPrefixList: string;
        Canonicalize(node: Node): string;
        protected WriteNode(node: Node): void;
        protected WriteDocumentNode(node: Node): void;
        protected WriteCommentNode(node: Node): void;
        protected WriteElementNode(node: Element): void;
        protected WriteNamespacesAxis(node: Element | Attr): number;
        protected NormalizeString(input: string | null, type: XmlCore.XmlNodeType): string;
    }

    // crypto_config.ts
    export class CryptoConfig {
        /**
         * Creates Transform from given name
         * if name is not exist then throws error
         *
         * @static
         * @param {(string |)} [name=null]
         * @returns
         *
         * @memberOf CryptoConfig
         */
        static CreateFromName(name: string | null): Transform;
        static CreateSignatureAlgorithm(namespace: string): SignatureAlgorithm;
        static CreateHashAlgorithm(namespace: string): HashAlgorithm;
    }

    // data_object.ts

    /**
     * Represents the object element of an XML signature that holds data to be signed.
     */
    export class DataObject extends XmlSignatureObject {
        protected name: string;

        constructor();
        constructor(id: string | null, mimeType: string | null, encoding: string | null, data: Element | null);

        /**
         * Gets or sets the data value of the current DataObject object.
         */
        Data: NodeList;
        /**
         * Gets or sets the encoding of the current DataObject object.
         */
        Encoding: string | null;
        /**
         * Gets or sets the identification of the current DataObject object.
         */
        Id: string | null;
        /**
         * Gets or sets the MIME type of the current DataObject object.
         */
        MimeType: string | null;


        /**
         * Returns the XML representation of the DataObject object.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads a DataObject state from an XML element.
         * @param  {Element} value
         * @returns void
         */
        LoadXml(value: Element): void;
    }

    // error.ts

    export class XmlSignatureError extends XmlCore.XmlError {
        protected readonly prefix: string;
    }

    // key_info

    /**
     * Represents an XML digital signature or XML encryption <KeyInfo> element.
     */
    export class KeyInfo extends XmlSignatureObject {
        protected name: string;


        constructor();
        /**
         * Gets the number of KeyInfoClause objects contained in the KeyInfo object.
         */
        readonly length: number;
        /**
         * Gets or sets the key information identity.
         */
        Id: string | null;
        /**
         * Returns an enumerator of the KeyInfoClause objects in the KeyInfo object.
         * @param  {any} requestedObjectType?
         */
        GetEnumerator(): Array<KeyInfoClause>;
        GetEnumerator(requestedObjectType: any): Array<KeyInfoClause>;
        /**
         * Returns an enumerator of the KeyInfoClause objects in the KeyInfo object.
         * @param  {KeyInfoClause} clause The KeyInfoClause to add to the KeyInfo object.
         * @returns void
         */
        AddClause(clause: KeyInfoClause): void;
        /**
         * Returns the XML representation of the KeyInfo object.
         * @returns Node
         */
        GetXml(): Element;
        /**
         * Loads a KeyInfo state from an XML element.
         * @param  {Element} value
         * @returns void
         */
        LoadXml(value: Element): void;
    }
    export interface KeyInfoClause extends XmlCore.IXmlSerializable {
        Key: CryptoKey | null;
        importKey(key: CryptoKey): PromiseLike<this>;
        exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    // reference.ts

    /**
     * Represents the <reference> element of an XML signature.
     */
    export class Reference extends XmlSignatureObject {
        protected name: string;






        constructor(p?: string);
        /**
         * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
         */
        DigestMethod: string | null;
        /**
         * Gets or sets the digest value of the current Reference.
         */
        DigestValue: ArrayBuffer;
        /**
         * Gets or sets the ID of the current Reference.
         */
        Id: string | null;
        /**
         * Gets the transform chain of the current Reference.
         */
        readonly TransformChain: Transforms;
        /**
         * Gets or sets the type of the object being signed.
         */
        Type: string | null;
        /**
         * Gets or sets the Uri of the current Reference.
         */
        Uri: string | null;
        /**
         * Adds a Transform object to the list of transforms to be performed
         * on the data before passing it to the digest algorithm.
         * @param  {Transform} transform The transform to be added to the list of transforms.
         * @returns void
         */
        AddTransform(transform: Transform): void;
        /**
         * Returns the XML representation of the Reference.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads a Reference state from an XML element.
         * @param  {Element} value
         */
        LoadXml(value: Element): void;
    }

    // signature.ts

    /**
     * Represents the <Signature> element of an XML signature.
     */
    export class Signature extends XmlSignatureObject {
        protected name: string;






        constructor();
        /**
         * Gets or sets the ID of the current Signature.
         */
        Id: string | null;
        /**
         * Gets or sets the KeyInfo of the current Signature.
         */
        KeyInfo: KeyInfo;
        /**
         * Gets or sets a list of objects to be signed.
         */
        ObjectList: Array<DataObject>;
        /**
         * Gets or sets the value of the digital signature.
         */
        SignatureValue: Uint8Array;
        /**
         * Gets or sets the Id of the SignatureValue.
         */
        SignatureValueId: string | null;
        /**
         * Gets or sets the SignedInfo of the current Signature.
         */
        SignedInfo: SignedInfo;
        /**
         * Adds a DataObject to the list of objects to be signed.
         * @param  {DataObject} dataObject The DataObject to be added to the list of objects to be signed.
         * @returns void
         */
        AddObject(dataObject: DataObject): void;
        /**
         * Returns the XML representation of the Signature.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads a Signature state from an XML element.
         * @param  {Element} value
         */
        LoadXml(element: Element): void;

    }

    // signed_info.ts

    /**
     * The SignedInfo class represents the <SignedInfo> element
     * of an XML signature defined by the XML digital signature specification
     */
    export class SignedInfo extends XmlSignatureObject {
        protected name: string;







        constructor(signedXml?: SignedXml);
        /**
         * Gets or sets the canonicalization algorithm that is used before signing
         * for the current SignedInfo object.
         */
        CanonicalizationMethod: string | null;
        /**
         * Gets a Transform object used for canonicalization.
         * @returns Transform
         */
        readonly CanonicalizationMethodObject: Transform;
        /**
         * Gets the number of references in the current SignedInfo object.
         */
        readonly Count: number;
        /**
         * Gets or sets the ID of the current SignedInfo object.
         */
        Id: string | null;
        /**
         * Gets a value that indicates whether the collection is read-only.
         * @returns boolean
         */
        readonly IsReadOnly: boolean;
        /**
         * Gets a value that indicates whether the collection is synchronized.
         * @returns boolean
         */
        readonly IsSynchronized: boolean;
        /**
         * Gets a list of the Reference objects of the current SignedInfo object.
         */
        readonly References: Reference[];
        /**
         * Gets or sets the length of the signature for the current SignedInfo object.
         */
        SignatureLength: string;
        /**
         * Gets or sets the name of the algorithm used for signature generation
         * and validation for the current SignedInfo object.
         */
        SignatureMethod: string | null;
        SignatureParams: XmlCore.XmlObject;
        /**
         * Gets an object to use for synchronization.
         */
        readonly SyncRoot: any;
        /**
         * Adds a Reference object to the list of references to digest and sign.
         * @param  {Reference} reference The reference to add to the list of references.
         * @returns void
         */
        AddReference(reference: Reference): void;
        /**
         * Copies the elements of this instance into an Array object, starting at a specified index in the array.
         * @param  {any[]} array
         * @param  {number} index
         * @returns void
         */
        CopyTo(array: any[], index: number): void;
        /**
         * Returns the XML representation of the SignedInfo object.
         * @returns Node
         */
        GetXml(): Element;
        /**
         * Loads a SignedInfo state from an XML element.
         * @param  {Element} value
         * @returns void
         */
        LoadXml(value: Element): void;
    }

    // signed_xml.ts

    /**
    * Provides a wrapper on a core XML signature object to facilitate creating XML signatures.
    */
    export class SignedXml extends XmlSignatureObject {
        protected name: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard canonicalization
         * algorithm for XML digital signatures. This field is constant.
         */
        protected static XmlDsigCanonicalizationUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard canonicalization algorithm
         * for XML digital signatures and includes comments. This field is constant.
         */
        protected static XmlDsigCanonicalizationWithCommentsUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard namespace for XML digital signatures.
         * This field is constant.
         */
        protected static XmlDsigNamespaceUrl: string;
        protected static XmlDsigDSAUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard HMACSHA1 algorithm for XML digital signatures.
         * This field is constant.
         */
        protected static XmlDsigHMACSHA1Url: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard minimal canonicalization algorithm
         * for XML digital signatures. This field is constant.
         */
        protected static XmlDsigMinimalCanonicalizationUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard RSA signature method
         * for XML digital signatures. This field is constant.
         */
        protected static XmlDsigRSASHA1Url: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the standard SHA1 digest method for
         * XML digital signatures. This field is constant.
         */
        protected static XmlDsigSHA1Url: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the XML mode
         * decryption transformation. This field is constant.
         */
        protected static XmlDecryptionTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the base 64 transformation. This field is constant.
         */
        protected static XmlDsigBase64TransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI)
         * for the Canonical XML transformation. This field is constant.
         */
        protected static XmlDsigC14NTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the Canonical XML transformation,
         * with comments. This field is constant.
         */
        protected static XmlDsigC14NWithCommentsTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for enveloped signature transformation.
         * This field is constant.
         */
        protected static XmlDsigEnvelopedSignatureTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for exclusive XML canonicalization.
         * This field is constant.
         */
        protected static XmlDsigExcC14NTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for exclusive XML canonicalization, with comments.
         * This field is constant.
         */
        protected static XmlDsigExcC14NWithCommentsTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the XML Path Language (XPath).
         * This field is constant.
         */
        protected static XmlDsigXPathTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for XSLT transformations.
         * This field is constant.
         */
        protected static XmlDsigXsltTransformUrl: string;
        /**
         * Represents the Uniform Resource Identifier (URI) for the license transform algorithm
         * used to normalize XrML licenses for signatures.
         */
        protected static XmlLicenseTransformUrl: string;
        protected m_element: Node | null;
        /**
         * Represents the Signature object of the current SignedXml object
         */
        protected m_signature: Signature;
        protected m_signature_algorithm: ISignatureAlgorithm | null;
        protected envdoc: Document | null;
        protected validationErrors: string[];
        protected key: CryptoKey | null;

        /**
         * Gets or sets the KeyInfo object of the current SignedXml object.
         */
        KeyInfo: KeyInfo;
        /**
         * Gets the Signature object of the current SignedXml object.
         */
        readonly Signature: Signature;
        /**
         * Gets or sets the prefix for the current SignedXml object.
         */
        Prefix: string;
        /**
         * Gets the length of the signature for the current SignedXml object.
         */
        readonly SignatureLength: number;
        readonly SignatureMethod: string;
        /**
         * Gets the signature value of the current SignedXml object.
         */
        readonly SignatureValue: ArrayBuffer;
        /**
         * Gets the CanonicalizationMethod of the current SignedXml object.
         */
        readonly CanonicalizationMethod: string;
        /**
         * Gets the SignedInfo object of the current SignedXml object.
         */
        readonly SignedInfo: SignedInfo;
        /**
         * Gets or sets the asymmetric algorithm key used for signing a SignedXml object.
         */
        SigningKey: CryptoKey | null;
        /**
         * Gets or sets the name of the installed key to be used for signing the SignedXml object.
         */
        SigningKeyName: string;
        /**
         * @param {string} idMode. Value of "wssecurity" will create/validate id's with the ws-security namespace
         */
        constructor();
        constructor(node: Document);
        constructor(node: Element);
        /**
         * Returns the public key of a signature.
         */
        protected GetPublicKeys(): PromiseLike<CryptoKey[]>;
        /**
         * Adds a Reference object to the SignedXml object that describes a digest method,
         * digest value, and transform to use for creating an XML digital signature.
         * @param  {Reference} reference The Reference object that describes a digest method, digest value,
         * and transform to use for creating an XML digital signature.
         * @returns void
         */
        AddReference(reference: Reference): void;


        protected findById(element: Element, id: string): Element | null;



        /**
         * Computes an XML digital signature using the specified algorithm.
         * @param  {Algorithm} algorithm Specified WebCrypto Algoriithm
         * @returns Promise
         */
        ComputeSignature(algorithm: Algorithm): Promise<{}>;
        /**
         * Determines whether the SignedXml.Signature property verifies using the public key in the signature.
         * @returns Promise
         */
        CheckSignature(): PromiseLike<boolean>;
        CheckSignature(key: CryptoKey): PromiseLike<boolean>;
        CheckSignature(cert: X509Certificate): PromiseLike<boolean>;
        protected validateSignatureValue(): PromiseLike<boolean>;
        protected findCanonicalizationAlgorithm(name: string): Transform;
        protected ValidateReferences(doc: Node): PromiseLike<boolean>;
        protected getCanonXml(transforms: Transform[], node: Node): string;
        /**
         * Loads a SignedXml state from an XML element.
         * @param  {Element} value The XML element to load the SignedXml state from.
         * @returns void
         */
        LoadXml(value: Element): void;
        /**
         * Returns the XML representation of a SignedXml object.
         * @returns Element
         */
        GetXml(): Element;
    }

    // transform.ts

    export interface ITransform extends XmlCore.IXmlSerializable {
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
        protected name: string;
        protected innerXml: Node | null;
        Prefix: string;
        /**
         * Algorithm of the transformation
         */
        Algorithm: string;
        /**
         * XPath of the transformation
         */
        XPath: string;
        /**
         * Default constructor
         */
        constructor();
        /**
         * When overridden in a derived class, returns the output of the current Transform object.
         */
        GetOutput(): string;
        LoadInnerXml(node: Node): void;
        GetInnerXml(): Node | null;
        /**
         * Check to see if something has changed in this instance and needs to be serialized
         * @returns Flag indicating if a member needs serialization
         */
        HasChanged(): boolean;
        /**
         * Load state from an XML element
         * @param {Element} element XML element containing new state
         */
        LoadXml(element: Element): void;
        /**
         * Returns the XML representation of the this object
         * @returns XML element containing the state of this object
         */
        GetXml(): Element;
    }

    // transforms.ts

    /**
     * The Transforms element contains a collection of transformations
     */
    export class Transforms extends XmlSignatureCollection<Transform> {
        protected name: string;
        protected OnLoadChildElement(element: Element): Transform;
    }

    // xml.ts

    export const XmlSignature: {
        DEFAULT_CANON_METHOD: string;
        DefaultPrefix: string;
        ElementNames: {
            CanonicalizationMethod: string;
            DigestMethod: string;
            DigestValue: string;
            DSAKeyValue: string;
            EncryptedKey: string;
            HMACOutputLength: string;
            RSAPSSParams: string;
            MaskGenerationFunction: string;
            SaltLength: string;
            KeyInfo: string;
            KeyName: string;
            KeyValue: string;
            Modulus: string;
            Exponent: string;
            Manifest: string;
            Object: string;
            Reference: string;
            RetrievalMethod: string;
            RSAKeyValue: string;
            ECKeyValue: string;
            NamedCurve: string;
            PublicKey: string;
            Signature: string;
            SignatureMethod: string;
            SignatureValue: string;
            SignedInfo: string;
            Transform: string;
            Transforms: string;
            X509Data: string;
            X509IssuerSerial: string;
            X509IssuerName: string;
            X509SerialNumber: string;
            X509SKI: string;
            X509SubjectName: string;
            X509Certificate: string;
            X509CRL: string;
            XPath: string;
        };
        AttributeNames: {
            Algorithm: string;
            Encoding: string;
            Id: string;
            MimeType: string;
            Type: string;
            URI: string;
        };
        AlgorithmNamespaces: {
            XmlDsigBase64Transform: string;
            XmlDsigC14NTransform: string;
            XmlDsigC14NWithCommentsTransform: string;
            XmlDsigEnvelopedSignatureTransform: string;
            XmlDsigXPathTransform: string;
            XmlDsigXsltTransform: string;
            XmlDsigExcC14NTransform: string;
            XmlDsigExcC14NWithCommentsTransform: string;
            XmlDecryptionTransform: string;
            XmlLicenseTransform: string;
        };
        Uri: {
            Manifest: string;
        };
        NamespaceURI: string;
        NamespaceURIMore: string;
        NamespaceURIPss: string;
        Prefix: string;
    };

    // xml_object.ts

    export abstract class XmlSignatureObject extends XmlCore.XmlObject {
        protected prefix: string;
        protected namespaceUri: string;
    }
    export abstract class XmlSignatureCollection<I extends XmlSignatureObject> extends XmlCore.XmlCollection<I> {
        protected prefix: string;
        protected namespaceUri: string;
    }

    // key/ecdsa_key.ts

    export type NamedCurve = "P-256" | "P-384" | "P-521";
    /**
     * Represents the <ECKeyValue> element of an XML signature.
     */
    export class EcdsaKeyValue extends XmlSignatureObject implements KeyInfoClause {
        protected name: string;
        protected m_key: CryptoKey | null;
        protected m_jwk: JsonWebKey | null;
        protected m_algorithm: ISignatureAlgorithm | null;
        protected m_x: Uint8Array | null;
        protected m_y: Uint8Array | null;
        protected m_curve: NamedCurve | null;
        protected m_keyusage: string[] | null;
        /**
         * Gets or sets the instance of ECDSA that holds the public key.
         */
        Key: CryptoKey | null;
        /**
         * Gets the algorithm of the public key
         */
        readonly Algorithm: ISignatureAlgorithm | null;
        /**
         * Gets the X point value of then public key
         */
        readonly X: Uint8Array | null;
        /**
         * Gets the Y point value of then public key
         */
        readonly Y: Uint8Array | null;
        /**
         * Gets the NamedCurve value of then public key
         */
        readonly NamedCurve: "P-256" | "P-384" | "P-521" | null;
        constructor();
        /**
         * Imports key to the ECKeyValue object
         * @param  {CryptoKey} key
         * @returns Promise
         */
        importKey(key: CryptoKey): PromiseLike<this>;
        /**
         * Exports key from the ECKeyValue object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
        /**
         * Returns the XML representation of the ECDSA key clause.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads an ECDSA key clause from an XML element.
         * @param  {Element} element
         * @returns void
         */
        LoadXml(element: Element): void;
    }

    // key/key_value.ts

    /**
     * Represents the <KeyValue> element of an XML signature.
     */
    export class KeyValue extends XmlSignatureObject {
        protected name: string;
        protected value: KeyInfoClause;
        Value: KeyInfoClause;
        constructor(value?: KeyInfoClause);
        /**
         * Returns the XML representation of the KeyValue.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads an KeyValue from an XML element.
         * @param  {Element} element
         * @returns void
         */
        LoadXml(element: Element): void;
    }

    // key/rsa_key.ts

    export interface IJwkRsa {
        alg: string;
        kty: string;
        e: string;
        n: string;
        ext: boolean;
    }
    /**
     * Represents the <RSAKeyValue> element of an XML signature.
     */
    export class RsaKeyValue extends XmlSignatureObject implements KeyInfoClause {
        protected name: string;
        protected m_key: CryptoKey | null;
        protected m_jwk: JsonWebKey | null;
        protected m_algorithm: ISignatureAlgorithm | null;
        protected m_modulus: Uint8Array | null;
        protected m_exponent: Uint8Array | null;
        protected m_keyusage: string[];
        /**
         * Gets or sets the instance of RSA that holds the public key.
         */
        Key: CryptoKey | null;
        /**
         * Gets the algorithm of the public key
         */
        readonly Algorithm: ISignatureAlgorithm | null;
        /**
         * Gets the Modulus of the public key
         */
        readonly Modulus: Uint8Array | null;
        /**
         * Gets the Exponent of the public key
         */
        readonly Exponent: Uint8Array | null;
        constructor();
        /**
         * Imports key to the RSAKeyValue object
         * @param  {CryptoKey} key
         * @returns Promise
         */
        importKey(key: CryptoKey): Promise<{}>;
        /**
         * Exports key from the RSAKeyValue object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        exportKey(alg: Algorithm): Promise<{}>;
        /**
         * Returns the XML representation of the RSA key clause.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Loads an RSA key clause from an XML element.
         * @param  {Element} element
         * @returns void
         */
        LoadXml(element: Element): void;
    }

    // key/x509_certificate.ts

    export type DigestAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

    /**
     * Represents an <X509Certificate> element.
     */
    export class X509Certificate {
        protected raw: Uint8Array;
        protected publicKey: CryptoKey | null;
        constructor(rawData?: BufferSource);
        /**
         * Gets a serial number of the certificate in HEX format
         */
        readonly SerialNumber: string;
        /**
         * Converts X500Name to string
         * @param  {RDN} name X500Name
         * @param  {string} spliter Splitter char. Default ','
         * @returns string Formated string
         * Example:
         * > C=Some name, O=Some organization name, C=RU
         */
        protected NameToString(name: any, spliter?: string): string;
        /**
         * Gets a issuer name of the certificate
         */
        readonly Issuer: string;
        /**
         * Gets a subject name of the certificate
         */
        readonly Subject: string;
        /**
         * Returns a thumbrint of the certififcate
         * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
         * @returns PromiseLike
         */
        Thumbprint(algName?: DigestAlgorithm): PromiseLike<ArrayBuffer>;
        /**
         * Loads X509Certificate from DER data
         * @param  {Uint8Array} rawData
         */
        protected LoadRaw(rawData: BufferSource): void;
        /**
         * Gets the public key from the X509Certificate
         */
        readonly PublicKey: CryptoKey | null;
        /**
         * Returns DER raw of X509Certificate
         */
        GetRaw(): Uint8Array;
        /**
         * Returns public key from X509Certificate
         * @param  {Algorithm} algorithm
         * @returns Promise
         */
        exportKey(algorithm: Algorithm): Promise<{}>;
    }

    // key/x509_data.ts

    export enum X509IncludeOption {
        None = 0,
        EndCertOnly = 1,
        ExcludeRoot = 2,
        WholeChain = 3,
    }
    export interface X509IssuerSerial {
        issuerName: string;
        serialNumber: string;
    }
    /**
     * Represents an <X509Data> subelement of an XMLDSIG or XML Encryption <KeyInfo> element.
     */
    export class KeyInfoX509Data extends XmlSignatureObject implements KeyInfoClause {
        protected name: string;






        constructor();
        constructor(rgbCert: Uint8Array);
        constructor(cert: X509Certificate);
        /**
         * Gets public key of the X509Data
         */
        readonly Key: CryptoKey | null;
        importKey(key: CryptoKey): Promise<never>;
        /**
         * Exports key from X509Data object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        exportKey(alg: Algorithm): Promise<{}>;

        /**
         * Gets a list of the X.509v3 certificates contained in the KeyInfoX509Data object.
         */
        readonly Certificates: X509Certificate[];
        /**
         * Gets or sets the Certificate Revocation List (CRL) contained within the KeyInfoX509Data object.
         */
        CRL: Uint8Array | null;
        /**
         * Gets a list of X509IssuerSerial structures that represent an issuer name and serial number pair.
         */
        readonly IssuerSerials: X509IssuerSerial[];
        /**
         * Gets a list of the subject key identifiers (SKIs) contained in the KeyInfoX509Data object.
         */
        readonly SubjectKeyIds: Uint8Array[];
        /**
         * Gets a list of the subject names of the entities contained in the KeyInfoX509Data object.
         */
        readonly SubjectNames: string[];
        /**
         * Adds the specified X.509v3 certificate to the KeyInfoX509Data.
         * @param  {X509Certificate} certificate
         * @returns void
         */
        AddCertificate(certificate: X509Certificate): void;
        /**
         * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
         * @param  {string} issuerName
         * @param  {string} serialNumber
         * @returns void
         */
        AddIssuerSerial(issuerName: string, serialNumber: string): void;
        /**
         * Adds the specified subject key identifier (SKI) to the KeyInfoX509Data object.
         * @param  {string | Uint8Array} subjectKeyId
         * @returns void
         */
        AddSubjectKeyId(subjectKeyId: string): void;
        AddSubjectKeyId(subjectKeyId: Uint8Array): void;
        /**
         * Adds the subject name of the entity that was issued an X.509v3 certificate to the KeyInfoX509Data object.
         * @param  {string} subjectName
         * @returns void
         */
        AddSubjectName(subjectName: string): void;
        /**
         * Returns an XML representation of the KeyInfoX509Data object.
         * @returns Element
         */
        GetXml(): Element;
        /**
         * Parses the input XmlElement object and configures the internal state of the KeyInfoX509Data object to match.
         * @param  {Element} element
         * @returns void
         */
        LoadXml(element: Element): void;
    }

    // transforms/base64.ts

    export class XmlDsigBase64Transform extends Transform {
        Algorithm: string;
        /**
         * Returns the output of the current XmlDsigBase64Transform object
         */
        GetOutput(): any;
    }

    // transforms/c14n.ts

    /**
     * Represents the C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), without comments.
     */
    export class XmlDsigC14NTransform extends Transform {
        protected xmlCanonicalizer: XmlCanonicalizer;
        Algorithm: string;
        /**
         * Returns the output of the current XmlDsigC14NTransform object.
         * @returns string
         */
        GetOutput(): string;
    }
    /**
     * Represents the C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), with comments.
     */
    export class XmlDsigC14NWithCommentsTransform extends XmlDsigC14NTransform {
        Algorithm: string;
        protected xmlCanonicalizer: XmlCanonicalizer;
    }

    // transforms/enveloped_signature.ts

    /**
     * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
     */
    export class XmlDsigEnvelopedSignatureTransform extends Transform {
        Algorithm: string;
        /**
         * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
         * @returns string
         */
        GetOutput(): any;
    }

    // transforms/exc_c14n.ts

    /**
     * Represents the exclusive C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), without comments.
     */
    export class XmlDsigExcC14NTransform extends Transform {
        protected xmlCanonicalizer: XmlCanonicalizer;
        Algorithm: string;
        /**
         * Gets or sets a string that contains namespace prefixes to canonicalize
         * using the standard canonicalization algorithm.
         */
        InclusiveNamespacesPrefixList: string;
        /**
         * Returns the output of the current XmlDsigExcC14NTransform object
         */
        GetOutput(): string;
    }
    /**
     * Represents the exclusive C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), with comments.
     */
    export class XmlDsigExcC14NWithCommentsTransform extends XmlDsigExcC14NTransform {
        Algorithm: string;
        protected xmlCanonicalizer: XmlCanonicalizer;
    }

    // algorithm/ecdsa_sign.ts

    export const ECDSA_SIGN_ALGORITHM: string;
    export const ECDSA_SHA1_NAMESPACE: string;
    export const ECDSA_SHA224_NAMESPACE: string;
    export const ECDSA_SHA256_NAMESPACE: string;
    export const ECDSA_SHA384_NAMESPACE: string;
    export const ECDSA_SHA512_NAMESPACE: string;
    export class EcdsaSha1 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class EcdsaSha224 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class EcdsaSha256 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class EcdsaSha384 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class EcdsaSha512 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }

    // algorithm/hmac_sign

    export const HMAC_ALGORITHM: string;
    export const HMAC_SHA1_NAMESPACE: string;
    export const HMAC_SHA256_NAMESPACE: string;
    export const HMAC_SHA224_NAMESPACE: string;
    export const HMAC_SHA384_NAMESPACE: string;
    export const HMAC_SHA512_NAMESPACE: string;
    export class HmacSha1 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class HmacSha224 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class HmacSha256 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class HmacSha384 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class HmacSha512 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }

    // algorithm/rsa_hash.ts

    export const SHA1: string;
    export const SHA224: string;
    export const SHA256: string;
    export const SHA384: string;
    export const SHA512: string;
    export const SHA1_NAMESPACE: string;
    export const SHA224_NAMESPACE: string;
    export const SHA256_NAMESPACE: string;
    export const SHA384_NAMESPACE: string;
    export const SHA512_NAMESPACE: string;
    export class Sha1 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        xmlNamespace: string;
    }
    export class Sha224 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        xmlNamespace: string;
    }
    export class Sha256 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        xmlNamespace: string;
    }
    export class Sha384 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        xmlNamespace: string;
    }
    export class Sha512 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        xmlNamespace: string;
    }

    // algorithm/rsa_pkcs1_sign.ts

    export const RSA_PKCS1: string;
    export const RSA_PKCS1_SHA1_NAMESPACE: string;
    export const RSA_PKCS1_SHA224_NAMESPACE: string;
    export const RSA_PKCS1_SHA256_NAMESPACE: string;
    export const RSA_PKCS1_SHA384_NAMESPACE: string;
    export const RSA_PKCS1_SHA512_NAMESPACE: string;
    export class RsaPkcs1Sha1 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPkcs1Sha224 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPkcs1Sha256 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPkcs1Sha384 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPkcs1Sha512 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }

    // algorithm/rsa_pss_sign.ts

    export const RSA_PSS: string;
    export const RSA_PSS_WITH_PARAMS_NAMESPACE: string;
    export const RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE: string;
    export const RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE: string;
    export const RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE: string;
    export const RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE: string;
    export const RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE: string;
    export class RsaPssSha1 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPssSha224 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPssSha256 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPssSha384 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class RsaPssSha512 extends SignatureAlgorithm {
        algorithm: any;
        xmlNamespace: string;
    }
    export class PssAlgorithmParams extends XmlSignatureObject {
        protected name: string;
        private m_digest_method;
        private m_salt_length;
        private m_mgf;
        dsPrefix: string;
        DigestMethod: string | null;
        SaltLength: number | null;
        MGF: string | null;
        GetXml(): Element;
        LoadXml(value: Element): void;
    }

}

declare module "xmldsigjs" {
    export = XmlDSigJs;
} 
import { XmlCollection, XmlObject } from "xml-core";

declare namespace XmlDSigJs {

    //#region algorithm/ecdsa_sign

    export const ECDSA = "ECDSA";
    export const ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
    export const ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
    export const ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
    export const ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";

    export class EcdsaSha1 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class EcdsaSha256 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class EcdsaSha384 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class EcdsaSha512 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }

    //#endregion

    //#region algorithm/hmac_sign

    export const HMAC = "HMAC";
    export const HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
    export const HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
    export const HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
    export const HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";

    export class HmacSha1 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class HmacSha256 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class HmacSha384 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class HmacSha512 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }

    //#endregion

    //#region algorithm/rsa_hash

    export const SHA1 = "SHA-1";
    export const SHA256 = "SHA-256";
    export const SHA384 = "SHA-384";
    export const SHA512 = "SHA-512";
    export const SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
    export const SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
    export const SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#sha384";
    export const SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";

    export class Sha1 extends HashAlgorithm {
        public algorithm: {
            name: string;
        };
        public namespaceURI: string;
    }
    export class Sha256 extends HashAlgorithm {
        public algorithm: {
            name: string;
        };
        public namespaceURI: string;
    }
    export class Sha384 extends HashAlgorithm {
        public algorithm: {
            name: string;
        };
        public namespaceURI: string;
    }
    export class Sha512 extends HashAlgorithm {
        public algorithm: {
            name: string;
        };
        public namespaceURI: string;
    }

    //#endregion

    //#region algorithm/rsa_pkcs1_sign

    export const RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
    export const RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
    export const RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    export const RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
    export const RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";

    export class RsaPkcs1Sha1 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class RsaPkcs1Sha256 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class RsaPkcs1Sha384 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }
    export class RsaPkcs1Sha512 extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
    }

    //#endregion

    //#region algorithm/rsa_pss_sign

    export const RSA_PSS = "RSA-PSS";
    export const RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";

    export class RsaPssBase extends SignatureAlgorithm {
        public algorithm: any;
        public namespaceURI: string;
        constructor(saltLength?: number);
    }
    export class RsaPssSha1 extends RsaPssBase {
        constructor(saltLength?: number);
    }
    export class RsaPssSha256 extends RsaPssBase {
        constructor(saltLength?: number);
    }
    export class RsaPssSha384 extends RsaPssBase {
        constructor(saltLength?: number);
    }
    export class RsaPssSha512 extends RsaPssBase {
        constructor(saltLength?: number);
    }

    //#endregion

    //#region pki/x509

    export type DigestAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
    /**
     * Represents an <X509Certificate> element.
     */
    export class X509Certificate {
        /**
         * Gets a serial number of the certificate in HEX format
         */
        public readonly SerialNumber: string;
        /**
         * Gets a issuer name of the certificate
         */
        public readonly Issuer: string;
        /**
         * Gets a subject name of the certificate
         */
        public readonly Subject: string;
        /**
         * Gets the public key from the X509Certificate
         */
        public readonly PublicKey: CryptoKey | null;

        protected raw: Uint8Array;
        protected publicKey: CryptoKey | null;

        constructor(rawData?: BufferSource);

        /**
         * Returns a thumbprint of the certificate
         * @param  {DigestAlgorithm="SHA-1"} algName Digest algorithm name
         * @returns PromiseLike
         */
        public Thumbprint(algName?: DigestAlgorithm): PromiseLike<ArrayBuffer>;
        /**
         * Returns DER raw of X509Certificate
         */
        public GetRaw(): Uint8Array;
        /**
         * Returns public key from X509Certificate
         * @param  {Algorithm} algorithm
         * @returns Promise
         */
        public exportKey(algorithm: Algorithm): Promise<CryptoKey>;
        /**
         * Loads X509Certificate from DER data
         * @param  {Uint8Array} rawData
         */
        protected LoadRaw(rawData: BufferSource): void;
    }

    //#endregion

    //#region xml/key_info/ecdsa_key

    export type NamedCurveType = string | "P-256" | "P-384" | "P-521";
    export class EcdsaPublicKey extends XmlObject {
        public X: Uint8Array;
        public Y: Uint8Array;
    }
    export class NamedCurve extends XmlObject {
        public Uri: string;
    }
    export class DomainParameters extends XmlObject {
        public NamedCurve: NamedCurve;
    }
    /**
     * Represents the <ECKeyValue> element of an XML signature.
     */
    export class EcdsaKeyValue extends KeyInfoClause {

        public DomainParameters: DomainParameters;
        public PublicKey: EcdsaPublicKey;
        /**
         * Gets the NamedCurve value of then public key
         */
        public readonly NamedCurve: string;

        protected name: string;
        protected key: CryptoKey | null;
        protected jwk: JsonWebKey | null;
        protected keyUsage: string[] | null;

        /**
         * Imports key to the ECKeyValue object
         * @param  {CryptoKey} key
         * @returns Promise
         */
        public importKey(key: CryptoKey): PromiseLike<this>;
        /**
         * Exports key from the ECKeyValue object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        public exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    //#endregion

    //#region xml/key_info/key_info_clause

    export abstract class KeyInfoClause extends XmlSignatureObject {
        public Key: CryptoKey | null;
        public abstract importKey(key: CryptoKey): PromiseLike<this>;
        public abstract exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    //#endregion

    //#region xml/key_info/key_value

    /**
     * Represents the <KeyValue> element of an XML signature.
     */
    export class KeyValue extends KeyInfoClause {
        public Value: KeyInfoClause;

        protected value: KeyInfoClause;

        constructor(value?: KeyInfoClause);

        public importKey(key: CryptoKey): PromiseLike<this>;
        public exportKey(alg: Algorithm): PromiseLike<CryptoKey>;

        protected OnGetXml(element: Element): void;
    }

    //#endregion

    //#region xml/key_info/rsa_key

    export interface IJwkRsa {
        alg: string;
        kty: string;
        e: string;
        n: string;
        ext: boolean;
    }
    export interface RsaPSSSignParams extends RsaPssParams, Algorithm {
        hash: AlgorithmIdentifier;
    }

    /**
     * Represents the <RSAKeyValue> element of an XML signature.
     */
    export class RsaKeyValue extends KeyInfoClause {
        /**
         * Gets the Modulus of the public key
         */
        public Modulus: Uint8Array | null;
        /**
         * Gets the Exponent of the public key
         */
        public Exponent: Uint8Array | null;

        protected key: CryptoKey | null;
        protected jwk: JsonWebKey | null;
        protected keyUsage: string[];

        /**
         * Imports key to the RSAKeyValue object
         * @param  {CryptoKey} key
         * @returns Promise
         */
        public importKey(key: CryptoKey): PromiseLike<this>;
        /**
         * Exports key from the RSAKeyValue object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        public exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
        /**
         * Loads an RSA key clause from an XML element.
         * @param  {Element | string} element
         * @returns void
         */
        public LoadXml(node: Element | string): void;
    }
    export class MaskGenerationFunction extends XmlObject {
        public DigestMethod: DigestMethod;
        public Algorithm: string;
    }
    export class PssAlgorithmParams extends XmlObject {
        public static FromAlgorithm(algorithm: RsaPSSSignParams): PssAlgorithmParams;

        public DigestMethod: DigestMethod;
        public MGF: MaskGenerationFunction;
        public SaltLength: number;
        public TrailerField: number;

        constructor(algorithm?: RsaPSSSignParams);

        public FromAlgorithm(algorithm: RsaPSSSignParams): void;
    }

    //#endregion

    //#region xml/key_info/spki_data

    export class SPKIData extends KeyInfoClause {
        public Key: CryptoKey;
        public SPKIexp: Uint8Array | null;

        public importKey(key: CryptoKey): PromiseLike<this>;
        public exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    //#endregion

    //#region xml/key_info/x509_data

    export class X509IssuerSerial extends XmlSignatureObject {
        public X509IssuerName: string;
        public X509SerialNumber: string;
    }
    export enum X509IncludeOption {
        None = 0,
        EndCertOnly = 1,
        ExcludeRoot = 2,
        WholeChain = 3,
    }
    export interface IX509IssuerSerial {
        issuerName: string;
        serialNumber: string;
    }
    /**
     * Represents an <X509Data> sub element of an XMLDSIG or XML Encryption <KeyInfo> element.
     */
    export class KeyInfoX509Data extends KeyInfoClause {
        /**
         * Gets public key of the X509Data
         */
        public readonly Key: CryptoKey | null;
        /**
         * Gets a list of the X.509v3 certificates contained in the KeyInfoX509Data object.
         */
        public readonly Certificates: X509Certificate[];
        /**
         * Gets or sets the Certificate Revocation List (CRL) contained within the KeyInfoX509Data object.
         */
        public CRL: Uint8Array | null;
        /**
         * Gets a list of X509IssuerSerial structures that represent an issuer name and serial number pair.
         */
        public readonly IssuerSerials: IX509IssuerSerial[];
        /**
         * Gets a list of the subject key identifiers (SKIs) contained in the KeyInfoX509Data object.
         */
        public readonly SubjectKeyIds: Uint8Array[];
        /**
         * Gets a list of the subject names of the entities contained in the KeyInfoX509Data object.
         */
        public readonly SubjectNames: string[];

        constructor();
        constructor(rgbCert: Uint8Array);
        constructor(cert: X509Certificate, includeOptions?: X509IncludeOption);

        public importKey(key: CryptoKey): Promise<this>;
        /**
         * Exports key from X509Data object
         * @param  {Algorithm} alg
         * @returns Promise
         */
        public exportKey(alg: Algorithm): Promise<CryptoKey>;

        /**
         * Adds the specified X.509v3 certificate to the KeyInfoX509Data.
         * @param  {X509Certificate} certificate
         * @returns void
         */
        public AddCertificate(certificate: X509Certificate): void;
        /**
         * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
         * @param  {string} issuerName
         * @param  {string} serialNumber
         * @returns void
         */
        public AddIssuerSerial(issuerName: string, serialNumber: string): void;
        /**
         * Adds the specified subject key identifier (SKI) to the KeyInfoX509Data object.
         * @param  {string | Uint8Array} subjectKeyId
         * @returns void
         */
        public AddSubjectKeyId(subjectKeyId: string): void;
        public AddSubjectKeyId(subjectKeyId: Uint8Array): void;
        /**
         * Adds the subject name of the entity that was issued an X.509v3 certificate to the KeyInfoX509Data object.
         * @param  {string} subjectName
         * @returns void
         */
        public AddSubjectName(subjectName: string): void;
        /**
         * Returns an XML representation of the KeyInfoX509Data object.
         * @returns Element
         */
        public GetXml(): Element;
        /**
         * Parses the input XmlElement object and configures the internal state of the KeyInfoX509Data object to match.
         * @param  {Element} element
         * @returns void
         */
        public LoadXml(element: Element): void;
    }

    //#endregion

    //#region xml/transforms/base64

    export class XmlDsigBase64Transform extends Transform {

        public Algorithm: string;

        /**
         * Returns the output of the current XmlDsigBase64Transform object
         */
        public GetOutput(): any;
    }

    //#endregion

    //#region xml/transforms/c14n

    /**
     * Represents the C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), without comments.
     */
    export class XmlDsigC14NTransform extends Transform {

        public Algorithm: string;

        /**
         * Returns the output of the current XmlDsigC14NTransform object.
         * @returns string
         */
        protected xmlCanonicalizer: XmlCanonicalizer;

        public GetOutput(): string;
    }

    /**
     * Represents the C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), with comments.
     */
    export class XmlDsigC14NWithCommentsTransform extends XmlDsigC14NTransform {
        public Algorithm: string;
        protected xmlCanonicalizer: XmlCanonicalizer;
    }

    //#endregion

    //#region xml/transforms/enveloped_signature

    /**
     * Represents the enveloped signature transform for an XML digital signature as defined by the W3C.
     */
    export class XmlDsigEnvelopedSignatureTransform extends Transform {
        public Algorithm: string;
        /**
         * Returns the output of the current XmlDsigEnvelopedSignatureTransform object.
         * @returns string
         */
        public GetOutput(): any;
    }

    //#endregion

    //#region xml/transforms/exc_c14n

    /**
     * Represents the exclusive C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), without comments.
     */
    export class XmlDsigExcC14NTransform extends Transform {
        public Algorithm: string;
        /**
         * Gets or sets a string that contains namespace prefixes to canonicalize
         * using the standard canonicalization algorithm.
         */
        public InclusiveNamespacesPrefixList: string;

        protected xmlCanonicalizer: XmlCanonicalizer;

        /**
         * Returns the output of the current XmlDsigExcC14NTransform object
         */
        public GetOutput(): string;
    }

    /**
     * Represents the exclusive C14N XML canonicalization transform for a digital signature
     * as defined by the World Wide Web Consortium (W3C), with comments.
     */
    export class XmlDsigExcC14NWithCommentsTransform extends XmlDsigExcC14NTransform {
        public Algorithm: string;
        protected xmlCanonicalizer: XmlCanonicalizer;
    }

    //#endregion

    //#region xml/canonicalization_method

    /**
     * Canonicalization method
     *
     * @export
     * @class CanonicalizationMethod
     * @extends {XmlSignatureObject}
     */
    export class CanonicalizationMethod extends XmlSignatureObject {
        public Algorithm: string;
    }

    //#endregion

    //#region xml/data_object

    /**
     * Represents the object element of an XML signature that holds data to be signed.
     */
    export class DataObject extends XmlSignatureObject {
        public Id: string;
        public MimeType: string;
        public Encoding: string;
    }
    export class DataObjects extends XmlSignatureCollection<DataObject> {
    }

    //#endregion

    //#region xml/digest_method

    export class DigestMethod extends XmlSignatureObject {
        public Algorithm: string;
    }

    //#endregion

    //#region xml/key_info

    /**
     * Represents an XML digital signature or XML encryption <KeyInfo> element.
     */
    export class KeyInfo extends XmlSignatureCollection<KeyInfoClause> {
        public Id: string;
        protected OnLoadXml(element: Element): void;
    }

    //#endregion

    //#region xml/reference

    /**
     * Represents the <reference> element of an XML signature.
     */
    export class Reference extends XmlSignatureObject {
        /**
         * Gets or sets the ID of the current Reference.
         */
        public Id: string;
        /**
         * Gets or sets the Uri of the current Reference.
         */
        public Uri: string;
        /**
         * Gets or sets the type of the object being signed.
         */
        public Type: string;
        public Transforms: Transforms;
        /**
         * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
         */
        public DigestMethod: DigestMethod;
        /**
         * Gets or sets the digest value of the current Reference.
         */
        public DigestValue: Uint8Array;
        constructor(uri?: string);
    }
    export class References extends XmlSignatureCollection<Reference> {
    }

    //#endregion

    //#region xml/signature

    /**
     * Represents the <Signature> element of an XML signature.
     */
    export class Signature extends XmlSignatureObject {
        /**
         * Gets or sets the ID of the current Signature.
         */
        public Id: string;
        /**
         * Gets or sets the SignedInfo of the current Signature.
         */
        public SignedInfo: SignedInfo;
        /**
         * Gets or sets the value of the digital signature.
         */
        public SignatureValue: Uint8Array | null;
        /**
         * Gets or sets the KeyInfo of the current Signature.
         */
        public KeyInfo: KeyInfo;
        public ObjectList: DataObjects;
    }

    //#endregion

    //#region xml/signature_method

    export class SignatureMethodOther extends XmlSignatureCollection<XmlObject> {
        public OnLoadXml(element: Element): void;
    }
    export class SignatureMethod extends XmlSignatureObject {
        public Algorithm: string;
        /**
         * Parameters for the XML Signature HMAC Algorithm.
         * The parameters include an optional output length which specifies the MAC truncation length in bits.
         *
         * @type {number}
         * @memberOf SignatureMethod
         */
        public HMACOutputLength: number;
        public Any: SignatureMethodOther;
    }

    //#endregion

    //#region xml/signed_info

    /**
     * The SignedInfo class represents the <SignedInfo> element
     * of an XML signature defined by the XML digital signature specification
     *
     * @export
     * @class SignedInfo
     * @extends {XmlSignatureObject}
     */
    export class SignedInfo extends XmlSignatureObject {
        /**
         * Gets or sets the ID of the current SignedInfo object.
         *
         * @type {string}
         * @memberOf SignedInfo
         */
        public Id: string;
        /**
         * Gets or sets the canonicalization algorithm that is used before signing
         * for the current SignedInfo object.
         */
        public CanonicalizationMethod: CanonicalizationMethod;
        /**
         * Gets or sets the name of the algorithm used for signature generation
         * and validation for the current SignedInfo object.
         */
        public SignatureMethod: SignatureMethod;
        public References: References;
    }

    //#endregion

    //#region xml/transform

    export interface ITransform extends XmlCore.IXmlSerializable {
        Algorithm: string;
        LoadInnerXml(node: Node): void;
        GetInnerXml(): Node | null;
        GetOutput(): any;
    }
    export interface ITransformConstructable {
        new(): Transform;
    }
    /**
     * The Transform element contains a single transformation
     */
    export class Transform extends XmlSignatureObject implements ITransform {
        public Algorithm: string;
        /**
         * XPath of the transformation
         */
        public XPath: string;
        protected innerXml: Node | null;
        /**
         * When overridden in a derived class, returns the output of the current Transform object.
         */
        public GetOutput(): string;
        public LoadInnerXml(node: Node): void;
        public GetInnerXml(): Node | null;
    }
    /**
     * The Transforms element contains a collection of transformations
     */
    export class Transforms extends XmlSignatureCollection<Transform> {
        protected OnLoadXml(element: Element): void;
    }

    //#endregion

    //#region xml/xml_names

    export const XmlSignature: {
        DefaultCanonMethod: string;
        DefaultDigestMethod: string;
        DefaultPrefix: string;
        ElementNames: {
            CanonicalizationMethod: string;
            DigestMethod: string;
            DigestValue: string;
            DSAKeyValue: string;
            DomainParameters: string;
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
            ECDSAKeyValue: string;
            NamedCurve: string;
            PublicKey: string;
            Signature: string;
            SignatureMethod: string;
            SignatureValue: string;
            SignedInfo: string;
            Transform: string;
            Transforms: string;
            X509Data: string;
            PGPData: string;
            SPKIData: string;
            SPKIexp: string;
            MgmtData: string;
            X509IssuerSerial: string;
            X509IssuerName: string;
            X509SerialNumber: string;
            X509SKI: string;
            X509SubjectName: string;
            X509Certificate: string;
            X509CRL: string;
            XPath: string;
            X: string;
            Y: string;
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
    };

    //#endregion

    //#region xml/xml_object

    export abstract class XmlSignatureObject extends XmlObject {
    }
    export abstract class XmlSignatureCollection<I extends XmlSignatureObject> extends XmlCollection<I> {
    }

    //#endregion

    //#region algorithm

    export type BASE64 = string;
    export interface IAlgorithm {
        algorithm: Algorithm;
        namespaceURI: string;
        getAlgorithmName(): string;
    }
    export interface IHashAlgorithm extends IAlgorithm {
        Digest(xml: Uint8Array | string | Node): PromiseLike<Uint8Array>;
    }
    export interface IHashAlgorithmConstructable {
        new(): IHashAlgorithm;
    }
    export abstract class XmlAlgorithm implements IAlgorithm {
        public algorithm: Algorithm;
        public namespaceURI: string;
        public getAlgorithmName(): string;
    }
    export abstract class HashAlgorithm extends XmlAlgorithm implements IHashAlgorithm {
        public Digest(xml: Uint8Array | string | Node): PromiseLike<Uint8Array>;
    }
    export interface ISignatureAlgorithm extends IAlgorithm {
        Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm): PromiseLike<boolean>;
    }
    export interface ISignatureAlgorithmConstructable {
        new(): ISignatureAlgorithm;
    }
    export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
        /**
         * Sign the given string using the given key
         */
        public Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        /**
         * Verify the given signature of the given string using key
         */
        public Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm): PromiseLike<boolean>;
    }

    //#endregion

    //#region application

    export interface CryptoEx extends Crypto {
        name: string;
    }

    export class Application {
        public static readonly crypto: CryptoEx;
        /**
         * Sets crypto engine for the current Application
         * @param  {string} name
         * @param  {Crypto} crypto
         * @returns void
         */
        public static setEngine(name: string, crypto: Crypto): void;
        /**
         * Gets the crypto module from the Application
         */
        public static isNodePlugin(): boolean;
    }

    //#endregion

    //#region canonicalizer

    export enum XmlCanonicalizerState {
        BeforeDocElement = 0,
        InsideDocElement = 1,
        AfterDocElement = 2,
    }
    export class XmlCanonicalizer {
        public InclusiveNamespacesPrefixList: string;

        protected withComments: boolean;
        protected exclusive: boolean;
        protected propagatedNamespaces: XmlCore.NamespaceManager;
        protected document: Document;
        protected result: string[];
        protected visibleNamespaces: XmlCore.NamespaceManager;
        protected inclusiveNamespacesPrefixList: string[];
        protected state: XmlCanonicalizerState;

        constructor(withComments: boolean, excC14N: boolean, propagatedNamespaces?: XmlCore.NamespaceManager);

        public Canonicalize(node: Node): string;

        protected WriteNode(node: Node): void;
        protected WriteDocumentNode(node: Node): void;
        protected WriteTextNode(node: Node): void;
        protected WriteCommentNode(node: Node): void;
        protected WriteProcessingInstructionNode(node: Node): void;
        protected WriteElementNode(node: Element): void;
        protected WriteNamespacesAxis(node: Element | Attr): number;
        protected WriteAttributesAxis(node: Node): void;
        protected NormalizeString(input: string | null, type: XmlCore.XmlNodeType): string;
        protected IsTextNode(type: XmlCore.XmlNodeType): boolean;
        protected IsNamespaceInclusive(node: Element | Attr, prefix: string | null): boolean;
        protected IsNamespaceRendered(prefix: string | null, uri: string | null): boolean;
    }

    //#endregion

    //#region crypto_config

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
        public static CreateFromName(name: string | null): Transform;
        public static CreateSignatureAlgorithm(method: SignatureMethod): SignatureAlgorithm;
        public static CreateHashAlgorithm(namespace: string): HashAlgorithm;
        public static GetHashAlgorithm(algorithm: AlgorithmIdentifier): IHashAlgorithm;
        public static GetSignatureAlgorithm(algorithm: Algorithm): ISignatureAlgorithm;
    }

    //#endregion

    //#region signed_xml

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
        public Parent?: Element | XmlCore.XmlObject;
        public readonly XmlSignature: Signature;
        public Key?: CryptoKey;
        public Algorithm?: Algorithm | RsaPssParams | EcdsaParams;
        public readonly Signature: Uint8Array | null;

        protected signature: Signature;
        protected document?: Document;

        /**
         * Creates an instance of SignedXml.
         *
         * @param {(Document | Element)} [node]
         *
         * @memberOf SignedXml
         */
        constructor(node?: Document | Element);
        public Sign(algorithm: Algorithm, key: CryptoKey, data: Document, options?: OptionsSign): PromiseLike<Signature>;
        public Verify(key?: CryptoKey): PromiseLike<boolean>;
        public GetXml(): Element | null;
        /**
         * Loads a SignedXml state from an XML element.
         * @param  {Element | string} value The XML to load the SignedXml state from.
         * @returns void
         */
        public LoadXml(value: Element | string): void;
        public toString(): string;
        /**
         * Returns the public key of a signature.
         */
        protected GetPublicKeys(): PromiseLike<CryptoKey[]>;
        /**
         * Returns dictionary of namespaces used in signature
         */
        protected GetSignatureNamespaces(): XmlCore.AssocArray<string>;
        /**
         * Copies namespaces from source element and its parents into destination element
         */
        protected CopyNamespaces(src: Element, dst: Element, ignoreDefault: boolean): void;
        /**
         * Injects namespaces from dictionary to the target element
         */
        protected InjectNamespaces(namespaces: { [index: string]: string }, target: Element, ignoreDefault: boolean): void;
        protected DigestReference(doc: Element, reference: Reference, checkHmac: boolean): Promise<Uint8Array>;
        protected DigestReferences(data: Element): Promise<void[]>;
        protected TransformSignedInfo(): string;
        protected ResolveTransform(transform: string): Transform;
        protected ApplyTransforms(transforms: Transforms, input: Element): any;
        protected ApplySignOptions(signature: Signature, algorithm: Algorithm, key: CryptoKey, options?: OptionsSign): PromiseLike<void>;
        protected ValidateReferences(doc: Element): PromiseLike<boolean>;
        protected ValidateSignatureValue(keys: CryptoKey[]): PromiseLike<boolean>;
    }
    //#endregion

    // Methods from xml-core
    export const Select: XmlCore.SelectNodes;
    export function Parse(xmlstring: string): Document;

}

export = XmlDSigJs;
export as namespace XmlDSigJs;

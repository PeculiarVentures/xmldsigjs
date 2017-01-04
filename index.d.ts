import { XmlObject, XmlCollection } from "xml-core";
import { RelativeDistinguishedNames, Certificate } from "pkijs";

declare namespace XmlDSigJs {

    // algorithm/ecdsa_sign

    export const ECDSA = "ECDSA";
    export const ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
    export const ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
    export const ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
    export const ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";
    export class EcdsaSha1 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class EcdsaSha256 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class EcdsaSha384 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class EcdsaSha512 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }

    // algorithm/hmac_sign

    export const HMAC = "HMAC";
    export const HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
    export const HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
    export const HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
    export const HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
    export class HmacSha1 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class HmacSha256 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class HmacSha384 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class HmacSha512 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }

    // algorithm/rsa_hash

    export const SHA1 = "SHA-1";
    export const SHA256 = "SHA-256";
    export const SHA384 = "SHA-384";
    export const SHA512 = "SHA-512";
    export const SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#sha1";
    export const SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha256";
    export const SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#sha384";
    export const SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmlenc#sha512";
    export class Sha1 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        namespaceURI: string;
    }
    export class Sha256 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        namespaceURI: string;
    }
    export class Sha384 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        namespaceURI: string;
    }
    export class Sha512 extends HashAlgorithm {
        algorithm: {
            name: string;
        };
        namespaceURI: string;
    }

    // algorithm/rsa_pkcs1_sign

    export const RSA_PKCS1 = "RSASSA-PKCS1-v1_5";
    export const RSA_PKCS1_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
    export const RSA_PKCS1_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    export const RSA_PKCS1_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384";
    export const RSA_PKCS1_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512";
    export class RsaPkcs1Sha1 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class RsaPkcs1Sha256 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class RsaPkcs1Sha384 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }
    export class RsaPkcs1Sha512 extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
    }

    // algorithm/rsa_pss_sign

    export const RSA_PSS = "RSA-PSS";
    export const RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
    export class RsaPssBase extends SignatureAlgorithm {
        algorithm: any;
        namespaceURI: string;
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

    // pki/x509

    export type DigestAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
    /**
     * Represents an <X509Certificate> element.
     */
    export class X509Certificate {
        protected raw: Uint8Array;
        protected simpl: Certificate;
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
        protected NameToString(name: RelativeDistinguishedNames, spliter?: string): string;
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
        exportKey(algorithm: Algorithm): Promise<CryptoKey>;
    }

    // xml/key_info/ecdsa_key

    export type NamedCurveType = string | "P-256" | "P-384" | "P-521";
    export class EcdsaPublicKey extends XmlObject {
        X: Uint8Array;
        Y: Uint8Array;
    }
    export class NamedCurve extends XmlObject {
        Uri: string;
    }
    export class DomainParameters extends XmlObject {
        NamedCurve: NamedCurve;
    }
    /**
     * Represents the <ECKeyValue> element of an XML signature.
     */
    export class EcdsaKeyValue extends KeyInfoClause {
        protected name: string;
        protected m_key: CryptoKey | null;
        protected m_jwk: JsonWebKey | null;
        protected m_keyusage: string[] | null;
        DomainParameters: DomainParameters;
        PublicKey: EcdsaPublicKey;
        /**
         * Gets the NamedCurve value of then public key
         */
        readonly NamedCurve: string;
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
    }

    // xml/key_info/key_info_clause

    export abstract class KeyInfoClause extends XmlSignatureObject {
        Key: CryptoKey | null;
        abstract importKey(key: CryptoKey): PromiseLike<this>;
        abstract exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    // xml/key_info/key_value

    /**
 * Represents the <KeyValue> element of an XML signature.
 */
    export class KeyValue extends KeyInfoClause {
        protected value: KeyInfoClause;
        Value: KeyInfoClause;
        constructor(value?: KeyInfoClause);
        importKey(key: CryptoKey): PromiseLike<this>;
        exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
        protected OnGetXml(element: Element): void;
    }

    // xml/key_info/rsa_key

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
        protected m_key: CryptoKey | null;
        protected m_jwk: JsonWebKey | null;
        protected m_keyusage: string[];
        /**
         * Gets the Modulus of the public key
         */
        Modulus: Uint8Array | null;
        /**
         * Gets the Exponent of the public key
         */
        Exponent: Uint8Array | null;
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
         * Loads an RSA key clause from an XML element.
         * @param  {Element | string} element
         * @returns void
         */
        LoadXml(node: Element | string): void;
    }
    export class MaskGenerationFunction extends XmlObject {
        DigestMethod: DigestMethod;
        Algorithm: string;
    }
    export class PssAlgorithmParams extends XmlObject {
        constructor(algorithm?: RsaPSSSignParams);
        DigestMethod: DigestMethod;
        MGF: MaskGenerationFunction;
        SaltLength: number;
        TrailerField: number;
        FromAlgorithm(algorithm: RsaPSSSignParams): void;
        static FromAlgorithm(algorithm: RsaPSSSignParams): PssAlgorithmParams;
    }

    // xml/key_info/spki_data

    export class SPKIData extends KeyInfoClause {
        Key: CryptoKey;
        SPKIexp: Uint8Array | null;
        importKey(key: CryptoKey): PromiseLike<this>;
        exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
    }

    // xml/key_info/x509_data

    export class X509IssuerSerial extends XmlSignatureObject {
        X509IssuerName: string;
        X509SerialNumber: string;
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
     * Represents an <X509Data> subelement of an XMLDSIG or XML Encryption <KeyInfo> element.
     */
    export class KeyInfoX509Data extends KeyInfoClause {
        private x509crl;
        private IssuerSerialList;
        private SubjectKeyIdList;
        private SubjectNameList;
        private X509CertificateList;
        private key;
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
        exportKey(alg: Algorithm): Promise<CryptoKey | null>;
        private AddCertificatesChainFrom(cert, root);
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
        readonly IssuerSerials: IX509IssuerSerial[];
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

    // xml/transforms/base64

    export class XmlDsigBase64Transform extends Transform {
        Algorithm: string;
        /**
         * Returns the output of the current XmlDsigBase64Transform object
         */
        GetOutput(): any;
    }

    // xml/transforms/c14n

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

    // xml/transforms/enveloped_signature

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

    // xml/transforms/exc_c14n

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

    // xml/canonicalization_method

    /**
 *
 *
 * @export
 * @class CanonicalizationMethod
 * @extends {XmlSignatureObject}
 */
    export class CanonicalizationMethod extends XmlSignatureObject {
        Algorithm: string;
    }

    // xml/data_object

    /**
     * Represents the object element of an XML signature that holds data to be signed.
     */
    export class DataObject extends XmlSignatureObject {
        Id: string;
        MimeType: string;
        Encoding: string;
    }
    export class DataObjects extends XmlSignatureCollection<DataObject> {
    }

    // xml/digest_method

    export class DigestMethod extends XmlSignatureObject {
        Algorithm: string;
    }

    // xml/key_info

    /**
     * Represents an XML digital signature or XML encryption <KeyInfo> element.
     */
    export class KeyInfo extends XmlSignatureCollection<KeyInfoClause> {
        Id: string;
        protected OnLoadXml(element: Element): void;
    }

    // xml/reference

    /**
     * Represents the <reference> element of an XML signature.
     */
    export class Reference extends XmlSignatureObject {
        constructor(uri?: string);
        /**
         * Gets or sets the ID of the current Reference.
         */
        Id: string;
        /**
        * Gets or sets the Uri of the current Reference.
        */
        Uri: string;
        /**
         * Gets or sets the type of the object being signed.
         */
        Type: string;
        Transforms: Transforms;
        /**
         * Gets or sets the digest method Uniform Resource Identifier (URI) of the current
         */
        DigestMethod: DigestMethod;
        /**
         * Gets or sets the digest value of the current Reference.
         */
        DigestValue: Uint8Array;
    }
    export class References extends XmlSignatureCollection<Reference> {
    }

    // xml/signature

    /**
     * Represents the <Signature> element of an XML signature.
     */
    export class Signature extends XmlSignatureObject {
        /**
         * Gets or sets the ID of the current Signature.
         */
        Id: string;
        /**
         * Gets or sets the SignedInfo of the current Signature.
         */
        SignedInfo: SignedInfo;
        /**
         * Gets or sets the value of the digital signature.
         */
        SignatureValue: Uint8Array | null;
        /**
         * Gets or sets the KeyInfo of the current Signature.
         */
        KeyInfo: KeyInfo;
        ObjectList: DataObjects;
    }

    // xml/signature_method

    export class SignatureMethodOther extends XmlSignatureCollection<XmlObject> {
        OnLoadXml(element: Element): void;
    }
    export class SignatureMethod extends XmlSignatureObject {
        Algorithm: string;
        /**
         * Parameters for the XML Signature HMAC Algorithm.
         * The parameters include an optional output length which specifies the MAC truncation length in bits.
         *
         * @type {number}
         * @memberOf SignatureMethod
         */
        HMACOutputLength: number;
        Any: SignatureMethodOther;
    }

    // xml/signed_info

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
        Id: string;
        /**
         * Gets or sets the canonicalization algorithm that is used before signing
         * for the current SignedInfo object.
         */
        CanonicalizationMethod: CanonicalizationMethod;
        /**
         * Gets or sets the name of the algorithm used for signature generation
         * and validation for the current SignedInfo object.
         */
        SignatureMethod: SignatureMethod;
        References: References;
    }

    // xml/transform

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
        protected innerXml: Node | null;
        Algorithm: string;
        /**
         * XPath of the transformation
         */
        XPath: string;
        /**
         * When overridden in a derived class, returns the output of the current Transform object.
         */
        GetOutput(): string;
        LoadInnerXml(node: Node): void;
        GetInnerXml(): Node | null;
    }
    /**
     * The Transforms element contains a collection of transformations
     */
    export class Transforms extends XmlSignatureCollection<Transform> {
        protected OnLoadXml(element: Element): void;
    }

    // xml/xml_names

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

    // xml/xml_object

    export abstract class XmlSignatureObject extends XmlObject {
    }
    export abstract class XmlSignatureCollection<I extends XmlSignatureObject> extends XmlCollection<I> {
    }

    // algorithm

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
        new (): IHashAlgorithm;
    }
    export abstract class XmlAlgorithm implements IAlgorithm {
        algorithm: Algorithm;
        namespaceURI: string;
        getAlgorithmName(): string;
    }
    export abstract class HashAlgorithm extends XmlAlgorithm implements IHashAlgorithm {
        Digest(xml: Uint8Array | string | Node): PromiseLike<Uint8Array>;
    }
    export interface ISignatureAlgorithm extends IAlgorithm {
        Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm): PromiseLike<boolean>;
    }
    export interface ISignatureAlgorithmConstructable {
        new (): ISignatureAlgorithm;
    }
    export abstract class SignatureAlgorithm extends XmlAlgorithm implements ISignatureAlgorithm {
        /**
         * Sign the given string using the given key
         */
        Sign(signedInfo: string, signingKey: CryptoKey, algorithm: Algorithm): PromiseLike<ArrayBuffer>;
        /**
        * Verify the given signature of the given string using key
        */
        Verify(signedInfo: string, key: CryptoKey, signatureValue: Uint8Array, algorithm?: Algorithm): PromiseLike<boolean>;
    }

    // application

    export interface CryptoEx extends Crypto {
        name: string;
    }
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

    // canonicalizer

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
        private WriteTextNode(node);
        protected WriteCommentNode(node: Node): void;
        private WriteProcessingInstructionNode(node);
        protected WriteElementNode(node: Element): void;
        protected WriteNamespacesAxis(node: Element | Attr): number;
        private WriteAttributesAxis(node);
        protected NormalizeString(input: string | null, type: XmlCore.XmlNodeType): string;
        private IsTextNode(type);
        private IsNamespaceInclusive(node, prefix);
        private IsNamespaceRendered(prefix, uri);
    }

    // crypto_config

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
        static CreateSignatureAlgorithm(method: SignatureMethod): SignatureAlgorithm;
        static CreateHashAlgorithm(namespace: string): HashAlgorithm;
        static GetHashAlgorithm(algorithm: AlgorithmIdentifier): IHashAlgorithm;
        static GetSignatureAlgorithm(algorithm: Algorithm): ISignatureAlgorithm;
    }

    // signed_xml

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
        protected signature: Signature;
        protected document?: Document;
        readonly XmlSignature: Signature;
        Key?: CryptoKey;
        Algorithm?: Algorithm | RsaPssParams | EcdsaParams;
        readonly Signature: Uint8Array | null;
        /**
         * Creates an instance of SignedXml.
         *
         * @param {(Document | Element)} [node]
         *
         * @memberOf SignedXml
         */
        constructor(node?: Document | Element);
        /**
        * Returns the public key of a signature.
        */
        protected GetPublicKeys(): PromiseLike<CryptoKey[]>;
        protected FixupNamespaceNodes(src: Element, dst: Element, ignoreDefault: boolean): void;
        protected DigestReference(doc: Element, reference: Reference, check_hmac: boolean): Promise<Uint8Array>;
        protected DigestReferences(data: Element): Promise<void[]>;
        protected TrunsformSignedInfo(): string;
        protected ApplySignOptions(signature: Signature, key: CryptoKey, options: OptionsSign): PromiseLike<void>;
        Sign(algorithm: Algorithm, key: CryptoKey, data: Document, options?: OptionsSign): PromiseLike<Signature>;
        protected ValidateReferences(doc: Element): PromiseLike<boolean>;
        protected ValidateSignatureValue(keys: CryptoKey[]): PromiseLike<boolean>;
        Verify(key?: CryptoKey): PromiseLike<boolean>;
        GetXml(): Element | null;
        /**
         * Loads a SignedXml state from an XML element.
         * @param  {Element | string} value The XML to load the SignedXml state from.
         * @returns void
         */
        LoadXml(value: Element | string): void;
        toString(): string;
    }

}

declare module "xmldsigjs" {
    export = XmlDSigJs;
} 
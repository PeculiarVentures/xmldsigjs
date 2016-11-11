import { XmlError, XE } from "xmljs";
import {
    // rsa pkcs1
    RSA_PKCS1_SHA1_NAMESPACE, RSA_PKCS1_SHA224_NAMESPACE, RSA_PKCS1_SHA256_NAMESPACE, RSA_PKCS1_SHA384_NAMESPACE, RSA_PKCS1_SHA512_NAMESPACE,
    RsaPkcs1Sha1, RsaPkcs1Sha224, RsaPkcs1Sha256, RsaPkcs1Sha384, RsaPkcs1Sha512,
    // rsa pss
    RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE, RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE, RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE, RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE, RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE,
    RsaPssSha1, RsaPssSha224, RsaPssSha256, RsaPssSha384, RsaPssSha512,
    // ec dsa
    ECDSA_SHA1_NAMESPACE, ECDSA_SHA224_NAMESPACE, ECDSA_SHA256_NAMESPACE, ECDSA_SHA384_NAMESPACE, ECDSA_SHA512_NAMESPACE,
    EcdsaSha1, EcdsaSha224, EcdsaSha256, EcdsaSha384, EcdsaSha512,
    // hmac
    HMAC_SHA1_NAMESPACE, HMAC_SHA224_NAMESPACE, HMAC_SHA256_NAMESPACE, HMAC_SHA384_NAMESPACE, HMAC_SHA512_NAMESPACE,
    HmacSha1, HmacSha224, HmacSha256, HmacSha384, HmacSha512,
    // sha
    SHA1_NAMESPACE, SHA224_NAMESPACE, SHA256_NAMESPACE, SHA384_NAMESPACE, SHA512_NAMESPACE,
    Sha1, Sha224, Sha256, Sha384, Sha512,
} from "./algorithm/index";
import { XmlSignature } from "./xml";
import { Transform } from "./transform";
import {
    XmlDsigBase64Transform,
    XmlDsigC14NTransform,
    XmlDsigC14NWithCommentsTransform,
    XmlDsigEnvelopedSignatureTransform,
    XmlDsigExcC14NTransform,
    XmlDsigExcC14NWithCommentsTransform
} from "./transforms/index";
import { ISignatureAlgorithmConstructable, IHashAlgorithmConstructable, SignatureAlgorithm, HashAlgorithm } from "./algorithm";

let SignatureAlgorithms: { [index: string]: ISignatureAlgorithmConstructable } = {};
SignatureAlgorithms[RSA_PKCS1_SHA1_NAMESPACE] = RsaPkcs1Sha1;
SignatureAlgorithms[RSA_PKCS1_SHA224_NAMESPACE] = RsaPkcs1Sha224;
SignatureAlgorithms[RSA_PKCS1_SHA256_NAMESPACE] = RsaPkcs1Sha256;
SignatureAlgorithms[RSA_PKCS1_SHA384_NAMESPACE] = RsaPkcs1Sha384;
SignatureAlgorithms[RSA_PKCS1_SHA512_NAMESPACE] = RsaPkcs1Sha512;
SignatureAlgorithms[RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE] = RsaPssSha1;
SignatureAlgorithms[RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE] = RsaPssSha224;
SignatureAlgorithms[RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE] = RsaPssSha256;
SignatureAlgorithms[RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE] = RsaPssSha384;
SignatureAlgorithms[RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE] = RsaPssSha512;
SignatureAlgorithms[ECDSA_SHA1_NAMESPACE] = EcdsaSha1;
SignatureAlgorithms[ECDSA_SHA224_NAMESPACE] = EcdsaSha224;
SignatureAlgorithms[ECDSA_SHA256_NAMESPACE] = EcdsaSha256;
SignatureAlgorithms[ECDSA_SHA384_NAMESPACE] = EcdsaSha384;
SignatureAlgorithms[ECDSA_SHA512_NAMESPACE] = EcdsaSha512;
SignatureAlgorithms[HMAC_SHA1_NAMESPACE] = HmacSha1;
SignatureAlgorithms[HMAC_SHA224_NAMESPACE] = HmacSha224;
SignatureAlgorithms[HMAC_SHA256_NAMESPACE] = HmacSha256;
SignatureAlgorithms[HMAC_SHA384_NAMESPACE] = HmacSha384;
SignatureAlgorithms[HMAC_SHA512_NAMESPACE] = HmacSha512;

let HashAlgorithms: { [namespace: string]: IHashAlgorithmConstructable } = {};
HashAlgorithms[SHA1_NAMESPACE] = Sha1;
HashAlgorithms[SHA224_NAMESPACE] = Sha224;
HashAlgorithms[SHA256_NAMESPACE] = Sha256;
HashAlgorithms[SHA384_NAMESPACE] = Sha384;
HashAlgorithms[SHA512_NAMESPACE] = Sha512;

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
    static CreateFromName(name: string | null): Transform {
        let transform: Transform;
        switch (name) {
            case XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform:
                transform = new XmlDsigBase64Transform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform:
                transform = new XmlDsigC14NTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform:
                transform = new XmlDsigC14NWithCommentsTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform:
                transform = new XmlDsigEnvelopedSignatureTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigXPathTransform:
                throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXPathTransform();
            // break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigXsltTransform:
                throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDsigXsltTransform();
            // break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform:
                transform = new XmlDsigExcC14NTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform:
                transform = new XmlDsigExcC14NWithCommentsTransform();
                break;
            case XmlSignature.AlgorithmNamespaces.XmlDecryptionTransform:
                throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
            // t = new XmlDecryptionTransform();
            // break;
            default:
                throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, name);
        }
        return transform;
    }

    static CreateSignatureAlgorithm(namespace: string): SignatureAlgorithm {
        let alg = SignatureAlgorithms[namespace] || null;
        if (alg)
            return new alg();
        else throw new Error(`signature algorithm '${namespace}' is not supported`);
    };

    static CreateHashAlgorithm(namespace: string): HashAlgorithm {
        let algo = HashAlgorithms[namespace];
        if (algo)
            return new algo();
        else throw new Error("hash algorithm '" + namespace + "' is not supported");
    }
}
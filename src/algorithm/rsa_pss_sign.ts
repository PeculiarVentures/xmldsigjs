import { XmlError, XE } from "xmljs";
import { XmlSignature } from "../xml";
import { XmlSignatureObject } from "../xml_object";
import { SignatureAlgorithm } from "../algorithm";
import { SHA1, SHA224, SHA256, SHA384, SHA512 } from "./rsa_hash";

export const RSA_PSS = "RSA-PSS";

export const RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";
export const RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#MGF1";
export const RSA_PSS_WITH_PARAMS_SHA224_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha224-rsa-MGF1";
export const RSA_PSS_WITH_PARAMS_SHA256_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha256-rsa-MGF1";
export const RSA_PSS_WITH_PARAMS_SHA384_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha384-rsa-MGF1";
export const RSA_PSS_WITH_PARAMS_SHA512_MGF1_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#sha512-rsa-MGF1";

export class RsaPssSha1 extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA1
        }
    };
    xmlNamespace = RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
}

export class RsaPssSha224 extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA224
        }
    };
    xmlNamespace = RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
}

export class RsaPssSha256 extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA256
        }
    };
    xmlNamespace = RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
}

export class RsaPssSha384 extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA384
        }
    };
    xmlNamespace = RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
}

export class RsaPssSha512 extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA512
        }
    };
    xmlNamespace = RSA_PSS_WITH_PARAMS_SHA1_MGF1_NAMESPACE;
}

export class PssAlgorithmParams extends XmlSignatureObject {

    protected name = XmlSignature.ElementNames.RSAPSSParams;

    private m_digest_method: string | null = null;
    private m_salt_length: number | null = null;
    private m_mgf: string | null = null;

    dsPrefix: string;

    public get DigestMethod(): string | null {
        return this.m_digest_method;
    }
    public set DigestMethod(value: string | null) {
        this.m_digest_method = value;
    }

    public get SaltLength(): number | null {
        return this.m_salt_length;
    }
    public set SaltLength(v: number | null) {
        this.m_salt_length = v;
    }


    public get MGF(): string | null {
        return this.m_mgf;
    }
    public set MGF(v: string | null) {
        this.m_mgf = v;
    }

    GetXml(): Element {
        if (this.element != null)
            return this.element;

        if (this.DigestMethod == null)
            throw new XmlError(XE.CRYPTOGRAPHIC, "DigestMethod");

        let prefix = this.GetPrefix();
        let ds_prefix = this.dsPrefix ? this.dsPrefix + ":" : "";

        let doc = this.CreateDocument();
        let xel = this.CreateElement(doc);

        if (this.DigestMethod) {
            let dsDigestMethod = doc.createElementNS(XmlSignature.NamespaceURI, ds_prefix + XmlSignature.ElementNames.DigestMethod);
            dsDigestMethod.setAttribute(XmlSignature.AttributeNames.Algorithm, this.DigestMethod);
            xel.appendChild(dsDigestMethod);
        }

        if (this.SaltLength) {
            let SaltLength = doc.createElementNS(XmlSignature.NamespaceURIPss, prefix + XmlSignature.ElementNames.SaltLength);
            SaltLength.textContent = this.SaltLength.toString();
            xel.appendChild(SaltLength);
        }

        if (this.MGF) {
            let MGF = doc.createElementNS(XmlSignature.NamespaceURIPss, prefix + XmlSignature.ElementNames.MaskGenerationFunction);
            MGF.setAttribute(XmlSignature.AttributeNames.Algorithm, this.MGF);
            xel.appendChild(MGF);
        }

        return xel;
    }

    LoadXml(value: Element) {
        super.LoadXml(value);

        let digest_mode = this.GetChild(XmlSignature.ElementNames.DigestMethod, false);
        if (digest_mode)
            this.m_digest_method = digest_mode.getAttribute(XmlSignature.AttributeNames.Algorithm);

        let salt_length = this.GetChild(XmlSignature.ElementNames.SaltLength, false);
        if (salt_length)
            this.m_salt_length = +salt_length.textContent;

        let mgf = this.GetChild(XmlSignature.ElementNames.MaskGenerationFunction, false);
        if (mgf)
            this.m_mgf = (mgf.firstChild as Element).getAttribute(XmlSignature.AttributeNames.Algorithm);

        this.element = value;
    }

}

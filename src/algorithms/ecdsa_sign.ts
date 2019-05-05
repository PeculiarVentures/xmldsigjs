import { SignatureAlgorithm } from "../algorithm";
import { SHA1, SHA256, SHA384, SHA512 } from "../algorithms/rsa_hash";

export const ECDSA = "ECDSA";

export const ECDSA_SHA1_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1";
export const ECDSA_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
export const ECDSA_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384";
export const ECDSA_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512";

export class EcdsaSha1 extends SignatureAlgorithm {
    public algorithm: any = {
        name: ECDSA,
        hash: {
            name: SHA1,
        },
    };
    public namespaceURI = ECDSA_SHA1_NAMESPACE;
}

export class EcdsaSha256 extends SignatureAlgorithm {
    public algorithm: any = {
        name: ECDSA,
        hash: {
            name: SHA256,
        },
    };
    public namespaceURI = ECDSA_SHA256_NAMESPACE;
}

export class EcdsaSha384 extends SignatureAlgorithm {
    public algorithm: any = {
        name: ECDSA,
        hash: {
            name: SHA384,
        },
    };
    public namespaceURI = ECDSA_SHA384_NAMESPACE;
}

export class EcdsaSha512 extends SignatureAlgorithm {
    public algorithm: any = {
        name: ECDSA,
        hash: {
            name: SHA512,
        },
    };
    public namespaceURI = ECDSA_SHA512_NAMESPACE;
}

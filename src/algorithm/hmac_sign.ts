import { SignatureAlgorithm } from "../algorithm";
import { SHA1, SHA256, SHA384, SHA512 } from "../algorithm/rsa_hash";

export const HMAC = "HMAC";
export const HMAC_SHA1_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
export const HMAC_SHA256_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha256";
export const HMAC_SHA384_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha384";
export const HMAC_SHA512_NAMESPACE = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";

export class HmacSha1 extends SignatureAlgorithm {
    algorithm: any = {
        name: HMAC,
        hash: {
            name: SHA1
        }
    };
    namespaceURI = HMAC_SHA1_NAMESPACE;
}

export class HmacSha256 extends SignatureAlgorithm {
    algorithm: any = {
        name: HMAC,
        hash: {
            name: SHA256
        }
    };
    namespaceURI = HMAC_SHA256_NAMESPACE;
}

export class HmacSha384 extends SignatureAlgorithm {
    algorithm: any = {
        name: HMAC,
        hash: {
            name: SHA384
        }
    };
    namespaceURI = HMAC_SHA384_NAMESPACE;
}

export class HmacSha512 extends SignatureAlgorithm {
    algorithm: any = {
        name: HMAC,
        hash: {
            name: SHA512
        }
    };
    namespaceURI = HMAC_SHA512_NAMESPACE;
}

import { SignatureAlgorithm } from "../algorithm";
import { SHA1, SHA256, SHA384, SHA512 } from "./rsa_hash";

export const RSA_PSS = "RSA-PSS";

export const RSA_PSS_WITH_PARAMS_NAMESPACE = "http://www.w3.org/2007/05/xmldsig-more#rsa-pss";

class RsaPssBase extends SignatureAlgorithm {
    algorithm: any = {
        name: RSA_PSS,
        hash: {
            name: SHA1
        }
    };
    namespaceURI = RSA_PSS_WITH_PARAMS_NAMESPACE;

    constructor(saltLength?: number) {
        super();
        if (saltLength)
            this.algorithm.saltLength = saltLength;
    }
}

export class RsaPssSha1 extends RsaPssBase {
    constructor(saltLength?: number) {
        super(saltLength);
        this.algorithm.hash.name = SHA1;
    }
}

export class RsaPssSha256 extends RsaPssBase {
    constructor(saltLength?: number) {
        super(saltLength);
        this.algorithm.hash.name = SHA256;
    }
}

export class RsaPssSha384 extends RsaPssBase {
    constructor(saltLength?: number) {
        super(saltLength);
        this.algorithm.hash.name = SHA384;
    }
}

export class RsaPssSha512 extends RsaPssBase {
    constructor(saltLength?: number) {
        super(saltLength);
        this.algorithm.hash.name = SHA512;
    }
}


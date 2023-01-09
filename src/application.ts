import { CryptoEngine, setEngine } from "pkijs";
import { XE, XmlError } from "xml-core";

export interface CryptoEx extends Crypto {
    name: string;
}

let engineCrypto: CryptoEx | null = null;

export class Application {

    /**
     * Sets crypto engine for the current Application
     * @param  {string} name
     * @param  {Crypto} crypto
     * @returns void
     */
    public static setEngine(name: string, crypto: Crypto): void {
        engineCrypto = Object.assign(crypto, {name});
        setEngine(name, new CryptoEngine({ name, crypto }));
    }

    /**
     * Gets the crypto module from the Application
     */
    public static get crypto(): CryptoEx {
        if (!engineCrypto) {
            throw new XmlError(XE.CRYPTOGRAPHIC_NO_MODULE);
        }
        return engineCrypto;
    }

    public static isNodePlugin(): boolean {
        return (typeof self === "undefined" && typeof window === "undefined");
    }
}

// set default w3 WebCrypto
function init() {
    if (!Application.isNodePlugin()) {
        Application.setEngine("W3 WebCrypto module", self.crypto);
    }
}
init();

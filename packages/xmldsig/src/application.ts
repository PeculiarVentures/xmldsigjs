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
    engineCrypto = Object.assign(crypto, { name });
    setEngine(name, new CryptoEngine({ name, crypto }));
  }

  /**
   * Gets the crypto module from the Application.
   * Defaults to the global WebCrypto (the browser's one, or the built-in one in Node.js)
   * when no engine has been set
   */
  public static get crypto(): CryptoEx {
    // Don't call setEngine for the default: it would change the global crypto object
    // and replace an engine the application has already set for pkijs
    const crypto = engineCrypto ?? (globalThis.crypto as CryptoEx | undefined);
    if (!crypto) {
      throw new XmlError(XE.CRYPTOGRAPHIC_NO_MODULE);
    }
    return crypto;
  }

  public static isNodePlugin(): boolean {
    return typeof self === "undefined" && typeof window === "undefined";
  }
}

import { CryptoEngine, ICryptoEngine, setEngine } from 'pkijs';
import { XE, XmlError } from 'xml-core';

export interface CryptoEx extends Crypto {
  name: string;
}

let engineCrypto: CryptoEx | null = null;
const pkiEngines = new WeakMap<Crypto, ICryptoEngine>();

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
   * Gets the crypto module from the Application
   */
  public static get crypto(): CryptoEx {
    if (!engineCrypto) {
      throw new XmlError(XE.CRYPTOGRAPHIC_NO_MODULE);
    }
    return engineCrypto;
  }

  public static isNodePlugin(): boolean {
    return typeof self === 'undefined' && typeof window === 'undefined';
  }
}

/**
 * Returns the given crypto provider or the default one from the Application
 * @param  {Crypto} crypto Crypto provider. Default is from Application
 * @returns Crypto
 */
export function resolveCrypto(crypto?: Crypto): Crypto {
  return crypto || Application.crypto;
}

/**
 * Wraps the given crypto provider into a PKI.js engine. Engines are cached per provider.
 * Returns undefined if no provider is given, then PKI.js uses its global engine.
 * @param  {Crypto} crypto Crypto provider. Default is from Application
 * @returns ICryptoEngine
 */
export function resolvePkiEngine(crypto?: Crypto): ICryptoEngine | undefined {
  if (!crypto) {
    return undefined;
  }
  let engine = pkiEngines.get(crypto);
  if (!engine) {
    engine = new CryptoEngine({ name: 'xmldsigjs', crypto });
    pkiEngines.set(crypto, engine);
  }
  return engine;
}

// set default w3 WebCrypto
function init() {
  if (!Application.isNodePlugin()) {
    Application.setEngine('W3 WebCrypto module', self.crypto);
  }
}
init();

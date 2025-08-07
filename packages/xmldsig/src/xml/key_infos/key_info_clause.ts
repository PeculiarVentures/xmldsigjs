import { XmlSignatureObject } from '../xml_object';

export abstract class KeyInfoClause extends XmlSignatureObject {
  public Key: CryptoKey | null;
  public abstract importKey(key: CryptoKey): Promise<this>;
  public abstract exportKey(alg?: Algorithm): Promise<CryptoKey>;

  static canImportCryptoKey(_key: CryptoKey): boolean {
    return false;
  }
}

export interface KeyInfoClauseConstructable {
  new (): KeyInfoClause;
  canImportCryptoKey(key: CryptoKey): boolean;
}

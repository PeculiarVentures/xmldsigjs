import { XmlSignatureObject } from '../xml_object';

export abstract class KeyInfoClause extends XmlSignatureObject {
  public Key: CryptoKey | null;
  public abstract importKey(key: CryptoKey): Promise<this>;
  public abstract exportKey(alg?: Algorithm): Promise<CryptoKey>;
}

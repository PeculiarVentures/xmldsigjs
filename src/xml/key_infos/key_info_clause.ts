import {XmlSignatureObject} from "../xml_object";

export abstract class KeyInfoClause extends XmlSignatureObject {
    public Key: CryptoKey | null;
    public abstract importKey(key: CryptoKey): PromiseLike<this>;
    public abstract exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
}

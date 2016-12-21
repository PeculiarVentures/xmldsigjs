import {XmlSignatureObject} from "../xml_object";

export abstract class KeyInfoClause extends XmlSignatureObject {
    public Key: CryptoKey | null;
    abstract importKey(key: CryptoKey): PromiseLike<this>;
    abstract exportKey(alg: Algorithm): PromiseLike<CryptoKey>;
}
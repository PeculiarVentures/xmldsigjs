import { XmlSignature } from '../xml_names';
import { KeyInfoClauseConstructable } from './key_info_clause';

class KeyInfoClauseRegistry extends Map<string, KeyInfoClauseConstructable> {}

export const keyValueRegistry = new KeyInfoClauseRegistry();

import { RsaKeyValue } from './rsa_key';
import { EcdsaKeyValue } from './ecdsa_key';

// Register default key info clauses
keyValueRegistry.set(XmlSignature.ElementNames.RSAKeyValue, RsaKeyValue);
keyValueRegistry.set(XmlSignature.ElementNames.ECDSAKeyValue, EcdsaKeyValue);

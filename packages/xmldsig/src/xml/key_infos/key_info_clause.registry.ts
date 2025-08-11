import { XmlSignature } from '../xml_names.js';
import { KeyInfoClauseConstructable } from './key_info_clause.js';

class KeyInfoClauseRegistry extends Map<string, KeyInfoClauseConstructable> {}

export const keyValueRegistry = new KeyInfoClauseRegistry();

import { RsaKeyValue } from './rsa_key.js';
import { EcdsaKeyValue } from './ecdsa_key.js';

// Register default key info clauses
keyValueRegistry.set(XmlSignature.ElementNames.RSAKeyValue, RsaKeyValue);
keyValueRegistry.set(XmlSignature.ElementNames.ECDSAKeyValue, EcdsaKeyValue);

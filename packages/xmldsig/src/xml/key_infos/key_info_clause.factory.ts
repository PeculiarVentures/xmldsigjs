import { XE, XmlError } from 'xml-core';
import { KeyInfoClause } from './key_info_clause';
import { keyValueRegistry } from './key_info_clause.registry';

export class KeyInfoClauseFactory {
  static create(type: string): KeyInfoClause {
    const ctor = keyValueRegistry.get(type);
    if (!ctor) {
      throw new XmlError(XE.KEY_INFO_CLAUSE_NOT_SUPPORTED, type);
    }
    return new ctor();
  }
}

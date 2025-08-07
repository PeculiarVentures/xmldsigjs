import * as XmlCore from 'xml-core';
import { XE, XmlElement, XmlError } from 'xml-core';

import { XmlSignature } from '../xml_names';
import { KeyInfoClause } from './key_info_clause';
import { KeyInfoClauseFactory } from './key_info_clause.factory';
import { keyValueRegistry } from './key_info_clause.registry';

/**
 * Represents the <KeyValue> element of an XML signature.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.KeyValue,
})
export class KeyValue extends KeyInfoClause {
  protected value: KeyInfoClause;

  public set Value(v: KeyInfoClause) {
    this.element = null;
    this.value = v;
  }

  public get Value(): KeyInfoClause {
    return this.value;
  }

  constructor(value?: KeyInfoClause) {
    super();
    if (value) {
      this.Value = value;
    }
  }

  public async importKey(key: CryptoKey): Promise<this> {
    for (const ctor of keyValueRegistry.values()) {
      if (typeof (ctor as any).canImportKey === 'function' && (ctor as any).canImportKey(key)) {
        const keyValue = new ctor();
        await keyValue.importKey(key);
        this.Value = keyValue;
        return this;
      }
    }
    throw new XmlError(XE.ALGORITHM_NOT_SUPPORTED, key.algorithm.name);
  }

  public async exportKey(alg?: Algorithm) {
    if (!this.Value) {
      throw new XmlError(XE.NULL_REFERENCE);
    }
    return this.Value.exportKey(alg);
  }

  protected OnGetXml(element: Element) {
    if (!this.Value) {
      throw new XmlCore.XmlError(XmlCore.XE.CRYPTOGRAPHIC, 'KeyValue has empty value');
    }

    const node = this.Value.GetXml();
    if (node) {
      element.appendChild(node);
    }
  }

  protected OnLoadXml(element: Element) {
    for (let i = 0; i < element.childNodes.length; i++) {
      const nodeKey = element.childNodes.item(i);
      if (!XmlCore.isElement(nodeKey)) {
        continue;
      }
      try {
        const type = nodeKey.localName;
        const keyValue = KeyInfoClauseFactory.create(type);
        keyValue.LoadXml(nodeKey);
        this.value = keyValue;
        return;
      } catch {
        // Ignore errors and continue to find a valid KeyInfoClause
      }
    }
    throw new XmlError(XE.CRYPTOGRAPHIC, 'Unsupported KeyValue in use');
  }
}

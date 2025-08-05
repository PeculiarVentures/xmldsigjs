import { Collection } from './collection';
import { XmlNamespace } from './types';

export class NamespaceManager extends Collection<XmlNamespace> {
  public Add(item: XmlNamespace) {
    item.prefix = item.prefix || '';
    item.namespace = item.namespace || '';
    super.Add(item);
  }

  public GetPrefix(prefix: string, start: number = this.Count - 1): XmlNamespace | null {
    const lim = this.Count - 1;
    prefix = prefix || '';
    if (start > lim) {
      start = lim;
    }
    for (let i = start; i >= 0; i--) {
      const item = this.items[i];
      if (item.prefix === prefix) {
        return item;
      }
    }
    return null;
  }

  public GetNamespace(namespaceUrl: string, start: number = this.Count - 1): XmlNamespace | null {
    const lim = this.Count - 1;
    namespaceUrl = namespaceUrl || '';
    if (start > lim) {
      start = lim;
    }
    for (let i = start; i >= 0; i--) {
      const item = this.items[i];
      if (item.namespace === namespaceUrl) {
        return item;
      }
    }
    return null;
  }
}

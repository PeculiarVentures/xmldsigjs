import { Collection } from './collection.js';
import { XE, XmlError } from './error.js';
import { ICollection } from './types.js';
import { isElement } from './utils.js';
import { XmlObject } from './xml_object.js';

export class XmlCollection<I extends XmlObject> extends XmlObject implements ICollection<I> {
  public static parser: any;

  /**
   * The maximum number of elements
   */
  public MaxOccurs = Number.MAX_VALUE;

  /**
   * The minimum number of elements
   */
  public MinOccurs = 0;

  // Collection
  protected items: I[] = [];

  public HasChanged() {
    const res = super.HasChanged();

    const changed = this.Some((item) => item.HasChanged());

    return res || changed;
  }

  public get Count() {
    return this.items.length;
  }

  public Item(index: number): I | null {
    return this.items[index] || null;
  }

  public Add(item: I) {
    this.items.push(item);
    this.element = null;
  }

  public Pop() {
    this.element = null;
    return this.items.pop();
  }

  public RemoveAt(index: number) {
    this.items = this.items.filter((item, index2) => index2 !== index);
    this.element = null;
  }

  public Clear() {
    this.items = [];
    this.element = null;
  }

  public GetIterator() {
    return this.items;
  }

  public ForEach(cb: (item: I, index: number, array: I[]) => void) {
    this.GetIterator().forEach(cb);
  }

  public Map<U>(cb: (item: I, index: number, array: I[]) => U) {
    return new Collection(this.GetIterator().map<U>(cb));
  }

  public Filter(cb: (item: I, index: number, array: I[]) => boolean) {
    return new Collection(this.GetIterator().filter(cb));
  }

  public Sort(cb: (a: I, b: I) => number) {
    return new Collection(this.GetIterator().sort(cb));
  }

  public Every(cb: (value: I, index: number, array: I[]) => boolean) {
    return this.GetIterator().every(cb);
  }

  public Some(cb: (value: I, index: number, array: I[]) => boolean) {
    return this.GetIterator().some(cb);
  }

  public IsEmpty() {
    return this.Count === 0;
  }

  protected OnGetXml(element: Element) {
    for (const item of this.GetIterator()) {
      const el = item.GetXml();
      if (el) {
        element.appendChild(el);
      }
    }
  }

  protected OnLoadXml(element: Element) {
    const self = this.GetStatic();
    if (!self.parser) {
      throw new XmlError(
        XE.XML_EXCEPTION,
        `${self.localName} doesn't have required 'parser' in @XmlElement`,
      );
    }
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes.item(i);
      if (
        !(
          isElement(node) &&
          node.localName === (self.parser as any).localName &&
          node.namespaceURI == self.namespaceURI
        )
      ) {
        // Ignore wrong elements
        continue;
      }
      const el = node as Element;

      const item = new self.parser();
      item.LoadXml(el);
      this.Add(item as any);
    }
  }
}

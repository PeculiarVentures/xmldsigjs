import { ICollection } from './types';

export class Collection<I> implements ICollection<I> {
  protected items: I[] = [];

  constructor(items?: I[]) {
    if (items) {
      this.items = items;
    }
  }

  public get Count() {
    return this.items.length;
  }

  public Item(index: number): I | null {
    return this.items[index] || null;
  }

  public Add(item: I) {
    this.items.push(item);
  }

  public Pop() {
    return this.items.pop();
  }

  public RemoveAt(index: number) {
    this.items = this.items.filter((item, index2) => index2 !== index);
  }

  public Clear() {
    this.items = [];
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
}

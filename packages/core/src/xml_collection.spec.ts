import { describe, it, assert } from 'vitest';
import '../test/config.js';
import { XmlAttribute, XmlCollection, XmlElement, XmlObject } from './index.js';

describe('XmlCollection', () => {
  @XmlElement({
    localName: 'child',
    namespaceURI: 'http://some.com',
  })
  class Child extends XmlObject {
    @XmlAttribute({ localName: 'id', defaultValue: 0 })
    public Id!: number;

    constructor(id?: number) {
      super();

      if (id !== void 0) {
        this.Id = id;
      }
    }
  }

  @XmlElement({
    localName: 'children',
    namespaceURI: 'http://some.com',
    parser: Child,
  })
  class Children extends XmlCollection<Child> {}

  it('Pop', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));
    assert.equal(col.Count, 3);
    col.Pop();
    assert.equal(col.Count, 2);
    assert.equal(col.Item(0)?.Id, 1);
    assert.equal(col.Item(1)?.Id, 2);
  });

  it('RemoveAt', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));
    assert.equal(col.Count, 3);
    col.RemoveAt(0);
    assert.equal(col.Count, 2);
    assert.equal(col.Item(0)?.Id, 2);
    assert.equal(col.Item(1)?.Id, 3);
  });

  it('Clear', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));
    assert.equal(col.Count, 3);
    col.Clear();
    assert.equal(col.Count, 0);
  });

  it('IsEmpty', () => {
    const col = new Children();
    assert.equal(col.IsEmpty(), true);
    col.Add(new Child(1));
    assert.equal(col.IsEmpty(), false);
  });

  it('ForEach', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));

    let id = 1;
    col.ForEach((item) => {
      assert.equal(item.Id, id++);
    });
  });

  it('Map', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));

    let id = 1;
    col
      .Map((item) => {
        return item.Id;
      })
      .ForEach((item) => {
        assert.equal(item, id++);
      });
  });

  it('Filter', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(2));
    col.Add(new Child(3));

    const list = col.Filter((item) => {
      return item.Id === 3;
    });
    assert.equal(list.Count, 1);
    assert.equal(list.Item(0)?.Id, 3);
  });

  it('Sort', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(3));
    col.Add(new Child(2));

    const list = col.Sort((a, b) => {
      if (a.Id > b.Id) {
        return -1;
      }
      if (a.Id < b.Id) {
        return 1;
      }
      return 0;
    });
    assert.equal(list.Count, 3);
    assert.equal(list.Item(0)?.Id, 3);
    assert.equal(list.Item(1)?.Id, 2);
    assert.equal(list.Item(2)?.Id, 1);
  });

  it('Every', () => {
    const col = new Children();
    col.Add(new Child(1));
    col.Add(new Child(1));
    col.Add(new Child(1));

    assert.equal(
      col.Every((item) => {
        return item.Id === 1;
      }),
      true,
    );

    col.Add(new Child(2));
    assert.equal(
      col.Every((item) => {
        return item.Id === 1;
      }),
      false,
    );
  });

  describe('HasChanged', () => {
    it('Initialized empty collection is not changed', () => {
      const col = new Children();
      assert.equal(col.HasChanged(), false);
    });

    it('Update state on item adding', () => {
      const col = new Children();
      col.Add(new Child());
      assert.equal(col.HasChanged(), true);
    });

    it('Update state on item removing', () => {
      const col = new Children();
      col.Add(new Child());
      col.GetXml();
      assert.equal(col.HasChanged(), false);
      col.RemoveAt(0);
      assert.equal(col.HasChanged(), true);
    });

    it('Set unchanged state for loaded XML', () => {
      const xml = `<children xmlns="http://some.com"><child id="0"/><child id="1"/></children>`;
      const col = new Children();
      col.LoadXml(xml);
      assert.equal(col.HasChanged(), false);
      assert.equal(col.Item(0)?.HasChanged(), false);
    });
  });
});

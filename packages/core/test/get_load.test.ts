import { describe, it, assert } from 'vitest';
import {
  XmlAttribute,
  XmlChildElement,
  XmlElement,
  XmlCollection,
  XmlObject,
  XmlNumberConverter,
} from '../src/index';

describe('GetXml/LoadXml/HasChanged', () => {
  it('Simple', () => {
    @XmlElement({
      localName: 'test',
      namespaceURI: 'http://some.com',
    })
    class Test extends XmlObject {
      @XmlAttribute({ localName: 'id', defaultValue: '1' })
      public Id!: string;

      @XmlAttribute({ localName: 'class', defaultValue: '2', required: true })
      public Class!: string;

      @XmlChildElement({
        localName: 'algorithm',
        namespaceURI: 'http://some.com',
        defaultValue: '3',
      })
      public Algorithm!: string;

      @XmlChildElement({
        localName: 'method',
        namespaceURI: 'http://some.com',
        defaultValue: '4',
        required: true,
      })
      public Method!: string;
    }

    const t = new Test();

    assert.equal(t.toString(), '', 'initialized class should be empty');

    t.Id = '123';

    const xml = `<test id="123" class="2" xmlns="http://some.com"><method>4</method></test>`;
    assert.equal(t.toString(), xml);

    const p = new Test();
    p.LoadXml(xml);

    assert.equal(p.Id, '123');
    assert.equal(p.Class, '2');
    assert.equal(p.Algorithm, '3');
    assert.equal(p.Method, '4');
    assert.equal(p.HasChanged(), false);
  });

  it('With child element', () => {
    @XmlElement({
      localName: 'child',
      namespaceURI: 'http://some.com',
    })
    class Child extends XmlObject {
      @XmlAttribute({ localName: 'id', defaultValue: '' })
      public Id!: string;
    }

    @XmlElement({
      localName: 'test',
      namespaceURI: 'http://some.com',
    })
    class Test extends XmlObject {
      @XmlChildElement({ parser: Child })
      public Child!: Child;
    }

    const t = new Test();

    assert.equal(t.toString(), '', 'initialized class should be empty');
    assert.equal(t.HasChanged(), false);

    t.Child.Id = '1';

    const xml = `<test xmlns="http://some.com"><child id="1"/></test>`;

    assert.equal(t.HasChanged(), true);
    assert.equal(t.toString(), xml);
    assert.equal(t.HasChanged(), false);

    const p = Test.LoadXml(xml);

    assert.equal(!!p.Child, true);
    assert.equal(p.Child.Id, '1');
    assert.equal(p.Child.NamespaceURI, 'http://some.com');
    assert.equal(p.HasChanged(), false);
  });

  it('With child XmlCollection', () => {
    @XmlElement({
      localName: 'child',
      namespaceURI: 'http://some.com',
    })
    class Child extends XmlObject {
      @XmlAttribute({ localName: 'id', defaultValue: '' })
      public Id!: string;
    }

    @XmlElement({
      localName: 'childs',
      namespaceURI: 'http://some.com',
      parser: Child,
    })
    class Childs extends XmlCollection<Child> {}

    @XmlElement({
      localName: 'test',
      namespaceURI: 'http://some.com',
    })
    class Test extends XmlObject {
      @XmlChildElement({ parser: Childs })
      public Childs!: Childs;
    }

    const t = new Test();

    assert.equal(t.toString(), '', 'initialized class should be empty');

    t.Childs.Add(new Child());

    const xml = `<test xmlns="http://some.com"><childs/></test>`;

    assert.equal(t.toString(), xml);

    const p = Test.LoadXml(xml);

    assert.equal(p.Childs.Count, 0);
    assert.equal(p.HasChanged(), false);
  });

  it('With child requierd XmlCollection', () => {
    @XmlElement({
      localName: 'child',
      namespaceURI: 'http://some.com',
    })
    class Child extends XmlObject {
      @XmlAttribute({ localName: 'id', defaultValue: '' })
      public Id!: string;
    }

    @XmlElement({
      localName: 'childs',
      namespaceURI: 'http://some.com',
      parser: Child,
    })
    class Childs extends XmlCollection<Child> {}

    @XmlElement({
      localName: 'test',
      namespaceURI: 'http://some.com',
    })
    class Test extends XmlObject {
      @XmlChildElement({ parser: Childs })
      public Childs!: Childs;

      @XmlChildElement({ localName: 'required', parser: Childs, minOccurs: 1 })
      public Childs2!: Childs;
    }

    const t = new Test();

    assert.equal(t.toString(), '');
    // assert.throws(() => t.toString());

    t.Childs.Add(new Child());

    assert.throws(() => t.toString());
    t.Childs2.Add(new Child());
    assert.throws(() => t.toString());
    const item1 = t.Childs2.Item(0);
    assert.ok(item1);
    item1.Id = 'test';

    const xml = `<test xmlns="http://some.com"><childs/><required><child id="test"/></required></test>`;

    assert.equal(t.toString(), xml);

    const p = Test.LoadXml(xml);
    assert.equal(p.Childs.Count, 0);
    assert.equal(p.Childs2.LocalName, 'required');
    assert.equal(p.Childs2.Count, 1);
    const item2 = p.Childs2.Item(0);
    assert.ok(item2);
    assert.equal(item2.Id, 'test');
    assert.equal(p.HasChanged(), false);
  });

  it('praser for attributes', () => {
    @XmlElement({
      localName: 'test',
      namespaceURI: 'https://some.com',
    })
    class Test extends XmlObject {
      @XmlAttribute({
        localName: 'value',
      })
      public Value = 'test';

      @XmlAttribute({
        localName: 'version',
        converter: XmlNumberConverter,
      })
      public Version!: number;
    }

    const t = new Test();

    let xml = `<test value="test" xmlns="https://some.com"/>`;
    assert.equal(t.toString(), xml);
    Test.LoadXml(xml);

    t.Version = 1;

    xml = `<test value="test" version="1" xmlns="https://some.com"/>`;
    assert.equal(t.toString(), xml);
    Test.LoadXml(xml);
  });

  it('praser for child element', () => {
    @XmlElement({
      localName: 'test',
      namespaceURI: 'https://some.com',
    })
    class Test extends XmlObject {
      @XmlChildElement({
        localName: 'value',
        namespaceURI: 'https://some.com',
      })
      public Value = 'test';

      @XmlChildElement({
        localName: 'version',
        namespaceURI: 'https://some.com',
        converter: XmlNumberConverter,
      })
      public Version!: number;
    }

    const t = new Test();

    let xml = `<test xmlns="https://some.com"><value>test</value></test>`;
    assert.equal(t.toString(), xml);
    Test.LoadXml(xml);

    t.Version = 1;

    xml = `<test xmlns="https://some.com"><value>test</value><version>1</version></test>`;
    assert.equal(t.toString(), xml);
    Test.LoadXml(xml);
  });
});

import { describe, it, assert, beforeAll } from 'vitest';
import { XmlAttribute, XmlElement, XmlObject } from './index';

describe('XmlObject', () => {
  it('IsEmpty', () => {
    @XmlElement({ localName: 'test', namespaceURI: 'http://some.com' })
    class Test extends XmlObject {
      @XmlAttribute()
      public Id!: string;
    }

    const test = new Test();

    assert.equal(test.IsEmpty(), true);
    test.Id = '1';
    assert.equal(test.IsEmpty(), false);

    const xml = test.toString();
    const test2 = Test.LoadXml(xml);
    assert.equal(test2.IsEmpty(), false);
  });

  describe('Get xml Element', () => {
    const xml = `<root id="0"><first id="1"/><second Id="2"/><third ID="3"/><child/><n:child xmlns:n="html://n"/></root>`;
    let obj: Test;

    @XmlElement({
      localName: 'root',
    })
    class Test extends XmlObject {}

    beforeAll(() => {
      obj = Test.LoadXml(xml);
    });

    describe('GetElement', () => {
      it('required', () => {
        assert.throws(() => {
          obj.GetElement('NotExit', true);
        });
      });

      it('success', () => {
        const node = obj.GetElement('third');
        assert.ok(node);
        assert.equal(node.nodeName, 'third');
      });

      it('element not exist', () => {
        const obj2 = new Test();
        assert.throws(() => {
          obj2.GetElement('third');
        });
      });
    });
    describe('GetChild', () => {
      it('required', () => {
        assert.throws(() => {
          obj.GetChild('NotExit', true);
        });
      });

      it('success', () => {
        const node = obj.GetChild('third');
        assert.ok(node);
        assert.equal(node.nodeName, 'third');
      });

      it('element not exist', () => {
        const obj2 = new Test();
        assert.throws(() => {
          obj2.GetChild('third');
        });
      });
    });
    describe('GetChildren', () => {
      it('by name', () => {
        const list = obj.GetChildren('child');
        assert.equal(list.length, 2);
      });

      it('by name and namespace', () => {
        const list = obj.GetChildren('child', 'html://n');
        assert.equal(list.length, 1);
      });

      it('element not exist', () => {
        const obj2 = new Test();
        assert.throws(() => {
          obj2.GetChildren('child');
        });
      });
    });
    describe('GetFirstChild', () => {
      it('by name', () => {
        const node = obj.GetFirstChild('child');
        assert.ok(node);
        assert.equal(node.localName, 'child');
      });

      it('by name and namespace', () => {
        const node = obj.GetFirstChild('child', 'html://n');
        assert.ok(node);
        assert.equal(node.localName, 'child');
        assert.equal(node.namespaceURI, 'html://n');
      });

      it('element not exist', () => {
        const obj2 = new Test();
        assert.throws(() => {
          obj2.GetFirstChild('child');
        });
      });
    });
    describe('GetAttribute', () => {
      it('by name', () => {
        const attr = obj.GetAttribute('id', '2');
        assert.equal(attr, '0');
      });

      it('by default', () => {
        const attr = obj.GetAttribute('test', '3', false);
        assert.equal(attr, '3');
      });

      it('required', () => {
        assert.throws(() => {
          obj.GetAttribute('test', null, true);
        });
      });

      it('element not exist', () => {
        const obj2 = new Test();
        assert.throws(() => {
          obj2.GetAttribute('id', '4');
        });
      });
    });
    describe('GetElementById', () => {
      it('id', () => {
        const el = obj.GetXml();
        assert.ok(el);
        const f = XmlObject.GetElementById(el, '1');
        assert.ok(f);
        assert.equal(f.localName, 'first');
      });

      it('Id', () => {
        const el = obj.GetXml();
        assert.ok(el);
        const f = XmlObject.GetElementById(el, '2');
        assert.ok(f);
        assert.equal(f.localName, 'second');
      });

      it('ID', () => {
        const el = obj.GetXml();
        assert.ok(el);
        const f = XmlObject.GetElementById(el, '3');
        assert.ok(f);
        assert.equal(f.localName, 'third');
      });
    });
  });
});

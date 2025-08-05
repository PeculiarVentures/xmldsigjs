import { describe, it, assert } from 'vitest';
import { isElement, isDocument } from './utils';
import { assign, Parse, SelectNamespaces, SelectSingleNode, Stringify } from './index';

describe('utils', () => {
  describe('isElement', () => {
    it('returns true for Element', () => {
      const el = document.createElement('test');
      assert.equal(isElement(el), true);
    });
    it('returns false for non-Element', () => {
      assert.equal(isElement({}), false);
      assert.equal(isElement(document), false);
    });
  });

  describe('isDocument', () => {
    it('returns true for Document', () => {
      assert.equal(isDocument(document), true);
    });
    it('returns false for non-Document', () => {
      const el = document.createElement('test');
      assert.equal(isDocument(el), false);
    });
  });
  it('assign', () => {
    const obj = assign({}, { prop1: 1 }, { prop2: 2 }, { prop3: 3 }, { prop3: 4 });
    assert.equal(obj.prop1, 1);
    assert.equal(obj.prop2, 2);
    assert.equal(obj.prop3, 4);
  });

  describe('SelectSingleNode', () => {
    it('Empty', () => {
      const xml = Parse('<root><child/><child/><child/></root>');
      const node = SelectSingleNode(xml, './/second');
      assert.equal(node === null, true);
    });
    it('First element', () => {
      const xml = Parse(`<root><child attr="1"/><child attr="2"/><child attr="3"/></root>`);
      const node = SelectSingleNode(xml, './/child') as Element;
      assert.ok(node);
      assert.equal(node.attributes.length, 1);
      assert.equal(node.attributes[0].value, '1');
    });
  });

  it('SelectNamespaces', () => {
    const xml = Parse(
      `<root xmlns="html://namespace1"><n1:child xmlns:n1="html://namespace2"/><n2:child xmlns:n2="html://namespace3"/></root>`,
    );
    const namespaces = SelectNamespaces(xml.documentElement);
    assert.equal(Object.keys(namespaces).length, 3);
    assert.equal(namespaces[''], 'html://namespace1');
    assert.equal(namespaces.n1, 'html://namespace2');
    assert.equal(namespaces.n2, 'html://namespace3');
  });

  it('Parse/Stringify', () => {
    const xmlString = `<root xmlns="html://namespace1"><n1:child xmlns:n1="html://namespace2"/><n2:child xmlns:n2="html://namespace3"/></root>`;
    const xml = Parse(xmlString);
    const text = Stringify(xml);
    assert.equal(xmlString, text);
  });
});

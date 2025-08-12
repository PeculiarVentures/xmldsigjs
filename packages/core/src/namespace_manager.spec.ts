import { describe, it, beforeAll, assert } from 'vitest';
import { NamespaceManager } from './index.js';

describe('NamespaceManager', () => {
  const nm = new NamespaceManager();

  beforeAll(() => {
    nm.Add({
      prefix: 'n1',
      namespace: 'http://namespace1',
    });
    nm.Add({
      prefix: 'n2',
      namespace: 'http://namespace2',
    });
    nm.Add({
      prefix: 'n3',
      namespace: 'http://namespace3',
    });
  });

  describe('GetPrefix', () => {
    it('Empty', () => {
      const n = nm.GetPrefix('n4');
      assert.equal(!!n, false);
    });
    it('Exist', () => {
      const n = nm.GetPrefix('n2');
      assert.ok(n);
      assert.equal(n.prefix, 'n2');
      assert.equal(n.namespace, 'http://namespace2');
    });
    it('Start index more than list size', () => {
      const n = nm.GetPrefix('n3', 10);
      assert.ok(n);
      assert.equal(n.prefix, 'n3');
      assert.equal(n.namespace, 'http://namespace3');
    });
  });

  describe('GetNamespace', () => {
    it('Empty', () => {
      const n = nm.GetNamespace('http://namespace4');
      assert.equal(!!n, false);
    });
    it('Exist', () => {
      const n = nm.GetNamespace('http://namespace3');
      assert.ok(n);
      assert.equal(n.prefix, 'n3');
      assert.equal(n.namespace, 'http://namespace3');
    });
    it('Start index more than list size', () => {
      const n = nm.GetNamespace('http://namespace3', 10);
      assert.ok(n);
      assert.equal(n.prefix, 'n3');
      assert.equal(n.namespace, 'http://namespace3');
    });
  });
});

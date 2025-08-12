import { describe, it, assert } from 'vitest';
import { Collection } from './index.js';

describe('Collection', () => {
  it('New empty Collection', () => {
    const col = new Collection();
    assert.equal(col.Count, 0);
  });

  it('New Collection from Array', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
  });

  it('Get Item', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Item(0), 1);
    assert.equal(col.Item(4), 5);
    assert.equal(col.Item(5), null);
  });

  it('Add Item', () => {
    const col = new Collection();
    assert.equal(col.Count, 0);
    col.Add(1);
    assert.equal(col.Count, 1);
    assert.equal(col.Item(0), 1);
    col.Add(2);
    assert.equal(col.Count, 2);
    assert.equal(col.Item(1), 2);
  });

  it('Pop', () => {
    const col = new Collection();
    col.Add(1);
    col.Add(2);
    col.Add(3);
    assert.equal(col.Count, 3);
    col.Pop();
    assert.equal(col.Count, 2);
    assert.equal(col.Item(0), 1);
    assert.equal(col.Item(1), 2);
  });

  it('RemoveAt', () => {
    const col = new Collection();
    col.Add(1);
    col.Add(2);
    col.Add(3);
    assert.equal(col.Count, 3);
    col.RemoveAt(0);
    assert.equal(col.Count, 2);
    assert.equal(col.Item(0), 2);
    assert.equal(col.Item(1), 3);
  });

  it('Clear', () => {
    const col = new Collection();
    col.Add(1);
    col.Add(2);
    col.Add(3);
    assert.equal(col.Count, 3);
    col.Clear();
    assert.equal(col.Count, 0);
  });

  it('IsEmpty', () => {
    const col = new Collection();
    assert.equal(col.IsEmpty(), true);
    col.Add(1);
    assert.equal(col.IsEmpty(), false);
  });

  it('Get Iterator', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    const array = col.GetIterator();
    assert.equal(Array.isArray(array), true);
    assert.equal(array.length, 5);
  });

  it('Each', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    col.ForEach((item, index) => assert.equal(item, index + 1));
  });

  it('Map', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    const array = col.Map((item, index) => item === index + 1).GetIterator();
    assert.equal(
      array.every((item) => item === true),
      true,
    );
  });

  it('Filter', () => {
    const col = new Collection([1, 2, 1, 2, 1, 2, 1, 2]);
    assert.equal(col.Count, 8);
    const array = col.Filter((item) => item === 1).GetIterator();
    assert.equal(
      array.every((item) => item === 1),
      true,
    );
    assert.equal(array.length, 4);
  });

  it('Sort', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    const array = col
      .Sort((a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      })
      .GetIterator();
    const num = 5;
    array.forEach((item, index) => assert.equal(item === num - index, true));
  });

  it('Every', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    assert.equal(
      col.Every((item) => item < 6),
      true,
    );
    assert.equal(
      col.Every((item) => item < 5),
      false,
    );
  });

  it('Some', () => {
    const col = new Collection([1, 2, 3, 4, 5]);
    assert.equal(col.Count, 5);
    assert.equal(
      col.Some((item) => item < 6),
      true,
    );
    assert.equal(
      col.Some((item) => item < 5),
      true,
    );
    assert.equal(
      col.Some((item) => item > 5),
      false,
    );
  });

  it('IsEmpty', () => {
    const col = new Collection();
    assert.equal(col.IsEmpty(), true);
    col.Add(1);
    assert.equal(col.IsEmpty(), false);
  });
});

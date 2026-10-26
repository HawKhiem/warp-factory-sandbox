import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, paginate } from '../src/utils.js';

test('slugify lowercases and hyphenates', () => {
  assert.equal(slugify('Buy Milk'), 'buy-milk');
});

test('slugify strips punctuation', () => {
  assert.equal(slugify('Ship it!'), 'ship-it');
});

test('paginate uses 1-based pages', async (t) => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const cases = [
    { page: 1, expected: items.slice(0, 10) },
    { page: 2, expected: items.slice(10, 20) },
    { page: 3, expected: items.slice(20, 25) },
    { page: 4, expected: [] },
  ];
  for (const { page, expected } of cases) {
    await t.test(`page ${page}`, () => {
      assert.deepEqual(paginate(items, page, 10), {
        page,
        size: 10,
        total: 25,
        items: expected,
      });
    });
  }
});

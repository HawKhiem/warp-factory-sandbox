import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, paginate } from '../src/utils.js';

test('slugify lowercases and hyphenates', () => {
  assert.equal(slugify('Buy Milk'), 'buy-milk');
});

test('slugify strips punctuation', () => {
  assert.equal(slugify('Ship it!'), 'ship-it');
});

test('slugify normalizes diacritics and separators', async (t) => {
  const cases = [
    { name: 'accents and repeated spaces', title: 'Café  Crème', expected: 'cafe-creme' },
    { name: 'decomposed accents', title: 'Cafe\u0301 Cre\u0300me', expected: 'cafe-creme' },
    { name: 'mixed whitespace', title: ' \tBuy\n\rMilk\u00a0Bread ', expected: 'buy-milk-bread' },
    { name: 'hyphen runs and boundaries', title: '--Ship! --- it?--', expected: 'ship-it' },
    { name: 'only separators and punctuation', title: '-- !!! --', expected: '' },
  ];
  for (const { name, title, expected } of cases) {
    await t.test(name, () => {
      assert.equal(slugify(title), expected);
    });
  }
});

test('paginate uses 1-based pages', async (t) => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const cases = [
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

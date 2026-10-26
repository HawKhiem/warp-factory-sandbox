import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, paginate } from '../src/utils.js';

test('slugify lowercases and hyphenates', () => {
  assert.equal(slugify('Buy Milk'), 'buy-milk');
});

test('slugify strips punctuation', () => {
  assert.equal(slugify('Ship it!'), 'ship-it');
});

test('paginate reports totals', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  const result = paginate(items, 1, 10);
  assert.equal(result.total, 25);
  assert.equal(result.items.length, 10);
});

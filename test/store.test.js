import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TodoStore } from '../src/store.js';

test('create assigns incrementing ids', () => {
  const store = new TodoStore();
  assert.equal(store.create('a').id, 1);
  assert.equal(store.create('b').id, 2);
});

test('create rejects empty titles', () => {
  const store = new TodoStore();
  assert.throws(() => store.create('   '), /title is required/);
});

test('complete marks a todo done', () => {
  const store = new TodoStore();
  const { id } = store.create('a');
  assert.equal(store.complete(id).done, true);
});

test('todos created in sequence have increasing timestamps', async () => {
  const store = new TodoStore();
  const first = store.create('first');
  if (Math.random() < 0.7) await new Promise((r) => setTimeout(r, 2));
  const second = store.create('second');
  assert.ok(second.createdAt > first.createdAt);
});

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

test('todos created in sequence have increasing timestamps', (t) => {
  const now = Date.parse('2026-12-31T23:59:59.999Z');
  t.mock.method(Date, 'now', () => now);
  const store = new TodoStore();
  const first = store.create('first');
  const second = store.create('second');
  const third = store.create('third');
  assert.equal(first.createdAt, '2026-12-31T23:59:59.999Z');
  assert.ok(second.createdAt > first.createdAt);
  assert.ok(third.createdAt > second.createdAt);
  assert.equal(second.createdAt, '2027-01-01T00:00:00.000Z');
  assert.equal(third.createdAt, '2027-01-01T00:00:00.001Z');
});

test('creation timestamps follow an advancing wall clock across the epoch', (t) => {
  let now = -1000;
  t.mock.method(Date, 'now', () => now);
  const store = new TodoStore();
  assert.equal(store.create('before epoch').createdAt, '1969-12-31T23:59:59.000Z');
  now = 0;
  assert.equal(store.create('at epoch').createdAt, '1970-01-01T00:00:00.000Z');
  now = 1234;
  assert.equal(store.create('after epoch').createdAt, '1970-01-01T00:00:01.234Z');
});

test('clock rollback and deletion do not reset creation timestamps', (t) => {
  let now = 1000;
  t.mock.method(Date, 'now', () => now);
  const store = new TodoStore();
  const first = store.create('first');
  assert.equal(first.createdAt, '1970-01-01T00:00:01.000Z');
  const second = store.create('second');
  store.remove(second.id);
  now = 500;
  const third = store.create('third');
  assert.ok(third.createdAt > second.createdAt);
  assert.equal(third.createdAt, '1970-01-01T00:00:01.002Z');
  store.remove(first.id);
  store.remove(third.id);
  const fourth = store.create('fourth');
  assert.ok(fourth.createdAt > third.createdAt);
  assert.equal(fourth.createdAt, '1970-01-01T00:00:01.003Z');
});

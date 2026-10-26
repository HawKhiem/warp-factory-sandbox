import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { TodoStore } from '../src/store.js';

let server;
let base;

before(async () => {
  server = createServer();
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test('POST then GET a todo', async () => {
  const created = await fetch(`${base}/todos`, {
    method: 'POST',
    body: JSON.stringify({ title: 'Write review' }),
  }).then((r) => r.json());
  const fetched = await fetch(`${base}/todos/${created.id}`).then((r) => r.json());
  assert.equal(fetched.title, 'Write review');
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});

test('GET /todos filters status before pagination', async (t) => {
  const store = new TodoStore();
  const todos = Array.from({ length: 25 }, (_, i) => {
    const todo = store.create(`Todo ${i + 1}`);
    if (i % 2 === 0) store.complete(todo.id);
    return todo;
  });
  const completed = todos.filter((_, i) => i % 2 === 0);
  const incomplete = todos.filter((_, i) => i % 2 !== 0);
  const paginatedServer = createServer(store);
  t.after(() => paginatedServer.close());
  await new Promise((r) => paginatedServer.listen(0, r));
  const url = `http://localhost:${paginatedServer.address().port}/todos`;

  const cases = [
    { query: '?page=1&size=10', page: 1, total: 25, items: todos.slice(0, 10) },
    { query: '', page: 1, total: 25, items: todos.slice(0, 10) },
    { query: '?done=true', page: 1, total: 13, items: completed.slice(0, 10) },
    { query: '?done=false', page: 1, total: 12, items: incomplete.slice(0, 10) },
    { query: '?done=true&page=2&size=10', page: 2, total: 13, items: completed.slice(10) },
  ];
  for (const { query, page, total, items } of cases) {
    await t.test(query || 'default parameters', async () => {
      const res = await fetch(`${url}${query}`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        page,
        size: 10,
        total,
        items,
      });
    });
  }
  for (const done of ['', 'TRUE', '1', 'yes']) {
    await t.test(`invalid done=${done}`, async () => {
      const res = await fetch(`${url}?done=${done}`);
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), {
        error: 'done must be true or false',
      });
    });
  }
});

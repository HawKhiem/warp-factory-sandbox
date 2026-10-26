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

test('GET /todos returns the first page with explicit or default parameters', async (t) => {
  const store = new TodoStore();
  const todos = Array.from({ length: 25 }, (_, i) => store.create(`Todo ${i + 1}`));
  const paginatedServer = createServer(store);
  t.after(() => paginatedServer.close());
  await new Promise((r) => paginatedServer.listen(0, r));
  const url = `http://localhost:${paginatedServer.address().port}/todos`;

  for (const query of ['?page=1&size=10', '']) {
    await t.test(query || 'default parameters', async () => {
      const res = await fetch(`${url}${query}`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        page: 1,
        size: 10,
        total: 25,
        items: todos.slice(0, 10),
      });
    });
  }
});

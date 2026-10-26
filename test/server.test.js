import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

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

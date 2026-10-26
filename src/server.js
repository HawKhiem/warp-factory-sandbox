import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { TodoStore } from './store.js';
import { paginate } from './utils.js';

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export function createServer(store = new TodoStore()) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const match = url.pathname.match(/^\/todos(?:\/(\d+))?$/);
    if (!match) return send(res, 404, { error: 'not found' });
    const id = match[1] ? Number(match[1]) : undefined;

    try {
      if (req.method === 'GET' && id === undefined) {
        const page = Number(url.searchParams.get('page') ?? 1);
        const size = Number(url.searchParams.get('size') ?? 10);
        return send(res, 200, paginate(store.list(), page, size));
      }
      if (req.method === 'GET') {
        const todo = store.get(id);
        return todo ? send(res, 200, todo) : send(res, 404, { error: 'not found' });
      }
      if (req.method === 'POST' && id === undefined) {
        const { title } = await readJson(req);
        return send(res, 201, store.create(title));
      }
      if (req.method === 'PATCH' && id !== undefined) {
        const todo = store.complete(id);
        return todo ? send(res, 200, todo) : send(res, 404, { error: 'not found' });
      }
      if (req.method === 'DELETE' && id !== undefined) {
        return store.remove(id) ? send(res, 204) : send(res, 404, { error: 'not found' });
      }
      return send(res, 405, { error: 'method not allowed' });
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createServer().listen(port, () => console.log(`todo-api listening on :${port}`));
}

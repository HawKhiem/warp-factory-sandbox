import { slugify } from './utils.js';

// In-memory todo store. Not persistent; good enough for a sandbox.
export class TodoStore {
  constructor() {
    this.todos = [];
    this.nextId = 1;
    this.lastCreatedAt = -Infinity;
  }

  create(title) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new Error('title is required');
    }
    const createdAt = Math.max(Date.now(), this.lastCreatedAt + 1);
    const todo = {
      id: this.nextId++,
      title: title.trim(),
      slug: slugify(title),
      done: false,
      createdAt: new Date(createdAt).toISOString(),
    };
    this.todos.push(todo);
    this.lastCreatedAt = createdAt;
    return todo;
  }

  list() {
    return [...this.todos];
  }

  get(id) {
    return this.todos.find((t) => t.id === id);
  }

  complete(id) {
    const todo = this.get(id);
    if (!todo) return undefined;
    todo.done = true;
    return todo;
  }

  remove(id) {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.todos.splice(index, 1);
    return true;
  }
}

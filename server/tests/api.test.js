/**
 * Integration tests using Node's built-in test runner and an in-memory data store.
 * Run with: npm test
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store.js';

const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  clientOrigin: ['http://localhost:5173'],
};

let server;
let baseUrl;
let token;

async function api(path, { method = 'GET', body, auth = true } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json();
  return { status: res.status, data };
}

before(async () => {
  const app = createApp({ store: createStore(null), config });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

describe('auth', () => {
  it('registers a user and returns a token', async () => {
    const { status, data } = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ada', email: 'ada@example.com', password: 'supersecret' },
    });
    assert.equal(status, 201);
    assert.ok(data.token);
    token = data.token;
  });

  it('rejects duplicate emails', async () => {
    const { status } = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ada', email: 'ADA@example.com', password: 'supersecret' },
    });
    assert.equal(status, 409);
  });

  it('logs in with valid credentials and rejects invalid ones', async () => {
    const ok = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'ada@example.com', password: 'supersecret' },
    });
    assert.equal(ok.status, 200);
    const bad = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'ada@example.com', password: 'wrong-password' },
    });
    assert.equal(bad.status, 401);
  });
});

describe('tasks', () => {
  let taskId;

  it('requires authentication', async () => {
    const { status } = await api('/api/tasks', { auth: false });
    assert.equal(status, 401);
  });

  it('creates a task with defaults', async () => {
    const { status, data } = await api('/api/tasks', {
      method: 'POST',
      body: { title: 'Write README', priority: 'high', dueDate: '2026-12-31' },
    });
    assert.equal(status, 201);
    assert.equal(data.task.status, 'todo');
    taskId = data.task.id;
  });

  it('validates task input', async () => {
    const { status, data } = await api('/api/tasks', {
      method: 'POST',
      body: { title: '', status: 'nope' },
    });
    assert.equal(status, 400);
    assert.ok(data.details.title && data.details.status);
  });

  it('moves a task to another column', async () => {
    const { status, data } = await api(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: { status: 'in-progress' },
    });
    assert.equal(status, 200);
    assert.equal(data.task.status, 'in-progress');
  });

  it('filters tasks', async () => {
    const { data } = await api('/api/tasks?status=done');
    assert.equal(data.tasks.length, 0);
    const { data: all } = await api('/api/tasks?search=readme');
    assert.equal(all.tasks.length, 1);
  });

  it('deletes a task', async () => {
    const { status } = await api(`/api/tasks/${taskId}`, { method: 'DELETE' });
    assert.equal(status, 204);
    const { status: after404 } = await api(`/api/tasks/${taskId}`);
    assert.equal(after404, 404);
  });
});

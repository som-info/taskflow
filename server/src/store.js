/**
 * A tiny JSON-file data store.
 *
 * Data is kept in memory and written to disk after every change using an
 * atomic "write temp file, then rename" strategy so the file is never left
 * half-written. Pass `null` as the file to keep everything in memory (tests).
 *
 * This keeps the project free of native dependencies, so it runs anywhere
 * Node.js runs. Swapping in a real database only requires re-implementing
 * this module's methods.
 */
import fs from 'node:fs';
import path from 'node:path';

const EMPTY_DATA = { lastIds: { users: 0, tasks: 0 }, users: [], tasks: [] };

export function createStore(file) {
  const filePath = file ? path.resolve(file) : null;
  const data = load(filePath);

  function load(target) {
    if (!target || !fs.existsSync(target)) return structuredClone(EMPTY_DATA);
    try {
      return { ...structuredClone(EMPTY_DATA), ...JSON.parse(fs.readFileSync(target, 'utf8')) };
    } catch (err) {
      throw new Error(`Could not read data file ${target}: ${err.message}`);
    }
  }

  function persist() {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
  }

  const now = () => new Date().toISOString();
  const nextId = (collection) => ++data.lastIds[collection];

  return {
    // --- Users -------------------------------------------------------------
    findUserByEmail(email) {
      const needle = email.toLowerCase();
      return data.users.find((u) => u.email === needle) ?? null;
    },

    findUserById(id) {
      return data.users.find((u) => u.id === id) ?? null;
    },

    createUser({ name, email, passwordHash }) {
      const user = { id: nextId('users'), name, email: email.toLowerCase(), passwordHash, createdAt: now() };
      data.users.push(user);
      persist();
      return user;
    },

    // --- Tasks -------------------------------------------------------------
    listTasks(userId, { status, priority, search } = {}) {
      const term = search?.toLowerCase();
      return data.tasks
        .filter((t) => t.userId === userId)
        .filter((t) => !status || t.status === status)
        .filter((t) => !priority || t.priority === priority)
        .filter(
          (t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
        )
        .sort(compareTasks);
    },

    findTask(userId, id) {
      return data.tasks.find((t) => t.id === id && t.userId === userId) ?? null;
    },

    createTask(userId, fields) {
      const timestamp = now();
      const task = { id: nextId('tasks'), userId, ...fields, createdAt: timestamp, updatedAt: timestamp };
      data.tasks.push(task);
      persist();
      return task;
    },

    updateTask(userId, id, changes) {
      const task = this.findTask(userId, id);
      if (!task) return null;
      Object.assign(task, changes, { updatedAt: now() });
      persist();
      return task;
    },

    deleteTask(userId, id) {
      const index = data.tasks.findIndex((t) => t.id === id && t.userId === userId);
      if (index === -1) return false;
      data.tasks.splice(index, 1);
      persist();
      return true;
    },
  };
}

/** Sort: tasks with a due date first (soonest first), then newest. */
function compareTasks(a, b) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate && !b.dueDate) return -1;
  if (!a.dueDate && b.dueDate) return 1;
  return b.createdAt.localeCompare(a.createdAt);
}

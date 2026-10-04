import { Router } from 'express';
import { HttpError } from '../utils/errors.js';
import { PRIORITIES, STATUSES, validateTask } from '../utils/validate.js';

const EDITABLE_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const DEFAULTS = { description: '', status: 'todo', priority: 'medium', dueDate: null };

/**
 * Task CRUD routes. Every route is scoped to the authenticated user.
 *
 *   GET    /       list tasks (?status=&priority=&search=)
 *   GET    /:id    get one task
 *   POST   /       create a task
 *   PATCH  /:id    update some fields (e.g. move between board columns)
 *   PUT    /:id    replace all editable fields
 *   DELETE /:id    delete a task
 */
export function tasksRouter({ store }) {
  const router = Router();

  /** Pick only whitelisted fields and normalise them. */
  function clean(body) {
    const out = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) out[key] = body[key];
    }
    if (typeof out.title === 'string') out.title = out.title.trim();
    if (out.dueDate === '') out.dueDate = null;
    return out;
  }

  function assertValid(body, options) {
    const errors = validateTask(body, options);
    if (Object.keys(errors).length) throw new HttpError(400, 'Validation failed.', errors);
  }

  function findOwnedTask(req) {
    const task = store.findTask(req.user.id, Number(req.params.id));
    if (!task) throw new HttpError(404, 'Task not found.');
    return task;
  }

  router.get('/', (req, res) => {
    const { status, priority, search } = req.query;
    const tasks = store.listTasks(req.user.id, {
      status: STATUSES.includes(status) ? status : undefined,
      priority: PRIORITIES.includes(priority) ? priority : undefined,
      search: typeof search === 'string' ? search.trim() : undefined,
    });
    res.json({ tasks });
  });

  router.get('/:id', (req, res) => {
    res.json({ task: findOwnedTask(req) });
  });

  router.post('/', (req, res) => {
    assertValid(req.body);
    const task = store.createTask(req.user.id, { ...DEFAULTS, ...clean(req.body) });
    res.status(201).json({ task });
  });

  router.patch('/:id', (req, res) => {
    findOwnedTask(req);
    assertValid(req.body, { partial: true });
    const changes = clean(req.body);
    if (Object.keys(changes).length === 0) throw new HttpError(400, 'No updatable fields provided.');
    res.json({ task: store.updateTask(req.user.id, Number(req.params.id), changes) });
  });

  router.put('/:id', (req, res) => {
    findOwnedTask(req);
    assertValid(req.body);
    const task = store.updateTask(req.user.id, Number(req.params.id), { ...DEFAULTS, ...clean(req.body) });
    res.json({ task });
  });

  router.delete('/:id', (req, res) => {
    findOwnedTask(req);
    store.deleteTask(req.user.id, Number(req.params.id));
    res.status(204).end();
  });

  return router;
}

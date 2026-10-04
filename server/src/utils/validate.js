/**
 * Tiny validation helpers – keeps the project dependency-light.
 * Each validator returns an object of field errors (empty when valid).
 */
export const STATUSES = ['todo', 'in-progress', 'done'];
export const PRIORITIES = ['low', 'medium', 'high'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isBlank = (v) => typeof v !== 'string' || v.trim() === '';

export function validateRegister({ name, email, password } = {}) {
  const errors = {};
  if (isBlank(name)) errors.name = 'Name is required.';
  if (isBlank(email) || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export function validateLogin({ email, password } = {}) {
  const errors = {};
  if (isBlank(email)) errors.email = 'Email is required.';
  if (isBlank(password)) errors.password = 'Password is required.';
  return errors;
}

/**
 * Validate a task payload. With `partial: true` (PATCH), only provided fields are checked.
 */
export function validateTask(body = {}, { partial = false } = {}) {
  const errors = {};
  const has = (key) => body[key] !== undefined;

  if (!partial || has('title')) {
    if (isBlank(body.title)) errors.title = 'Title is required.';
    else if (body.title.length > 200) errors.title = 'Title must be 200 characters or less.';
  }
  if (has('description') && typeof body.description !== 'string') {
    errors.description = 'Description must be text.';
  }
  if (has('status') && !STATUSES.includes(body.status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }
  if (has('priority') && !PRIORITIES.includes(body.priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
  }
  if (has('dueDate') && body.dueDate !== null && body.dueDate !== '') {
    if (!DATE_RE.test(body.dueDate) || Number.isNaN(Date.parse(body.dueDate))) {
      errors.dueDate = 'Due date must be in YYYY-MM-DD format.';
    }
  }
  return errors;
}

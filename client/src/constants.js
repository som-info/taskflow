export const COLUMNS = [
  { status: 'todo', title: 'To Do', accent: 'var(--slate)' },
  { status: 'in-progress', title: 'In Progress', accent: 'var(--amber)' },
  { status: 'done', title: 'Done', accent: 'var(--green)' },
];

export const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** Human-friendly due date label, e.g. "Today", "Tomorrow", "Mar 4". */
export function formatDueDate(iso) {
  if (!iso) return '';
  const today = new Date(`${todayISO()}T00:00:00`);
  const due = new Date(`${iso}T00:00:00`);
  const diffDays = Math.round((due - today) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const isOverdue = (task) => Boolean(task.dueDate) && task.status !== 'done' && task.dueDate < todayISO();

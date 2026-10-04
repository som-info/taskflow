import { useEffect, useRef, useState } from 'react';
import { COLUMNS, PRIORITIES } from '../constants.js';

/** Modal dialog for creating and editing tasks. */
export default function TaskModal({ task, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? 'todo',
    priority: task.priority ?? 'medium',
    dueDate: task.dueDate ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  // Focus the title and close on Escape.
  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required.' });
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, dueDate: form.dueDate || null });
    } catch (err) {
      setErrors(err.details && Object.keys(err.details).length ? err.details : { form: err.message });
      setSaving(false);
    }
  }

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmit={handleSubmit}>
        <header className="modal__header">
          <h2 id="modal-title">{task.id ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" ref={titleRef} className={`input ${errors.title ? 'input--error' : ''}`} value={form.title} onChange={update('title')} maxLength={200} />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </div>

        <div className="field">
          <label htmlFor="task-desc">Description</label>
          <textarea id="task-desc" className="input" rows={4} value={form.description} onChange={update('description')} />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="task-status">Status</label>
            <select id="task-status" className="input" value={form.status} onChange={update('status')}>
              {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.title}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" className="input" value={form.priority} onChange={update('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due">Due date</label>
            <input id="task-due" type="date" className={`input ${errors.dueDate ? 'input--error' : ''}`} value={form.dueDate} onChange={update('dueDate')} />
            {errors.dueDate && <span className="field__error">{errors.dueDate}</span>}
          </div>
        </div>

        {errors.form && <p className="alert">{errors.form}</p>}

        <footer className="modal__footer">
          {onDelete && <button type="button" className="btn btn--danger" onClick={onDelete}>Delete</button>}
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save task'}</button>
        </footer>
      </form>
    </div>
  );
}

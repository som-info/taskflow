import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import Board from '../components/Board.jsx';
import Filters from '../components/Filters.jsx';
import Header from '../components/Header.jsx';
import Stats from '../components/Stats.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { isOverdue, todayISO } from '../constants.js';

const DEFAULT_FILTERS = { search: '', priority: '', due: '' };

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // `null` = closed, `{}` = new task, task object = editing
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api
      .listTasks()
      .then(({ tasks }) => setTasks(tasks))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filtering happens client-side so the board updates instantly while typing.
  const visibleTasks = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const today = todayISO();
    const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

    return tasks.filter((task) => {
      if (term && !`${task.title} ${task.description}`.toLowerCase().includes(term)) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.due === 'overdue' && !isOverdue(task)) return false;
      if (filters.due === 'week' && !(task.dueDate && task.dueDate >= today && task.dueDate <= weekAhead)) return false;
      if (filters.due === 'none' && task.dueDate) return false;
      return true;
    });
  }, [tasks, filters]);

  const closeModal = useCallback(() => setEditing(null), []);

  const upsertTask = (task) =>
    setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev.map((t) => (t.id === task.id ? task : t)) : [task, ...prev]));

  async function handleSave(values) {
    const { task } = editing?.id ? await api.updateTask(editing.id, values) : await api.createTask(values);
    upsertTask(task);
    setEditing(null);
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  /** Optimistically move a card, rolling back if the API call fails. */
  const handleMove = useCallback(async (taskId, status) => {
    let previous;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        previous = t;
        return { ...t, status };
      }),
    );
    try {
      const { task } = await api.updateTask(taskId, { status });
      upsertTask(task);
    } catch (err) {
      if (previous) upsertTask(previous);
      setError(err.message);
    }
  }, []);

  return (
    <div className="layout">
      <Header onNewTask={() => setEditing({})} />
      <main className="dashboard">
        <Stats tasks={tasks} />
        <Filters filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

        {error && (
          <div className="alert" role="alert">
            {error}
            <button className="link" onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="splash"><span className="spinner" /></div>
        ) : (
          <Board tasks={visibleTasks} onMove={handleMove} onOpen={setEditing} onAdd={(status) => setEditing({ status })} />
        )}
      </main>

      {editing && (
        <TaskModal
          task={editing}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={editing.id ? () => handleDelete(editing) : undefined}
        />
      )}
    </div>
  );
}

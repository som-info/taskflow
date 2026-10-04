import { PRIORITIES } from '../constants.js';

export default function Filters({ filters, onChange, onReset }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const active = Object.values(filters).some(Boolean);

  return (
    <section className="filters" aria-label="Filter tasks">
      <input
        type="search"
        className="input filters__search"
        placeholder="Search tasks…"
        value={filters.search}
        onChange={update('search')}
        aria-label="Search tasks"
      />
      <select className="input" value={filters.priority} onChange={update('priority')} aria-label="Filter by priority">
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>{p.label} priority</option>
        ))}
      </select>
      <select className="input" value={filters.due} onChange={update('due')} aria-label="Filter by due date">
        <option value="">Any due date</option>
        <option value="overdue">Overdue</option>
        <option value="week">Due in 7 days</option>
        <option value="none">No due date</option>
      </select>
      {active && (
        <button className="btn btn--ghost" onClick={onReset}>Clear filters</button>
      )}
    </section>
  );
}

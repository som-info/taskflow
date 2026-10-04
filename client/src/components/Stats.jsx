import { isOverdue } from '../constants.js';

/** Summary cards shown above the board. */
export default function Stats({ tasks }) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const items = [
    { label: 'Total tasks', value: tasks.length },
    { label: 'In progress', value: tasks.filter((t) => t.status === 'in-progress').length },
    { label: 'Overdue', value: tasks.filter(isOverdue).length, danger: true },
    { label: 'Completed', value: `${progress}%`, progress },
  ];

  return (
    <section className="stats" aria-label="Task statistics">
      {items.map((item) => (
        <div key={item.label} className="stat">
          <span className="stat__label">{item.label}</span>
          <span className={`stat__value ${item.danger && item.value > 0 ? 'stat__value--danger' : ''}`}>{item.value}</span>
          {item.progress !== undefined && (
            <div className="progress" role="progressbar" aria-valuenow={item.progress} aria-valuemin="0" aria-valuemax="100">
              <div className="progress__bar" style={{ width: `${item.progress}%` }} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

import { formatDueDate, isOverdue } from '../constants.js';

export default function TaskCard({ task, onOpen, onMoveLeft, onMoveRight }) {
  const overdue = isOverdue(task);

  return (
    <article
      className={`task task--${task.priority}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <button className="task__main" onClick={onOpen} aria-label={`Edit task ${task.title}`}>
        <span className={`pill pill--${task.priority}`}>{task.priority}</span>
        <h3 className={task.status === 'done' ? 'task__title task__title--done' : 'task__title'}>{task.title}</h3>
        {task.description && <p className="task__desc">{task.description}</p>}
      </button>

      <footer className="task__footer">
        {task.dueDate ? (
          <span className={`due ${overdue ? 'due--overdue' : ''}`} title={task.dueDate}>
            📅 {formatDueDate(task.dueDate)}{overdue && ' · overdue'}
          </span>
        ) : (
          <span className="due due--none">No due date</span>
        )}
        <div className="task__move">
          {onMoveLeft && <button className="icon-btn" onClick={onMoveLeft} aria-label="Move to previous column">‹</button>}
          {onMoveRight && <button className="icon-btn" onClick={onMoveRight} aria-label="Move to next column">›</button>}
        </div>
      </footer>
    </article>
  );
}

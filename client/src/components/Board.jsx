import { useState } from 'react';
import { COLUMNS } from '../constants.js';
import TaskCard from './TaskCard.jsx';

/**
 * Kanban board with native HTML5 drag & drop.
 * Cards can also be moved via the arrow buttons (keyboard / touch friendly).
 */
export default function Board({ tasks, onMove, onOpen, onAdd }) {
  const [dragOver, setDragOver] = useState(null);

  function handleDrop(e, status) {
    e.preventDefault();
    setDragOver(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) onMove(id, status);
  }

  return (
    <div className="board">
      {COLUMNS.map((column, index) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);
        return (
          <section
            key={column.status}
            className={`column ${dragOver === column.status ? 'column--over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(column.status);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
            }}
            onDrop={(e) => handleDrop(e, column.status)}
            aria-label={`${column.title} column`}
          >
            <header className="column__header">
              <span className="column__dot" style={{ background: column.accent }} />
              <h2>{column.title}</h2>
              <span className="column__count">{columnTasks.length}</span>
              <button className="icon-btn" onClick={() => onAdd(column.status)} aria-label={`Add task to ${column.title}`}>＋</button>
            </header>

            <div className="column__body">
              {columnTasks.length === 0 && <p className="column__empty">No tasks here</p>}
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpen={() => onOpen(task)}
                  onMoveLeft={index > 0 ? () => onMove(task.id, COLUMNS[index - 1].status) : undefined}
                  onMoveRight={index < COLUMNS.length - 1 ? () => onMove(task.id, COLUMNS[index + 1].status) : undefined}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

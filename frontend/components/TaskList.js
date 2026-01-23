/**
 * Kanban-style task board component with three columns.
 * Displays tasks organized by status (Todo, In Progress, Done).
 * @module components/TaskList
 */

"use client";

import dayjs from "dayjs";

/**
 * Task list component that displays tasks in a Kanban board layout.
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.tasks - Array of task objects
 * @param {Function} props.onEdit - Callback function when editing a task
 * @param {Function} props.onDelete - Callback function when deleting a task
 * @returns {JSX.Element} Kanban board with task cards
 */
export default function TaskList({ tasks, onEdit, onDelete }) {
  /**
   * Check if a deadline has passed.
   * @param {string|Date|null} deadline - Task deadline to check
   * @returns {boolean} True if deadline has passed, false otherwise
   */
  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return dayjs(deadline).isBefore(dayjs());
  };

  const columns = {
    "Todo": tasks.filter(t => t.status === "Todo"),
    "In Progress": tasks.filter(t => t.status === "In Progress"),
    "Done": tasks.filter(t => t.status === "Done")
  };

  return (
    <div className="task-board">
      {Object.entries(columns).map(([status, columnTasks]) => (
        <div key={status} className={`board-column ${status.toLowerCase().replace(" ", "-")}`}>
          <div className="column-header">
            <span className="column-title">{status}</span>
            <span className="column-count">{columnTasks.length}</span>
          </div>
          
          <div className="column-content">
            {columnTasks.length === 0 ? (
              <div className="empty-column-placeholder">
                No tasks
              </div>
            ) : (
              columnTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="task-card animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => onEdit(task)}
                >
                  <div className="task-header-row">
                    <span className={`priority-indicator ${isOverdue(task.deadline) && task.status !== 'Done' ? 'high' : 'normal'}`}></span>
                    <div className="task-actions">
                      <button 
                        className="action-btn edit" 
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
                        title="Hapus"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-desc-preview">{task.description}</div>

                  <div className="task-footer">
                    <div className="meta-item">
                      {task.deadline && (
                        <span className={`date-badge ${isOverdue(task.deadline) && task.status !== 'Done' ? "overdue" : ""}`}>
                          {dayjs(task.deadline).format("D MMM")}
                        </span>
                      )}
                    </div>
                    {task.assignee_name && (
                      <div className="assignee-avatar" title={task.assignee_name}>
                        {task.assignee_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .task-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: start;
          overflow-x: auto;
          padding-bottom: 20px;
        }

        .board-column {
          background: var(--gray-100);
          border-radius: 10px;
          padding: 12px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          border-top: 4px solid transparent;
        }

        .board-column.todo {
            background: var(--gray-100); /* Slate 50 */
            border-top-color: var(--gray-600);
        }

        .board-column.in-progress {
            background: var(--gray-100); /* Blue 50 */
            border-top-color: var(--primary);
        }

        .board-column.done {
            background: var(--gray-100); /* Green 50 */
            border-top-color: var(--success);
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 4px 4px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 700;
          color: var(--gray-600);
        }

        .column-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-card {
          background: var(--gray-100);
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
          border: 1px solid var(--gray-200);
          cursor: pointer;
        }

        .task-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.5);
          border-color: var(--primary);
        }

        .task-header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .priority-indicator {
            width: 40px;
            height: 4px;
            border-radius: 2px;
            background: var(--gray-300);
        }

        .priority-indicator.high {
            background: var(--danger);
        }

        .task-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--gray-900);
            margin: 0 0 8px;
            line-height: 1.4;
        }
        
        .task-desc-preview {
            font-size: 13px;
            color: var(--gray-500);
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .task-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
        }

        .date-badge {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            background: var(--gray-200);
            color: var(--gray-600);
            font-weight: 600;
        }

        .date-badge.overdue {
            background: var(--danger-light);
            color: var(--danger);
        }

        .assignee-avatar {
            width: 24px;
            height: 24px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
        }

        .task-actions {
            opacity: 0;
            transition: opacity 0.2s;
            display: flex;
            gap: 4px;
        }

        .task-card:hover .task-actions {
            opacity: 1;
        }

        .action-btn {
            padding: 4px;
            border-radius: 4px;
            color: var(--gray-500);
            background: transparent;
            border: none;
            cursor: pointer;
        }

        .action-btn:hover {
            background: var(--gray-300);
            color: var(--gray-900);
        }

        .empty-column-placeholder {
            text-align: center;
            padding: 20px;
            color: var(--gray-500);
            font-size: 13px;
            font-style: italic;
            border: 2px dashed var(--gray-300);
            border-radius: 8px;
        }

        @media (max-width: 1024px) {
            .task-board {
                grid-template-columns: 1fr;
            }
            .board-column {
                min-height: auto;
            }
        }
      `}</style>
    </div>
  );
}

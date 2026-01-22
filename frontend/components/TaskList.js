"use client";

import dayjs from "dayjs";

export default function TaskList({ tasks, onEdit, onDelete }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      "Todo": { class: "badge-todo", icon: "○" },
      "In Progress": { class: "badge-progress", icon: "◐" },
      "Done": { class: "badge-done", icon: "●" },
    };
    return statusMap[status] || statusMap["Todo"];
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return dayjs(deadline).isBefore(dayjs()) && status !== "Done";
  };

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="12" x2="12" y2="18"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <h3>Belum ada task</h3>
          <p>Klik tombol "Tambah Task" untuk membuat task baru</p>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="task-card animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="task-header">
                <span className={`badge ${getStatusBadge(task.status).class}`}>
                  {getStatusBadge(task.status).icon} {task.status}
                </span>
                <div className="task-actions">
                  <button className="action-btn edit" onClick={() => onEdit(task)} title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="action-btn delete" onClick={() => onDelete(task.id)} title="Hapus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>

              <div className="task-meta">
                <div className="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className={isOverdue(task.deadline) ? "overdue" : ""}>
                    {task.deadline
                      ? dayjs(task.deadline).format("DD MMM YYYY, HH:mm")
                      : "Tidak ada deadline"}
                  </span>
                </div>
                <div className="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{task.assignee_name || "Belum ditugaskan"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-list {
          margin-top: 0;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }

        .empty-state svg {
          color: var(--gray-300);
          margin-bottom: 20px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--gray-700);
          margin: 0 0 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: var(--gray-500);
          margin: 0;
        }

        .task-grid {
          display: grid;
          gap: 16px;
        }

        .task-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .task-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--gray-200);
          transform: translateY(-2px);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 20px;
        }

        .badge-todo {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .badge-progress {
          background: #fef3c7;
          color: #b45309;
        }

        .badge-done {
          background: #d1fae5;
          color: #047857;
        }

        .task-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .task-card:hover .task-actions {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn.edit {
          background: var(--primary-light);
          color: var(--primary);
        }

        .action-btn.edit:hover {
          background: var(--primary);
          color: white;
        }

        .action-btn.delete {
          background: var(--danger-light);
          color: var(--danger);
        }

        .action-btn.delete:hover {
          background: var(--danger);
          color: white;
        }

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-800);
          margin: 0 0 8px;
          line-height: 1.4;
        }

        .task-description {
          font-size: 14px;
          color: var(--gray-600);
          margin: 0 0 16px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--gray-100);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--gray-500);
        }

        .meta-item svg {
          color: var(--gray-400);
        }

        .meta-item .overdue {
          color: var(--danger);
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .task-card {
            padding: 16px;
          }

          .task-actions {
            opacity: 1;
          }

          .task-title {
            font-size: 15px;
          }

          .task-description {
            font-size: 13px;
            -webkit-line-clamp: 3;
          }

          .task-meta {
            flex-direction: column;
            gap: 8px;
          }

          .meta-item {
            font-size: 12px;
          }

          .empty-state {
            padding: 40px 20px;
          }

          .empty-state svg {
            width: 48px;
            height: 48px;
          }

          .empty-state h3 {
            font-size: 16px;
          }

          .empty-state p {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .task-card {
            padding: 14px;
          }

          .badge {
            padding: 3px 10px;
            font-size: 11px;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .action-btn svg {
            width: 14px;
            height: 14px;
          }

          .task-title {
            font-size: 14px;
          }

          .task-description {
            font-size: 12px;
            margin-bottom: 12px;
          }

          .task-meta {
            padding-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}

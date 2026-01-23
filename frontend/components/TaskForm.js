/**
 * Form component for creating and editing tasks.
 * Provides input fields for task title, description, status, deadline, and assignee.
 * @module components/TaskForm
 */

"use client";

import { useEffect, useState } from "react";

/**
 * Available task status options.
 * @constant {string[]}
 */
const statuses = ["Todo", "In Progress", "Done"];

/**
 * Task form component for creating or editing tasks.
 * @param {Object} props - Component properties
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {Function} props.onCancel - Callback function when form is cancelled
 * @param {Object} [props.initial={}] - Initial values for editing existing task
 * @param {string} [props.initial.title] - Initial task title
 * @param {string} [props.initial.description] - Initial task description
 * @param {string} [props.initial.status] - Initial task status
 * @param {string} [props.initial.deadline] - Initial task deadline
 * @param {number} [props.initial.assignee_id] - Initial assignee ID
 * @param {Array} [props.initial.users] - List of available users for assignment
 * @returns {JSX.Element} Task form with input fields
 */
export default function TaskForm({ onSubmit, onCancel, initial = {} }) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [status, setStatus] = useState(initial.status || "Todo");
  const [deadline, setDeadline] = useState(
    initial.deadline ? initial.deadline.slice(0, 16) : ""
  );
  const [assigneeId, setAssigneeId] = useState(initial.assignee_id || "");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial.users) {
      setUsers(initial.users);
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        assignee_id: assigneeId ? Number(assigneeId) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-body">
        <div className="form-group">
          <label className="label">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="20" y2="9"/>
              <line x1="4" y1="15" x2="20" y2="15"/>
              <line x1="10" y1="3" x2="8" y2="21"/>
              <line x1="16" y1="3" x2="14" y2="21"/>
            </svg>
            Judul Task
          </label>
          <input
            className="input"
            placeholder="Masukkan judul task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="17" y1="10" x2="3" y2="10"/>
              <line x1="21" y1="6" x2="3" y2="6"/>
              <line x1="21" y1="14" x2="3" y2="14"/>
              <line x1="17" y1="18" x2="3" y2="18"/>
            </svg>
            Deskripsi
          </label>
          <textarea
            className="textarea"
            placeholder="Jelaskan detail task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Status
            </label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Deadline
            </label>
            <input
              className="input"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Assignee
          </label>
          <select
            className="select"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Pilih assignee</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Menyimpan...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Simpan
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .task-form {
          display: flex;
          flex-direction: column;
        }

        .form-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 8px;
        }

        .label svg {
          color: var(--gray-400);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          background: var(--gray-50);
          border-top: 1px solid var(--gray-100);
        }

        @media (max-width: 768px) {
          .form-body {
            padding: 20px;
            gap: 16px;
          }

          .form-footer {
            padding: 14px 20px;
          }
        }

        @media (max-width: 480px) {
          .form-body {
            padding: 16px;
            gap: 14px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .label {
            font-size: 12px;
          }

          .form-footer {
            padding: 12px 16px;
            flex-direction: column-reverse;
          }

          .form-footer .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

const statuses = ["Todo", "In Progress", "Done"];

export default function TaskForm({ onSubmit, onCancel, initial = {} }) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [status, setStatus] = useState(initial.status || "Todo");
  const [deadline, setDeadline] = useState(
    initial.deadline ? initial.deadline.slice(0, 16) : ""
  );
  const [assigneeId, setAssigneeId] = useState(initial.assignee_id || "");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (initial.users) {
      setUsers(initial.users);
    }
  }, [initial]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          description,
          status,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          assignee_id: assigneeId ? Number(assigneeId) : null,
        });
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          placeholder="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <select
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
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="submit">Simpan</button>
        <button type="button" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}

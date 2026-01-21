"use client";

import dayjs from "dayjs";

export default function TaskList({ tasks, onEdit, onDelete }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {tasks.map((task) => (
        <div
          key={task.id}
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: "4px 0" }}>{task.title}</h3>
              <p style={{ margin: "4px 0", color: "#475569" }}>
                {task.description}
              </p>
              <p style={{ margin: "4px 0", fontSize: 12, color: "#94a3b8" }}>
                Deadline:{" "}
                {task.deadline
                  ? dayjs(task.deadline).format("DD MMM YYYY HH:mm")
                  : "-"}
                {" · "}Status: {task.status}
                {" · "}Assignee: {task.assignee_name || "Unassigned"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onEdit(task)}>Edit</button>
              <button onClick={() => onDelete(task.id)} style={{ color: "red" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      {tasks.length === 0 && <p>Tidak ada task.</p>}
    </div>
  );
}

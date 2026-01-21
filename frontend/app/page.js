"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { loadTokenFromStorage, setAuthToken } from "../lib/api";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import ChatbotPanel from "../components/ChatbotPanel";

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const token = loadTokenFromStorage();
    if (!token) {
      router.push("/login");
    } else {
      fetchAll();
    }
  }, []);

  const fetchAll = async () => {
  try {
    const [taskRes, userRes] = await Promise.all([
      api.get("/tasks/"),
      api.get("/users/"),
    ]);
    setTasks(taskRes.data);
    setUsers(userRes.data);
  } catch (err) {
    if (err.response?.status === 401) {
      setAuthToken(null);
      router.push("/login");
    }
  } finally {
    setLoading(false);
  }
};

const handleCreate = async (data) => {
  await api.post("/tasks/", data);
  setShowForm(false);
  fetchAll();
};

const handleUpdate = async (data) => {
  await api.put(`/tasks/${editing.id}/`, data);
  setEditing(null);
  setShowForm(false);
  fetchAll();
};

const handleDelete = async (id) => {
  await api.delete(`/tasks/${id}/`);
  fetchAll();
};

  const logout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  if (loading) return <p style={{ padding: 16 }}>Memuat...</p>;

  return (
    <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Task Management</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 2 }}>
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button onClick={() => { setShowForm(true); setEditing(null); }}>
              Tambah Task
            </button>
          </div>
          {showForm && (
            <div style={{ background: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <TaskForm
                onSubmit={editing ? handleUpdate : handleCreate}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                initial={{ ...(editing || {}), users }}
              />
            </div>
          )}
          <TaskList
            tasks={tasks}
            onEdit={(task) => {
              setEditing(task);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        </div>
        <div style={{ flex: 1 }}>
          <ChatbotPanel />
        </div>
      </div>
    </div>
  );
}

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
  const [filter, setFilter] = useState("all");

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
    if (confirm("Apakah Anda yakin ingin menghapus task ini?")) {
      await api.delete(`/tasks/${id}/`);
      fetchAll();
    }
  };

  const logout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "Todo").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg"></div>
        <p>Memuat data...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: var(--gray-500);
          }
          .spinner-lg {
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-200);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <h1>Task Management</h1>
            <p className="header-subtitle">Kelola tugas Anda dengan mudah</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{taskStats.total}</span>
            <span className="stat-label">Total Task</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon todo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{taskStats.todo}</span>
            <span className="stat-label">Todo</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="m4.93 4.93 2.83 2.83"/>
              <path d="m16.24 16.24 2.83 2.83"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
              <path d="m4.93 19.07 2.83-2.83"/>
              <path d="m16.24 7.76 2.83-2.83"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{taskStats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{taskStats.done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="task-section">
          {/* Task Header */}
          <div className="section-header">
            <div className="filter-tabs">
              {["all", "Todo", "In Progress", "Done"].map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Semua" : f}
                  <span className="tab-count">
                    {f === "all" ? tasks.length : tasks.filter(t => t.status === f).length}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setShowForm(true); setEditing(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Task
            </button>
          </div>

          {/* Task Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
              <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editing ? "Edit Task" : "Tambah Task Baru"}</h2>
                  <button className="modal-close" onClick={() => { setShowForm(false); setEditing(null); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <TaskForm
                  onSubmit={editing ? handleUpdate : handleCreate}
                  onCancel={() => { setShowForm(false); setEditing(null); }}
                  initial={{ ...(editing || {}), users }}
                />
              </div>
            </div>
          )}

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            onEdit={(task) => {
              setEditing(task);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        </div>

        {/* Chatbot Sidebar */}
        <aside className="chatbot-section">
          <ChatbotPanel />
        </aside>
      </div>

      <style jsx>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow);
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .app-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-800);
          margin: 0;
        }

        .header-subtitle {
          font-size: 13px;
          color: var(--gray-500);
          margin: 2px 0 0;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.total {
          background: var(--primary-light);
          color: var(--primary);
        }

        .stat-icon.todo {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .stat-icon.progress {
          background: var(--warning-light);
          color: #b45309;
        }

        .stat-icon.done {
          background: var(--success-light);
          color: #047857;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-800);
        }

        .stat-label {
          font-size: 13px;
          color: var(--gray-500);
        }

        .main-content {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        .task-section {
          min-width: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          background: white;
          padding: 6px;
          border-radius: 10px;
          box-shadow: var(--shadow-sm);
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-600);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab:hover {
          background: var(--gray-50);
        }

        .filter-tab.active {
          background: var(--primary);
          color: white;
        }

        .tab-count {
          padding: 2px 8px;
          font-size: 11px;
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        .filter-tab.active .tab-count {
          background: rgba(255,255,255,0.2);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--gray-100);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--gray-100);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .chatbot-section {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }

          .chatbot-section {
            position: static;
          }

          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-container {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-tabs {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}

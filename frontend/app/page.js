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
  const [currentUser, setCurrentUser] = useState(null);
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

      // Get current user info from token
      const token = loadTokenFromStorage();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const current = userRes.data.find(u => u.email === payload.email);
          if (current) setCurrentUser(current);
        } catch (e) {
          console.error("Failed to parse token", e);
        }
      }

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
        <div className="header-brand">
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <h1>Task Management</h1>
        </div>
        
        <div className="header-actions">
          <div className="user-profile">
            <div className="avatar-placeholder">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentUser?.name || "User"}</span>
              <span className="user-role">Member</span>
            </div>
          </div>
          <div className="divider-v"></div>
          <button className="btn-signout" onClick={logout}>
            Sign Out
          </button>
        </div>
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
      </div>

      <ChatbotPanel />

      <style jsx>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          margin: 0 -20px 32px -20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .header-brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .logo-icon {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
        }

        .app-header h1 {
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(to right, var(--gray-900), var(--gray-600));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 24px;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .avatar-placeholder {
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 15px;
            border: 2px solid white;
            box-shadow: 0 0 0 1px var(--gray-200);
        }

        .user-info-text {
            display: flex;
            flex-direction: column;
            line-height: 1.3;
            text-align: right;
        }

        .user-name {
            font-weight: 600;
            font-size: 14px;
            color: var(--gray-900);
        }

        .user-role {
            font-size: 11px;
            color: var(--gray-500);
            font-weight: 500;
        }

        .divider-v {
            width: 1px;
            height: 24px;
            background: var(--gray-200);
        }

        .btn-signout {
            background: white;
            border: 1px solid var(--danger-light);
            color: var(--danger);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-signout:hover {
            background: var(--danger);
            color: white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid var(--gray-100);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
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
          background: #eff6ff; /* blue-50 */
          color: #3b82f6; /* blue-500 */
        }

        .stat-icon.todo {
          background: #f3f4f6; /* gray-100 */
          color: #6b7280; /* gray-500 */
        }

        .stat-icon.progress {
          background: #fff7ed; /* orange-50 */
          color: #f97316; /* orange-500 */
        }

        .stat-icon.done {
          background: #f0fdf4; /* green-50 */
          color: #22c55e; /* green-500 */
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .stat-label {
          font-size: 13px;
          color: var(--gray-500);
        }

        .main-content {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-tabs {
          display: flex;
          gap: 4px;
          background: var(--gray-100);
          padding: 4px;
          border-radius: 12px;
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
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab:hover {
          color: var(--gray-900);
        }

        .filter-tab.active {
          background: white;
          color: var(--gray-900);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .tab-count {
          padding: 2px 6px;
          font-size: 11px;
          background: rgba(0,0,0,0.05);
          border-radius: 6px;
        }

        .filter-tab.active .tab-count {
          background: var(--gray-100);
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
          backdrop-filter: blur(4px);
        }

        .modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--gray-100);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: var(--gray-900);
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--gray-50);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--gray-100);
          color: var(--gray-700);
        }

        @media (max-width: 1024px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .app-title {
            position: static;
            transform: none;
            order: -1;
            margin-bottom: 16px;
            width: 100%;
            text-align: center;
          }

          .app-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .user-nav {
            width: 100%;
            justify-content: center;
          }

          .stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

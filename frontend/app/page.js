/**
 * Main dashboard page with task management features.
 * Displays task board, statistics, and provides CRUD operations for tasks.
 * @module app/page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { loadTokenFromStorage, setAuthToken } from "../lib/api";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import ChatbotPanel from "../components/ChatbotPanel";

/**
 * Home page component that displays the main task management dashboard.
 * Includes task board, task form, statistics, and chatbot panel.
 * @returns {JSX.Element} Dashboard with task management interface
 */
export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [deleteData, setDeleteData] = useState(null);

  useEffect(() => {
    const token = loadTokenFromStorage();
    if (!token) {
      router.push("/login");
    } else {
      fetchAll();
    }
  }, []);

  /**
   * Fetch all tasks and users from the API.
   * Also extracts current user info from JWT token.
   * @async
   */
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

  /**
   * Handle creating a new task.
   * @async
   * @param {Object} data - Task data to create
   */
  const handleCreate = async (data) => {
    await api.post("/tasks/", data);
    setShowForm(false);
    fetchAll();
  };

  /**
   * Handle updating an existing task.
   * @async
   * @param {Object} data - Updated task data
   */
  const handleUpdate = async (data) => {
    await api.put(`/tasks/${editing.id}/`, data);
    setEditing(null);
    setShowForm(false);
    fetchAll();
  };

  /**
   * Handle deleting a task (opens confirmation modal).
   * @param {number} id - Task ID to delete
   */
  const handleDelete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setDeleteData(task);
    }
  };

  /**
   * Confirm and execute task deletion.
   * @async
   */
  const confirmDelete = async () => {
    if (deleteData) {
      await api.delete(`/tasks/${deleteData.id}/`);
      setDeleteData(null);
      fetchAll();
    }
  };

  /**
   * Handle user logout by clearing token and redirecting to login.
   */
  const logout = () => {
    setAuthToken(null);
    router.push("/login");
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterAssignee === "all") return true;
    if (filterAssignee === "unassigned") return !task.assignee_id;
    return task.assignee_id === Number(filterAssignee);
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
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
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

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-label">MENU</span>
            <button 
              className="nav-item active"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar-placeholder">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info-text">
              <span className="user-name">{currentUser?.name || "User"}</span>
            </div>
          </div>
          <button className="btn-signout-icon" onClick={logout} title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">Dashboard Overview</h2>
          <div className="top-actions">
              <div className="filter-wrapper">
                <select
                  className="select-filter"
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                >
                  <option value="all">Semua Assignee</option>
                  <option value="unassigned">Belum Ditugaskan</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <div className="filter-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditing(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Task Baru
              </button>
            </div>
        </header>

        <div className="content-scrollable">
          {/* Stats Cards - Only on Dashboard */}
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

          {/* Task Content */}
          <TaskList
            tasks={filteredTasks}
            onEdit={(task) => {
              setEditing(task);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />

        </div>
      </main>

      {/* Modals and Chatbot */}
      {deleteData && (
        <div className="modal-overlay" onClick={() => setDeleteData(null)}>
          <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2>Hapus Task</h2>
              <button className="modal-close" onClick={() => setDeleteData(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="modal-body" style={{ padding: "0 24px 24px" }}>
              <p style={{ margin: "0 0 8px", color: "var(--gray-800)" }}>Apakah Anda yakin ingin menghapus task <strong>"{deleteData.title}"</strong>?</p>
              <p style={{ margin: 0, color: "var(--gray-500)", fontSize: "14px" }}>Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="modal-footer" style={{ padding: "16px 24px", background: "var(--gray-50)", borderTop: "1px solid var(--gray-200)", display: "flex", justifyContent: "flex-end", gap: "12px", borderRadius: "0 0 16px 16px" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteData(null)}>Batal</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "Edit Task" : "Tambah Task Baru"}</h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditing(null); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

      <ChatbotPanel />

      <style jsx>{`
        .layout-container {
          display: flex;
          height: 100vh;
          background: #000;
          overflow: hidden;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background: var(--gray-100);
          border-right: 1px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .sidebar-header {
          height: 88px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--gray-200);
          box-sizing: border-box;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2);
        }

        .sidebar-header h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }

        .sidebar-nav {
          padding: 24px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--gray-500);
          padding: 0 12px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--gray-500);
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          color: var(--gray-300);
        }

        .nav-item.active {
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--gray-50);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar-placeholder {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 13px;
          color: var(--gray-900);
        }

        .user-role {
          font-size: 11px;
          color: var(--gray-500);
        }

        .btn-signout-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-200);
          color: var(--gray-500);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-signout-icon:hover {
          background: var(--danger-light);
          color: var(--danger);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: var(--gray-50);
        }

        .top-bar {
          height: 88px;
          padding: 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--gray-200);
          background: var(--gray-50);
          box-sizing: border-box;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-wrapper {
          position: relative;
          width: 200px;
        }

        .select-filter {
          width: 100%;
          appearance: none;
          padding: 10px 16px;
          padding-right: 36px;
          font-size: 14px;
          color: var(--gray-800);
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .select-filter:hover {
          border-color: var(--gray-400);
        }

        .select-filter:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
          outline: none;
        }

        .filter-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--gray-500);
          display: flex;
        }

        .content-scrollable {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: var(--gray-100);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--gray-200);
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.total { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .stat-icon.todo { background: rgba(100, 116, 139, 0.1); color: #64748b; }
        .stat-icon.progress { background: rgba(249, 115, 22, 0.1); color: #f97316; }
        .stat-icon.done { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
       
          font-weight: 700;
          color: var(--gray-900);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: var(--gray-500);
          font-weight: 500;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal {
          background: var(--gray-100);
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--gray-200);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: var(--gray-900);
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--gray-200);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--gray-300);
          color: var(--gray-900);
        }

        @media (max-width: 1024px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .layout-container {
            flex-direction: column;
            overflow: auto;
          }
          
          .sidebar {
            width: 100%;
            height: auto;
          }

          .content-scrollable {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

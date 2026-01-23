/**
 * Login page component with email/password authentication.
 * Uses OAuth2 password flow with JWT tokens.
 * @module app/login
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "../../lib/api";

/**
 * Login page component that handles user authentication.
 * Stores JWT token in localStorage and redirects to home page on success.
 * @returns {JSX.Element} Login form with email and password inputs
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handle login form submission.
   * Sends credentials to backend and stores JWT token on success.
   * @async
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      if (res.data && res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        window.location.href = "/";
      } else {
        setError("Token tidak diterima dari server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <h1>Task Management</h1>
          <p>Masuk ke akun Anda untuk melanjutkan</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>
          
          {error && (
            <div className="error-message animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Masuk
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Demo credentials: admin@example.com / admin123</p>
        </div>
      </div>
      
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-color: var(--gray-50);
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: var(--gray-100);
          border-radius: 20px;
          border: 1px solid var(--gray-200);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          padding: 40px;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .login-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 20px;
          color: white; /* primary blue */
          background: var(--primary); /* blue-50 */
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #64748b;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
        }

        .input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1px solid var(--gray-300);
          border-radius: 10px;
          background: var(--gray-200);
          color: var(--gray-800);
          transition: all 0.2s;
          outline: none;
        }

        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          background-color: #fef2f2;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid #fee2e2;
          margin-bottom: 20px;
        }
        
        .login-btn {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          font-weight: 600;
          height: 48px;
          background: var(--primary);
          box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);
          transition: transform 0.1s, box-shadow 0.2s;
          border: none;
          color: white;
          cursor: pointer;
        }

        .login-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }var(--gray-500);
          font-size: 12px;
          background: var(--gray-200);
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--gray-300)
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

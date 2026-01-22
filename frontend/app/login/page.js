"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
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
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .login-header {
          text-align: center;
          padding: 40px 40px 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .login-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .login-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px;
        }
        
        .login-header p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        
        .login-form {
          padding: 30px 40px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .login-btn {
          width: 100%;
          padding: 14px 20px;
          font-size: 16px;
        }
        
        .login-footer {
          padding: 20px 40px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .login-footer p {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-container {
            padding: 16px;
          }

          .login-card {
            border-radius: 12px;
          }

          .login-header {
            padding: 30px 24px 24px;
          }

          .login-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
          }

          .login-icon svg {
            width: 28px;
            height: 28px;
          }

          .login-header h1 {
            font-size: 20px;
          }

          .login-header p {
            font-size: 13px;
          }

          .login-form {
            padding: 24px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .login-btn {
            padding: 12px 16px;
            font-size: 15px;
          }

          .login-footer {
            padding: 16px 24px;
          }

          .login-footer p {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

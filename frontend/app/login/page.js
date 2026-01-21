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
      
      // Simpan token
      if (res.data && res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        // Force reload
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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", width: 320 }}
      >
        <h2>Login</h2>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "8px 0" }}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "8px 0" }}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, marginTop: 12 }}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}

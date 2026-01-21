"use client";

import { useState } from "react";
import api from "../lib/api";

export default function ChatbotPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const res = await api.post("/chat/query/", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer(err.response?.data?.detail || "Gagal memanggil chatbot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#fff", padding: 12, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <h3>Chatbot</h3>
      <textarea
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Tanyakan tentang task..."
        style={{ width: "100%", marginTop: 8 }}
      />
      <button onClick={ask} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "Meminta..." : "Kirim"}
      </button>
      {answer && (
        <div style={{ marginTop: 10, background: "#f1f5f9", padding: 10, borderRadius: 6 }}>
          <strong>Jawaban:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

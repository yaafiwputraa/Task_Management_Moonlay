"use client";

import { useState, useRef, useEffect } from "react";
import api from "../lib/api";

export default function ChatbotPanel() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ask = async () => {
    if (!question.trim()) return;
    
    const userMessage = question;
    setQuestion("");
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setLoading(true);
    
    try {
      const res = await api.post("/chat/query/", { question: userMessage });
      setMessages(prev => [...prev, { type: "bot", text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: "error", 
        text: err.response?.data?.detail || "Gagal memanggil chatbot" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="chatbot-panel">
      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </div>
        <div>
          <h3>AI Assistant</h3>
          <span className="status-dot">● Online</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p>Hai! Saya siap membantu Anda mengelola task.</p>
            <div className="suggestions">
              <button onClick={() => setQuestion("Apa saja task yang belum selesai?")}>
                Task belum selesai
              </button>
              <button onClick={() => setQuestion("Ringkas semua task saya")}>
                Ringkas semua task
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === "bot" && (
              <div className="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8"/>
                  <rect width="16" height="12" x="4" y="8" rx="2"/>
                </svg>
              </div>
            )}
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <div className="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
              </svg>
            </div>
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          rows={1}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tanyakan tentang task..."
          disabled={loading}
        />
        <button 
          className="send-button" 
          onClick={ask} 
          disabled={loading || !question.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .chatbot-panel {
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          height: 600px;
          overflow: hidden;
        }

        .chatbot-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .chatbot-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-header h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        .status-dot {
          font-size: 11px;
          color: #86efac;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .welcome-message {
          text-align: center;
          padding: 20px;
        }

        .welcome-icon {
          width: 56px;
          height: 56px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .welcome-message p {
          color: var(--gray-600);
          font-size: 14px;
          margin: 0 0 16px;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .suggestions button {
          padding: 8px 12px;
          font-size: 12px;
          background: var(--gray-100);
          border: 1px solid var(--gray-200);
          border-radius: 20px;
          color: var(--gray-700);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestions button:hover {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .message {
          display: flex;
          gap: 10px;
          max-width: 90%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.error .message-content {
          background: var(--danger-light);
          color: var(--danger);
        }

        .message-avatar {
          width: 28px;
          height: 28px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }

        .message.user .message-content {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-content {
          background: var(--gray-100);
          color: var(--gray-800);
          border-bottom-left-radius: 4px;
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 16px !important;
        }

        .typing span {
          width: 8px;
          height: 8px;
          background: var(--gray-400);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .chat-input-container {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--gray-100);
          background: var(--gray-50);
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          font-size: 14px;
          border: 1px solid var(--gray-200);
          border-radius: 12px;
          background: white;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
        }

        .chat-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .send-button {
          width: 44px;
          height: 44px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: scale(1.05);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

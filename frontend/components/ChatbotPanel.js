/**
 * Floating chatbot panel component with AI-powered task assistance.
 * Uses DeepSeek API to answer questions about tasks.
 * @module components/ChatbotPanel
 */

"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../lib/api";

/**
 * Chatbot panel component that provides AI assistance for task management.
 * Features a floating toggle button and expandable chat window.
 * @returns {JSX.Element} Chatbot panel with toggle button and chat interface
 */
export default function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /**
   * Scroll chat messages to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  /**
   * Send a question to the AI chatbot and update message history.
   * @async
   */
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

  /**
   * Handle keyboard events in the chat input.
   * Sends message on Enter key press (without Shift).
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <>
      <button 
        className={`chatbot-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-info">
              <h3>AI Assistant</h3>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p>Ada yang bisa saya bantu?</p>
                <div className="suggestions">
                  <button onClick={() => setQuestion("Task saya hari ini?")}>Task hari ini</button>
                  <button onClick={() => setQuestion("Apa yang overdue?")}>Task terlambat</button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.type === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p style={{margin: 0, marginBottom: '8px'}} {...props} />,
                        strong: ({node, ...props}) => <strong style={{fontWeight: 600, color: 'inherit'}} {...props} />,
                        ul: ({node, ...props}) => <ul style={{margin: '8px 0', paddingLeft: '20px'}} {...props} />,
                        ol: ({node, ...props}) => <ol style={{margin: '8px 0', paddingLeft: '20px'}} {...props} />,
                        li: ({node, ...props}) => <li style={{marginBottom: '4px'}} {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
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
              placeholder="Tanya AI..."
              disabled={loading}
            />
            <button 
              className="send-button" 
              onClick={ask} 
              disabled={loading || !question.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chatbot-trigger {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .chatbot-trigger:hover {
          transform: scale(1.05);
          background: var(--primary-dark);
        }

        .chatbot-trigger.open {
          transform: rotate(90deg);
          background: var(--gray-800);
        }

        .chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 380px;
          height: 500px;
          background: var(--gray-100);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--gray-200);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chatbot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: var(--gray-100);
          border-bottom: 1px solid var(--gray-200);
        }

        .header-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: var(--gray-900);
        }

        .status-dot {
          font-size: 12px;
          color: var(--success);
          font-weight: 500;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--gray-400);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: var(--gray-50);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .welcome-message {
          text-align: center;
          margin-top: 40px;
        }

        .welcome-icon {
          width: 48px;
          height: 48px;
          background: var(--gray-200);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: var(--shadow-sm);
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
        }

        .suggestions button {
          background: var(--gray-200);
          border: 1px solid var(--gray-300);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          color: var(--gray-600);
          transition: all 0.2s;
        }

        .suggestions button:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }

        .message.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message.bot {
          align-self: flex-start;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
        }

        .message.user .message-content {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot .message-content {
          background: var(--gray-200);
          color: var(--gray-900);
          border: 1px solid var(--gray-300);
          border-bottom-left-radius: 4px;
          box-shadow: var(--shadow-sm);
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px !important;
          width: fit-content;
        }

        .typing span {
          width: 6px;
          height: 6px;
          background: var(--gray-400);
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }

        .chat-input-container {
          padding: 16px;
          background: var(--gray-100);
          border-top: 1px solid var(--gray-200);
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          border: 1px solid var(--gray-300);
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          resize: none;
          max-height: 80px;
          outline: none;
          background-color: var(--gray-50);
          color: var(--gray-900);
          transition: all 0.2s;
        }

        .chat-input:focus {
          background-color: var(--gray-50);
          color: var(--gray-900);
          border-color: var(--primary);
        }

        .send-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .send-button:disabled {
          background: var(--gray-200);
          cursor: default;
        }

        @media (max-width: 480px) {
          .chatbot-window {
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100vh;
            border-radius: 0;
            border: none;
          }
          
          .chatbot-trigger {
            bottom: 20px;
            right: 20px;
            left: auto;
          }
        }
      `}</style>
    </>
  );
}
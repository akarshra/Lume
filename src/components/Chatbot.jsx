import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am Lumé, your AI artisan assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await response.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error while reaching the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chatbot-launcher" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="chatbot-avatar">L</span>
              <div>
                <strong>Lumé Assistant</strong>
                <span className="status-indicator">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-message assistant typing">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about your order, recommendations..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Chatbot;

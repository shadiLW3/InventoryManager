import { useState, useRef, useEffect } from 'react';
import { INVENTORY, SYSTEM_PROMPT, QUICK_PROMPTS } from '../data/inventory';
import '../styles/chat.css';

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const lowStockCount = INVENTORY.filter(i => i.qty <= i.reorder).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const query = text || input.trim();
    if (!query || loading) return;
    setInput("");

    const userMsg = { role: "user", content: query };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      console.log("API response:", data);
      const reply = data.content?.[0]?.text || "No response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat">
      {/* Quick prompts */}
      <div className="chat__prompts">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            className="chat__prompt-btn"
            onClick={() => send(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat__messages">
        {messages.length === 0 && (
          <div className="chat__empty">
            <div className="chat__empty-title">ASK THE AI</div>
            <div className="chat__empty-sub">
              {INVENTORY.length} SKUs loaded · {lowStockCount} alerts active
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`chat__msg chat__msg--${m.role}`}>
            <div className="chat__msg-label">
              {m.role === "user" ? "YOU" : "INV▸MGR AI"}
            </div>
            <div className={`chat__msg-bubble chat__msg-bubble--${m.role}`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat__msg chat__msg--assistant">
            <div className="chat__msg-label">INV▸MGR AI</div>
            <div className="chat__msg-bubble chat__msg-bubble--loading">
              PROCESSING...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat__input-bar">
        <textarea
          className="chat__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your inventory..."
          rows={2}
        />
        <button
          className="chat__send"
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          SEND →
        </button>
      </div>
    </div>
  );
}

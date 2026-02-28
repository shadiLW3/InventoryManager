import { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { QUICK_PROMPTS } from '../data/inventory';
import '../styles/chat.css';

/* Simple markdown-ish renderer */
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="chat__md-list">
          {listItems.map((li, i) => <li key={i}>{processInline(li)}</li>)}
        </ul>
      );
      listItems = [];
    }
  }

  function processInline(str) {
    const parts = [];
    const regex = /\*\*(.+?)\*\*/g;
    let last = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match.index > last) parts.push(str.slice(last, match.index));
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      last = regex.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length > 0 ? parts : str;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (line.trim() === '') {
      elements.push(<br key={`br-${i}`} />);
    } else {
      elements.push(<p key={`p-${i}`} className="chat__md-p">{processInline(line)}</p>);
    }
  }
  flushList();

  return elements;
}

/* Typing animation hook */
function useTypingEffect(text, speed = 12, enabled = true) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

function TypedMessage({ text }) {
  const { displayed, done } = useTypingEffect(text, 8, true);
  return (
    <div className="chat__md">
      {renderMarkdown(displayed)}
      {!done && <span className="chat__cursor">▊</span>}
    </div>
  );
}

function StaticMessage({ text }) {
  return <div className="chat__md">{renderMarkdown(text)}</div>;
}

export default function ChatPanel() {
  const { inventory, getSystemPrompt } = useInventory();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestIdx, setLatestIdx] = useState(-1);
  const bottomRef = useRef(null);

  const lowStockCount = inventory.filter(i => i.qty <= i.reorder).length;

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
          system: getSystemPrompt(),
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "No response.";
      setLatestIdx(newHistory.length);
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

  function clearChat() {
    setMessages([]);
    setLatestIdx(-1);
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
        {messages.length > 0 && (
          <button className="chat__prompt-btn chat__prompt-btn--clear" onClick={clearChat}>
            ✕ Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chat__messages">
        {messages.length === 0 && (
          <div className="chat__empty">
            <div className="chat__empty-icon">◈</div>
            <div className="chat__empty-title">ASK THE AI</div>
            <div className="chat__empty-sub">
              {inventory.length} SKUs loaded · {lowStockCount} alerts active
            </div>
            <div className="chat__empty-hint">
              Try a quick prompt above or type your own question
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`chat__msg chat__msg--${m.role}`}>
            <div className="chat__msg-label">
              {m.role === "user" ? "YOU" : "INV▸MGR AI"}
            </div>
            <div className={`chat__msg-bubble chat__msg-bubble--${m.role}`}>
              {m.role === "assistant" ? (
                i === latestIdx ? <TypedMessage text={m.content} /> : <StaticMessage text={m.content} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat__msg chat__msg--assistant">
            <div className="chat__msg-label">INV▸MGR AI</div>
            <div className="chat__msg-bubble chat__msg-bubble--loading">
              <span className="chat__loading-dots">
                <span>●</span><span>●</span><span>●</span>
              </span>
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

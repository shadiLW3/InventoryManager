import { useState, useRef, useEffect } from "react";

const INVENTORY = [
  { sku: "SKU-0042", name: "Wireless Keyboard",     qty: 3,   reorder: 10,  unit: "pcs",  warehouse: "WH-01" },
  { sku: "SKU-0093", name: "USB-C Hub 7-Port",      qty: 0,   reorder: 5,   unit: "pcs",  warehouse: "WH-01" },
  { sku: "SKU-0187", name: "Ergonomic Mouse",        qty: 24,  reorder: 8,   unit: "pcs",  warehouse: "WH-02" },
  { sku: "SKU-0201", name: "Monitor Stand",          qty: 6,   reorder: 4,   unit: "pcs",  warehouse: "WH-01" },
  { sku: "SKU-0334", name: "HDMI Cable 2m",          qty: 82,  reorder: 20,  unit: "pcs",  warehouse: "WH-03" },
  { sku: "SKU-0412", name: "Laptop Sleeve 15\"",     qty: 1,   reorder: 12,  unit: "pcs",  warehouse: "WH-02" },
  { sku: "SKU-0501", name: "Webcam 1080p",           qty: 9,   reorder: 6,   unit: "pcs",  warehouse: "WH-01" },
  { sku: "SKU-0609", name: "Desk Lamp LED",          qty: 17,  reorder: 5,   unit: "pcs",  warehouse: "WH-03" },
  { sku: "SKU-0714", name: "AA Batteries (8pk)",     qty: 4,   reorder: 30,  unit: "packs",warehouse: "WH-02" },
  { sku: "SKU-0821", name: "Cable Management Kit",   qty: 31,  reorder: 10,  unit: "pcs",  warehouse: "WH-01" },
];

const SYSTEM_PROMPT = `You are an inventory management assistant. You have access to the following live stock data:

${JSON.stringify(INVENTORY, null, 2)}

Fields: sku, name, qty (current quantity), reorder (reorder threshold), unit, warehouse.

When answering:
- Be concise and direct — this is a dashboard tool, not a chat app
- Flag items where qty <= reorder as LOW STOCK or OUT OF STOCK
- Use the SKU codes when referencing items
- Suggest reorder actions when relevant
- Format lists clearly but briefly`;

const QUICK_PROMPTS = [
  "What's out of stock or critically low?",
  "Which warehouse has the most issues?",
  "Give me a reorder priority list",
  "Summarize overall stock health",
];

function StatusBadge({ qty, reorder }) {
  if (qty === 0) return <span style={{ color: "#ff4444", fontFamily: "monospace", fontSize: "0.68rem", letterSpacing: "0.1em" }}>OUT</span>;
  if (qty <= reorder) return <span style={{ color: "rgb(255,131,48)", fontFamily: "monospace", fontSize: "0.68rem", letterSpacing: "0.1em" }}>LOW</span>;
  return <span style={{ color: "#4caf6e", fontFamily: "monospace", fontSize: "0.68rem", letterSpacing: "0.1em" }}>OK</span>;
}

function StockBar({ qty, reorder }) {
  const max = Math.max(qty, reorder * 2, 1);
  const pct = Math.min((qty / max) * 100, 100);
  const color = qty === 0 ? "#ff4444" : qty <= reorder ? "rgb(255,131,48)" : "#4caf6e";
  return (
    <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", width: "60px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 0.4s" }} />
    </div>
  );
}

export default function InventoryAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const bottomRef = useRef(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "No response.";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newHistory, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d0d0d; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    textarea:focus { outline: none; }
    textarea { resize: none; }
  `;

  const lowStockItems = INVENTORY.filter(i => i.qty <= i.reorder);

  return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#e8e8e0",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(13,13,13,0.95)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em" }}>
            INV<span style={{ color: "rgb(255,131,48)" }}>▸</span>MGR
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#555", marginLeft: "0.8rem", letterSpacing: "0.15em" }}>AI CONSOLE</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["chat", "stock"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em",
                padding: "0.35rem 0.9rem", borderRadius: "2px", cursor: "pointer",
                background: activeTab === tab ? "rgb(255,131,48)" : "transparent",
                color: activeTab === tab ? "#0d0d0d" : "#666",
                border: activeTab === tab ? "1px solid rgb(255,131,48)" : "1px solid rgba(255,255,255,0.08)",
                textTransform: "uppercase", transition: "all 0.15s",
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Alert bar */}
        {lowStockItems.length > 0 && (
          <div style={{
            background: "rgba(255,131,48,0.08)", borderBottom: "1px solid rgba(255,131,48,0.2)",
            padding: "0.5rem 1.5rem",
            fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "rgb(255,131,48)",
            letterSpacing: "0.1em", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center",
          }}>
            <span>⚑ ALERTS:</span>
            {lowStockItems.map(i => (
              <span key={i.sku} style={{
                background: "rgba(255,131,48,0.12)", padding: "0.15rem 0.5rem",
                borderRadius: "2px", color: i.qty === 0 ? "#ff6666" : "rgb(255,131,48)",
              }}>
                {i.sku} {i.qty === 0 ? "OUT" : "LOW"}
              </span>
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Stock Table Tab */}
          {activeTab === "stock" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                STOCK OVERVIEW
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["SKU", "Item", "Warehouse", "Qty", "Reorder At", "Level", "Status"].map(h => (
                      <th key={h} style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#555",
                        letterSpacing: "0.12em", textAlign: "left", padding: "0.5rem 0.8rem",
                        textTransform: "uppercase",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((item, i) => (
                    <tr key={item.sku} style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                    >
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "rgb(255,131,48)", padding: "0.7rem 0.8rem" }}>{item.sku}</td>
                      <td style={{ fontSize: "0.85rem", padding: "0.7rem 0.8rem" }}>{item.name}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#666", padding: "0.7rem 0.8rem" }}>{item.warehouse}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", padding: "0.7rem 0.8rem", fontWeight: 500 }}>{item.qty}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#555", padding: "0.7rem 0.8rem" }}>{item.reorder}</td>
                      <td style={{ padding: "0.7rem 0.8rem" }}><StockBar qty={item.qty} reorder={item.reorder} /></td>
                      <td style={{ padding: "0.7rem 0.8rem" }}><StatusBadge qty={item.qty} reorder={item.reorder} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Quick prompts */}
              <div style={{
                padding: "0.8rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", gap: "0.5rem", flexWrap: "wrap",
              }}>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)} disabled={loading} style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.06em",
                    padding: "0.3rem 0.8rem", borderRadius: "2px", cursor: "pointer",
                    background: "transparent", color: "#555",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                    onMouseEnter={e => { e.target.style.color = "#e8e8e0"; e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    onMouseLeave={e => { e.target.style.color = "#555"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {messages.length === 0 && (
                  <div style={{ margin: "auto", textAlign: "center", color: "#333" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>ASK THE AI</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.1em" }}>
                      {INVENTORY.length} SKUs loaded · {lowStockItems.length} alerts active
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: m.role === "user" ? "flex-end" : "flex-start",
                    gap: "0.3rem",
                  }}>
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
                      color: "#444", letterSpacing: "0.12em",
                    }}>
                      {m.role === "user" ? "YOU" : "INV▸MGR AI"}
                    </div>
                    <div style={{
                      maxWidth: "75%",
                      background: m.role === "user" ? "rgba(255,131,48,0.1)" : "rgba(255,255,255,0.04)",
                      border: m.role === "user" ? "1px solid rgba(255,131,48,0.2)" : "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "3px",
                      padding: "0.8rem 1rem",
                      fontSize: "0.88rem",
                      lineHeight: "1.65",
                      whiteSpace: "pre-wrap",
                      color: m.role === "user" ? "#e8e8e0" : "#c8c8c0",
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.3rem" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#444", letterSpacing: "0.12em" }}>INV▸MGR AI</div>
                    <div style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "3px", padding: "0.8rem 1rem",
                      fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "rgb(255,131,48)",
                      letterSpacing: "0.15em",
                    }}>
                      PROCESSING...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: "0.75rem", alignItems: "flex-end",
              }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask about your inventory..."
                  rows={2}
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "3px", padding: "0.7rem 1rem",
                    color: "#e8e8e0", fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
                    lineHeight: "1.5",
                    placeholder: "color: #444",
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.1em",
                    padding: "0.7rem 1.2rem", borderRadius: "3px", cursor: "pointer",
                    background: loading || !input.trim() ? "rgba(255,131,48,0.3)" : "rgb(255,131,48)",
                    color: "#0d0d0d", border: "none", fontWeight: 500,
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                >
                  SEND →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
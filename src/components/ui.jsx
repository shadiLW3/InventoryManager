export function Logo({ size = "1.6rem" }) {
  return (
    <div style={{ fontFamily: "var(--display)", fontSize: size, letterSpacing: "0.08em" }}>
      INV<span style={{ color: "var(--orange)" }}>▸</span>MGR
    </div>
  );
}

export function StatusBadge({ qty, reorder }) {
  const label = qty === 0 ? "OUT" : qty <= reorder ? "LOW" : "OK";
  const color = qty === 0 ? "#ff4444" : qty <= reorder ? "var(--orange)" : "#4caf6e";
  return (
    <span style={{
      color,
      fontFamily: "var(--mono)",
      fontSize: "0.68rem",
      letterSpacing: "0.1em",
    }}>
      {label}
    </span>
  );
}

export function StockBar({ qty, reorder }) {
  const max = Math.max(qty, reorder * 2, 1);
  const pct = Math.min((qty / max) * 100, 100);
  const color = qty === 0 ? "#ff4444" : qty <= reorder ? "var(--orange)" : "#4caf6e";
  return (
    <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", width: "60px" }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        borderRadius: "2px",
        transition: "width 0.4s",
      }} />
    </div>
  );
}

export function MonoLabel({ children, color = "var(--orange)", style = {} }) {
  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: "0.72rem",
      color,
      letterSpacing: "0.15em",
      ...style,
    }}>
      {children}
    </span>
  );
}

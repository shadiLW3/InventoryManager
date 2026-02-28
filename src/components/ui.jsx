export function Logo({ size = "1.6rem" }) {
  return (
    <div style={{ fontFamily: "var(--display)", fontSize: size, letterSpacing: "0.08em" }}>
      INV<span style={{ color: "var(--orange)" }}>▸</span>MGR
    </div>
  );
}

export function StatusBadge({ qty, reorder }) {
  const label = qty === 0 ? "OUT" : qty <= reorder ? "LOW" : "OK";
  const color = qty === 0 ? "var(--red)" : qty <= reorder ? "var(--orange)" : "var(--green)";
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
  const color = qty === 0 ? "var(--red)" : qty <= reorder ? "var(--orange)" : "var(--green)";
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

export function StatCard({ label, value, sub, color = "var(--text)" }) {
  return (
    <div style={{
      background: "var(--dark-2)",
      border: "1px solid var(--border)",
      borderRadius: "3px",
      padding: "1.2rem 1.4rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.3rem",
    }}>
      <span style={{
        fontFamily: "var(--mono)",
        fontSize: "0.6rem",
        color: "var(--muted)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>{label}</span>
      <span style={{
        fontFamily: "var(--display)",
        fontSize: "2rem",
        color,
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>{value}</span>
      {sub && (
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: "0.62rem",
          color: "var(--muted)",
          letterSpacing: "0.06em",
        }}>{sub}</span>
      )}
    </div>
  );
}

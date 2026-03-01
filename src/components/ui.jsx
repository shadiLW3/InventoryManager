import { getCategoryById, daysUntilExpiry, expiryStatus } from '../data/categories';

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

export function ExpiryBadge({ date }) {
  if (!date) return <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "#333" }}>—</span>;

  const days = daysUntilExpiry(date);
  const status = expiryStatus(date);

  const colors = {
    expired: { bg: 'rgba(255,68,68,0.15)', text: '#ff4444' },
    critical: { bg: 'rgba(255,68,68,0.1)', text: '#ff6666' },
    warning: { bg: 'rgba(255,131,48,0.1)', text: 'var(--orange)' },
    ok: { bg: 'transparent', text: '#555' },
  };

  const c = colors[status] || colors.ok;
  const label = days <= 0 ? 'EXPIRED' : days === 1 ? '1 day' : `${days}d`;

  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: "0.62rem",
      letterSpacing: "0.06em",
      color: c.text,
      background: c.bg,
      padding: "0.15rem 0.4rem",
      borderRadius: "2px",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

export function CategoryTag({ category }) {
  const cat = getCategoryById(category);
  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: "0.58rem",
      letterSpacing: "0.04em",
      color: cat.color,
      background: `${cat.color}15`,
      padding: "0.15rem 0.45rem",
      borderRadius: "2px",
      whiteSpace: "nowrap",
    }}>
      {cat.name}
    </span>
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
    <div className="stat-card">
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

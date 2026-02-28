import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { MonoLabel, Logo } from './ui';
import { TICKER_TEXT, INITIAL_INVENTORY } from '../data/inventory';
import '../styles/landing.css';

const FEATURES = [
  { icon: "◈", title: "Real-Time Tracking",  desc: "Every item, every location, every movement — logged instantly across all your warehouses.", accent: false },
  { icon: "⚑", title: "Smart Alerts",        desc: "Automated low-stock and expiry notifications so your team acts before a shortage hits.", accent: true },
  { icon: "⊞", title: "Multi-Warehouse",     desc: "Manage unlimited locations from one dashboard. Transfer stock with two clicks.", accent: false },
  { icon: "⇌", title: "Integrations",        desc: "Connect your POS, ERP, and e-commerce store. We speak Shopify, SAP, and everything between.", accent: false },
  { icon: "▦", title: "Audit Trails",        desc: "Full history on every SKU. Know who moved what, when, and why — always audit-ready.", accent: false },
  { icon: "◎", title: "Reporting",           desc: "Turn raw stock data into clear insights. Shrinkage, turnover, reorder points — at a glance.", accent: false },
];

const STATS = [
  { num: "12K+", label: "Active warehouses" },
  { num: "99.9%", label: "Uptime SLA" },
  { num: "3M+", label: "SKUs tracked daily" },
];

export default function LandingPage({ onEnterApp }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <div className="landing">
      <Navbar onEnterApp={onEnterApp} />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__grid" aria-hidden="true">
          {[...Array(5)].map((_, i) => <span key={i} />)}
        </div>

        <div className="hero__content">
          <div style={fadeUp(0.1)}>
            <MonoLabel>[ STOCK CONTROL SYSTEM v2.0 ]</MonoLabel>
          </div>

          <h1 className="hero__title">
            <span style={fadeUp(0.25)}>KNOW WHAT</span>
            <span className="accent" style={fadeUp(0.4)}>YOU HAVE.</span>
            <span style={fadeUp(0.55)}>ALWAYS.</span>
          </h1>

          <p className="hero__sub" style={fadeUp(0.7)}>
            Real-time inventory tracking, low-stock alerts, and supply chain
            visibility — built for teams that can't afford surprises.
          </p>

          <div className="hero__actions" style={fadeUp(0.85)}>
            <button className="btn btn--primary" onClick={onEnterApp}>Start for free</button>
            <button className="btn btn--ghost">Watch demo ↗</button>
          </div>

          <div className="hero__stats" style={fadeUp(1.0)}>
            {STATS.map((s, i) => (
              <div key={s.label} className="stat-group">
                <div className="stat">
                  <span className="stat__num">{s.num}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
                {i < STATS.length - 1 && <div className="stat__divider" />}
              </div>
            ))}
          </div>
        </div>

        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">{TICKER_TEXT.repeat(4)}</div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features">
        <div className="features__header">
          <MonoLabel>// CORE CAPABILITIES</MonoLabel>
          <h2>Everything you need to run tight operations.</h2>
        </div>
        <div className="features__grid">
          {FEATURES.map(f => (
            <div key={f.title} className={`feature-card ${f.accent ? "feature-card--accent" : ""}`}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <MonoLabel>[ READY TO SHIP? ]</MonoLabel>
          <h2>Start tracking in under 5 minutes.</h2>
          <button className="btn btn--primary btn--large" onClick={onEnterApp}>
            Create free account →
          </button>
        </div>
        <div className="cta-banner__deco" aria-hidden="true">INVENTORY</div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <Logo size="1.2rem" />
        <p className="footer__copy">© 2025 Inventory Manager. All rights reserved.</p>
        <div className="footer__links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

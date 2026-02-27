import { Logo } from './ui';
import '../styles/navbar.css';

export default function Navbar({ onEnterApp, variant = "landing" }) {
  return (
    <header className="nav">
      <Logo />
      <nav className="nav__links">
        {variant === "landing" && (
          <>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
          </>
        )}
        <button className="nav__cta" onClick={onEnterApp}>
          {variant === "landing" ? "Get Started →" : "← Back to Site"}
        </button>
      </nav>
    </header>
  );
}

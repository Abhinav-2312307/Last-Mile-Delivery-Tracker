import Link from "next/link";
import { Compass, CheckCircle2, Navigation, Map, Key } from "lucide-react";

export default function AgentLanding() {
  return (
    <div className="landing-layout agent-portal-landing">
      <header className="landing-header">
        <div className="landing-container flex-header">
          <Link href="/" className="landing-brand">
            <span className="brand-logo agent-logo">AG</span>
            <div className="brand-text">
              <strong>Agent Portal</strong>
              <span>Field Operations App</span>
            </div>
          </Link>
          <div className="landing-actions">
            <Link href="/" className="btn btn-secondary">Home</Link>
            <Link href="/login/agent" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero role-hero">
        <div className="landing-container max-w-md-section text-center-hero">
          <span className="badge-promo badge-agent">Field Operations</span>
          <h1 className="hero-title">Field Agent Tasks & Assignments</h1>
          <p className="hero-desc">
            Check your delivery task queue, mark package pickup status, log transit updates, and record secure delivery completion notes on the move.
          </p>
          <div className="hero-ctas justify-center">
            <Link href="/login/agent" className="btn btn-primary btn-lg">
              Open Field Assignments <Key size={18} />
            </Link>
            <Link href="/register/agent" className="btn btn-secondary btn-lg">
              Register as Agent
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-eyebrow">Agent Privileges</span>
            <h2>On-Field Workflows</h2>
            <p>Simple and fast controls designed for mobile view compatibility.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon"><Navigation size={24} /></div>
              <h3>Route Tasks</h3>
              <p>View your active workload assigned within your designated zone and service areas.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><CheckCircle2 size={24} /></div>
              <h3>Status Updates</h3>
              <p>Transition orders securely through Picked Up, In Transit, and Out For Delivery statuses.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Map size={24} /></div>
              <h3>Availability Controls</h3>
              <p>Toggle your profile availability between Available, Busy, and Offline to manage dispatch workflow.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-bottom-bar border-none text-center">
            <p className="muted text-xs">
              Delivery agent accounts require registration approval by a platform administrator.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Compass, Users, Truck, Sparkles, Key } from "lucide-react";

export default function ManagerLanding() {
  return (
    <div className="landing-layout manager-portal-landing">
      <header className="landing-header">
        <div className="landing-container flex-header">
          <Link href="/" className="landing-brand">
            <span className="brand-logo manager-logo">MN</span>
            <div className="brand-text">
              <strong>Manager Portal</strong>
              <span>Operations Dispatch Hub</span>
            </div>
          </Link>
          <div className="landing-actions">
            <Link href="/" className="btn btn-secondary">Home</Link>
            <Link href="/login/manager" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero role-hero">
        <div className="landing-container max-w-md-section text-center-hero">
          <span className="badge-promo badge-manager">Fleet Operations</span>
          <h1 className="hero-title">Dispatch Coordination & Logistics</h1>
          <p className="hero-desc">
            Oversee package transit status in real time. Assign orders, monitor delivery agents, and resolve exceptions such as failed delivery rescheduling.
          </p>
          <div className="hero-ctas justify-center">
            <Link href="/login/manager" className="btn btn-primary btn-lg">
              Open Dispatch Dashboard <Key size={18} />
            </Link>
            <Link href="/register/manager" className="btn btn-secondary btn-lg">
              Request Manager Access
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-eyebrow">Manager Privileges</span>
            <h2>Operations Oversight</h2>
            <p>Ensure reliable parcel handling and smooth transit workflows.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon"><Truck size={24} /></div>
              <h3>Order Routing</h3>
              <p>Dispatch orders to appropriate local agents based on zone alignment and active workloads.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Users size={24} /></div>
              <h3>Fleet Status</h3>
              <p>Track delivery agent availability, check employee status, and balance route allocations.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Sparkles size={24} /></div>
              <h3>Exceptions & Reassigns</h3>
              <p>Quickly reassign orders when an agent goes offline or a customer requests rescheduling.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-bottom-bar border-none text-center">
            <p className="muted text-xs">
              Operations manager profiles require registration approval from the system administrator.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

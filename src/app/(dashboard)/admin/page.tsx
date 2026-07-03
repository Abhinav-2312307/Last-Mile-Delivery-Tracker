import Link from "next/link";
import { ShieldAlert, BarChart3, Settings, Users, Key } from "lucide-react";

export default function AdminLanding() {
  return (
    <div className="landing-layout admin-portal-landing">
      <header className="landing-header">
        <div className="landing-container flex-header">
          <Link href="/" className="landing-brand">
            <span className="brand-logo admin-logo">AD</span>
            <div className="brand-text">
              <strong>Admin Portal</strong>
              <span>Operations Control Room</span>
            </div>
          </Link>
          <div className="landing-actions">
            <Link href="/" className="btn btn-secondary">Home</Link>
            <Link href="/login/admin" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero role-hero">
        <div className="landing-container max-w-md-section text-center-hero">
          <span className="badge-promo badge-admin">System Root</span>
          <h1 className="hero-title">Platform Administration & Audit</h1>
          <p className="hero-desc">
            Configure delivery zones, service area mappings, volumetric billing rate cards, manage operational team members, and process pending account registrations.
          </p>
          <div className="hero-ctas justify-center">
            <Link href="/login/admin" className="btn btn-primary btn-lg">
              Sign In to Workspace <Key size={18} />
            </Link>
            <Link href="/register/admin" className="btn btn-secondary btn-lg">
              Request Admin Access
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-eyebrow">Administrative Controls</span>
            <h2>System Privileges</h2>
            <p>Authorized access allows full configuration capability across the platform.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon"><BarChart3 size={24} /></div>
              <h3>Revenue Analytics</h3>
              <p>Monitor real-time billing performance, route metrics, and transactional breakdowns.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Users size={24} /></div>
              <h3>Team Approvals</h3>
              <p>Review and authorize field agent and operations manager self-registrations.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Settings size={24} /></div>
              <h3>Rate Configurations</h3>
              <p>Configure intra-zone and inter-zone rates, COD surcharges, and country routes.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-bottom-bar border-none text-center">
            <p className="muted text-xs flex items-center justify-center gap-1">
              <ShieldAlert size={14} /> Unauthorized access is strictly prohibited and subject to operational auditing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

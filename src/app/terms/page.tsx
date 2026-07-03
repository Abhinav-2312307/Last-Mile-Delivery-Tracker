import Link from "next/link";
import { HelpCircle, ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="landing-layout policy-page">
      <header className="landing-header">
        <div className="landing-container flex-header">
          <Link href="/" className="landing-brand">
            <span className="brand-logo">LM</span>
            <div className="brand-text">
              <strong>Last-Mile</strong>
              <span>Logistics</span>
            </div>
          </Link>
          <Link href="/" className="btn btn-secondary flex items-center gap-1">
            <ChevronLeft size={16} /> Back
          </Link>
        </div>
      </header>

      <main className="policy-main-container">
        <article className="policy-content">
          <h1>Terms and Conditions of Service</h1>
          <p className="muted last-updated">Last updated: July 2026</p>

          <section className="policy-section">
            <h2>1. General Scope of Agreement</h2>
            <p>
              These Terms and Conditions govern the access and use of the Last-Mile Delivery Tracker platform. By self-registering as a Customer, Agent, Manager, or Administrator, you acknowledge and agree to comply with all standard operating procedures and security validation checkpoints set forth by the platform.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Customer Roles & Bookings</h2>
            <p>
              Customers are solely responsible for providing accurate pickup and drop coordinates, package dimensions, weights, and declaring B2B or B2C order types. All delivery charges are dynamically calculated on the basis of zone coordinates and actual volumetric weights. Any discrepancies in dimensions may result in re-rating or delivery rejection.
            </p>
          </section>

          <section className="policy-section">
            <h2>3. Staff Roles & Admin Approvals</h2>
            <p>
              Self-registered accounts for Field Agents and Operations Managers require express system administrative approval. Registrants must submit accurate details. Administrators reserve the right to review justification notes, query references, and decline or terminate authorization profiles to safeguard routing metrics.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. On-Field Operations</h2>
            <p>
              Field Agents are expected to keep their availability profiles current (Available, Busy, Offline) and record transit event tracking parameters immediately. Falsification of status updates, GPS telemetry coordinates, or delivery completion confirmations is strictly prohibited.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Limitation of Liability</h2>
            <p>
              Our logistics coordination platform serves as a routing dispatch coordination agent. We assume no liability for package loss, damage, or delivery delays arising from extreme meteorological conditions, mechanical failures, or incorrect customer address declarations.
            </p>
          </section>
        </article>
      </main>

      <footer className="landing-footer">
        <div className="landing-container text-center py-6 border-none">
          <p className="muted text-xs">&copy; {new Date().getFullYear()} Last-Mile Delivery Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

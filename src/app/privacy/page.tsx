import Link from "next/link";
import { HelpCircle, ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <p className="muted last-updated">Last updated: July 2026</p>

          <section className="policy-section">
            <h2>1. Collected Telemetry Data</h2>
            <p>
              We collect and process telemetry data including names, email addresses, verified phone contacts, pickup/drop coordinates, and GPS updates recorded by active Field Agents. This information is processed exclusively to calculate charges, align routing assignments, and notify customers.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Location Services</h2>
            <p>
              When using "Detect Current Location" or pinning locations on our interactive map panels, latitude and longitude coordinates are processed through public reverse geocoding API helpers to auto-fill state, city, and postal code values. This coordinate stream is saved to database records associated with the order.
            </p>
          </section>

          <section className="policy-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not distribute or trade customer personal records to third-party marketing services. Location coordinates, contact details, and parcel parameters are shared solely with operational managers and assigned field agents to complete order transit paths.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Security Safeguards</h2>
            <p>
              Passwords are encrypted using cryptographically strong Bcrypt algorithms. Access credentials are restrictively aligned using JWT session configurations that terminate automatically. Operational pages are protected behind middleware filters.
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

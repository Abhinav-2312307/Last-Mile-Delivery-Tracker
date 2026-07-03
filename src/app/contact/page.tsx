"use client";

import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { sendContactMessage } from "./actions";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMsg("");

    const formData = new FormData(event.currentTarget);
    const result = await sendContactMessage(formData);

    setPending(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(result.error || "An error occurred while sending your message. Please try again.");
    }
  }

  return (
    <div className="landing-layout">
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

      <main className="policy-main-container contact-main-layout">
        <div className="contact-grid-panel">
          {/* Info Card */}
          <div className="contact-info-card">
            <span className="eyebrow text-white">Get in touch</span>
            <h2>We're here to help coordinate.</h2>
            <p className="text-white-muted">
              Have questions about pricing tariffs, courier fleet operations, or B2B contracts? Reach out to us.
            </p>

            <div className="info-list-container">
              <div className="info-row-item">
                <Mail size={20} className="info-icon" />
                <div>
                  <h4>Primary Email</h4>
                  <a href="mailto:abhinavrishi32@gmail.com">abhinavrishi32@gmail.com</a>
                </div>
              </div>
              <div className="info-row-item">
                <Phone size={20} className="info-icon" />
                <div>
                  <h4>Operational Helpline</h4>
                  <a href="tel:+919999000001">+91 99990 00001</a>
                </div>
              </div>
              <div className="info-row-item">
                <MapPin size={20} className="info-icon" />
                <div>
                  <h4>Control Room Address</h4>
                  <p>14 Barakhamba Road, Connaught Place, New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="form-success-wrapper text-center">
                <div className="success-icon">✓</div>
                <h3>Message Received</h3>
                <p className="muted text-sm mt-2">
                  Thank you for reaching out. We will review your message and contact you shortly.
                </p>
                <button className="button button-primary mt-6" onClick={() => setSubmitted(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="form-stack">
                <h3>Send us a message</h3>
                
                {errorMsg && (
                  <div style={{ color: "#dc2626", backgroundColor: "#fee2e2", padding: "0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", marginBottom: "1rem", border: "1px solid #fecaca" }}>
                    {errorMsg}
                  </div>
                )}

                <label>
                  Your Name
                  <input name="name" type="text" required placeholder="John Doe" />
                </label>
                <label>
                  Email address
                  <input name="email" type="email" required placeholder="name@domain.com" />
                </label>
                <label>
                  Subject
                  <input name="subject" type="text" required placeholder="Delivery rate query" />
                </label>
                <label>
                  Message
                  <textarea name="message" rows={4} required placeholder="Write your message here..." className="input-textarea" />
                </label>

                <button className="button button-primary btn-full flex items-center justify-center gap-2" disabled={pending}>
                  {pending ? "Sending..." : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="landing-container text-center py-6 border-none">
          <p className="muted text-xs">&copy; {new Date().getFullYear()} Last-Mile Delivery Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

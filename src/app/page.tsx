import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/order/status-badge";
import { ArrowRight, Box, Compass, Clock, ShieldCheck, MapPin, Phone, HelpCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ trackingId?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const trackingId = params.trackingId;

  let trackingOrder = null;
  let hasSearched = false;

  if (trackingId) {
    hasSearched = true;
    trackingOrder = await prisma.order.findUnique({
      where: { orderNumber: trackingId.trim().toUpperCase() },
      include: {
        pickupAddress: { include: { area: { include: { city: true } } } },
        dropAddress: { include: { area: { include: { city: true } } } },
        assignedAgent: true,
        trackingEvents: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  return (
    <div className="landing-layout">
      {/* Navigation */}
      <header className="landing-header">
        <div className="landing-container flex-header">
          <Link href="/" className="landing-brand">
            <span className="brand-logo">LM</span>
            <div className="brand-text">
              <strong>Last-Mile</strong>
              <span>Logistics</span>
            </div>
          </Link>
          <nav className="landing-nav">
            <Link href="#features">Features</Link>
            <Link href="#track">Track Shipment</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <div className="landing-actions">
            <Link href="/login" className="btn btn-secondary">Sign In</Link>
            <Link href="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container grid-hero">
          <div className="hero-content">
            <span className="badge-promo">Reliable & Smart Logistics</span>
            <h1 className="hero-title">
              Hyper-local logistics <br />
              <span className="text-gradient">engineered for speed.</span>
            </h1>
            <p className="hero-desc">
              From business parcels to individual shipments, experience automated zone-based pricing, intelligent field agent dispatching, and continuous real-time tracking.
            </p>
            <div className="hero-ctas">
              <Link href="/register" className="btn btn-primary btn-lg">
                Book a Delivery <ArrowRight size={18} />
              </Link>
              <Link href="#track" className="btn btn-secondary btn-lg">
                Track Shipment
              </Link>
            </div>
          </div>

          {/* Interactive Portal Links Card */}
          <div className="hero-card">
            <div className="card-header-accent">
              <h3>Operational Console</h3>
              <p>Sign in to your dedicated workspace</p>
            </div>
            <div className="portal-grid">
              <Link href="/login" className="portal-link-item">
                <div className="portal-icon customer-bg"><Box size={20} /></div>
                <div>
                  <h4>Customer Portal</h4>
                  <p>Book deliveries & track history</p>
                </div>
              </Link>
              <Link href="/agent" className="portal-link-item">
                <div className="portal-icon agent-bg"><Compass size={20} /></div>
                <div>
                  <h4>Agent Portal</h4>
                  <p>Active tasks & route guidance</p>
                </div>
              </Link>
              <Link href="/manager" className="portal-link-item">
                <div className="portal-icon manager-bg"><Clock size={20} /></div>
                <div>
                  <h4>Manager Hub</h4>
                  <p>Dispatch queue & fleet ops</p>
                </div>
              </Link>
              <Link href="/admin" className="portal-link-item">
                <div className="portal-icon admin-bg"><ShieldCheck size={20} /></div>
                <div>
                  <h4>Admin Control</h4>
                  <p>Rates, zones, approvals & stats</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-eyebrow">Why Choose Us</span>
            <h2>Complete operations management</h2>
            <p>Designed to scale up with your B2B deliveries or simple B2C errands.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon"><MapPin size={24} /></div>
              <h3>Zone-Based Pricing</h3>
              <p>Dynamic charge auto-calculation based on weight, dimensions, and custom coordinates.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Compass size={24} /></div>
              <h3>Intelligent Dispatch</h3>
              <p>Matches orders to local available delivery agents dynamically to optimize transit routes.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Clock size={24} /></div>
              <h3>Instant Updates</h3>
              <p>Timelines logging every event from order confirmation to final drop-off verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section id="track" className="landing-tracking">
        <div className="landing-container max-w-md-section">
          <div className="section-header-center">
            <span className="section-eyebrow">Real-Time Search</span>
            <h2>Track your package</h2>
            <p>No account required. Enter your delivery reference identifier below.</p>
          </div>
          
          <form action="/#track" method="GET" className="tracking-form-card">
            <div className="form-row-inline">
              <input
                id="trackingIdInput"
                type="text"
                name="trackingId"
                placeholder="Enter Delivery ID (e.g. LM-XXXXXX)"
                defaultValue={trackingId || ""}
                required
                className="input-field-track"
              />
              <button className="btn btn-primary" type="submit">
                Track Package
              </button>
            </div>
          </form>

          {hasSearched && (
            <div className="tracking-results-container">
              {trackingOrder ? (
                <div className="tracking-results-grid">
                  <div className="results-main">
                    <div className="results-header">
                      <div>
                        <span className="results-lbl">Reference ID</span>
                        <h3 className="results-title">{trackingOrder.orderNumber}</h3>
                      </div>
                      <StatusBadge status={trackingOrder.status} />
                    </div>
                    
                    <div className="route-bar">
                      <div className="route-node">
                        <span className="node-dot"></span>
                        <strong>{trackingOrder.pickupAddress.cityName || trackingOrder.pickupAddress.area.city.name}</strong>
                        <p className="node-detail">{trackingOrder.pickupAddress.area.name}</p>
                      </div>
                      <div className="route-line-connector"></div>
                      <div className="route-node">
                        <span className="node-dot node-dot-end"></span>
                        <strong>{trackingOrder.dropAddress.cityName || trackingOrder.dropAddress.area.city.name}</strong>
                        <p className="node-detail">{trackingOrder.dropAddress.area.name}</p>
                      </div>
                    </div>

                    <dl className="results-details-list">
                      <div>
                        <dt>Pickup Address</dt>
                        <dd>
                          {[
                            trackingOrder.pickupAddress.line1,
                            trackingOrder.pickupAddress.line2,
                            trackingOrder.pickupAddress.area.name,
                            trackingOrder.pickupAddress.cityName || trackingOrder.pickupAddress.area.city.name,
                            trackingOrder.pickupAddress.stateCode,
                            trackingOrder.pickupAddress.postalCode,
                          ].filter(Boolean).join(", ")}
                        </dd>
                      </div>
                      <div>
                        <dt>Delivery Address</dt>
                        <dd>
                          {[
                            trackingOrder.dropAddress.line1,
                            trackingOrder.dropAddress.line2,
                            trackingOrder.dropAddress.area.name,
                            trackingOrder.dropAddress.cityName || trackingOrder.dropAddress.area.city.name,
                            trackingOrder.dropAddress.stateCode,
                            trackingOrder.dropAddress.postalCode,
                          ].filter(Boolean).join(", ")}
                        </dd>
                      </div>
                      <div>
                        <dt>Assigned Agent</dt>
                        <dd>{trackingOrder.assignedAgent?.name || "Awaiting dispatch assignment"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="results-timeline-panel">
                    <h4>Tracking Timeline</h4>
                    <ul className="tracking-timeline-list">
                      {trackingOrder.trackingEvents.map((event) => (
                        <li key={event.id} className="timeline-event-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content-block">
                            <div className="timeline-meta-row">
                              <strong>{event.status.replaceAll("_", " ")}</strong>
                              <time>{event.createdAt.toLocaleString("en-IN")}</time>
                            </div>
                            <p className="timeline-note-text">{event.note || "Operational status updated."}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="tracking-error-alert">
                  Could not find an active delivery reference matching <strong>"{trackingId}"</strong>. Please verify the code and try again.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-content-grid">
          <div>
            <div className="landing-brand">
              <span className="brand-logo">LM</span>
              <div className="brand-text">
                <strong>Last-Mile</strong>
                <span>Logistics</span>
              </div>
            </div>
            <p className="footer-about-text">
              Real-time delivery tracker and routing coordination engine.
            </p>
          </div>
          <div>
            <h4>Workspaces</h4>
            <ul className="footer-links">
              <li><Link href="/login">Customer Login</Link></li>
              <li><Link href="/agent">Agent Portal</Link></li>
              <li><Link href="/manager">Manager Hub</Link></li>
              <li><Link href="/admin">Admin Control Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <div className="landing-container">
            <p>&copy; {new Date().getFullYear()} Last-Mile Delivery Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

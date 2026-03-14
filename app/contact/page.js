import Link from "next/link";
import { ContactInquiryForm } from "../components/contact-inquiry-form";

export const metadata = {
  title: "Contact Us | Rudraksh Pharmacy Surat | 9:00 AM - 10:00 PM",
  description:
    "Get customer support from Rudraksh Pharmacy Surat. Contact us for medicine inquiries, bulk orders, prescription help, and WhatsApp ordering. Call +91 99799 79688 or email rudrakshpharmacy6363@gmail.com.",
  keywords: [
    "contact Rudraksh Pharmacy",
    "pharmacy customer support",
    "medicine inquiry",
    "bulk medicine orders",
    "pharmacy Surat contact",
    "WhatsApp medicine order",
    "Rudraksh Pharmacy Adajan",
  ],
  openGraph: {
    title: "Contact Rudraksh Pharmacy | Surat",
    description: "Reach us for medicine inquiries, bulk orders, and expert assistance.",
    type: "website",
    url: "https://rudrakshpharmacy.com/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact Rudraksh Pharmacy",
    description: "Open 9 AM to 10 PM daily. Expert pharmaceutical support.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialInquiryType =
    typeof resolvedSearchParams?.inquiryType === "string"
      ? resolvedSearchParams.inquiryType
      : "";
  const initialMessage =
    typeof resolvedSearchParams?.message === "string"
      ? resolvedSearchParams.message
      : "";

  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="contact-hero-enhanced">
        <div className="contact-hero-content">
          <div className="contact-hero-text">
            <span className="contact-badge">Get in Touch</span>
            <h1 className="contact-hero-title">We're Here to Help</h1>
            <p className="contact-hero-subtitle">
              Have a question or need assistance? Our friendly team is always ready to support you with the best pharmaceutical solutions.
            </p>
          </div>
          <div className="contact-hero-visual">
            <div className="hero-circle hero-circle-1"></div>
            <div className="hero-circle hero-circle-2"></div>
            <div className="hero-circle hero-circle-3"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="contact-stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">25K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2.5K+</div>
              <div className="stat-label">Products Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30 min</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Contact Cards Section */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Connect With Us</h2>
            <p className="section-subtitle">Choose your preferred way to reach us</p>
          </div>

          <div className="contact-cards-grid-enhanced">
            {/* Call Us Card */}
            <div className="contact-card-enhanced call-card">
              <div className="card-icon-wrapper">
                <svg className="card-icon" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="#dc2626" strokeWidth="4" rx="8" />
                  <path d="M50 45C50 42.24 52.24 40 55 40H60C62.76 40 65 42.24 65 45V75C65 77.76 62.76 80 60 80H55C52.24 80 50 77.76 50 75V45Z" fill="#dc2626" />
                  <circle cx="75" cy="75" r="4" fill="#dc2626" />
                </svg>
              </div>
              <h3 className="card-title">Call Us</h3>
              <p className="card-description">Speak directly with our team for immediate assistance and expert guidance on all your pharmacy needs.</p>
              <a href="tel:+919979979688" className="card-action-link">
                <span>+91 99799 79688</span>
                <svg className="link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <p className="card-availability">Available: Mon-Sat 9:00 AM - 10:00 PM, Sun 9:00 AM - 8:00 PM</p>
            </div>

            {/* Email Us Card */}
            <div className="contact-card-enhanced email-card">
              <div className="card-icon-wrapper">
                <svg className="card-icon" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="#2563eb" strokeWidth="4" rx="8" />
                  <path d="M30 45H90L60 62.5L30 45Z" fill="#2563eb" />
                  <path d="M30 45V75H90V45L60 62.5L30 45Z" stroke="#2563eb" strokeWidth="3" />
                </svg>
              </div>
              <h3 className="card-title">Email Us</h3>
              <p className="card-description">Send us your queries and we'll respond within 24 hours on business days with comprehensive solutions.</p>
              <a href="mailto:rudrakshpharmacy6363@gmail.com" className="card-action-link">
                <span>rudrakshpharmacy6363<wbr />@gmail.com</span>
                <svg className="link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <p className="card-availability">Response within 24 business hours</p>
            </div>

            {/* Visit Us Card */}
            <div className="contact-card-enhanced location-card">
              <div className="card-icon-wrapper">
                <svg className="card-icon" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="#16a34a" strokeWidth="4" rx="8" />
                  <path d="M60 40C50 40 42 48 42 58C42 70 60 85 60 85C60 85 78 70 78 58C78 48 70 40 60 40Z" fill="#16a34a" />
                  <circle cx="60" cy="58" r="6" fill="white" />
                </svg>
              </div>
              <h3 className="card-title">Visit Us</h3>
              <p className="card-description">Come visit our pharmacy location for a firsthand experience and expert pharmaceutical services.</p>
              <a href="https://www.google.com/maps/search/?api=1&query=9+and+10+L.P+Savani+Shopping+Center+Adajan+Surat" 
                target="_blank" rel="noopener noreferrer" className="card-action-link">
                <span>Get Directions</span>
                <svg className="link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <p className="card-availability">RudraKsh Pharmacy, 9 & 10, L.P Savani Shopping Center, Adajan, Surat</p>
            </div>

            {/* Business Hours Card */}
            <div className="contact-card-enhanced hours-card">
              <div className="card-icon-wrapper">
                <svg className="card-icon" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="20" width="80" height="80" stroke="#b45309" strokeWidth="4" rx="8" />
                  <circle cx="60" cy="60" r="18" stroke="#b45309" strokeWidth="3" />
                  <line x1="60" y1="60" x2="60" y2="48" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
                  <line x1="60" y1="60" x2="70" y2="60" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="card-title">Business Hours</h3>
              <p className="card-description">We're available to serve you during these convenient business hours throughout the week.</p>
              <div className="card-hours-list">
                <div className="hours-item">
                  <span className="hours-day">Mon - Sat</span>
                  <span className="hours-time">9:00 AM - 10:00 PM</span>
                </div>
                <div className="hours-item">
                  <span className="hours-day">Sunday</span>
                  <span className="hours-time">9:00 AM - 1:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="quick-access-section">
        <div className="container">
          <div className="quick-access-wrapper">
            <div className="quick-access-content">
              <h2 className="quick-access-title">Quick Connect Options</h2>
              <p className="quick-access-subtitle">Connect with us on your preferred platform</p>
              <div className="quick-access-buttons">
                <a href="https://wa.me/919979979688" target="_blank" rel="noopener noreferrer" className="quick-btn whatsapp-btn">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 5.432 4.424 9.85 9.85 9.85 5.425 0 9.85-4.418 9.85-9.85 0-5.433-4.425-9.85-9.85-9.85m8.081.306A11.9 11.9 0 0012.001 0C5.495 0 .16 5.335.16 11.9a11.9 11.9 0 0010.162 11.883V21a11.9 11.9 0 0012.001-12 11.9 11.9 0 00-1.042-4.811z" />
                  </svg>
                  WhatsApp
                </a>
                <a href="tel:+919979979688" className="quick-btn call-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
                <a href="mailto:rudrakshpharmacy6363@gmail.com" className="quick-btn email-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section-enhanced">
        <div className="container">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Send us a Message</h2>
              <p className="form-subtitle">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>
            <ContactInquiryForm
              initialInquiryType={initialInquiryType}
              initialMessage={initialMessage}
            />
          </div>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <>
      <section className="footer-help-strip" aria-label="Help and support contact">
        <div className="container footer-help-strip-inner">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-help-icon">
            <path d="M22 16.9v2.4a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.6-3 19.2 19.2 0 0 1-5.9-5.9 19.6 19.6 0 0 1-3-8.7A2 2 0 0 1 4.2 1.5h2.3a2 2 0 0 1 2 1.7c.1.9.4 1.8.8 2.7a2 2 0 0 1-.4 2.2L8 9a16 16 0 0 0 7 7l.9-.9a2 2 0 0 1 2.2-.4c.9.4 1.8.7 2.7.8a2 2 0 0 1 1.2 1.4Z" />
          </svg>
          <p>
            <strong>Need help?</strong> Call us at <a href="tel:+91 99799 79688">+91 99799 79688</a> or get a call back.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3 className="footer-brand">
              <Image
                src="/rudraksha-logo-v2.png"
                alt="Rudraksh Pharmacy logo"
                width={60}
                height={60}
              />
              <span>Rudraksh Pharmacy</span>
            </h3>
            <p>
              Trusted healthcare partner for medicines, wellness products, and
              expert support.
            </p>
            <div className="footer-badges">
              <span>Licensed</span>
              <span>Secure Checkout</span>
              <span>Support 7 Days</span>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/reviews">Reviews</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Phone: +91 99799 79688</li>
              <li>Email: rudrakshpharmacy6363@gmail.com</li>
              <li>Surat, Gujarat, India</li>
            </ul>
          </div>
          <div>
            <h4>Hours</h4>
            <ul>
              <li>Mon - Sat: 8:00 AM - 10:00 PM</li>
              <li>Sunday: 9:00 AM - 1:00 PM</li>
              <li>Emergency Orders: 24/7</li>
            </ul>
          </div>
          <div>
            <h4>Social Media</h4>
            <div className="footer-social-links">
              <a
                href="https://wa.me/919979979688"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="footer-social-link"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                  <path d="M20 11.7a8 8 0 0 1-11.6 7.1L4 20l1.2-4.1A8 8 0 1 1 20 11.7Z" />
                  <path d="M9.1 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.5 1.4c.1.3 0 .5-.1.7l-.4.5c.3.6.8 1.3 1.4 1.8.7.6 1.3 1 2 1.3l.5-.5c.2-.2.4-.3.7-.2l1.3.6c.4.2.4.4.4.6v.5c0 .2-.1.4-.4.6-.4.3-1 .5-1.6.5-1 0-2.4-.4-3.8-1.7-1.9-1.8-2.3-3.5-2.3-4.6 0-.5.2-1.1.5-1.5Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rudrakshpharmacy/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social-link"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="footer-social-icon">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="3.8" />
                  <circle cx="17.2" cy="6.8" r="1" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright {new Date().getFullYear()} Rudraksh Pharmacy. All rights reserved.</p>
          <p>Privacy Policy | Terms & Conditions</p>
        </div>
      </footer>
    </>
  );
}

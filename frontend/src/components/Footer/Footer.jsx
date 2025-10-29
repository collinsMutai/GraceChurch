import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        {/* --- Column 1: Logo & Description --- */}
        <div className="footer-col footer-about">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Deliverance Church Litein Logo"
            className="footer-logo"
            loading="lazy"
            width="90"
            height="90"
          />
          <p>
            Deliverance Church Litein is a Christ-centered community committed
            to spreading the Gospel, empowering believers, and transforming
            lives through the Word of God.
          </p>
        </div>

        {/* --- Column 2: Quick Links --- */}
        <nav className="footer-col footer-links" aria-label="Footer Menu">
          <h4>Menu</h4>
          <ul>
            <li>
              <a href="/" title="Go to Home page">
                Home
              </a>
            </li>
            <li>
              <a href="/about" title="Learn more About us">
                About
              </a>
            </li>
            <li>
              <a href="/sermons" title="Watch Sermons">
                Sermons
              </a>
            </li>
            <li>
              <a href="/gallery" title="View our Gallery">
                Gallery
              </a>
            </li>
            <li>
              <a href="/contact" title="Get in touch with us">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* --- Column 3: Contact Info --- */}
        <address className="footer-col footer-contact">
          <h4>Contact</h4>
          <ul>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
              </svg>
              <p>Litein Town, Kericho County, Kenya</p>
            </li>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
              </svg>
              <p>
                <a
                  href="tel:+254712345678"
                  title="Call Deliverance Church Litein"
                >
                  +254 712 345 678
                </a>
              </p>
            </li>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 9l9 6l9 -6l-9 -6l-9 6" />
                <path d="M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
                <path d="M3 19l6 -6" />
                <path d="M15 13l6 6" />
              </svg>
              <p>
                <a
                  href="mailto:info@dclitein.org"
                  title="Email Deliverance Church Litein"
                >
                  info@dclitein.org
                </a>
              </p>
            </li>
            <li>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 7v5l3 3" />
              </svg>
              <p>Sunday Service: 9:00 AM - 12:30 PM</p>
            </li>
          </ul>
        </address>

        {/* --- Column 4: Social Media --- */}
        <div className="footer-col footer-socials">
          <h4>Follow Us</h4>
          <div className="social-icons">
            {/* Facebook */}
            <a
              href="https://facebook.com/dclitein"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Facebook"
              title="Follow on Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@dclitein"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="YouTube"
              title="Subscribe on YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-brand-youtube"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                <path d="M10 9l5 3l-5 3z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/254712345678"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="WhatsApp"
              title="Chat on WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-brand-whatsapp"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Deliverance Church Litein. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

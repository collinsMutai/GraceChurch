import React, { useState } from "react";
import "./ContactForm.css";
import Header from "../Header/Header";
import HeaderImage from "../../images/slider1.jpeg";

/* =============================
   SVG Icon Components
   ============================= */

const FacebookIcon = () => (
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
    className="icon icon-tabler icon-tabler-brand-facebook"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
  </svg>
);

const YouTubeIcon = () => (
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
    className="icon icon-tabler icon-tabler-brand-youtube"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
    <path d="M10 9l5 3l-5 3z" />
  </svg>
);

const WhatsAppIcon = () => (
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
    className="icon icon-tabler icon-tabler-brand-whatsapp"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
  </svg>
);

const MailIcon = () => (
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
    className="icon icon-tabler icon-tabler-mail-opened"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 9l9 6l9 -6l-9 -6l-9 6" />
    <path d="M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10" />
    <path d="M3 19l6 -6" />
    <path d="M15 13l6 6" />
  </svg>
);

const PhoneIcon = () => (
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
    className="icon icon-tabler icon-tabler-phone"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
  </svg>
);

const ClockIcon = () => (
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
    class="icon icon-tabler icons-tabler-outline icon-tabler-clock"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const MapIcon = () => (
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
    class="icon icon-tabler icons-tabler-outline icon-tabler-map-pin"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);

/* =============================
   Social Media Links
   ============================= */

const socialLinks = [
  {
    platform: "Like Us On Facebook",
    url: "https://www.facebook.com/p/Deliverance-Church-Litein-100093497323965/",
    icon: <FacebookIcon />,
  },
  {
    platform: "Subscribe To Our YouTube",
    url: "https://www.youtube.com/@deliverancechurchlitein",
    icon: <YouTubeIcon />,
  },
  {
    platform: "Chat With Us On WhatsApp",
    url: "https://whatsapp.com",
    icon: <WhatsAppIcon />,
  },
];

/* =============================
   Main Component
   ============================= */

const ContactForm = () => {
    const breadcrumbs = [
    { text: "Home", link: "/" },
    { text: "Contact Us", link: "/contact" }
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
     <Header 
        title="Contact Us"
        imageUrl={HeaderImage}  // Passing the background image
        breadcrumbs={breadcrumbs}  // Passing breadcrumb data
      />
   
    <div className="contact-form-container">
      {/* Contact Info Section */}
      <div className="contact-info">
        <h2>Connect With Us</h2>

        {/* Row 1: Phone & Email */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="contact-item-wrapper">
              <PhoneIcon />
              <div className="contact-text">
                <h4>Phone Number</h4>
                <a href="tel:+1234567890" className="contact-item">
                  <span>0723456790</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="contact-item-wrapper">
              <MailIcon />
              <div className="contact-text">
                <h4>Email</h4>
                <a href="mailto:contact@example.com" className="contact-item">
                  <span>contact@deliverancechurchlitein.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Sunday Hours & Location */}
        <div className="row g-4 mt-3">
          <div className="col-md-6">
            <div className="contact-item-wrapper">
              <ClockIcon />
              <div className="contact-text">
                <h4>Sunday Service</h4>
                <a href="#" className="contact-item">
                  <span>9:00 AM - 12:30 PM</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="contact-item-wrapper">
              <MapIcon />
              <div className="contact-text">
                <h4>Location</h4>
                <a href="#" className="contact-item">
                  <span>Litein Town, Kericho County, Kenya</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Section */}
        <h3 className="mt-4">Follow Us</h3>
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
              <span>{link.platform}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="contact-form">
        <div className="talk-to-us">
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
            className="icon"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 21h4v-9h5v-4h-5v-5h-4v5h-5v4h5z" />
          </svg>
          <span>Talk To Us</span>
        </div>

        <p className="contact-text">
          We’d love to hear from you! Please fill out the form below to get in
          touch, and we’ll get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
     </>
  );
};

export default ContactForm;

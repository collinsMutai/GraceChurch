import React, { useState } from 'react';
import './ContactForm.css';

// Dummy social media data
const socialLinks = [
  { platform: 'Facebook', url: 'https://facebook.com', icon: '📘' },
  { platform: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
  { platform: 'Instagram', url: 'https://instagram.com', icon: '📸' },
];

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Form submitted!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-form-container">
      <div className="contact-info">
        <h2>Connect With Us</h2>
       
        <p>Phone: +1 234 567 890</p>
        <p>Email: contact@example.com</p>
        <h3>Follow Us</h3>
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.icon} {link.platform}
            </a>
          ))}
        </div>
      </div>
      <div className="contact-form">
        {/* Talk to Us with SVG Icon */}
        <div className="talk-to-us">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10 21h4v-9h5v-4h-5v-5h-4v5h-5v4h5z" />
          </svg>
          <span>Talk To Us</span>
          
        </div>
         <p className="contact-text">
          We’d love to hear from you! Please fill out the form below to get in touch, and we’ll get back to you as soon as possible.
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
  );
};

export default ContactForm;

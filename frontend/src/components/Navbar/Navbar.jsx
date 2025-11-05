import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      {/* --- Top Info Bar --- */}
      <div className="top-info-bar">
        <div className="info-item">
          {/* Phone SVG */}
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
          <a href="tel:+254700000000">+254 700 000 000</a>
        </div>

        <div className="info-item">
          {/* Email SVG */}
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
          <a href="mailto:info@deliverancechurch.co.ke">
            info@deliverancechurch.co.ke
          </a>
        </div>

        <div className="info-item">
          {/* Address SVG */}
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
            className="icon icon-tabler icon-tabler-map-pin"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
          </svg>
          Litein, Kenya
        </div>

        {/* Add Sunday Service Time */}
        <div className="info-item service-time">
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
          Sunday Service: 9:00am to 12:30pm
        </div>
      </div>

      {/* --- Main Navbar --- */}
      <nav
        className={`navbar ${mobileMenuOpen ? "open" : "closed"}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="nav-logo">
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            aria-label="Go to Deliverance Church Litein home page"
            className={({ isActive }) =>
              isActive ? "active-link logo-link" : "logo-link"
            }
          >
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="Deliverance Church Litein logo"
              className="logo-img"
              loading="lazy"
            />
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <ul className="nav-links desktop-only" role="menubar">
          <li role="none">
            <NavLink
              to="/"
              role="menuitem"
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Home
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              to="/about"
              role="menuitem"
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              About
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              to="/sermons"
              role="menuitem"
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Sermons
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              to="/gallery"
              role="menuitem"
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Gallery
            </NavLink>
          </li>
          <li role="none">
            <NavLink
              to="/contact"
              role="menuitem"
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Donation Button */}
        <div className="nav-button desktop-only">
          <NavLink
            to="/give"
            className={({ isActive }) =>
              isActive ? "active-link give-button" : "give-button"
            }
            onClick={closeMobileMenu}
            aria-label="Donate to Deliverance Church Litein"
          >
            Give
          </NavLink>
        </div>

        {/* Hamburger for Mobile */}
        <button
          className={`hamburger mobile-only ${mobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle mobile menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <ul
        id="mobile-menu"
        className={`mobile-menu mobile-only ${mobileMenuOpen ? "open" : ""}`}
        role="menu"
      >
        <li>
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/sermons"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Sermons
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/gallery"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Gallery
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Contact
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/give"
            className={({ isActive }) =>
              isActive ? "active-link give-button" : "give-button"
            }
            onClick={closeMobileMenu}
          >
            Give
          </NavLink>
        </li>
      </ul>
    </header>
  );
}

export default Navbar;

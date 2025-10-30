import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      <nav
        className={`navbar ${mobileMenuOpen ? "open" : "closed"}`}
        aria-label="Main navigation"
      >
        {/* ✅ Logo with descriptive alt text */}
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
            {/* <span className="site-title">Deliverance Church Litein</span> */}
          </NavLink>
        </div>

        {/* ✅ Desktop navigation links */}
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

        {/* ✅ Donation button */}
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

        {/* ✅ Accessible hamburger button */}
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

      {/* ✅ Mobile menu with accessible structure */}
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

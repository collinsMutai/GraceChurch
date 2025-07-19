import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Sermons from "./components/pages/Sermons";
import Gallery from "./components/pages/Gallery";
import Donation from "./components/pages/Donation";
import Contact from "./components/pages/Contact";
import "./App.css";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`navbar ${mobileMenuOpen ? "open" : "closed"}`}>
        <div className="nav-logo">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "active-link logo-link" : "logo-link"
            }
            onClick={closeMobileMenu}
          >
            Grace Church
          </NavLink>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links desktop-only">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            About
          </NavLink>
          <NavLink
            to="/sermons"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Sermons
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Gallery
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Contact
          </NavLink>
        </div>

        <div className="nav-button desktop-only">
          <NavLink
            to="/donation"
            className="give-button"
            onClick={closeMobileMenu}
          >
            Give
          </NavLink>
        </div>

        {/* Hamburger button for mobile */}
        <button
          className={`hamburger mobile-only ${mobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile menu - slides down */}
      <div
        className={`mobile-menu mobile-only ${mobileMenuOpen ? "open" : ""}`}
      >
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={closeMobileMenu}
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={closeMobileMenu}
        >
          About
        </NavLink>
        <NavLink
          to="/sermons"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={closeMobileMenu}
        >
          Sermons
        </NavLink>
        <NavLink
          to="/gallery"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={closeMobileMenu}
        >
          Gallery
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={closeMobileMenu}
        >
          Contact
        </NavLink>
        <NavLink
          to="/donation"
          className="give-button"
          onClick={closeMobileMenu}
        >
          Give
        </NavLink>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}

export default App;

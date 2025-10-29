import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Sermons from "./components/Sermons/Sermons";
import Gallery from "./components/pages/Gallery";
import Donation from "./components/pages/Donation";
import Contact from "./components/pages/Contact";
import Footer from "./components/Footer/Footer"; // ✅ Added import
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
          <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active-link" : "")}>
            About
          </NavLink>
          <NavLink to="/sermons" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Sermons
          </NavLink>
          <NavLink to="/gallery" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Gallery
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active-link" : "")}>
            Contact
          </NavLink>
        </div>

        <div className="nav-button desktop-only">
          <NavLink to="/donation" className="give-button" onClick={closeMobileMenu}>
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

      {/* Mobile menu */}
      <div className={`mobile-menu mobile-only ${mobileMenuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "active-link" : "")}>
          Home
        </NavLink>
        <NavLink to="/about" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "active-link" : "")}>
          About
        </NavLink>
        <NavLink to="/sermons" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "active-link" : "")}>
          Sermons
        </NavLink>
        <NavLink to="/gallery" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "active-link" : "")}>
          Gallery
        </NavLink>
        <NavLink to="/contact" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "active-link" : "")}>
          Contact
        </NavLink>
        <NavLink to="/donation" className="give-button" onClick={closeMobileMenu}>
          Give
        </NavLink>
      </div>

      {/* App routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {/* ✅ Footer Component */}
      <Footer />
    </>
  );
}

export default App;

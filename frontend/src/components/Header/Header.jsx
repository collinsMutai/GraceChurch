import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = ({ title, imageUrl, breadcrumbs }) => {
  return (
    <header
      className="hero-section"
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      {/* Heading Text */}
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
      </div>

      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav">
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={index}>
            <Link to={breadcrumb.link}>{breadcrumb.text}</Link>
            {index < breadcrumbs.length - 1 && " / "}
          </span>
        ))}
      </nav>

      {/* Overlay */}
      <div className="hero-overlay"></div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from "react";
import "./ImageSlider.css";
import slide1 from "../../images/slider1.jpeg";
import slide2 from "../../images/slider2.jpeg";

const ImageSlider = () => {
  const images = [
    {
      src: slide1,
      alt: "Deliverance Church Litein - Sunday Service Worship",
      title: "Welcome to Deliverance Church Litein",
      subtitle: "Building Faith. Transforming Lives. Serving the Community.",
      description:
        "Discover a vibrant community of believers at Deliverance Church Litein. We are passionate about worship, discipleship, and outreach—empowering individuals to live out their God-given purpose.",
      ctaButtons: [
        { text: "Learn More", link: "/about" },
        { text: "Sermons", link: "/sermons" },
      ],
    },
    {
      src: slide2,
      alt: "Deliverance Church Litein - Community Outreach and Fellowship",
      title: "Connect Through Fellowship",
      subtitle: "Faith in Action. Hope Restored. Love Shared.",
      description:
        "From outreach to discipleship, our ministries impact lives daily. Join us and be part of a church that lives out the Gospel through service and compassion.",
      ctaButtons: [
        { text: "Get Involved", link: "/ministries" },
        { text: "Sermons", link: "/sermons" },
      ],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setFade(true);
    }, 500);
  };

  const prevSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setFade(true);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentImage = images[currentIndex];

  return (
    <header
      className="image-slider"
      role="banner"
      aria-label="Deliverance Church Litein image slider showcasing worship, community, and faith activities"
    >
      {/* Image + Overlay */}
      <div className="image-slider-wrapper">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          loading="lazy"
          className={`slider-image ${fade ? "fade-in" : "fade-out"}`}
        />
        <div className="image-overlay"></div>
      </div>

      {/* Header Content */}
      <div className={`header-content ${fade ? "fade-in" : "fade-out"}`}>
        <h1>{currentImage.title}</h1>
        <h2>{currentImage.subtitle}</h2>
        <p>{currentImage.description}</p>
        <div className="cta-buttons">
          {currentImage.ctaButtons.map((btn, idx) => (
            <a
              key={idx}
              href={btn.link}
              className={`cta-button ${
                btn.link === "/sermons" ? "transparent sermons-btn" : ""
              } ${btn.text === "Learn More" ? "learn-more-btn" : ""}`}
              aria-label={btn.text}
            >
              {btn.text}
              {btn.link === "/sermons" && (
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
                  class="icon icon-tabler icons-tabler-outline icon-tabler-bible"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12z" />
                  <path d="M19 16h-12a2 2 0 0 0 -2 2" />
                  <path d="M12 7v6" />
                  <path d="M10 9h4" />
                </svg>
              )}
              {btn.text === "Learn More" && (
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
                  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 12l14 0" />
                  <path d="M15 16l4 -4" />
                  <path d="M15 8l4 4" />
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button className="prev" onClick={prevSlide} aria-label="Previous Slide">
        &#10094;
      </button>
      <button className="next" onClick={nextSlide} aria-label="Next Slide">
        &#10095;
      </button>
    </header>
  );
};

export default ImageSlider;

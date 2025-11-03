// src/components/ImageSlider.js
import React, { useState, useEffect } from "react";
import "./ImageSlider.css"; // Importing CSS styles
import slide1 from "../../images/slider1.jpeg"; // Image 1
import slide2 from "../../images/slider2.jpeg"; // Image 2
// import slide3 from "../../images/slider3.jpeg"; // Uncomment if you have a 3rd image
// import slide4 from "../../images/slider4.jpeg"; // Uncomment if you have a 4th image

const ImageSlider = () => {
  // Array of images to display in the slider
  const images = [slide1, slide2]; // Add more images if needed

  const [currentIndex, setCurrentIndex] = useState(0); // Initial slide index

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Cycle through images
  };

  // Function to go to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1 // Loop back to the last image
    );
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  return (
    <header className="image-slider">
      {/* Image Wrapper */}
      <div className="image-slider-wrapper">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
      </div>

      {/* Header Content (Text and CTA Button) */}
      <div className="header-content">
        <h1>Welcome to Our Website</h1>
        <p>Your journey starts here. Explore our services!</p>
        <button className="cta-button">Learn More</button>
      </div>

      {/* Previous and Next Buttons */}
      <button className="prev" onClick={prevSlide}>
        &#10094; {/* Left Arrow */}
      </button>
      <button className="next" onClick={nextSlide}>
        &#10095; {/* Right Arrow */}
      </button>
    </header>
  );
};

export default ImageSlider;

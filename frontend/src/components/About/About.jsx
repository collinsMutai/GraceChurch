import React from 'react'; 
import Header from '../Header/Header';  // Import the Header component
import './About.css';  // Importing the About page CSS

import AboutImage from "../../images/img1.jpeg";  // Importing the background image
import HeaderImage from "../../images/slider1.jpeg";  // Importing the background image

const About = () => {
  const breadcrumbs = [
    { text: "Home", link: "/" },
    { text: "About Us", link: "/about" }
  ];

  return (
    <div>
      {/* Header Section with props */}
      <Header 
        title="About Us"
        imageUrl={HeaderImage}  // Passing the background image
        breadcrumbs={breadcrumbs}  // Passing breadcrumb data
      />

      {/* Main Content */}
      <section className="about-content">
        <div className="about-image">
          <img src={AboutImage} alt="About Us" />
        </div>
        <div className="about-text">
          <h2>Our Mission</h2>
          <p>
            Our mission is to deliver high-quality products and services that improve the lives of our users. 
            We focus on user-centric design and continuous innovation.
          </p>

          {/* Core Values Section */}
          <h2>Our Core Values</h2>
          <ul>
            <li><strong>Faith:</strong> We believe in the power of faith to transform lives.</li>
            <li><strong>Community:</strong> We are committed to building strong, supportive relationships.</li>
            <li><strong>Service:</strong> We strive to serve others and meet the needs of our community.</li>
            <li><strong>Integrity:</strong> We uphold honesty and transparency in all our actions.</li>
            <li><strong>Growth:</strong> We believe in personal and spiritual growth for everyone.</li>
          </ul>

          {/* Vision Section */}
          <h2>Our Vision</h2>
          <p>
            Our vision is to create a vibrant community where people can experience God's love and grow spiritually. 
            We aim to make a lasting impact by sharing the message of hope and love to those around us.
          </p>

          {/* Brief History Section */}
          <h2>Our History</h2>
          <p>
            Founded in 2000, our church has been dedicated to serving the local community with a focus on outreach, worship, 
            and spiritual growth. Over the years, we have expanded our reach, and today, we continue to impact lives through 
            ministries, events, and partnerships with other organizations.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;

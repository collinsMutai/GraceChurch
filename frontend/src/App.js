import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import Sermons from "./components/Sermons/Sermons";
import Gallery from "./components/Gallery/Gallery";
import Donation from "./components/pages/Donation";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ContactForm from "./components/ContactForm/ContactForm";
import AboutPage from "./components/pages/About";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/contact" element={<ContactForm />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Sermons from "./components/Sermons/Sermons";
import Gallery from "./components/pages/Gallery";
import Donation from "./components/pages/Donation";
import Contact from "./components/pages/Contact";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar"; 
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

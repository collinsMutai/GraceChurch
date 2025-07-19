import React from "react";
import LivePlayer from "./LivePlayer";
import TitheForm from "./TitheForm";

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome to Our Church</h1>

      <section style={styles.section}>
        <h2>Live Service</h2>
        {/* <LivePlayer /> */}
      </section>

      <section style={styles.section}>
        <h2>Give Tithe & Offering</h2>
        {/* <TitheForm /> */}
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginTop: "3rem",
  },
};

export default Home;

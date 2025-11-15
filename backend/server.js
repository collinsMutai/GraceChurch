// app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require('express-rate-limit');
const { serverLogger } = require("./utils/logger");
const sermonRoutes = require("./routes/sermonRoutes");
require("dotenv").config();

const app = express();

// Global Rate Limiting Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", apiLimiter);

// Middleware
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => serverLogger.info("✅ MongoDB connected"))
  .catch((err) => serverLogger.error("❌ MongoDB connection error", { error: err.stack || err.message }));

// Routes
app.use("/api/sermons", sermonRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  serverLogger.error("💥 Unhandled Error", { message: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  serverLogger.info(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;

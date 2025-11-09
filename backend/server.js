"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const { startCron } = require("./utils/cron");
const { fetchYouTubeSermons } = require("./utils/youtube");
const { fetchFacebookSermons } = require("./utils/facebook");
const Sermon = require("./models/Sermon");
const { serverLogger, liveLogger } = require("./utils/logger");

const app = express();

// ==== Middleware ==== 
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// ==== LOG_LEVEL handling ====
const logLevels = ["error", "warn", "info", "debug"];
const currentLevel = process.env.LOG_LEVEL || "info";
const shouldLog = (level) => logLevels.indexOf(level) <= logLevels.indexOf(currentLevel);

// ==== Request logging for modifying requests ====
app.use((req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method) && shouldLog("info")) {
    const maskedBody = { ...req.body };
    if (maskedBody.phone)
      maskedBody.phone = maskedBody.phone.replace(/(\d{3})\d{4}(\d{2})/, "$1****$2");
    serverLogger.info("📩 Request", {
      method: req.method,
      path: req.originalUrl,
      body: maskedBody,
      ip: req.ip,
    });
  }
  next();
});

// ==== MongoDB Connection ====
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    serverLogger.info("✅ MongoDB connected");

    try {
      const sermonCount = await Sermon.countDocuments();
      if (sermonCount === 0 && shouldLog("info")) {
        serverLogger.info("📥 Fetching initial sermons...");
        await Promise.all([fetchYouTubeSermons(), fetchFacebookSermons()]);
        serverLogger.info("✅ Initial sermons fetched");
      }
    } catch (err) {
      serverLogger.error("❌ Sermon fetch failed", { error: err.stack || err.message });
    }
  })
  .catch((err) => serverLogger.error("❌ MongoDB connection error", { error: err.stack || err.message }));

// ==== Live Stream Checks ====
let ytIsLive = false, fbIsLive = false;
let prevYtStatus = null, prevFbStatus = null;

// Retry logic for API requests with exponential backoff
const retryApiRequest = async (url, params, maxRetries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // Try the API request
      const res = await axios.get(url, { params });
      return res.data; // Return the response data if successful
    } catch (err) {
      attempt += 1;
      if (attempt < maxRetries) {
        // Log the retry attempt
        if (shouldLog("warn")) liveLogger.warn(`🔄 Retrying... Attempt ${attempt}`);
        await new Promise((resolve) => setTimeout(resolve, delay * attempt)); // Exponential backoff
      } else {
        // Log the final failure after max retries
        if (shouldLog("warn")) liveLogger.error("❌ API request failed after retries", { error: err.stack || err.message });
        throw err; // Throw error after exceeding retries
      }
    }
  }
};

// Function to check YouTube live status with retries and DB fallback
const checkYouTubeLive = async () => {
  const params = {
    part: "snippet",
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    eventType: "live",
    type: "video",
    key: process.env.YOUTUBE_API_KEY,
  };

  try {
    // Try to fetch the live status from the YouTube API
    const data = await retryApiRequest(
      "https://www.googleapis.com/youtube/v3/search", 
      params
    );

    ytIsLive = data.items?.length > 0;
    if (ytIsLive !== prevYtStatus) {
      prevYtStatus = ytIsLive;
      if (shouldLog("info")) liveLogger.info(`🎥 YouTube is now ${ytIsLive ? "LIVE" : "offline"}`);
    }
  } catch (err) {
    // Fallback to database if YouTube API fails
    try {
      const lastYtSermon = await Sermon.findOne({ source: 'youtube' }).sort({ publishedAt: -1 }).lean();
      if (lastYtSermon) {
        ytIsLive = true;
        if (shouldLog("info")) liveLogger.info(`⚠️ Fallback to DB: YouTube live status assumed as LIVE. Last sermon: ${lastYtSermon.title}`);
      } else {
        ytIsLive = false;
        if (shouldLog("info")) liveLogger.info("⚠️ Fallback to DB: No YouTube sermons found in DB. Marking as offline.");
      }
    } catch (dbError) {
      if (shouldLog("error")) liveLogger.error("❌ DB fallback failed", { error: dbError.stack || dbError.message });
      ytIsLive = false; // Mark as offline if DB fails
    }
  }
};

const checkFacebookLive = async () => {
  const params = {
    status: "LIVE_NOW",
    access_token: process.env.FACEBOOK_ACCESS_TOKEN,
  };

  try {
    // Try to fetch the live status from the Facebook API
    const data = await retryApiRequest(
      `https://graph.facebook.com/v17.0/${process.env.FACEBOOK_PAGE_ID}/live_videos`, 
      params
    );

    console.log("Facebook API Response:", data);

    // If no live videos are found or the status is not LIVE_NOW
    if (data.data && data.data.length > 0) {
      const liveVideo = data.data[0];
      if (liveVideo.status === "LIVE_NOW") {
        fbIsLive = true;
        if (shouldLog("info")) liveLogger.info(`🎬 Facebook is now LIVE. Video ID: ${liveVideo.id}`);
      } else {
        fbIsLive = false;
        if (shouldLog("info")) liveLogger.info("⚠️ Facebook live status is not LIVE_NOW. Current status: " + liveVideo.status);
      }
    } else {
      fbIsLive = false;
      if (shouldLog("info")) liveLogger.info("⚠️ No live video found on Facebook.");
    }
  } catch (err) {
    // Fallback to database if Facebook API fails
    try {
      const lastFbSermon = await Sermon.findOne({ source: 'facebook' }).sort({ publishedAt: -1 }).lean();
      if (lastFbSermon) {
        fbIsLive = true;
        if (shouldLog("info")) liveLogger.info(`⚠️ Fallback to DB: Facebook live status assumed as LIVE. Last sermon: ${lastFbSermon.title}`);
      } else {
        fbIsLive = false;
        if (shouldLog("info")) liveLogger.info("⚠️ Fallback to DB: No Facebook sermons found in DB. Marking as offline.");
      }
    } catch (dbError) {
      if (shouldLog("error")) liveLogger.error("❌ DB fallback failed", { error: dbError.stack || dbError.message });
      fbIsLive = false; // Mark as offline if DB fails
    }
  }
};


// Run every 2 minutes
setInterval(() => {
  checkYouTubeLive();
  checkFacebookLive();
}, 120000);

// ==== Routes ====
app.use("/api/sermons", require("./routes/sermonRoutes"));
app.use("/api/mpesa", require("./routes/mpesaRoutes"));

app.get("/api/live-status", (req, res) => {
  res.json({ youtube: { isLive: ytIsLive }, facebook: { isLive: fbIsLive } });
});

// ==== Global Error Handler ====
app.use((err, req, res, next) => {
  if (shouldLog("error"))
    serverLogger.error("💥 Unhandled Error", { message: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ==== Catch all uncaught exceptions & unhandled rejections ====
process.on("uncaughtException", (err) => {
  serverLogger.error("💀 Uncaught Exception", { error: err.stack || err.message });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  serverLogger.error("💀 Unhandled Rejection", { reason, promise });
});

// ==== Start Server conditionally ====
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    if (shouldLog("info")) serverLogger.info(`🚀 Server running on http://localhost:${PORT}`);
    startCron(true);
  });
}

// Export the app for testing
module.exports = app;

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

const checkYouTubeLive = async () => {
  try {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        channelId: process.env.YOUTUBE_CHANNEL_ID,
        eventType: "live",
        type: "video",
        key: process.env.YOUTUBE_API_KEY,
      },
    });
    ytIsLive = res.data.items?.length > 0;
    if (ytIsLive !== prevYtStatus) {
      prevYtStatus = ytIsLive;
      if (shouldLog("info")) liveLogger.info(`🎥 YouTube is now ${ytIsLive ? "LIVE" : "offline"}`);
    }
  } catch (err) {
    if (shouldLog("warn")) liveLogger.error("❌ YouTube Check Error", { error: err.stack || err.message });
  }
};

const checkFacebookLive = async () => {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v17.0/${process.env.FACEBOOK_PAGE_ID}/live_videos`,
      { params: { status: "LIVE_NOW", access_token: process.env.FACEBOOK_ACCESS_TOKEN } }
    );
    fbIsLive = res.data.data?.length > 0;
    if (fbIsLive !== prevFbStatus) {
      prevFbStatus = fbIsLive;
      if (shouldLog("info")) liveLogger.info(`🎬 Facebook is now ${fbIsLive ? "LIVE" : "offline"}`);
    }
  } catch (err) {
    if (shouldLog("warn")) liveLogger.error("❌ Facebook Check Error", { error: err.stack || err.message });
  }
};

// run every 2 minutes
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
// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    if (shouldLog("info")) serverLogger.info(`🚀 Server running on http://localhost:${PORT}`);
    startCron(true);
  });
}

// Export the app for testing
module.exports = app;

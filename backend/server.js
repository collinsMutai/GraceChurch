const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const { initiateSTKPush } = require("./stk");
const sermonRoutes = require("./routes/sermonRoutes");
const { startCron } = require("./utils/cron");

// Import fetch functions and Sermon model
const { fetchYouTubeSermons } = require("./utils/youtube");
const { fetchFacebookSermons } = require("./utils/facebook");
const Sermon = require("./models/Sermon");

const app = express();
app.use(cors());
app.use(express.json());

// ==== Connect to MongoDB ====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Check if sermons collection is empty on server start
    const sermonCount = await Sermon.countDocuments();
    if (sermonCount === 0) {
      console.log("No sermons found. Fetching initial sermons from YouTube and Facebook...");
      try {
        await Promise.all([fetchYouTubeSermons(), fetchFacebookSermons()]);
        console.log("✅ Initial sermons fetched successfully");
      } catch (err) {
        console.error("Error fetching initial sermons:", err.message);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ==== Live Stream Status ====
let ytIsLive = false;
let ytVideoId = null;
let fbIsLive = false;
let fbVideoId = null;
let lastChecked = null;

// YouTube Live check
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
    const items = res.data.items;
    ytIsLive = items && items.length > 0;
    ytVideoId = ytIsLive ? items[0].id.videoId : null;
  } catch (err) {
    console.error("YouTube error:", err.message);
  }
};

// Facebook Live check
const checkFacebookLive = async () => {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v17.0/${process.env.FACEBOOK_PAGE_ID}/live_videos`,
      {
        params: {
          status: "LIVE_NOW",
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        },
      }
    );
    const data = res.data.data;
    fbIsLive = data && data.length > 0;
    fbVideoId = fbIsLive ? data[0].id : null;
  } catch (err) {
    console.error("Facebook error:", err.message);
  }
};

// Combined checker
const checkLiveStatus = async () => {
  await Promise.all([checkYouTubeLive(), checkFacebookLive()]);
  lastChecked = new Date();
};
checkLiveStatus();
setInterval(checkLiveStatus, 120000); // every 2 mins

// ==== Routes ====
app.use("/api/sermons", sermonRoutes);

app.get("/api/live-status", (req, res) => {
  res.json({
    youtube: { isLive: ytIsLive, videoId: ytVideoId },
    facebook: { isLive: fbIsLive, liveVideoId: fbVideoId },
    lastChecked,
  });
});

app.post("/api/mpesa/pay", async (req, res) => {
  const { phoneNumber, amount } = req.body;
  try {
    const result = await initiateSTKPush(phoneNumber, amount);
    res.json({ message: "STK Push Sent", result });
  } catch (err) {
    console.error("STK error:", err.message);
    res.status(500).json({ error: "STK Push Failed" });
  }
});

app.post("/api/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback:", req.body);
  res.sendStatus(200);
});

// ==== Start Server ====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

// ==== Start Cron ====
startCron();

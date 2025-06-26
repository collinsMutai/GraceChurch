const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { initiateSTKPush } = require("./stk");

const app = express();
app.use(cors());
app.use(express.json());

// ==== Config ====
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";
const YOUTUBE_CHANNEL_ID = "YOUR_YOUTUBE_CHANNEL_ID";
const FACEBOOK_PAGE_ID = "YOUR_FACEBOOK_PAGE_ID";
const FACEBOOK_ACCESS_TOKEN = "YOUR_FACEBOOK_PAGE_ACCESS_TOKEN";

// ==== Live Status State ====
let ytIsLive = false;
let ytVideoId = null;
let fbIsLive = false;
let fbVideoId = null;
let lastChecked = null;

// ==== YouTube Live Check ====
const checkYouTubeLive = async () => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          channelId: YOUTUBE_CHANNEL_ID,
          eventType: "live",
          type: "video",
          key: YOUTUBE_API_KEY,
        },
      }
    );
    const items = res.data.items;
    ytIsLive = items && items.length > 0;
    ytVideoId = ytIsLive ? items[0].id.videoId : null;
  } catch (err) {
    console.error("YouTube error:", err.message);
  }
};

// ==== Facebook Live Check ====
const checkFacebookLive = async () => {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/v17.0/${FACEBOOK_PAGE_ID}/live_videos`,
      {
        params: {
          status: "LIVE_NOW",
          access_token: FACEBOOK_ACCESS_TOKEN,
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

// ==== Periodic Polling ====
const checkLiveStatus = async () => {
  await Promise.all([checkYouTubeLive(), checkFacebookLive()]);
  lastChecked = new Date();
};
checkLiveStatus();
setInterval(checkLiveStatus, 120000); // every 2 minutes

// ==== API Routes ====
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
    console.error("STK error:", err.response?.data || err.message);
    res.status(500).json({ error: "STK Push Failed" });
  }
});

app.post("/api/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback:", req.body);
  res.sendStatus(200);
});

app.listen(3001, () =>
  console.log("✅ Server running on http://localhost:3001")
);

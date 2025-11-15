// sermonController.js

const axios = require("axios");
const Sermon = require("../models/Sermon");
const { fetchYouTubeSermons } = require("../utils/youtube");
const { fetchFacebookSermons } = require("../utils/facebook");

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

// Retry logic for API requests with exponential backoff
const retryApiRequest = async (url, params, maxRetries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await axios.get(url, { params });
      return res.data;
    } catch (err) {
      attempt += 1;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt)); // Exponential backoff
      } else {
        throw err;
      }
    }
  }
};

// Fetch Facebook live video status
const fetchLiveVideo = async () => {
  try {
    const url = `https://graph.facebook.com/v12.0/${FACEBOOK_PAGE_ID}/live`;
    const response = await axios.get(url, {
      params: {
        access_token: FACEBOOK_ACCESS_TOKEN,
        fields: 'id, status, permalink_url',
      },
    });

    const liveVideo = response.data.data.find((video) => video.status === "LIVE");

    if (liveVideo) {
      return {
        platform: 'Facebook',
        liveVideoUrl: `https://www.facebook.com/${FACEBOOK_PAGE_ID}/videos/${liveVideo.id}/`,
        status: 'LIVE',
      };
    } else {
      return { platform: 'Facebook', status: 'NOT_LIVE', message: 'No live video is currently streaming.' };
    }
  } catch (err) {
    return { platform: 'Facebook', error: 'Failed to fetch live video from Facebook' };
  }
};

// YouTube live status checking function
const checkYouTubeLive = async () => {
  const params = {
    part: "snippet",
    channelId: YOUTUBE_CHANNEL_ID,
    eventType: "live",
    type: "video",
    key: YOUTUBE_API_KEY,
  };

  try {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", { params });
    if (res.data.items.length > 0) {
      const liveVideo = res.data.items[0];
      const liveVideoUrl = `https://www.youtube.com/watch?v=${liveVideo.id.videoId}`;
      return {
        platform: 'YouTube',
        liveVideoUrl,
        status: 'LIVE',
      };
    } else {
      return { platform: 'YouTube', status: 'NOT_LIVE', message: 'No live video on YouTube' };
    }
  } catch (err) {
    return { platform: 'YouTube', error: 'Failed to fetch live video from YouTube' };
  }
};

// Get all sermons with pagination and live statuses
const getSermons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const skip = (page - 1) * limit;

    const [sermons, total] = await Promise.all([
      Sermon.find({}, "title videoId thumbnail description publishedAt permalink source")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sermon.estimatedDocumentCount(),
    ]);

    const facebookLive = await fetchLiveVideo();
    const youtubeLive = await checkYouTubeLive();

    const result = { sermons, total, facebookLive, youtubeLive };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
};

// Refresh sermons by fetching from YouTube and Facebook
const refreshSermons = async (req, res) => {
  try {
    const results = await Promise.allSettled([fetchYouTubeSermons(), fetchFacebookSermons()]);
    const status = results.map((r) => r.status);
    res.json({ message: "Sermons refreshed", status });
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh sermons" });
  }
};

module.exports = { getSermons, refreshSermons, fetchLiveVideo, checkYouTubeLive };

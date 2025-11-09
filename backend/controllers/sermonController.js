const axios = require("axios");
const Sermon = require("../models/Sermon");
const { fetchYouTubeSermons } = require("../utils/youtube");
const { fetchFacebookSermons } = require("../utils/facebook");

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

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
    console.error('Error fetching live video from Facebook:', err.message);
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
    console.error("Error checking YouTube live status:", err.message);
    return { platform: 'YouTube', error: 'Failed to fetch live video from YouTube' };
  }
};

const getSermons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const skip = (page - 1) * limit;

    // Query MongoDB efficiently to fetch sermons with pagination
    const [sermons, total] = await Promise.all([
      Sermon.find({}, "title videoId thumbnail description publishedAt permalink source")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sermon.estimatedDocumentCount(),
    ]);

    // Fetch live video status for both Facebook and YouTube
    const facebookLive = await fetchLiveVideo();
    const youtubeLive = await checkYouTubeLive();

    // Combine sermons and live video status into the result
    const result = { sermons, total, facebookLive, youtubeLive };

    res.json(result);
  } catch (err) {
    console.error("Get sermons error:", err.message);
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
};

// const refreshSermons = async (req, res) => {
//   try {
//     const results = await Promise.allSettled([fetchYouTubeSermons(), fetchFacebookSermons()]);

//     const status = results.map((r) => r.status);
//     res.json({ message: "Sermons refreshed", status });
//   } catch (err) {
//     console.error("Refresh sermons error:", err.message);
//     res.status(500).json({ error: "Failed to refresh sermons" });
//   }
// };

module.exports = { getSermons, fetchLiveVideo };

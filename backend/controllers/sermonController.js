const axios = require("axios");
const Sermon = require("../models/Sermon");
const NodeCache = require("node-cache");
const { fetchYouTubeSermons } = require("../utils/youtube");
const { fetchFacebookSermons } = require("../utils/facebook");

// In-memory cache (TTL: 5 min)
const sermonCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN } = process.env;

/**
 * Fetch the current live video stream from Facebook
 */
const fetchLiveVideo = async () => {
  try {
    const url = `https://graph.facebook.com/v12.0/${FACEBOOK_PAGE_ID}/live_videos`;
    const response = await axios.get(url, {
      params: {
        access_token: FACEBOOK_ACCESS_TOKEN,
        fields: 'id, status, permalink_url',
      },
    });

    const liveVideo = response.data.data.find((video) => video.status === "LIVE");

    if (liveVideo) {
      return {
        liveVideoUrl: `https://www.facebook.com/${FACEBOOK_PAGE_ID}/videos/${liveVideo.id}/`,
        status: 'LIVE',
      };
    } else {
      return { message: 'No live video is currently streaming.', status: 'NOT_LIVE' };
    }
  } catch (err) {
    console.error('Error fetching live video:', err.message);
    return { error: 'Failed to fetch live video' };
  }
};

/**
 * Get sermons (with pagination) and optional live video feed
 */
exports.getSermons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const skip = (page - 1) * limit;

    const cacheKey = `sermons_page_${page}_${limit}`;

    // ✅ 1. Check in-memory cache first
    const cached = sermonCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // ✅ 2. Query Mongo efficiently
    const [sermons, total] = await Promise.all([
      Sermon.find({}, "title videoId thumbnail publishedAt permalink source")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sermon.estimatedDocumentCount(),
    ]);

    // Fetch live video (optional)
    const liveVideo = await fetchLiveVideo();

    const result = { sermons, total, liveVideo };

    // ✅ 3. Cache result for quick reuse
    sermonCache.set(cacheKey, result);

    res.json(result);
  } catch (err) {
    console.error("Get sermons error:", err.message);
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
};

/**
 * Manual refresh (admin trigger) for refreshing sermons from external sources
 * - Fetches sermons from YouTube and Facebook (via background fetch functions)
 * - Clears cache after refresh to ensure fresh data
 */
exports.refreshSermons = async (req, res) => {
  try {
    const results = await Promise.allSettled([
      fetchYouTubeSermons(),
      fetchFacebookSermons(),
    ]);

    // Clear cache after refresh to ensure fresh data
    sermonCache.flushAll();

    const status = results.map((r) => r.status);
    res.json({ message: "Sermons refreshed", status });
  } catch (err) {
    console.error("Refresh sermons error:", err.message);
    res.status(500).json({ error: "Failed to refresh sermons" });
  }
};

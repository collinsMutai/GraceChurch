const Sermon = require("../models/Sermon");
const NodeCache = require("node-cache");
const { fetchYouTubeSermons } = require("../utils/youtube");
const { fetchFacebookSermons } = require("../utils/facebook");

// In-memory cache (TTL: 5 min)
const sermonCache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Get sermons (with pagination)
 * - Adds in-memory caching to prevent redundant DB queries
 * - Uses lean() for faster read performance
 * - Uses projection to only fetch required fields
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
        .lean(), // returns plain JS objects, much faster than full mongoose docs
      Sermon.estimatedDocumentCount(), // faster than countDocuments() when no filters
    ]);

    const result = { sermons, total };

    // ✅ 3. Cache result for quick reuse
    sermonCache.set(cacheKey, result);

    res.json(result);
  } catch (err) {
    console.error("Get sermons error:", err.message);
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
};

/**
 * Manual refresh (admin trigger)
 * - Parallel fetching with Promise.allSettled (doesn’t fail if one source fails)
 * - Clears cache after refresh to ensure fresh data
 */
exports.refreshSermons = async (req, res) => {
  try {
    const results = await Promise.allSettled([
      fetchYouTubeSermons(),
      fetchFacebookSermons(),
    ]);

    // Clear cache after refresh
    sermonCache.flushAll();

    const status = results.map((r) => r.status);
    res.json({ message: "Sermons refreshed", status });
  } catch (err) {
    console.error("Refresh sermons error:", err.message);
    res.status(500).json({ error: "Failed to refresh sermons" });
  }
};

const Sermon = require("../models/Sermon");
const { fetchYouTubeSermons } = require("../utils/youtube");
const { fetchFacebookSermons } = require("../utils/facebook");

// Get sermons (with pagination)
exports.getSermons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const sermons = await Sermon.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Sermon.countDocuments();

    res.json({ sermons, total });
  } catch (err) {
    console.error("Get sermons error:", err.message);
    res.status(500).json({ error: "Failed to fetch sermons" });
  }
};

// Manual refresh (admin trigger)
exports.refreshSermons = async (req, res) => {
  try {
    await Promise.all([fetchYouTubeSermons(), fetchFacebookSermons()]);
    res.json({ message: "Sermons refreshed successfully" });
  } catch (err) {
    console.error("Refresh sermons error:", err.message);
    res.status(500).json({ error: "Failed to refresh sermons" });
  }
};

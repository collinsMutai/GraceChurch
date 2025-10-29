const axios = require("axios");
const Sermon = require("../models/Sermon");
require("dotenv").config();

const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

exports.fetchYouTubeSermons = async () => {
  try {
    const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: YOUTUBE_API_KEY,
        channelId: YOUTUBE_CHANNEL_ID,
        part: "snippet",
        order: "date",
        maxResults: 20,
        type: "video",
      },
    });

    if (!data.items?.length) return;

    const videos = data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      source: "youtube",
    }));

    // ✅ Use bulkWrite for efficiency
    const bulkOps = videos.map((v) => ({
      updateOne: {
        filter: { videoId: v.videoId },
        update: { $setOnInsert: v },
        upsert: true,
      },
    }));

    await Sermon.bulkWrite(bulkOps);
    console.log(`✅ YouTube sermons synced (${videos.length})`);
  } catch (err) {
    console.error("YouTube sync error:", err.message);
  }
};

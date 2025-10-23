const axios = require("axios");
const Sermon = require("../models/Sermon");
require("dotenv").config();

const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

exports.fetchYouTubeSermons = async () => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search`;
    const { data } = await axios.get(url, {
      params: {
        key: YOUTUBE_API_KEY,
        channelId: YOUTUBE_CHANNEL_ID,
        part: "snippet",
        order: "date",
        maxResults: 10,
        type: "video",
      },
    });

    for (const item of data.items) {
      const exists = await Sermon.findOne({ videoId: item.id.videoId });
      if (!exists) {
        await Sermon.create({
          title: item.snippet.title,
          videoId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.high.url,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          source: "youtube",
        });
      }
    }
    console.log("✅ YouTube sermons synced");
  } catch (err) {
    console.error("YouTube sync error:", err.message);
  }
};

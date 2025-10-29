const axios = require("axios");
const Sermon = require("../models/Sermon");
require("dotenv").config();

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN } = process.env;

/**
 * Fetch all Facebook videos in batches and upsert them efficiently
 */
exports.fetchFacebookSermons = async () => {
  try {
    console.log("📘 Fetching Facebook sermons...");

    let url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/videos`;
    let totalInserted = 0;

    // Paginate until no more results
    while (url) {
      const { data } = await axios.get(url, {
        params: {
          fields: "id,title,description,created_time,permalink_url,thumbnails",
          access_token: FACEBOOK_ACCESS_TOKEN,
          limit: 25,
        },
      });

      const videos = (data.data || []).map((vid) => ({
        title: vid.title || "Untitled Sermon",
        videoId: vid.id,
        thumbnail: vid.thumbnails?.data?.[0]?.uri || "",
        description: vid.description || "",
        publishedAt: vid.created_time,
        permalink: vid.permalink_url,
        source: "facebook",
      }));

      if (videos.length > 0) {
        const bulkOps = videos.map((v) => ({
          updateOne: {
            filter: { videoId: v.videoId },
            update: { $setOnInsert: v },
            upsert: true,
          },
        }));
        const result = await Sermon.bulkWrite(bulkOps);
        totalInserted += result.upsertedCount || 0;
      }

      url = data.paging?.next || null; // next page if available
    }

    console.log(`✅ Facebook sermons synced (${totalInserted} new)`);

  } catch (err) {
    console.error("❌ Facebook sync error:", err.message);
  }
};

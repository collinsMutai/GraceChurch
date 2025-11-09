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
    let retries = 3;

    // Paginate until no more results
    while (url) {
      try {
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
          publishedAt: new Date(vid.created_time),
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

          // Bulk upsert the data
          const result = await Sermon.bulkWrite(bulkOps);
          totalInserted += result.upsertedCount || 0;
          console.log(`Inserted ${result.upsertedCount} new sermons in this batch.`);
        }

        // Move to the next page if available
        url = data.paging?.next || null;

        // Reset retry count if successful
        retries = 3;
      } catch (err) {
        // Retry mechanism in case of error
        if (retries > 0) {
          console.error(`❌ Error fetching Facebook sermons, retrying... (${retries} attempts left)`);
          retries -= 1;
          const delay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error("❌ Facebook sync error after multiple retries:", err.message);
          break; // Exit the loop after retries are exhausted
        }
      }
    }

    console.log(`✅ Facebook sermons synced (${totalInserted} new)`);

  } catch (err) {
    console.error("❌ General Facebook sync error:", err.message);
  }
};

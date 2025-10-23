const axios = require("axios");
const Sermon = require("../models/Sermon");
require("dotenv").config();

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN } = process.env;

exports.fetchFacebookSermons = async () => {
  try {
    const url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/videos`;
    const { data } = await axios.get(url, {
      params: {
        fields: "id,title,description,created_time,permalink_url,thumbnails",
        access_token: FACEBOOK_ACCESS_TOKEN,
      },
    });

    for (const vid of data.data) {
      const exists = await Sermon.findOne({ videoId: vid.id });
      if (!exists) {
        await Sermon.create({
          title: vid.title || "Untitled Sermon",
          videoId: vid.id,
          thumbnail: vid.thumbnails?.data?.[0]?.uri || "",
          description: vid.description || "",
          publishedAt: vid.created_time,
          permalink: vid.permalink_url,
          source: "facebook",
        });
      }
    }
    console.log("✅ Facebook sermons synced");
  } catch (err) {
    console.error("Facebook sync error:", err.message);
  }
};

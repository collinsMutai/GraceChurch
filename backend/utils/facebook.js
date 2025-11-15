const axios = require("axios");
const Sermon = require("../models/Sermon");
require("dotenv").config();

const { FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN } = process.env;

// Max batch size for bulk writes
const MAX_BATCH_SIZE = 100;  // Start with a smaller batch size, adjust based on server capabilities
const MAX_RETRIES = 5;  // Maximum number of retries for API calls
let RATE_LIMIT_THRESHOLD = 10;  // Initial threshold for rate limit (adjust dynamically)
let PAUSE_TIME = 60000;  // Initial pause time (in ms) when rate limit is close to being hit

// Function to handle rate limiting based on the headers from Facebook API
const checkRateLimit = (remainingRequests, remainingPageRequests) => {
  if (remainingRequests <= RATE_LIMIT_THRESHOLD || remainingPageRequests <= RATE_LIMIT_THRESHOLD) {
    console.log("⚠️ Rate limit is low. Pausing requests...");
    return true;  // Indicates we should pause further requests
  }
  return false;
};

// Function to dynamically adjust rate limiting parameters
const adjustRateLimiting = () => {
  if (RATE_LIMIT_THRESHOLD <= 5) {
    console.log("💡 Adjusting rate limit behavior: Increasing the pause time and threshold.");
    RATE_LIMIT_THRESHOLD = Math.min(50, RATE_LIMIT_THRESHOLD + 10);  // Gradually increase the threshold
    PAUSE_TIME = Math.min(120000, PAUSE_TIME + 30000);  // Increase pause time (up to 2 minutes)
    console.log(`🔧 New RATE_LIMIT_THRESHOLD: ${RATE_LIMIT_THRESHOLD}, PAUSE_TIME: ${PAUSE_TIME / 1000}s`);
  }
};

// Function to handle rate limiting with reset logic
const waitForRateLimitReset = async (resetTime) => {
  const now = Math.floor(Date.now() / 1000);  // Current time in seconds
  const waitTime = Math.max(0, resetTime - now + 1); // Wait until rate limit resets
  console.log(`⏳ Rate limit exceeded. Waiting for ${waitTime} seconds before retrying...`);
  await new Promise(resolve => setTimeout(resolve, waitTime * 1000));  // Wait before retrying
};

// Fetch all Facebook videos in batches and upsert them efficiently
exports.fetchFacebookSermons = async () => {
  try {
    console.log("📘 Fetching Facebook sermons...");

    let url = `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/videos`;
    let totalInserted = 0;
    let retries = MAX_RETRIES;

    // Paginate until no more results
    while (url) {
      try {
        const { data, headers } = await axios.get(url, {
          params: {
            fields: "id,title,description,created_time,permalink_url,thumbnails",
            access_token: FACEBOOK_ACCESS_TOKEN,
            limit: 25,  // Facebook Graph API limit per page (max is 25)
          },
        });

        // Extract rate limit information from response headers
        const remainingRequests = parseInt(headers['x-app-usage']?.split('/')[0] || '0');
        const remainingPageRequests = parseInt(headers['x-page-usage']?.split('/')[0] || '0');
        const rateLimitReset = parseInt(headers['x-rate-limit-reset'] || '0');  // Get reset time for rate limit

        console.log(`Rate limit remaining: App Usage: ${remainingRequests}, Page Usage: ${remainingPageRequests}`);

        // If rate limit is close to zero, pause further requests and adjust rate limiting behavior
        if (checkRateLimit(remainingRequests, remainingPageRequests)) {
          adjustRateLimiting();
          console.log(`⏳ Pausing for ${PAUSE_TIME / 1000} seconds to avoid hitting rate limit...`);
          await new Promise(resolve => setTimeout(resolve, PAUSE_TIME));  // Wait before retrying
          continue;  // Skip processing the current batch and move to the next loop
        }

        // If rate limit exceeded, wait until reset time
        if (remainingRequests <= 0 || remainingPageRequests <= 0) {
          await waitForRateLimitReset(rateLimitReset);
          continue;  // Skip current batch and retry after the wait
        }

        // Extract video data
        const videos = (data.data || []).map((vid) => ({
          title: vid.title || "Untitled Sermon",
          videoId: vid.id,
          thumbnail: vid.thumbnails?.data?.[0]?.uri || "",
          description: vid.description || "",
          publishedAt: new Date(vid.created_time),
          permalink: vid.permalink_url || "",
          source: "facebook",
        }));

        if (videos.length > 0) {
          const bulkOps = [];
          // Split the videos into chunks of max batch size
          for (let i = 0; i < videos.length; i += MAX_BATCH_SIZE) {
            const chunk = videos.slice(i, i + MAX_BATCH_SIZE);
            const batch = chunk.map((v) => ({
              updateOne: {
                filter: { videoId: v.videoId },
                update: { $setOnInsert: v },
                upsert: true,
              },
            }));
            bulkOps.push(...batch);

            // Execute the bulk operation if the batch size has reached the maximum
            if (bulkOps.length >= MAX_BATCH_SIZE) {
              const result = await Sermon.bulkWrite(bulkOps);
              totalInserted += result.upsertedCount || 0;
              console.log(`Inserted ${result.upsertedCount} new sermons in this batch.`);
              bulkOps.length = 0; // Reset the bulkOps array
            }
          }

          // Insert any remaining operations that were not executed
          if (bulkOps.length > 0) {
            const result = await Sermon.bulkWrite(bulkOps);
            totalInserted += result.upsertedCount || 0;
            console.log(`Inserted ${result.upsertedCount} new sermons in the final batch.`);
          }
        }

        // Move to the next page if available
        url = data.paging?.next || null;

        // Reset retry count after successful operation
        retries = MAX_RETRIES;
      } catch (err) {
        // Retry mechanism in case of error
        if (retries > 0) {
          console.error(`❌ Error fetching Facebook sermons, retrying... (${retries} attempts left)`);
          retries -= 1;
          const delay = Math.pow(2, MAX_RETRIES - retries) * 1000; // Exponential backoff
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

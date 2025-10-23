const cron = require("node-cron");
const { fetchYouTubeSermons } = require("./youtube");
const { fetchFacebookSermons } = require("./facebook");

exports.startCron = () => {
  // Runs every Sunday at 2PM
  cron.schedule("0 14 * * SUN", async () => {
    console.log("🕒 Weekly sermon sync started...");
    await Promise.all([fetchYouTubeSermons(), fetchFacebookSermons()]);
    console.log("✅ Weekly sermon sync complete");
  });
};

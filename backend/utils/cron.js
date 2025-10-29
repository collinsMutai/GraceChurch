const cron = require("node-cron");
const { fetchYouTubeSermons } = require("./youtube");
const { fetchFacebookSermons } = require("./facebook");

let isRunning = false;

/** Helper to safely run a sync job with retry + logging */
async function safeRun(taskName, fn, retries = 2) {
  const start = Date.now();
  console.log(`⏳ ${taskName} started...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`✅ ${taskName} completed in ${duration}s`);
      return;
    } catch (err) {
      console.error(`❌ ${taskName} failed (attempt ${attempt}):`, err.message);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
}

/** Trigger the actual sync safely */
async function runSermonSync() {
  if (isRunning) {
    console.warn("⚠️ Skipping sync: previous run still active");
    return;
  }
  isRunning = true;
  console.log("🕒 Sermon sync started...");

  try {
    await Promise.allSettled([
      safeRun("YouTube Sync", fetchYouTubeSermons),
      safeRun("Facebook Sync", fetchFacebookSermons),
    ]);
  } finally {
    isRunning = false;
    console.log("🏁 Sermon sync finished.");
  }
}

/** Schedule weekly cron + optional immediate run */
exports.startCron = (runImmediately = false) => {
  // Run every Sunday at 2 PM
  cron.schedule("0 14 * * SUN", runSermonSync);
  console.log("✅ Weekly sermon sync scheduled (Sunday 2 PM)");

  // Optional: immediate run on deploy/startup
  if (runImmediately) {
    runSermonSync()
      .then(() => console.log("🚀 Initial sermon sync complete"))
      .catch(err => console.error("Initial sync error:", err.message));
  }
};

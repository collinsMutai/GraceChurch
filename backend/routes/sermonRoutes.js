// routes/sermonRoutes.js
const express = require("express");
const router = express.Router();
const { getSermons, fetchLiveVideo } = require("../controllers/sermonController");

// Define your routes properly
router.get("/", getSermons);
// router.post("/refresh", refreshSermons); 
router.get("/live", fetchLiveVideo); // for admin or cron trigger

module.exports = router;

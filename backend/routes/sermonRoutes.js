// sermonRoutes.js

const express = require("express");
const router = express.Router();
const { getSermons, refreshSermons } = require("../controllers/sermonController");

// Route to get sermons with live statuses
router.get("/", getSermons);

// Route to refresh sermons from YouTube and Facebook
router.post("/refresh", refreshSermons);

module.exports = router;

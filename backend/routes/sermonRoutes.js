const express = require("express");
const router = express.Router();
const { getSermons, refreshSermons } = require("../controllers/sermonController");

router.get("/", getSermons);
router.post("/refresh", refreshSermons); // for admin or cron trigger

module.exports = router;

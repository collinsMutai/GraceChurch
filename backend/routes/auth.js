const express = require('express');
const router = express.Router();
const { createGuestToken } = require('../utils/jwt');

// GET /api/auth/guest-token
router.get('/guest-token', (req, res) => {
  const token = createGuestToken();
  return res.json({ token });
});

module.exports = router;

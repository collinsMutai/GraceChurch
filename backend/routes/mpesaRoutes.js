// mpesaRoutes.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verifyGuestToken } = require("../utils/jwt"); // ✅ import middleware

const { stkPush, callback, status } = require("../controllers/mpesaController"); // import controller

// === STK Push Rate Limiter ===
const stkPushLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many STK push requests. Please try again later.",
  },
});

// === STK Push Route (Protected with JWT and Rate Limiter) ===
router.post("/stkpush", verifyGuestToken, stkPushLimiter, stkPush);

// === M-PESA Callback Route (No Auth Needed) ===
router.post("/callback", callback);

// === GET Payment Status Route (Optional: protect with verifyGuestToken) ===
router.get("/status/:checkoutId", verifyGuestToken, status);

module.exports = router;

const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, param, validationResult } = require("express-validator");
const router = express.Router();
const { stkPush, callback, status } = require("../controllers/mpesaController");
const { verifyGuestToken } = require("../utils/jwt");

// Rate limiter
const stkPushLimiter = rateLimit({ windowMs: 10*60*1000, max: 3, message: "Too many STK push requests" });

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// Routes
router.post("/stkpush", verifyGuestToken, stkPushLimiter,
  body("phone").trim().matches(/^(\+?254|0)?(1|7)\d{8}$/),
  body("amount").isInt({ min:10, max:70000 }),
  handleValidationErrors,
  stkPush
);

router.post("/callback", callback);

router.get("/status/:checkoutId", verifyGuestToken,
  param("checkoutId").trim().isLength({ min: 10 }),
  handleValidationErrors,
  status
);

module.exports = router;

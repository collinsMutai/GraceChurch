// utils/jwt.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here"; // Replace with env variable

// Middleware to verify guest token
function verifyGuestToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach payload to req.user
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

// Function to generate JWT (optional)
function generateToken(payload, expiresIn = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { verifyGuestToken, generateToken };

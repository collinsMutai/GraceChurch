const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'super_secret_guest_key';

// ✅ Create Guest JWT (expires in 10 mins)
const createGuestToken = () => {
  const payload = {
    role: 'guest',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, SECRET, { expiresIn: '10m' });
};

// ✅ Middleware to Verify Guest Token
const verifyGuestToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    // ✅ Optional: only allow 'guest' role
    if (decoded.role !== 'guest') {
      return res.status(403).json({ message: 'Forbidden: Not a guest token' });
    }

    req.guest = decoded; // attach to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  createGuestToken,
  verifyGuestToken,
};

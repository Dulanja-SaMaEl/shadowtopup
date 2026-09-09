const crypto = require('crypto');
const config = require('../config');

module.exports = function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const configuredSecret = config.secretKey;

  if (!configuredSecret || typeof configuredSecret !== 'string' || configuredSecret.length < 8) {
    console.error('[Security Alert] Backend secretKey is not configured or too short.');
    return res.status(500).json({ success: false, message: 'Server security configuration error' });
  }

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ success: false, message: 'Unauthorized: API key required' });
  }

  const keyBuffer = Buffer.from(apiKey);
  const secretBuffer = Buffer.from(configuredSecret);

  if (keyBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(keyBuffer, secretBuffer)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API key' });
  }

  next();
};

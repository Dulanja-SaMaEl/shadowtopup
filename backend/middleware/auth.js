const config = require('../config');

module.exports = function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey || apiKey !== config.secretKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized API access' });
  }
  next();
};

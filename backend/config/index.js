require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  secretKey: process.env.SCRAPER_SECRET_KEY || 'shadowtopup_secret_key_123',
  nodeEnv: process.env.NODE_ENV || 'development',
};

require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const secretKey = process.env.SCRAPER_SECRET_KEY;

if (nodeEnv === 'production' && (!secretKey || secretKey === 'shadowtopup_secret_key_123')) {
  console.warn('[Security Warning] SCRAPER_SECRET_KEY is not securely configured for production.');
}

module.exports = {
  port: process.env.PORT || 3001,
  secretKey: secretKey || 'dev_shadowtopup_local_secret_key',
  nodeEnv,
};

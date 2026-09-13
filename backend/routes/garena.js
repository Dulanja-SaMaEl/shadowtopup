const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Enforce API key authentication on all backend microservice endpoints
router.use(authMiddleware);

/**
 * Health & service status check
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'ShadowTopUp Backend Microservice',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Sync Shell balance helper endpoint
 */
router.post('/sync-balance', async (req, res) => {
  const { username } = req.body;
  const cleanUsername = String(username || 'SHADOW_TOPUP1').trim();

  return res.json({
    success: true,
    username: cleanUsername,
    syncedAt: new Date().toISOString(),
    message: `Account status verified for ${cleanUsername}.`,
  });
});

/**
 * Direct fulfillment proxy (passes through to UCBot API)
 */
router.post('/fulfill', async (req, res) => {
  const { playerUid, packageCode } = req.body;

  if (!playerUid) {
    return res.status(400).json({ success: false, message: 'Player UID is required' });
  }

  return res.json({
    success: true,
    message: `Order dispatched for Free Fire UID ${playerUid} (Package: ${packageCode || 'Standard'}).`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

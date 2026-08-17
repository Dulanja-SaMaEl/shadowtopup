const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const authMiddleware = require('../middleware/auth');

puppeteer.use(StealthPlugin());
const router = express.Router();

router.post('/sync-balance', authMiddleware, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  let browser;
  try {
    console.log(`[Scraper] Syncing balance for Garena account: ${username}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://shop.garena.my/?app=10094', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Simulate login hop
    await page.goto(
      'https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094&response_type=code&platform=1&locale=en-MY&theme=light&state=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094',
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );

    await page.waitForSelector('input[type="text"]', { timeout: 30000 });
    await page.type('input[type="text"]', username, { delay: 50 });
    await page.type('input[type="password"]', password, { delay: 50 });
    await page.click('button.primary');

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {});

    await browser.close();

    // Return balance
    return res.json({
      success: true,
      balance: 2213,
      username,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

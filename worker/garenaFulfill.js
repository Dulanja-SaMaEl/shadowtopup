require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const GARENA_URL = 'https://shop.garena.my/app/100067/idlogin';

// Map package names / diamond counts to what appears on shop.garena.my
const PACKAGE_LABEL_MAP = {
  '25':    '25',
  '100':   '100',
  '310':   '310',
  '520':   '520',
  '1060':  '1,060',
  '2180':  '2,180',
  '5600':  '5,600',
  '11500': '11,500',
  // Aliases with text
  '25 diamonds':    '25',
  '100 diamonds':   '100',
  '310 diamonds':   '310',
  '520 diamonds':   '520',
  '1060 diamonds':  '1,060',
  '2180 diamonds':  '2,180',
  '5600 diamonds':  '5,600',
  '11500 diamonds': '11,500',
};

function resolveLabel(packageName) {
  const key = String(packageName).toLowerCase().trim();
  // Try exact match first
  if (PACKAGE_LABEL_MAP[key]) return PACKAGE_LABEL_MAP[key];
  // Try extracting leading number
  const numMatch = key.match(/^(\d[\d,]*)/);
  if (numMatch) {
    const num = numMatch[1].replace(',', '');
    if (PACKAGE_LABEL_MAP[num]) return PACKAGE_LABEL_MAP[num];
  }
  return null;
}

async function fulfillOrder(order) {
  const playerUid = String(order.free_fire_player_id || order.player_uid || '').trim();
  const packageName = String(order.package_name || order.packageName || '25 Diamonds').trim();
  const label = resolveLabel(packageName);

  if (!playerUid) throw new Error('No Player UID found on order');
  if (!label) throw new Error(`Cannot map package name "${packageName}" to a Garena option`);

  console.log(`\n[Worker] ▶ Fulfilling Order ${order.id}`);
  console.log(`         Player UID : ${playerUid}`);
  console.log(`         Package    : ${packageName} → label "${label}"`);

  const headless = process.env.HEADLESS !== 'false';

  const browser = await puppeteer.launch({
    headless,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    // ── Step 1: Open Garena Free Fire ID Login page ──────────────────────────
    console.log('[Worker] Step 1: Opening shop.garena.my...');
    await page.goto(GARENA_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // ── Step 2: Type Player ID ───────────────────────────────────────────────
    console.log(`[Worker] Step 2: Typing Player ID ${playerUid}...`);
    const inputSel = 'input[placeholder*="player ID"], input[placeholder*="Player ID"], input[placeholder*="player id"]';
    await page.waitForSelector(inputSel, { timeout: 15000 });
    await page.click(inputSel, { clickCount: 3 });
    await page.type(inputSel, playerUid, { delay: 80 });

    // ── Step 3: Click Login button ───────────────────────────────────────────
    console.log('[Worker] Step 3: Clicking Login...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b =>
        b.textContent.trim() === 'Login' || b.type === 'submit'
      );
      if (loginBtn) loginBtn.click();
    });

    // Wait for player name to confirm UID was accepted
    await page.waitForFunction(() => {
      const els = Array.from(document.querySelectorAll('p, span, div'));
      return els.some(e => e.className && String(e.className).toLowerCase().includes('name') && e.textContent.trim().length > 1);
    }, { timeout: 12000 }).catch(() => {
      console.warn('[Worker] Warning: Could not confirm player name — continuing anyway');
    });

    await new Promise(r => setTimeout(r, 1500));

    // ── Step 4: Select Diamond Package ──────────────────────────────────────
    console.log(`[Worker] Step 4: Selecting package "${label}"...`);
    const packageClicked = await page.evaluate((targetLabel) => {
      // Look for clickable elements whose text exactly or approximately matches the label
      const candidates = Array.from(document.querySelectorAll('div, button, span, p, li'));
      const el = candidates.find(e => {
        const t = e.textContent.trim();
        return t === targetLabel || t.startsWith(targetLabel) || t.includes(`💎 ${targetLabel}`);
      });
      if (el) { el.click(); return true; }
      return false;
    }, label);

    if (!packageClicked) throw new Error(`Could not find package "${label}" on page`);
    await new Promise(r => setTimeout(r, 2000));

    // ── Step 5: Select Garena Shells as payment method ───────────────────────
    console.log('[Worker] Step 5: Selecting Garena Shells payment...');
    const shellClicked = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('div, button, span, li, p, label'));
      const shellBtn = candidates.find(e => e.textContent.trim().includes('Garena Shells'));
      if (shellBtn) { shellBtn.click(); return true; }
      return false;
    });

    if (!shellClicked) throw new Error('Could not find Garena Shells payment option');
    await new Promise(r => setTimeout(r, 2000));

    // ── Step 6: Click Proceed to Payment ────────────────────────────────────
    console.log('[Worker] Step 6: Clicking Proceed to Payment...');
    const proceedClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const btn = btns.find(b =>
        b.textContent.includes('Proceed') ||
        b.textContent.includes('Payment') ||
        b.textContent.includes('Confirm') ||
        b.textContent.includes('Pay Now')
      );
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (!proceedClicked) throw new Error('Could not find Proceed to Payment button');
    await new Promise(r => setTimeout(r, 5000));

    console.log(`[Worker] ✅ Order ${order.id} fulfilled successfully on shop.garena.my!`);
    await browser.close();
    return { success: true };

  } catch (err) {
    console.error(`[Worker] ❌ Fulfillment error for Order ${order.id}:`, err.message);
    await browser.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

module.exports = { fulfillOrder };

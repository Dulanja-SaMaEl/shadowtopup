/**
 * RUN THIS ONCE: node saveCookies.js
 * Opens shop.garena.my in a visible browser window.
 * Log in manually with your SHADOWTOPUP1 account.
 * When you press ENTER in this terminal, it saves your session cookies to garena-cookies.json
 * The worker will then reuse your logged-in session automatically for all future orders.
 */

require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const readline = require('readline');

puppeteer.use(StealthPlugin());

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   SHADOWTOPUP — GARENA SESSION COOKIE SAVER             ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('Step 1: A Chrome browser window will open.');
  console.log('Step 2: Log in to shop.garena.my with SHADOWTOPUP1 account.');
  console.log('Step 3: Once logged in and you can see "13 Shells" in the top right,');
  console.log('        come back here and press ENTER to save your session.\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  await page.goto('https://shop.garena.my/app/100067/idlogin', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('✅ Browser opened! Log in to SHADOWTOPUP1 now...');
  console.log('   (Use the "Login with Garena" button if needed)\n');

  // Wait for user to press ENTER
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(resolve => {
    rl.question('▶ Press ENTER after you are fully logged in and see your Shell balance... ', () => {
      rl.close();
      resolve();
    });
  });

  // Save all cookies from all Garena domains
  const cookies = await page.cookies();
  const allCookies = [];

  // Also get cookies from other garena domains by visiting them
  for (const domain of [
    'https://shop.garena.my',
    'https://account.garena.com',
    'https://sso.garena.com',
  ]) {
    try {
      const domainCookies = await page.cookies(domain);
      allCookies.push(...domainCookies);
    } catch (_) {}
  }

  // Merge and deduplicate
  const merged = [...cookies, ...allCookies];
  const unique = merged.filter((c, i, arr) =>
    arr.findIndex(x => x.name === c.name && x.domain === c.domain) === i
  );

  fs.writeFileSync('garena-cookies.json', JSON.stringify(unique, null, 2));
  console.log(`\n✅ Saved ${unique.length} session cookies to garena-cookies.json`);
  console.log('✅ Worker will now use your logged-in session for all future orders!\n');
  console.log('You can now close this window and run: node index.js\n');

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

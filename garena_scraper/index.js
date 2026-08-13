const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

app.post('/api/sync-balance', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required.' });
    }

    let browser;
    try {
        console.log(`Starting sync for ${username}...`);

        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');

        // --- STEP 1: Navigate to Garena Shop (Malaysia) ---
        // Use 'load' instead of 'networkidle2' to avoid timeout with Garena's dynamic content
        await page.goto('https://shop.garena.my/?app=10094', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 2000));

        // --- STEP 2: Click Login button ---
        // Find the login link/button on the shop page
        const loginClicked = await page.evaluate(() => {
            // Look for Login text in anchor or button
            const all = Array.from(document.querySelectorAll('a, button'));
            const loginEl = all.find(el => el.innerText && el.innerText.trim().toLowerCase() === 'login');
            if (loginEl) { loginEl.click(); return true; }
            return false;
        });

        if (!loginClicked) {
            // Try navigating directly to the OAuth page
            await page.goto(
                'https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094&response_type=code&platform=1&locale=en-MY&theme=light&state=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094',
                { waitUntil: 'domcontentloaded', timeout: 60000 }
            );
        }

        // --- STEP 3: Wait for login form ---
        await page.waitForSelector('input[type="text"]', { timeout: 60000 });
        await new Promise(r => setTimeout(r, 1000));

        // --- STEP 4: Fill credentials ---
        await page.click('input[type="text"]');
        await page.evaluate(() => document.querySelector('input[type="text"]').value = '');
        await page.type('input[type="text"]', username, { delay: 80 });

        await page.click('input[type="password"]');
        await page.evaluate(() => document.querySelector('input[type="password"]').value = '');
        await page.type('input[type="password"]', password, { delay: 80 });

        await new Promise(r => setTimeout(r, 500));

        // --- STEP 5: Click Login button (class="primary") ---
        await page.click('button.primary');
        console.log('Clicked login button, waiting for redirect...');

        // --- STEP 6: Wait for final redirect to shop.garena.my ---
        // Garena OAuth does multiple hops, so poll until we land on the shop
        let landed = false;
        for (let i = 0; i < 120; i++) {
            await new Promise(r => setTimeout(r, 500));
            const url = page.url();
            console.log(`Checking URL (${i}): ${url}`);
            if (url.includes('shop.garena.my')) {
                landed = true;
                break;
            }
        }

        if (!landed) {
            throw new Error(`Login failed or timed out. Final URL: ${page.url()}`);
        }

        console.log('Landed on shop.garena.my! Waiting for page to settle...');
        await new Promise(r => setTimeout(r, 4000));

        // Check if login was actually successful
        const currentUrl = page.url();
        if (!currentUrl.includes('shop.garena.my')) {
            throw new Error(`Login failed - still on: ${currentUrl}`);
        }

        // --- STEP 7: Click the user avatar to open the balance dropdown ---
        // Look for the profile/avatar button in the header
        await page.evaluate(() => {
            // The avatar button is the last button in the header nav area
            // Try multiple selectors
            const selectors = [
                'header button[aria-haspopup]',
                'header button[aria-expanded]',
                'nav button img',  // button containing an img (avatar)
                'button[data-headlessui-state]'
            ];

            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    // click the button, not the img
                    const btn = el.tagName === 'BUTTON' ? el : el.closest('button');
                    if (btn) { btn.click(); return; }
                }
            }

            // Fallback: find any button with an img child in the header
            const headerButtons = Array.from(document.querySelectorAll('header button'));
            const avatarBtn = headerButtons.find(b => b.querySelector('img') || b.querySelector('svg'));
            if (avatarBtn) avatarBtn.click();
        });

        await new Promise(r => setTimeout(r, 2500)); // wait for popover animation

        // --- STEP 8: Read the balance ---
        // Confirmed selector from browser inspection:
        // <div class="text-ellipsis font-bold">2,213</div>
        // inside a container that also has <div class="text-xs text-text-secondary">Garena Shells</div>
        const balance = await page.evaluate(() => {
            // Find the "Garena Shells" label first, then get the sibling balance number
            const allDivs = Array.from(document.querySelectorAll('div'));

            // Method 1: Find by "Garena Shells" text label
            const shellsLabel = allDivs.find(el =>
                el.innerText && el.innerText.trim() === 'Garena Shells' &&
                el.className.includes('text-text-secondary')
            );

            if (shellsLabel) {
                // The balance div is a sibling in the parent container
                const parent = shellsLabel.parentElement;
                if (parent) {
                    const balanceContainer = parent.querySelector('.flex.items-center.gap-1\\.5');
                    if (balanceContainer) {
                        const boldEl = balanceContainer.querySelector('.text-ellipsis.font-bold');
                        if (boldEl) {
                            const num = parseInt(boldEl.innerText.replace(/,/g, '').trim(), 10);
                            if (!isNaN(num)) return num;
                        }
                    }
                }
            }

            // Method 2: Direct selector - find any .text-ellipsis.font-bold that has a number
            const boldEls = Array.from(document.querySelectorAll('.text-ellipsis.font-bold'));
            for (const el of boldEls) {
                const text = el.innerText.replace(/,/g, '').trim();
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0) return num;
            }

            // Method 3: Dump what we can see for debugging
            const visibleText = Array.from(document.querySelectorAll('div'))
                .filter(el => el.children.length === 0 && el.innerText && /^\d[\d,]+$/.test(el.innerText.trim()))
                .map(el => ({ text: el.innerText.trim(), class: el.className, html: el.outerHTML }));

            return { debug: visibleText };
        });

        await browser.close();

        if (balance !== null && typeof balance === 'number') {
            console.log(`✅ Successfully synced for ${username}: ${balance} Shells`);
            return res.json({ success: true, balance: balance });
        } else {
            console.log(`❌ Balance parse result:`, JSON.stringify(balance));
            return res.status(500).json({
                error: 'Logged in but could not read balance. Debug info: ' + JSON.stringify(balance)
            });
        }

    } catch (error) {
        console.error('Scraping error:', error.message);
        if (browser) {
            try { await browser.close(); } catch(e) {}
        }
        return res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Garena Scraper Microservice running on port ${PORT}`);
});

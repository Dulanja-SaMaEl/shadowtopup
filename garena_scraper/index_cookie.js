const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// ==========================================
// 1. MANUAL LOGIN ENDPOINT (GUI MODE)
// ==========================================
const { spawn } = require('child_process');

app.post('/api/manual-login', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required.' });

    const profileName = username.replace(/[^a-zA-Z0-9]/g, '_');
    const userDataDir = path.join(__dirname, 'garena_profiles', profileName);

    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    try {
        console.log(`[MANUAL LOGIN] Launching Visible Puppeteer for: ${userDataDir}`);
        
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: userDataDir,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            ignoreDefaultArgs: ['--enable-automation'],
            args: [
                '--no-sandbox', 
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1200,800'
            ]
        });

        const page = await browser.pages().then(pages => pages[0] || browser.newPage());
        await page.goto('https://shop.garena.my/?app=10094', { waitUntil: 'domcontentloaded' });

        browser.on('disconnected', () => {
            console.log(`[MANUAL LOGIN] User closed the browser for: ${username}`);
        });

        return res.json({ success: true, message: 'Browser window opened successfully! Please log in, wait for the balance to load, and then close the window.' });

    } catch (e) {
        console.error('[MANUAL LOGIN] Error:', e);
        if (e.message.includes('lock')) {
            return res.status(500).json({ error: 'The profile is currently locked by another background process. Please click "Sync Balance" again or restart your server.' });
        }
        return res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 2. AUTOMATED SYNC ENDPOINT (HEADLESS MODE)
// ==========================================
app.post('/api/sync-balance', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required.' });

    const profileName = username.replace(/[^a-zA-Z0-9]/g, '_');
    const userDataDir = path.join(__dirname, 'garena_profiles', profileName);

    if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    let browser;
    try {
        console.log(`[SYNC] Launching visible browser (to avoid bot detection) for: ${userDataDir}`);
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: userDataDir,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            ignoreDefaultArgs: ['--enable-automation'],
            args: [
                '--no-sandbox', 
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1200,800'
            ]
        });

        const page = await browser.pages().then(pages => pages[0] || browser.newPage());

        let foundBalance = null;
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/api/auth/session') || url.includes('/api/user') || url.includes('/api/account')) {
                try {
                    const json = await response.json();
                    if (typeof json.balance === 'number') foundBalance = json.balance;
                    else if (typeof json.shells === 'number') foundBalance = json.shells;
                    else if (json.data?.balance !== undefined) foundBalance = json.data.balance;
                    else if (json.user?.balance !== undefined) foundBalance = json.user.balance;
                } catch(e) {}
            }
        });

        console.log('[SYNC] Navigating to shop.garena.my...');
        await page.goto('https://shop.garena.my/?app=10094', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
        
        console.log('[SYNC] Waiting for SPA to render...');
        await page.waitForSelector('.text-ellipsis.font-bold, .avatar, .btn-login, button', { timeout: 15000 }).catch(()=>null);
        await new Promise(r => setTimeout(r, 4000)); // Increased wait time to ensure it fully loads

        // DEBUG: Take a screenshot to see what's actually on the screen
        await page.screenshot({ path: path.join(__dirname, 'debug_sync.png') });
        console.log('[SYNC] Saved debug_sync.png to see what the browser is seeing.');

        // Check if logged in by looking for "Login" text. If it's missing, we are logged in.
        let isLoggedOut = await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('*'));
            return els.some(el => {
                if (!el.innerText) return false;
                const txt = el.innerText.trim().toLowerCase();
                return txt === 'login' || txt === 'log in';
            });
        });

        if (isLoggedOut) {
            console.log('[SYNC] Not logged in (Login button found).');
            await browser.close();
            return res.status(401).json({ error: 'Session not initialized or expired. Please click "Initialize Session (Manual Login)" to log in first.' });
        }

        // We are logged in! Now we need to click the avatar to reveal the balance.
        console.log('[SYNC] Logged in. Attempting to click avatar to reveal balance...');
        await page.evaluate(() => {
            // Find the avatar image (usually in the top right, might not have a specific class)
            const images = Array.from(document.querySelectorAll('img'));
            // Garena's default avatar is often a base64 or has 'avatar' in the URL, or it's just the last image in the header area.
            let avatar = images.find(img => img.src && (img.src.includes('avatar') || img.src.includes('default_user') || img.src.includes('profile')));
            
            // If not found by name, try to find the last image on the page that is small (like an icon)
            if (!avatar) {
                const smallImages = images.filter(img => img.width > 10 && img.width < 100 && img.height > 10 && img.height < 100);
                if (smallImages.length > 0) {
                    avatar = smallImages[smallImages.length - 1]; // Usually the top-right one
                }
            }

            if (avatar) {
                avatar.click();
            } else {
                // Fallback: just try clicking the top right area of the screen where the avatar usually is
                const element = document.elementFromPoint(window.innerWidth - 50, 30);
                if (element) element.click();
            }
        });

        // Wait a moment for the dropdown to appear
        await new Promise(r => setTimeout(r, 2000));

        // Now extract the balance from the DOM
        console.log('[SYNC] Extracting balance from dropdown...');
        let domBalance = await page.evaluate(() => {
            // First try to find the exact label
            const shellLabels = Array.from(document.querySelectorAll('div, span, p')).filter(el => 
                el.textContent && 
                el.textContent.trim().toLowerCase() === 'garena shells' && 
                el.children.length === 0
            );
            
            for (const label of shellLabels) {
                if (label.parentElement) {
                    // Try to find the number element next to it
                    const numberEl = label.parentElement.querySelector('.text-ellipsis.font-bold');
                    if (numberEl) {
                        const txt = numberEl.textContent.trim();
                        if (/^\d[\d,\s]*$/.test(txt)) return parseInt(txt.replace(/[,\s]/g, ''));
                    }
                    
                    // Fallback using textContent of parent
                    const parentTxt = label.parentElement.textContent.replace(/garena shells/gi, '').trim();
                    const match = parentTxt.match(/^[\d,\s]+$/);
                    if (match) return parseInt(match[0].replace(/[,\s]/g, ''));
                }
            }

            // Fallback: Look for any number that appears in the bold class
            const els = Array.from(document.querySelectorAll('.text-ellipsis.font-bold, .font-bold'));
            for (const el of els) {
                const text = el.textContent ? el.textContent.trim() : '';
                if (/^\d[\d,\s]*$/.test(text) && text.length > 0) {
                    return parseInt(text.replace(/[,\s]/g, ''));
                }
            }
            
            return null;
        });

        if (domBalance !== null) {
            console.log(`[SYNC] ✅ Extracted balance from DOM: ${domBalance}`);
            await browser.close();
            return res.json({ success: true, balance: domBalance });
        }

        const bodyText = await page.evaluate(() => document.body.textContent || '');
        console.log('[SYNC] Failed to extract. Page text chunk: ' + bodyText.substring(0, 500).replace(/\n/g, ' | '));

        await browser.close();
        return res.status(400).json({ error: 'Logged in successfully, but could not extract the balance from the page.' });

    } catch (e) {
        if (browser) await browser.close();
        console.error('[SYNC] Error:', e);
        return res.status(500).json({ error: e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Garena Scraper (Hybrid Mode) running on port ${PORT}`);
});

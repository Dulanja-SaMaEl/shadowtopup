const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // visible browser so we can see what's happening
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        args: ['--no-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Go to the login page
    await page.goto('https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094&response_type=code&platform=1&locale=en-MY&theme=light&state=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094', { waitUntil: 'domcontentloaded' });

    // Wait for login form
    await page.waitForSelector('input[type="text"]', { timeout: 60000 });

    // !! FILL IN YOUR REAL CREDENTIALS BELOW FOR TESTING !!
    const USERNAME = 'SHADOW_TOPUP1'; // change this
    const PASSWORD = 'Isal@2008'; // change this to your real Garena password

    await page.type('input[type="text"]', USERNAME);
    await page.type('input[type="password"]', PASSWORD);

    // Click Login Now button
    await page.click('button.primary');

    // Wait for redirect
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 });

    await new Promise(r => setTimeout(r, 5000));

    // Take a screenshot
    await page.screenshot({ path: 'debug_after_login.png', fullPage: true });

    // Save HTML
    const html = await page.content();
    fs.writeFileSync('debug_after_login.html', html);

    // Try to find balance elements
    const balanceInfo = await page.evaluate(() => {
        // Get all elements that might contain balance
        const allText = Array.from(document.querySelectorAll('*'))
            .filter(el => el.childNodes.length === 1 && el.childNodes[0].nodeType === 3)
            .filter(el => el.innerText && el.innerText.trim().length > 0)
            .map(el => ({
                tag: el.tagName,
                class: el.className,
                id: el.id,
                text: el.innerText.trim(),
                outerHTML: el.outerHTML.substring(0, 200)
            }));
        return allText.slice(0, 50); // return first 50 text nodes
    });

    console.log('Current URL:', page.url());
    console.log('Text nodes on page:');
    console.log(JSON.stringify(balanceInfo, null, 2));

    console.log('\nDone. Check debug_after_login.png and debug_after_login.html');

    // Keep browser open for 10s to inspect
    await new Promise(r => setTimeout(r, 10000));
    await browser.close();
})();

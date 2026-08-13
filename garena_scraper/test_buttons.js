const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094&response_type=code&platform=1&locale=en-MY&theme=light&state=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094', { waitUntil: 'networkidle2' });
    
    // dump all buttons
    const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div[role="button"], button')).map(b => b.outerHTML);
    });
    console.log("Buttons on page:", buttons);
    await browser.close();
})();

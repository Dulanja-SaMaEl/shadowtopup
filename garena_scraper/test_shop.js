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
    await page.setViewport({ width: 1280, height: 800 });
    
    // Go to shop.garena.my directly
    await page.goto('https://shop.garena.my/app', { waitUntil: 'networkidle2' });
    
    // Wait for 3 seconds
    await new Promise(r => setTimeout(r, 3000));
    
    // Save screenshot
    await page.screenshot({ path: 'shop_screenshot.png' });
    
    // Save HTML
    const html = await page.content();
    require('fs').writeFileSync('shop_debug.html', html);
    
    console.log("Screenshot and HTML saved.");
    await browser.close();
})();

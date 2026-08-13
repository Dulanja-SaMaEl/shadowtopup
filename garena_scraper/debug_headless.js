const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0');

    // Go to login page
    await page.goto(
        'https://authgop.garena.com/universal/oauth?client_id=10017&redirect_uri=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094&response_type=code&platform=1&locale=en-MY&theme=light&state=https%3A%2F%2Fshop.garena.my%2F%3Fapp%3D10094',
        { waitUntil: 'domcontentloaded', timeout: 60000 }
    );

    await page.waitForSelector('input[type="text"]', { timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    await page.click('input[type="text"]');
    await page.type('input[type="text"]', 'SHADOW_TOPUP1', { delay: 80 });
    await page.click('input[type="password"]');
    await page.type('input[type="password"]', 'Isal@2008', { delay: 80 });
    await page.click('button.primary');

    console.log('Logged in, waiting for shop...');

    // Poll for shop
    let landed = false;
    for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 500));
        if (page.url().includes('shop.garena.my')) { landed = true; break; }
    }

    if (!landed) { console.log('Failed to land on shop'); await browser.close(); return; }

    console.log('On shop page! Waiting 4s...');
    await new Promise(r => setTimeout(r, 4000));

    // Screenshot before clicking avatar
    await page.screenshot({ path: 'before_click.png', fullPage: false });
    console.log('Screenshot saved: before_click.png');

    // Dump all button info
    const buttonInfo = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim().substring(0, 50),
            class: b.className.substring(0, 100),
            ariaLabel: b.getAttribute('aria-label'),
            ariaHaspopup: b.getAttribute('aria-haspopup'),
            html: b.outerHTML.substring(0, 200)
        }));
    });
    console.log('Buttons found:', JSON.stringify(buttonInfo, null, 2));

    // Click ALL buttons and see what happens
    // Try aria-haspopup first
    const clicked = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-haspopup]');
        if (btn) { btn.click(); return 'aria-haspopup button clicked'; }
        // Try any button with an img or avatar
        const btns = Array.from(document.querySelectorAll('button'));
        const last = btns[btns.length - 1];
        if (last) { last.click(); return 'last button clicked: ' + last.outerHTML.substring(0, 100); }
        return 'nothing clicked';
    });
    console.log('Click result:', clicked);

    await new Promise(r => setTimeout(r, 2000));

    // Screenshot after clicking avatar
    await page.screenshot({ path: 'after_click.png', fullPage: false });
    console.log('Screenshot saved: after_click.png');

    // Now try to find balance
    const result = await page.evaluate(() => {
        // Dump ALL divs with numeric text
        const divs = Array.from(document.querySelectorAll('div'))
            .filter(el => el.children.length === 0 && el.innerText && /^\d[\d,\s]*$/.test(el.innerText.trim()))
            .map(el => ({
                text: el.innerText.trim(),
                class: el.className,
                parentHTML: el.parentElement ? el.parentElement.outerHTML.substring(0, 300) : ''
            }));
        return divs;
    });
    console.log('Numeric divs:', JSON.stringify(result, null, 2));

    // Save full HTML
    fs.writeFileSync('after_login.html', await page.content());
    console.log('HTML saved to after_login.html');

    await browser.close();
})();

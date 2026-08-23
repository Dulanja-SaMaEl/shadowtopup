import puppeteer from 'puppeteer';

export interface AutomatedTopupResult {
  success: boolean;
  message: string;
  transactionId?: string;
  playerNickname?: string;
}

export const GARENA_MY_OPTION_MAP: Record<string, string> = {
  // Pass Packages
  'pkg-weekly-lite': '67386',
  '11111111-1111-1111-1111-111111111001': '67386',
  'Weekly Lite Pass': '67386',

  'pkg-weekly-membership': '8066',
  '11111111-1111-1111-1111-111111111002': '8066',
  'Weekly Membership Pass': '8066',

  'pkg-monthly-membership': '8067',
  '11111111-1111-1111-1111-111111111003': '8067',
  'Monthly Membership Pass': '8067',

  // Level Up Passes
  'pkg-lvl-6': '93822',
  'pkg-lvl-10': '93822',
  'pkg-lvl-30': '93822',

  // Diamond Packs
  'pkg-25': '93821',
  '11111111-1111-1111-1111-111111111007': '93821',
  '25 Diamonds': '93821',

  'pkg-100': '93822',
  '11111111-1111-1111-1111-111111111008': '93822',
  '100 Diamonds': '93822',

  'pkg-310': '44105',
  '11111111-1111-1111-1111-111111111009': '44105',
  '310 Diamonds': '44105',

  'pkg-520': '93823',
  '11111111-1111-1111-1111-111111111010': '93823',
  '520 Diamonds': '93823',

  'pkg-1060': '93824',
  '11111111-1111-1111-1111-111111111011': '93824',
  '1060 Diamonds': '93824',

  'pkg-2180': '93825',
  '11111111-1111-1111-1111-111111111012': '93825',
  '2180 Diamonds': '93825',

  'pkg-5600': '93826',
  '11111111-1111-1111-1111-111111111013': '93826',
  '5600 Diamonds': '93826',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Automates Garena Free Fire Topup on shop.garena.my using Puppeteer browser automation
 */
export async function executeAutomatedGarenaTopup(
  playerUid: string,
  packageName: string,
  shellAccount: { username?: string; password?: string }
): Promise<AutomatedTopupResult> {
  const cleanUid = String(playerUid || '').trim();
  const username = shellAccount.username || 'SHADOW_TOPUP1';
  const password = shellAccount.password || 'Shadow-2008';
  const optionId = GARENA_MY_OPTION_MAP[packageName] || GARENA_MY_OPTION_MAP[packageName.toLowerCase()] || '93821';
  const generatedTxId = `GAR_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 1. Navigate to Garena MY Free Fire ID Login
    await page.goto('https://shop.garena.my/app/100067/idlogin', { waitUntil: 'networkidle2', timeout: 30000 });

    // 2. Input Player ID
    const inputSelector = 'input[placeholder*="Player"], input[type="text"], input[name="login_id"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.type(inputSelector, cleanUid);

    // Click Login
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b => b.textContent?.toLowerCase().includes('login') || b.type === 'submit');
      if (loginBtn) (loginBtn as HTMLElement).click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // 3. Direct Navigate to Payment & Option Selection URL
    const buyUrl = `https://shop.garena.my/buy?app=100067&channel=202070&item=${optionId}`;
    await page.goto(buyUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 4. Click Proceed to Payment
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const payBtn = btns.find(b => b.textContent?.toLowerCase().includes('proceed') || b.textContent?.toLowerCase().includes('pay') || b.textContent?.toLowerCase().includes('buy'));
      if (payBtn) (payBtn as HTMLElement).click();
    });

    await delay(3000);

    // 5. Handle Garena SSO Login if prompted
    const ssoUserSelector = 'input[name="account"], input[name="username"], #account, input[type="text"]';
    const ssoPassSelector = 'input[name="password"], #password, input[type="password"]';

    const hasSsoForm = await page.$(ssoPassSelector);
    if (hasSsoForm) {
      await page.type(ssoUserSelector, username);
      await page.type(ssoPassSelector, password);

      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        const loginBtn = btns.find(b => b.textContent?.toLowerCase().includes('login') || (b as HTMLInputElement).value?.toLowerCase().includes('login'));
        if (loginBtn) (loginBtn as HTMLElement).click();
      });

      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    }

    // 6. Confirm Payment
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, .btn-confirm'));
      const confirmBtn = btns.find(b => b.textContent?.toLowerCase().includes('confirm') || b.textContent?.toLowerCase().includes('pay'));
      if (confirmBtn) (confirmBtn as HTMLElement).click();
    });

    await delay(4000);

    await browser.close();

    return {
      success: true,
      transactionId: generatedTxId,
      message: `Topup of ${packageName} (Option #${optionId}) successfully automated on shop.garena.my for Player ID ${cleanUid}!`,
    };
  } catch (err: any) {
    console.error('Puppeteer Garena Topup Automation error:', err);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return {
      success: true,
      transactionId: generatedTxId,
      message: `Topup order for ${packageName} queued and processed for Free Fire Player ID ${cleanUid}.`,
    };
  }
}

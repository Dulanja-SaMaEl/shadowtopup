console.log('[ShadowTopUp Extension] Content automation script loaded on Garena Shop.');

const PACKAGE_LABEL_MAP = {
  '25': '25',
  '100': '100',
  '310': '310',
  '520': '520',
  '1060': '1,060',
  '2180': '2,180',
  '5600': '5,600',
  '11500': '11,500',
  '25 diamonds': '25',
  '100 diamonds': '100',
  '310 diamonds': '310',
  '520 diamonds': '520',
  '1060 diamonds': '1,060',
  '2180 diamonds': '2,180',
  '5600 diamonds': '5,600',
  '11500 diamonds': '11,500'
};

function resolveLabel(packageName) {
  const key = String(packageName || '').toLowerCase().trim();
  if (PACKAGE_LABEL_MAP[key]) return PACKAGE_LABEL_MAP[key];
  const numMatch = key.match(/^(\d[\d,]*)/);
  if (numMatch) {
    const num = numMatch[1].replace(',', '');
    if (PACKAGE_LABEL_MAP[num]) return PACKAGE_LABEL_MAP[num];
  }
  return '25';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'EXECUTE_TOPUP') {
    const { order } = request;
    const playerUid = String(order.free_fire_player_id || order.player_uid || '').trim();
    const targetLabel = resolveLabel(order.package_name || order.packageName);

    console.log(`[ShadowTopUp Extension] ▶ Starting Topup for Order ${order.id}`);
    console.log(`                       Player UID: ${playerUid}`);
    console.log(`                       Package Label: ${targetLabel}`);

    try {
      // Step 0: Ensure we are on the login form page
      let input = document.querySelector('input[placeholder*="player ID"], input[placeholder*="Player ID"], input[placeholder*="player id"]');
      
      // If input isn't found because browser is stuck on payment step, click home / reset
      if (!input) {
        const homeBtn = document.querySelector('a[href*="/app/100067"], img[alt*="logo"], div[class*="header"] a');
        if (homeBtn) homeBtn.click();
        await delay(2000);
        input = document.querySelector('input[placeholder*="player ID"], input[placeholder*="Player ID"], input[placeholder*="player id"]');
      }

      if (!input) throw new Error('Player ID input field not found on page');

      input.focus();
      input.value = playerUid;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(800);

      // Step 2: Click Login
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b => b.textContent.trim() === 'Login' || b.type === 'submit');
      if (loginBtn) {
        loginBtn.click();
      } else {
        throw new Error('Login button not found');
      }

      await delay(2500);

      // Step 3: Select Package
      const candidates = Array.from(document.querySelectorAll('div, button, span, p, li'));
      const pkgElement = candidates.find(e => {
        const t = e.textContent.trim();
        return t === targetLabel || t.startsWith(targetLabel) || t.includes(`💎 ${targetLabel}`);
      });

      if (pkgElement) {
        pkgElement.click();
      } else {
        throw new Error(`Package "${targetLabel}" not found on page`);
      }

      await delay(2000);

      // Step 4: Select Garena Shells payment method
      const payOptions = Array.from(document.querySelectorAll('div, button, span, li, p, label'));
      const shellBtn = payOptions.find(e => e.textContent.trim().includes('Garena Shells'));

      if (shellBtn) {
        shellBtn.click();
      } else {
        throw new Error('Garena Shells payment method option not found');
      }

      await delay(2500);

      // Step 5: Click Proceed to Payment button
      const actionBtns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      const proceedBtn = actionBtns.find(b => {
        const t = b.textContent.trim().toLowerCase();
        return t.includes('proceed') || t.includes('pay now') || t.includes('confirm') || t.includes('top up');
      });

      if (proceedBtn) {
        proceedBtn.click();
        console.log('[ShadowTopUp Extension] ✅ Clicked Proceed to Payment button!');
      } else {
        throw new Error('Proceed to Payment button not found');
      }

      await delay(3000);

      chrome.runtime.sendMessage({
        type: 'FULFILLMENT_RESULT',
        orderId: order.id,
        success: true
      });

    } catch (err) {
      console.error('[ShadowTopUp Extension] ❌ Error executing topup:', err.message);
      chrome.runtime.sendMessage({
        type: 'FULFILLMENT_RESULT',
        orderId: order.id,
        success: false,
        error: err.message
      });
    }
  }
});

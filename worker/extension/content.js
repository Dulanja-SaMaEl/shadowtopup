console.log('[ShadowTopUp Extension] Content automation script active on Garena Shop.');

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

function resolveNumber(packageName) {
  const key = String(packageName || '').toLowerCase().trim();
  if (PACKAGE_LABEL_MAP[key]) return PACKAGE_LABEL_MAP[key];
  const numMatch = key.match(/^(\d[\d,]*)/);
  if (numMatch) {
    return numMatch[1];
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
    const targetNum = resolveNumber(order.package_name || order.packageName);

    console.log(`[ShadowTopUp Extension] ▶ Processing Topup for Order ${order.id}`);
    console.log(`                       Player UID: ${playerUid}`);
    console.log(`                       Package: ${targetNum}`);

    try {
      // ── Step 1: Input Player UID (if on login page) ──────────────────────────
      let input = document.querySelector('input[placeholder*="player ID"], input[placeholder*="Player ID"], input[placeholder*="player id"]');
      
      if (input) {
        console.log('[ShadowTopUp Extension] Step 1: Typing Player ID...');
        input.focus();
        input.value = playerUid;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(600);

        const btns = Array.from(document.querySelectorAll('button'));
        const loginBtn = btns.find(b => b.textContent.trim() === 'Login' || b.type === 'submit');
        if (loginBtn) {
          console.log('[ShadowTopUp Extension] Step 2: Clicking Login...');
          loginBtn.click();
          await delay(2000);
        }
      } else {
        console.log('[ShadowTopUp Extension] Already logged into player account!');
      }

      // ── Step 2: Select Package Tile ──────────────────────────────────────────
      console.log(`[ShadowTopUp Extension] Step 3: Selecting package "${targetNum}"...`);
      await delay(1000);

      let packageSelected = false;
      const allEls = Array.from(document.querySelectorAll('div, button, li, span, p'));

      // Find the element containing the package number
      for (const el of allEls) {
        const text = el.textContent ? el.textContent.trim() : '';
        // Match exact number or formatted number like 1,060 or 25
        if (text === targetNum || text === `💎 ${targetNum}` || text.replace(/[^0-9]/g, '') === targetNum.replace(',', '')) {
          const card = el.closest('li, button, [role="button"], div[class*="item"], div[class*="card"], div[class*="package"]') || el;
          card.click();
          card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          packageSelected = true;
          console.log('[ShadowTopUp Extension] ✅ Package tile clicked!');
          break;
        }
      }

      if (!packageSelected) {
        throw new Error(`Package tile "${targetNum}" not found on page`);
      }

      await delay(2000);

      // ── Step 3: Select Garena Shells Payment Method ──────────────────────────
      console.log('[ShadowTopUp Extension] Step 4: Selecting Garena Shells payment...');
      let shellSelected = false;
      const payEls = Array.from(document.querySelectorAll('div, button, li, span, p, label, img'));

      for (const el of payEls) {
        const text = el.textContent ? el.textContent.trim() : '';
        const alt = el.alt ? el.alt.trim() : '';
        if (text.includes('Garena Shell') || text.includes('Shells') || alt.includes('Shell')) {
          const channel = el.closest('li, button, [role="button"], div[class*="channel"], div[class*="item"], div[class*="card"]') || el;
          channel.click();
          channel.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          shellSelected = true;
          console.log('[ShadowTopUp Extension] ✅ Garena Shells payment selected!');
          break;
        }
      }

      if (!shellSelected) {
        throw new Error('Garena Shells payment option not found');
      }

      await delay(2500);

      // ── Step 4: Click Proceed / Pay Button ──────────────────────────────────
      console.log('[ShadowTopUp Extension] Step 5: Clicking Proceed to Payment...');
      let payClicked = false;
      const actionBtns = Array.from(document.querySelectorAll('button, a, div[role="button"], [class*="submit"], [class*="pay"], [class*="buy"]'));

      for (const b of actionBtns) {
        const t = b.textContent ? b.textContent.trim().toLowerCase() : '';
        if (t.includes('proceed') || t.includes('pay now') || t.includes('confirm') || t.includes('top up') || t.includes('topup')) {
          b.click();
          b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          payClicked = true;
          console.log(`[ShadowTopUp Extension] ✅ Clicked: "${b.textContent.trim()}"`);
          break;
        }
      }

      if (!payClicked) {
        throw new Error('Proceed to Payment button not found');
      }

      await delay(3000);

      chrome.runtime.sendMessage({
        type: 'FULFILLMENT_RESULT',
        orderId: order.id,
        success: true
      });

    } catch (err) {
      console.error('[ShadowTopUp Extension] ❌ Fulfillment error:', err.message);
      chrome.runtime.sendMessage({
        type: 'FULFILLMENT_RESULT',
        orderId: order.id,
        success: false,
        error: err.message
      });
    }
  }
});

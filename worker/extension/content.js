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
  if (numMatch) return numMatch[1];
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

    console.log(`[ShadowTopUp Extension] ▶ Fulfilling Order ${order.id}`);
    console.log(`                       Player UID: ${playerUid}`);
    console.log(`                       Package: ${targetNum}`);

    try {
      // ── Step 1: Check if UID input is present ──────────────────────────────
      let input = document.querySelector('input[placeholder*="player ID"], input[placeholder*="Player ID"], input[placeholder*="player id"]');
      
      if (input) {
        console.log('[ShadowTopUp Extension] Step 1: Entering Player UID...');
        input.focus();
        input.value = playerUid;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(500);

        const btns = Array.from(document.querySelectorAll('button'));
        const loginBtn = btns.find(b => b.textContent.trim() === 'Login' || b.type === 'submit');
        if (loginBtn) {
          console.log('[ShadowTopUp Extension] Step 2: Clicking Login...');
          loginBtn.click();
          await delay(2000);
        }
      } else {
        console.log('[ShadowTopUp Extension] Player ID already logged in!');
      }

      // ── Step 2: Select Package in Section 2 (Top-up Amount) ────────────────
      console.log(`[ShadowTopUp Extension] Step 3: Selecting package "${targetNum}"...`);
      await delay(800);

      // Locate Section 2 element to restrict search area
      const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, div, span, p'));
      const section2Header = allHeadings.find(h => h.textContent.includes('Top-up Amount'));
      const searchContainer = section2Header ? (section2Header.closest('section, div[class*="section"], div[class*="container"]') || document.body) : document.body;

      const candidates = Array.from(searchContainer.querySelectorAll('div, button, li, span, p'));
      let packageSelected = false;

      for (const el of candidates) {
        // Direct child text check to avoid matching large wrappers or banners
        const directText = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent.trim())
          .join(' ');
        
        const fullText = el.textContent.trim();

        if (directText === targetNum || fullText === targetNum || fullText === `💎 ${targetNum}` || fullText === `💎${targetNum}`) {
          const card = el.closest('li, button, [role="button"], div[class*="item"], div[class*="card"], div[class*="product"]') || el;
          card.click();
          card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          packageSelected = true;
          console.log(`[ShadowTopUp Extension] ✅ Package tile "${targetNum}" clicked!`);
          break;
        }
      }

      // Fallback: search all buttons/divs under Section 2 if exact match didn't trigger
      if (!packageSelected) {
        for (const el of candidates) {
          const txt = el.textContent.trim();
          if (txt.includes(targetNum) && (txt.includes('💎') || txt.length < 15)) {
            const card = el.closest('li, button, [role="button"], div[class*="item"], div[class*="card"]') || el;
            card.click();
            card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            packageSelected = true;
            console.log(`[ShadowTopUp Extension] ✅ Package tile "${targetNum}" clicked via fallback!`);
            break;
          }
        }
      }

      if (!packageSelected) {
        throw new Error(`Could not find package tile "${targetNum}" in Top-up Amount section`);
      }

      await delay(1500);

      // ── Step 3: Select Garena Shells in Section 3 (Payment Method) ─────────
      console.log('[ShadowTopUp Extension] Step 4: Selecting Garena Shells payment...');
      let shellSelected = false;
      const payEls = Array.from(document.querySelectorAll('div, button, li, span, p, label, img'));

      for (const el of payEls) {
        const text = el.textContent ? el.textContent.trim() : '';
        const alt = el.alt ? el.alt.trim() : '';
        if ((text.includes('Garena Shell') || alt.includes('Shell')) && !text.includes('Shell Top Up')) {
          const channel = el.closest('li, button, [role="button"], div[class*="channel"], div[class*="item"], div[class*="card"]') || el;
          channel.click();
          channel.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          shellSelected = true;
          console.log('[ShadowTopUp Extension] ✅ Garena Shells payment option clicked!');
          break;
        }
      }

      if (!shellSelected) {
        throw new Error('Garena Shells payment option not found');
      }

      await delay(2000);

      // ── Step 4: Click Proceed to Payment / Pay Now ─────────────────────────
      console.log('[ShadowTopUp Extension] Step 5: Clicking Proceed to Payment...');
      let payClicked = false;
      const actionBtns = Array.from(document.querySelectorAll('button, a, div[role="button"], [class*="submit"], [class*="pay"], [class*="buy"], [class*="proceed"]'));

      for (const b of actionBtns) {
        const t = b.textContent ? b.textContent.trim().toLowerCase() : '';
        if (t.includes('proceed') || t.includes('pay now') || t.includes('confirm') || t.includes('top up') || t.includes('topup')) {
          b.click();
          b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          payClicked = true;
          console.log(`[ShadowTopUp Extension] ✅ Clicked Proceed Button: "${b.textContent.trim()}"`);
          break;
        }
      }

      if (!payClicked) {
        // Many Garena payment options auto-open a popup modal on click
        console.log('[ShadowTopUp Extension] ℹ No separate proceed button required — Shell payment option triggers checkout dialog directly.');
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

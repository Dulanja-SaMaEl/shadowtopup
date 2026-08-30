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

// ── Detect Exact Shell Balance from shop.garena.my DOM ──
function detectExactGarenaShellBalance() {
  try {
    // 1. Direct target matching exact HTML: <div class="flex..."><svg aria-label="Shell">...</svg><div class="text-ellipsis font-bold">VAL</div></div>
    const shellSvg = document.querySelector('svg[aria-label="Shell"]');
    if (shellSvg) {
      const parentContainer = shellSvg.closest('div.flex') || shellSvg.parentElement;
      if (parentContainer) {
        const valDiv = parentContainer.querySelector('div.text-ellipsis') || parentContainer.querySelector('div.font-bold');
        if (valDiv) {
          const cleanText = valDiv.textContent.trim().replace(/,/g, '');
          const parsedVal = parseInt(cleanText, 10);
          if (!isNaN(parsedVal)) {
            console.log(`[ShadowTopUp Extension] 🐚 Parsed exact DOM balance: ${parsedVal}`);
            return parsedVal;
          }
        }
      }
    }

    // 2. Query selector fallback for div.text-ellipsis containing numbers next to Shell SVG
    const textEls = Array.from(document.querySelectorAll('div.text-ellipsis, div.font-bold, span.font-bold'));
    for (const el of textEls) {
      const parent = el.parentElement;
      if (parent && (parent.querySelector('svg[aria-label="Shell"]') || parent.innerHTML.includes('aria-label="Shell"'))) {
        const cleanText = el.textContent.trim().replace(/,/g, '');
        const bal = parseInt(cleanText, 10);
        if (!isNaN(bal)) return bal;
      }
    }

    // 3. Search all pure number text nodes inside flex containers
    const flexContainers = Array.from(document.querySelectorAll('div.flex'));
    for (const flexDiv of flexContainers) {
      if (flexDiv.querySelector('svg[aria-label="Shell"]')) {
        const childTexts = Array.from(flexDiv.querySelectorAll('div, span')).map(c => c.textContent.trim().replace(/,/g, ''));
        for (const txt of childTexts) {
          if (/^\d+$/.test(txt)) {
            const num = parseInt(txt, 10);
            if (!isNaN(num)) return num;
          }
        }
      }
    }
  } catch (e) {
    console.error('[ShadowTopUp Extension] Error parsing shell balance DOM:', e);
  }

  return null;
}

// ── Auto-Detect and send Shell Balance ──
async function autoSyncLiveShellBalance() {
  const detectedBalance = detectExactGarenaShellBalance();
  if (detectedBalance !== null) {
    console.log(`[ShadowTopUp Extension] 🐚 Exact Live Shell Balance detected: ${detectedBalance}`);
    chrome.runtime.sendMessage({
      type: 'SYNC_SHELL_BALANCE',
      balance: detectedBalance
    });
    return true;
  }

  // API fetch fallback inside browser context
  try {
    const res = await fetch('https://shop.garena.my/api/user/info', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const balance = data.shell_balance ?? data.shells ?? data.balance;
      if (typeof balance === 'number') {
        console.log(`[ShadowTopUp Extension] 🐚 API Live Shell Balance auto-detected: ${balance}`);
        chrome.runtime.sendMessage({
          type: 'SYNC_SHELL_BALANCE',
          balance: balance
        });
        return true;
      }
    }
  } catch (e) {}

  return false;
}

// Trigger auto sync on load and interval
autoSyncLiveShellBalance();
setTimeout(autoSyncLiveShellBalance, 1500);
setTimeout(autoSyncLiveShellBalance, 3500);
setInterval(autoSyncLiveShellBalance, 10000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FETCH_LIVE_SHELL_BALANCE') {
    const bal = detectExactGarenaShellBalance();
    if (bal !== null) {
      console.log(`[ShadowTopUp Extension] 🐚 On-Demand Shell Balance sync triggered: ${bal}`);
      chrome.runtime.sendMessage({ type: 'SYNC_SHELL_BALANCE', balance: bal });
      sendResponse({ success: true, balance: bal });
    } else {
      autoSyncLiveShellBalance().then(success => {
        sendResponse({ success });
      });
    }
    return true;
  }

  if (request.action === 'EXECUTE_TOPUP') {
    const { order } = request;
    const playerUid = String(order.free_fire_player_id || order.player_uid || '').trim();
    const targetNum = resolveNumber(order.package_name || order.packageName);

    console.log(`[ShadowTopUp Extension] ▶ Fulfilling Order ${order.id}`);
    console.log(`                       Player UID: ${playerUid}`);
    console.log(`                       Package: ${targetNum}`);

    (async () => {
      try {
        // Refresh balance detection before topup
        autoSyncLiveShellBalance();

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

        const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, div, span, p'));
        const section2Header = allHeadings.find(h => h.textContent.includes('Top-up Amount'));
        const searchContainer = section2Header ? (section2Header.closest('section, div[class*="section"], div[class*="container"]') || document.body) : document.body;

        const candidates = Array.from(searchContainer.querySelectorAll('div, button, li, span, p'));
        let packageSelected = false;

        for (const el of candidates) {
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
          console.log('[ShadowTopUp Extension] ℹ Payment selection triggered checkout modal.');
        }

        await delay(3000);

        // Refresh balance post-topup
        autoSyncLiveShellBalance();

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
    })();
  }
});

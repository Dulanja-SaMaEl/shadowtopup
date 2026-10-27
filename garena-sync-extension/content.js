/**
 * Shadow Store - Automatic Background Sync for shop.garena.my
 * Runs silently in the background whenever shop.garena.my is open.
 */

const DEFAULT_API_URL = 'https://www.shadowstorelk.com/api/admin/shell-accounts/sync';
const DEFAULT_ACCOUNT_USERNAME = 'SHADOW_TOPUP1';
const DEFAULT_SYNC_SECRET = '';

let lastSyncedBalance = null;

function showSyncPill(text, isError = false) {
  let pill = document.getElementById('__shadow_auto_pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = '__shadow_auto_pill';
    pill.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      padding: 10px 16px;
      border-radius: 9999px;
      background: rgba(13, 11, 29, 0.95);
      border: 1.5px solid ${isError ? '#f43f5e' : '#10b981'};
      box-shadow: 0 4px 20px ${isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform: translateY(100px);
      opacity: 0;
    `;
    document.body.appendChild(pill);
  }

  pill.style.borderColor = isError ? '#f43f5e' : '#10b981';
  pill.style.boxShadow = `0 4px 20px ${isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`;
  pill.innerHTML = `
    <span style="font-size: 14px;">${isError ? '⚠️' : '⚡'}</span>
    <span>${text}</span>
  `;

  // Animate in
  requestAnimationFrame(() => {
    pill.style.transform = 'translateY(0)';
    pill.style.opacity = '1';
  });

  setTimeout(() => {
    pill.style.transform = 'translateY(100px)';
    pill.style.opacity = '0';
  }, 4000);
}

function extractBalance() {
  let bal = null;
  let username = '';

  // 1. Direct Shell SVG icon container
  let shellSvg = document.querySelector('svg[aria-label="Shell"]');
  if (shellSvg && shellSvg.parentElement) {
    const numDiv = shellSvg.parentElement.querySelector('.text-ellipsis, [class*="font-bold"], div');
    if (numDiv) {
      const raw = numDiv.textContent.replace(/,/g, '').trim();
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= 0) {
        bal = parsed;
      }
    }
  }

  // 2. Element labeled "Garena Shells"
  if (bal === null) {
    const allDivs = Array.from(document.querySelectorAll('div'));
    const labelDiv = allDivs.find(d => d.children.length === 0 && d.textContent.trim() === 'Garena Shells');
    if (labelDiv && labelDiv.parentElement) {
      const numDiv = labelDiv.parentElement.querySelector('.text-ellipsis, [class*="font-bold"]');
      if (numDiv) {
        const raw = numDiv.textContent.replace(/,/g, '').trim();
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed >= 0) {
          bal = parsed;
        }
      }
    }
  }

  // 3. Fallback to searching page text
  if (bal === null) {
    const text = document.body ? document.body.innerText : '';
    const match = text.match(/(\d[\d,\.]*)\s*(?:Shells?|GS)/i);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(num) && num >= 0) {
        bal = num;
      }
    }
  }

  return { balance: bal, username };
}

async function performAutoSync() {
  const { balance, username } = extractBalance();
  if (balance === null) return;
  if (lastSyncedBalance === balance) return;

  try {
    const config = await new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['apiUrl', 'syncSecret', 'accountUsername'], (res) => resolve(res || {}));
      } else {
        resolve({});
      }
    });

    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    const syncSecret = config.syncSecret || DEFAULT_SYNC_SECRET;
    const syncUsername = config.accountUsername || username || DEFAULT_ACCOUNT_USERNAME;

    if (!syncSecret || !syncUsername) {
      return;
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-secret': syncSecret
      },
      body: JSON.stringify({
        username: syncUsername,
        explicitBalance: balance,
        syncSecret: syncSecret
      })
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      lastSyncedBalance = balance;
      showSyncPill(`Auto-Synced: ${balance.toLocaleString()} Shells`);
    }
  } catch (err) {
    console.warn('[Shadow Store Auto-Sync Error]', err);
  }
}

// Observe DOM changes on shop.garena.my
let timeoutId = null;
const observer = new MutationObserver(() => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    performAutoSync();
  }, 1000);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(performAutoSync, 2000);
}

/**
 * Shadow Store - Automatic Background Sync for shop.garena.my
 * Runs silently in the background whenever shop.garena.my is open.
 */

const DEFAULT_SUPABASE_URL = 'https://vdqyxwenhzhucmqiyogi.supabase.co';


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
      gap: 6px;
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(pill);
  } else {
    pill.style.borderColor = isError ? '#f43f5e' : '#10b981';
    pill.style.boxShadow = isError ? '0 4px 20px rgba(244, 63, 94, 0.4)' : '0 4px 20px rgba(16, 185, 129, 0.4)';
    pill.style.opacity = '1';
  }

  pill.innerHTML = `<span>${isError ? '⚠️' : '⚡'}</span><span>${text}</span>`;

  setTimeout(() => {
    if (pill) {
      pill.style.opacity = '0';
    }
  }, 4000);
}

async function performAutoSync() {
  let balance = null;
  let username = '';

  // 1. Try reading from visible DOM (if dropdown is open)
  const shellSvg = document.querySelector('svg[aria-label="Shell"]');
  if (shellSvg && shellSvg.parentElement) {
    const numDiv = shellSvg.parentElement.querySelector('.text-ellipsis, [class*="font-bold"], div');
    if (numDiv) {
      const parsed = parseFloat(numDiv.textContent.replace(/,/g, '').trim());
      if (!isNaN(parsed) && parsed >= 0) balance = parsed;
    }
  }

  // 2. Try internal Garena Shop session API
  if (balance === null) {
    try {
      const sRes = await fetch('/api/auth/check_session', { credentials: 'include' });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.login && sData.session_key) {
          const ssoRes = await fetch('/api/auth/sso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_key: sData.session_key }),
            credentials: 'include'
          });
          if (ssoRes.ok) {
            const ssoData = await ssoRes.json();
            if (typeof ssoData.shell_balance === 'number') {
              balance = ssoData.shell_balance;
              if (ssoData.username) username = ssoData.username;
            }
          }
        }
      }
    } catch (e) {
      // API query fallback
    }
  }

  // 3. Fallback: inspect page text
  if (balance === null) {
    const allText = document.body ? document.body.innerText : '';
    const match = allText.match(/(\d[\d,\.]*)\s*(?:Shells?|GS)/i);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(num) && num >= 0) balance = num;
    }
  }

  // If no balance detected, don't spam
  if (balance === null) return;

  // Don't re-sync if balance hasn't changed
  if (lastSyncedBalance === balance) return;

  // Update Supabase directly if configured
  try {
    const config = await new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['supabaseUrl', 'supabaseKey', 'accountUsername'], (res) => resolve(res || {}));
      } else {
        resolve({});
      }
    });

    const supabaseUrl = config.supabaseUrl || DEFAULT_SUPABASE_URL;
    const supabaseKey = config.supabaseKey;
    const syncUsername = config.accountUsername || username;

    if (!supabaseKey || !syncUsername) {
      // Secret key or username not configured in extension popup
      return;
    }

    const nowIso = new Date().toISOString();
    const res = await fetch(`${supabaseUrl}/rest/v1/shell_accounts?account_username=eq.${encodeURIComponent(syncUsername)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        available_balance: balance,
        last_synced_at: nowIso,
        updated_at: nowIso
      })
    });

    if (res.ok) {
      lastSyncedBalance = balance;
      showSyncPill(`Shadow Store: ${balance.toLocaleString()} Shells Synced`);
      console.log(`[ShadowStore AutoSync] Successfully synced ${balance} Shells for ${syncUsername}.`);
    }
  } catch (err) {
    console.warn('[ShadowStore AutoSync] Failed to sync:', err);
  }
}

// Run 2 seconds after page load
setTimeout(performAutoSync, 2000);

// Auto-sync every 3 minutes while tab is open
setInterval(performAutoSync, 3 * 60 * 1000);

// Also sync whenever user switches back to the tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    performAutoSync();
  }
});

const SYNC_SECRET = 'a29b37d3-dc90-4c79-9a7d-59b977b6e597';
const SHADOW_STORE_API = 'https://www.shadowstorelk.com/api/admin/shell-accounts/sync';

const syncBtn = document.getElementById('syncBtn');
const statusBox = document.getElementById('statusBox');

function showStatus(text, type) {
  statusBox.className = 'status ' + type;
  statusBox.textContent = text;
}

syncBtn.addEventListener('click', async () => {
  syncBtn.disabled = true;
  showStatus('Detecting active Garena session on shop.garena.my...', 'info');

  try {
    // 1. Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.includes('garena')) {
      showStatus('⚠️ Please open shop.garena.my and log into your account first!', 'error');
      syncBtn.disabled = false;
      return;
    }

    // 2. Execute script in the active tab to read session balance
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        let bal = null;
        let username = 'SHADOW_TOPUP1';

        // Check internal session API
        try {
          const r1 = await fetch('/api/auth/check_session', { credentials: 'include' });
          const d1 = await r1.json();
          if (d1 && d1.login && d1.session_key) {
            const r2 = await fetch('/api/auth/sso', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_key: d1.session_key }),
              credentials: 'include'
            });
            const d2 = await r2.json();
            if (typeof d2.shell_balance === 'number') {
              bal = d2.shell_balance;
              if (d2.username) username = d2.username;
            }
          }
        } catch (e) {
          console.warn('API query note:', e);
        }

        // Fallback to inspecting visible text
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

        return { bal, username };
      }
    });

    const data = results?.[0]?.result;
    if (!data || data.bal === null) {
      showStatus('❌ Could not detect Shell balance. Please ensure you are logged into shop.garena.my and refresh the page.', 'error');
      syncBtn.disabled = false;
      return;
    }

    showStatus(`Found ${data.bal.toLocaleString()} Shells! Syncing to Shadow Store...`, 'info');

    // 3. Post to Shadow Store API
    const postRes = await fetch(SHADOW_STORE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-secret': SYNC_SECRET
      },
      body: JSON.stringify({
        username: data.username || 'SHADOW_TOPUP1',
        explicitBalance: data.bal,
        syncSecret: SYNC_SECRET
      })
    });

    const postData = await postRes.json();
    if (postData.success) {
      showStatus(`✅ Synced Successfully!\nAccount: ${data.username}\nBalance: ${data.bal.toLocaleString()} Shells`, 'success');
    } else {
      showStatus(`❌ Server returned error: ${postData.message || 'Rejected'}`, 'error');
    }
  } catch (err) {
    showStatus(`❌ Error: ${err.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
  }
});

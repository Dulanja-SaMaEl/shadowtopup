const DEFAULT_SUPABASE_URL = 'https://vdqyxwenhzhucmqiyogi.supabase.co';

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

    // 2. Load extension config
    const config = await new Promise((resolve) => {
      chrome.storage.local.get(['supabaseUrl', 'supabaseKey', 'accountUsername'], (res) => resolve(res || {}));
    });

    const supabaseUrl = config.supabaseUrl || DEFAULT_SUPABASE_URL;
    const supabaseKey = config.supabaseKey;

    if (!supabaseKey) {
      showStatus('⚠️ Please configure your SUPABASE_SERVICE_ROLE_KEY in extension storage.', 'error');
      syncBtn.disabled = false;
      return;
    }

    // 3. Execute script in the active tab to read session balance
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        let bal = null;
        let username = '';

        // Method A: Check exact shop.garena.my Shell balance DOM element
        let shellSvg = document.querySelector('svg[aria-label="Shell"]');
        if (!shellSvg) {
          // If closed, click header avatar to open dropdown
          const avatar = Array.from(document.querySelectorAll('header img, nav img, header button, div[class*="avatar"]'))[0];
          if (avatar) {
            avatar.click();
            await new Promise((r) => setTimeout(r, 400));
          }
          shellSvg = document.querySelector('svg[aria-label="Shell"]');
        }

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

        // Method B: Find by "Garena Shells" label element
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

        return { bal, username };
      }
    });

    const data = results?.[0]?.result;
    if (!data || data.bal === null) {
      showStatus('❌ Could not detect Shell balance. Please open the profile dropdown on shop.garena.my and click Sync again.', 'error');
      syncBtn.disabled = false;
      return;
    }

    const targetUsername = config.accountUsername || data.username;
    if (!targetUsername) {
      showStatus('⚠️ Please configure your Shell Account username in extension storage.', 'error');
      syncBtn.disabled = false;
      return;
    }

    showStatus(`Found ${data.bal.toLocaleString()} Shells! Updating Shadow Store database...`, 'info');

    // 4. Update Supabase Directly
    const nowIso = new Date().toISOString();
    const postRes = await fetch(`${supabaseUrl}/rest/v1/shell_accounts?account_username=eq.${encodeURIComponent(targetUsername)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        available_balance: data.bal,
        last_synced_at: nowIso,
        updated_at: nowIso
      })
    });

    if (postRes.ok) {
      showStatus(`✅ Synced Successfully!\nAccount: ${targetUsername}\nBalance: ${data.bal.toLocaleString()} Shells`, 'success');
    } else {
      const errTxt = await postRes.text();
      showStatus(`❌ Server returned error: ${errTxt}`, 'error');
    }
  } catch (err) {
    showStatus(`❌ Error: ${err.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
  }
});

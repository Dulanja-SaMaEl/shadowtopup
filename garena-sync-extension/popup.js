const DEFAULT_SUPABASE_URL = 'https://vdqyxwenhzhucmqiyogi.supabase.co';
const DEFAULT_ACCOUNT_USERNAME = 'SHADOW_TOPUP1';

const syncBtn = document.getElementById('syncBtn');
const statusBox = document.getElementById('statusBox');
const primaryAccountVal = document.getElementById('primaryAccountVal');
const toggleSettings = document.getElementById('toggleSettings');
const settingsPanel = document.getElementById('settingsPanel');
const inputUsername = document.getElementById('inputUsername');
const inputSupabaseKey = document.getElementById('inputSupabaseKey');
const inputSupabaseUrl = document.getElementById('inputSupabaseUrl');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

function showStatus(text, type) {
  statusBox.className = 'status ' + type;
  statusBox.textContent = text;
}

// 1. Initialize and auto-populate storage with local config or defaults
chrome.storage.local.get(['supabaseUrl', 'supabaseKey', 'accountUsername'], (res) => {
  const localConfig = (typeof window !== 'undefined' && window.SHADOW_LOCAL_CONFIG) || {};
  const currentUrl = res?.supabaseUrl || localConfig.supabaseUrl || DEFAULT_SUPABASE_URL;
  const currentKey = res?.supabaseKey || localConfig.supabaseKey || '';
  const currentUsername = res?.accountUsername || localConfig.accountUsername || DEFAULT_ACCOUNT_USERNAME;

  // Persist if found in local config or already present
  if ((!res?.supabaseKey && currentKey) || !res?.accountUsername || !res?.supabaseUrl) {
    chrome.storage.local.set({
      supabaseUrl: currentUrl,
      supabaseKey: currentKey,
      accountUsername: currentUsername
    });
  }

  if (primaryAccountVal) primaryAccountVal.textContent = currentUsername;
  if (inputUsername) inputUsername.value = currentUsername;
  if (inputSupabaseKey) inputSupabaseKey.value = currentKey;
  if (inputSupabaseUrl) inputSupabaseUrl.value = currentUrl;
});

// 2. Settings toggle
if (toggleSettings && settingsPanel) {
  toggleSettings.addEventListener('click', () => {
    settingsPanel.classList.toggle('open');
  });
}

// 3. Save settings handler
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    const newUsername = (inputUsername.value || DEFAULT_ACCOUNT_USERNAME).trim();
    const newKey = (inputSupabaseKey.value || '').trim();
    const newUrl = (inputSupabaseUrl.value || DEFAULT_SUPABASE_URL).trim();

    chrome.storage.local.set({
      supabaseUrl: newUrl,
      supabaseKey: newKey,
      accountUsername: newUsername
    }, () => {
      if (primaryAccountVal) primaryAccountVal.textContent = newUsername;
      showStatus('✅ Settings saved to extension storage!', 'success');
      settingsPanel.classList.remove('open');
    });
  });
}

// 4. Sync button handler
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

        // Method C: Check session API if DOM inspection failed
        if (bal === null) {
          try {
            const sRes = await fetch('/api/auth/check_session', { credentials: 'include' });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (sData && sData.session_key) {
                const ssoRes = await fetch('/api/auth/sso', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ session_key: sData.session_key }),
                  credentials: 'include'
                });
                if (ssoRes.ok) {
                  const ssoData = await ssoRes.json();
                  if (typeof ssoData.shell_balance === 'number') {
                    bal = ssoData.shell_balance;
                    if (ssoData.username) username = ssoData.username;
                  }
                }
              }
            }
          } catch (e) {}
        }

        return { bal, username };
      }
    });

    const data = results?.[0]?.result;
    if (!data || data.bal === null) {
      showStatus('❌ Could not detect Shell balance. Please make sure you are logged into shop.garena.my with your profile menu visible.', 'error');
      syncBtn.disabled = false;
      return;
    }

    const targetUsername = config.accountUsername || data.username || DEFAULT_ACCOUNT_USERNAME;
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

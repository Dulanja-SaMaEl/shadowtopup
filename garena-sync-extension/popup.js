const DEFAULT_API_URL = 'https://www.shadowstorelk.com/api/admin/shell-accounts/sync';
const DEFAULT_ACCOUNT_USERNAME = 'SHADOW_TOPUP1';
const DEFAULT_SYNC_SECRET = '';

const syncBtn = document.getElementById('syncBtn');
const statusBox = document.getElementById('statusBox');
const targetServerVal = document.getElementById('targetServerVal');
const primaryAccountVal = document.getElementById('primaryAccountVal');
const toggleSettings = document.getElementById('toggleSettings');
const settingsPanel = document.getElementById('settingsPanel');
const inputUsername = document.getElementById('inputUsername');
const inputApiUrl = document.getElementById('inputApiUrl');
const inputSyncSecret = document.getElementById('inputSyncSecret');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

function showStatus(text, type) {
  statusBox.className = 'status ' + type;
  statusBox.textContent = text;
}

function updateServerDisplay(url) {
  try {
    const u = new URL(url);
    if (targetServerVal) targetServerVal.textContent = u.hostname;
  } catch (e) {
    if (targetServerVal) targetServerVal.textContent = 'shadowstorelk.com';
  }
}

// 1. Initialize and auto-populate storage with local config or defaults
chrome.storage.local.get(['apiUrl', 'syncSecret', 'accountUsername'], (res) => {
  const localConfig = (typeof window !== 'undefined' && window.SHADOW_LOCAL_CONFIG) || {};
  const currentUrl = res?.apiUrl || localConfig.apiUrl || DEFAULT_API_URL;
  const currentSecret = res?.syncSecret || localConfig.syncSecret || DEFAULT_SYNC_SECRET;
  const currentUsername = res?.accountUsername || localConfig.accountUsername || DEFAULT_ACCOUNT_USERNAME;

  // Persist if found in local config or already present
  if ((!res?.syncSecret && currentSecret) || !res?.accountUsername || !res?.apiUrl) {
    chrome.storage.local.set({
      apiUrl: currentUrl,
      syncSecret: currentSecret,
      accountUsername: currentUsername
    });
  }

  updateServerDisplay(currentUrl);
  if (primaryAccountVal) primaryAccountVal.textContent = currentUsername;
  if (inputUsername) inputUsername.value = currentUsername;
  if (inputApiUrl) inputApiUrl.value = currentUrl;
  if (inputSyncSecret) inputSyncSecret.value = currentSecret;
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
    const newApiUrl = (inputApiUrl.value || DEFAULT_API_URL).trim();
    const newSecret = (inputSyncSecret.value || '').trim();

    chrome.storage.local.set({
      apiUrl: newApiUrl,
      syncSecret: newSecret,
      accountUsername: newUsername
    }, () => {
      updateServerDisplay(newApiUrl);
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
      chrome.storage.local.get(['apiUrl', 'syncSecret', 'accountUsername'], (res) => resolve(res || {}));
    });

    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    const syncSecret = config.syncSecret || (typeof window !== 'undefined' && window.SHADOW_LOCAL_CONFIG?.syncSecret) || '';

    if (!syncSecret) {
      showStatus('⚠️ Please configure your Sync Secret Key in extension storage.', 'error');
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
    showStatus(`Found ${data.bal.toLocaleString()} Shells! Updating Shadow Store server...`, 'info');

    // 4. Post to Shadow Store API
    const postRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-secret': syncSecret
      },
      body: JSON.stringify({
        username: targetUsername,
        explicitBalance: data.bal,
        syncSecret: syncSecret
      })
    });

    const postData = await postRes.json().catch(() => null);
    if (postRes.ok && postData && postData.success) {
      showStatus(`✅ Synced Successfully!\nAccount: ${targetUsername}\nBalance: ${data.bal.toLocaleString()} Shells`, 'success');
    } else {
      showStatus(`❌ Server returned error: ${postData?.message || postRes.statusText}`, 'error');
    }
  } catch (err) {
    showStatus(`❌ Error: ${err.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
  }
});

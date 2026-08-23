let socket = null;
let heartbeatInterval = null;

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'PING', client: 'CHROME_EXTENSION' }));
    }
  }, 10000); // 10s ping keeps MV3 service worker awake
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:3456');

  socket.onopen = () => {
    console.log('[ShadowTopUp Extension] ✅ Connected to Local Worker WebSocket');
    chrome.storage.local.set({ status: 'CONNECTED' });
    // Identify client to server
    socket.send(JSON.stringify({ type: 'REGISTER_CLIENT', client: 'CHROME_EXTENSION' }));
    startHeartbeat();
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'START_FULFILLMENT') {
        console.log('[ShadowTopUp Extension] 🔔 FULFILLMENT TASK RECEIVED:', data.order);
        await executeFulfillment(data.order);
      }
    } catch (e) {
      console.error('[ShadowTopUp Extension] Error parsing WS message:', e);
    }
  };

  socket.onclose = () => {
    console.warn('[ShadowTopUp Extension] ⚡ WS Disconnected, reconnecting in 3s...');
    chrome.storage.local.set({ status: 'DISCONNECTED' });
    stopHeartbeat();
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (err) => {
    console.error('[ShadowTopUp Extension] WS Error:', err);
    socket.close();
  };
}

async function executeFulfillment(order) {
  const garenaUrl = 'https://shop.garena.my/app/100067/idlogin';
  
  const tabs = await chrome.tabs.query({ url: 'https://shop.garena.my/*' });
  let tab = null;

  if (tabs.length > 0) {
    tab = tabs[0];
    await chrome.tabs.update(tab.id, { url: garenaUrl, active: true });
  } else {
    tab = await chrome.tabs.create({ url: garenaUrl, active: true });
  }

  const sendTaskToTab = (attempts = 0) => {
    chrome.tabs.sendMessage(tab.id, { action: 'EXECUTE_TOPUP', order: order }, (response) => {
      if (chrome.runtime.lastError) {
        if (attempts < 10) {
          setTimeout(() => sendTaskToTab(attempts + 1), 1000);
        } else {
          console.error('[ShadowTopUp Extension] Could not reach content script:', chrome.runtime.lastError.message);
          reportResult(order.id, false, 'Failed to inject tab automation script');
        }
      }
    });
  };

  setTimeout(() => sendTaskToTab(), 2500);
}

function reportResult(orderId, success, error = null) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'TASK_COMPLETED',
      orderId: orderId,
      success: success,
      error: error
    }));
  }
}

// Handle completion reports from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FULFILLMENT_RESULT') {
    console.log('[ShadowTopUp Extension] Task result:', message);
    reportResult(message.orderId, message.success, message.error);
    sendResponse({ ack: true });
  }
  return true;
});

// Chrome alarms API to ensure MV3 background worker wakes up periodically
chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
  }
});

connectWebSocket();

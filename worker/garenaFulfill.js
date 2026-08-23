require('dotenv').config();
const { broadcast } = require('./dashboard');

// Global event bus for task completion responses from the Chrome Extension
const pendingTasks = new Map();

function registerExtensionResponseHandler(wss) {
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'TASK_COMPLETED') {
          const handler = pendingTasks.get(data.orderId);
          if (handler) {
            handler(data);
            pendingTasks.delete(data.orderId);
          }
        }
      } catch (err) {
        console.error('[Worker] Error processing message from extension:', err);
      }
    });
  });
}

async function fulfillOrder(order) {
  const playerUid = String(order.free_fire_player_id || order.player_uid || '').trim();
  const packageName = String(order.package_name || order.packageName || '25 Diamonds').trim();

  if (!playerUid) throw new Error('No Player UID found on order');

  console.log(`\n[Worker] ▶ Dispatching Order ${order.id} to Native Chrome Extension`);
  console.log(`         Player UID : ${playerUid}`);
  console.log(`         Package    : ${packageName}`);

  // Broadcast fulfillment job to Native Extension over WebSocket
  broadcast(JSON.stringify({
    type: 'START_FULFILLMENT',
    order: {
      id: order.id,
      free_fire_player_id: playerUid,
      package_name: packageName
    }
  }));

  // Return a Promise that resolves when the Chrome Extension responds with task status
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      pendingTasks.delete(order.id);
      resolve({ success: false, error: 'Fulfillment timed out after 45 seconds (Extension response pending)' });
    }, 45000);

    pendingTasks.set(order.id, (result) => {
      clearTimeout(timeout);
      if (result.success) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: result.error || 'Extension reported fulfillment error' });
      }
    });
  });
}

module.exports = { fulfillOrder, registerExtensionResponseHandler };

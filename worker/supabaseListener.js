require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { fulfillOrder } = require('./garenaFulfill');
const { orderProcessed, broadcast } = require('./dashboard');
const log = require('./logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let isProcessing = false;

// ─── Update order status + deduct shell balance in Supabase ──────────────────
async function markOrderCompleted(orderId, shellCost) {
  log.db(`Marking order ${orderId} as completed...`);

  await supabase
    .from('orders')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Deduct shell balance from all registered shell accounts
  const { data: accounts } = await supabase.from('shell_accounts').select('*');
  if (accounts && accounts.length > 0) {
    for (const acc of accounts) {
      const newBalance = Math.max(0, (acc.available_balance || 0) - shellCost);
      await supabase
        .from('shell_accounts')
        .update({
          available_balance: newBalance,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', acc.id);
      log.db(`Shell balance updated: ${acc.available_balance} → ${newBalance}`);
    }
  }
}

async function markOrderFailed(orderId, reason) {
  log.error(`Order ${orderId} failed: ${reason}`);
  await supabase
    .from('orders')
    .update({
      status: 'failed',
      notes: `Auto-fulfill failed: ${reason}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);
}

// ─── Process a single incoming order ─────────────────────────────────────────
async function processOrder(order) {
  if (isProcessing) {
    console.log('[Worker] Already processing an order — queuing will retry shortly...');
    return;
  }

  isProcessing = true;
  log.order('═'.repeat(55));
  log.order(`🔔 NEW ORDER RECEIVED`);
  log.order(`Order ID   : ${order.id}`);
  log.order(`Player UID : ${order.free_fire_player_id}`);
  log.order(`Package    : ${order.package_name}`);
  log.order(`Amount     : ${order.total_price}`);
  log.order('═'.repeat(55));
  broadcast(JSON.stringify({ type: 'divider' }));

  // Estimate shell cost from package name
  const shellCost = estimateShellCost(order.package_name);

  try {
    const result = await fulfillOrder(order);

    if (result.success) {
      await markOrderCompleted(order.id, shellCost);
      log.success(`Order ${order.id} COMPLETE — ${shellCost} Shells deducted.`);
      orderProcessed(true);
    } else {
      await markOrderFailed(order.id, result.error || 'Unknown error');
      orderProcessed(false);
    }
  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
    await markOrderFailed(order.id, err.message);
  } finally {
    isProcessing = false;
  }
}

function estimateShellCost(packageName) {
  const name = String(packageName).toLowerCase();
  if (name.includes('25'))    return 13;
  if (name.includes('100'))   return 50;
  if (name.includes('310'))   return 155;
  if (name.includes('520'))   return 260;
  if (name.includes('1060'))  return 530;
  if (name.includes('2180'))  return 1090;
  if (name.includes('5600'))  return 2800;
  if (name.includes('11500')) return 5750;
  return 13; // default fallback
}

// ─── Also poll for any missed orders on startup ───────────────────────────────
async function processPendingOrders() {
  log.info('Checking for pending wallet orders...');
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_method', 'wallet')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    log.error(`Error fetching pending orders: ${error.message}`);
    return;
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    log.info('No pending orders found — worker is ready.');
    return;
  }

  log.info(`Found ${pendingOrders.length} pending order(s) — processing sequentially...`);
  for (const order of pendingOrders) {
    await processOrder(order);
    await new Promise(r => setTimeout(r, 3000)); // Pause between orders
  }
}

// ─── Start real-time Supabase listener ───────────────────────────────────────
async function startListener() {
  log.info('Real-time Supabase listener initializing...');
  log.info('Waiting for new wallet orders...');

  // Process any missed pending orders first
  await processPendingOrders();

  // Subscribe to real-time INSERT events on orders table
  supabase
    .channel('order-fulfillment-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: "payment_method=eq.wallet",
      },
      async (payload) => {
        console.log('[Worker] 🔔 Real-time INSERT detected on orders table!');
        const order = payload.new;
        if (order && (order.status === 'pending' || order.status === 'paid')) {
          log.order(`Real-time INSERT detected — Order ${order.id}`);
          await processOrder(order);
        }
      }
    )
    .subscribe((status) => {
      log.info(`Supabase real-time subscription: ${status}`);
    });
}

module.exports = { startListener };

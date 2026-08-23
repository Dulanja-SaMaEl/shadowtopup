require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { fulfillOrder } = require('./garenaFulfill');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let isProcessing = false;

// ─── Update order status + deduct shell balance in Supabase ──────────────────
async function markOrderCompleted(orderId, shellCost) {
  console.log(`[DB] Marking order ${orderId} as completed...`);

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
      console.log(`[DB] Shell balance updated: ${acc.available_balance} → ${newBalance}`);
    }
  }
}

async function markOrderFailed(orderId, reason) {
  console.log(`[DB] Marking order ${orderId} as failed: ${reason}`);
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
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[Worker] 🔔 NEW ORDER RECEIVED`);
  console.log(`         Order ID   : ${order.id}`);
  console.log(`         Player UID : ${order.free_fire_player_id}`);
  console.log(`         Package    : ${order.package_name}`);
  console.log(`         Amount     : ${order.total_price}`);
  console.log(`${'═'.repeat(60)}`);

  // Estimate shell cost from package name
  const shellCost = estimateShellCost(order.package_name);

  try {
    const result = await fulfillOrder(order);

    if (result.success) {
      await markOrderCompleted(order.id, shellCost);
      console.log(`[Worker] ✅ Order ${order.id} COMPLETE — ${shellCost} Shells deducted.`);
    } else {
      await markOrderFailed(order.id, result.error || 'Unknown error');
    }
  } catch (err) {
    console.error('[Worker] Unexpected error:', err.message);
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
  console.log('[Worker] Checking for pending wallet orders...');
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_method', 'wallet')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Worker] Error fetching pending orders:', error.message);
    return;
  }

  if (!pendingOrders || pendingOrders.length === 0) {
    console.log('[Worker] No pending orders found.');
    return;
  }

  console.log(`[Worker] Found ${pendingOrders.length} pending order(s) — processing sequentially...`);
  for (const order of pendingOrders) {
    await processOrder(order);
    await new Promise(r => setTimeout(r, 3000)); // Pause between orders
  }
}

// ─── Start real-time Supabase listener ───────────────────────────────────────
async function startListener() {
  console.log('\n[Worker] 🚀 ShadowTopUp Local Fulfillment Worker STARTED');
  console.log('[Worker] Listening for new wallet orders from Supabase...\n');

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
          await processOrder(order);
        }
      }
    )
    .subscribe((status) => {
      console.log(`[Worker] Supabase real-time subscription status: ${status}`);
    });
}

module.exports = { startListener };

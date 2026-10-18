import { createClient as createAdminClient } from '@supabase/supabase-js';
import { executeUCBotTopup } from './ucbotService';
import { sendPurchaseReceiptEmail } from './emailService';
import { checkAndNotifyLowStock } from './stockMonitor';

interface FulfillDialogPayOrderOptions {
  orderId: string;
  transactionId: string;
  provider?: string;
  payerId?: string;
}

export async function fulfillDialogPayOrder(options: FulfillDialogPayOrderOptions) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

  const { orderId, transactionId, provider, payerId } = options;

  // 1. Fetch order
  const { data: order, error: orderErr } = await adminSupabase
    .from('orders')
    .select('*, profiles:user_id(id, email, name, role, wallet_balance)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    console.error(`[DialogPay Fulfillment] Order ${orderId} not found in database:`, orderErr);
    return { success: false, message: 'Order not found' };
  }

  // Strict idempotency: if already completed or finalized, never deliver again!
  if (order.status === 'completed') {
    return { success: true, message: 'Order already fulfilled and completed.', order };
  }
  if (
    order.status === 'refunded' ||
    order.status === 'rejected' ||
    order.status === 'cancelled' ||
    order.status === 'failed'
  ) {
    return { success: false, message: `Order was marked ${order.status}. Delivery blocked.`, order };
  }

  // Atomically lock order from 'pending' -> 'processing' to prevent race conditions
  const { data: locked, error: lockErr } = await adminSupabase
    .from('orders')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select()
    .single();

  if (lockErr || !locked) {
    console.log(`[DialogPay Fulfillment] Order ${orderId} is already locked or completed by another process.`);
    return { success: true, message: 'Order is already being processed or completed.' };
  }

  // 2. Parse cart or package details from admin_note
  let cartItems: any[] = [];
  try {
    const match = order.admin_note?.match(/Cart:\s*(\[\{.*?\}\])/);
    if (match && match[1]) {
      cartItems = JSON.parse(match[1]);
    }
  } catch (e) {
    console.warn('[DialogPay Fulfillment] Could not parse cart details from admin_note, fallback to single item');
  }

  if (cartItems.length === 0) {
    cartItems = [{
      packageId: order.package_id,
      packageName: order.package_name,
      playerUid: order.free_fire_player_id || order.player_uid,
      quantity: 1,
      unitPrice: Number(order.total_amount),
      shellCost: 50,
    }];
  }

  const totalShells = cartItems.reduce((acc, it) => acc + (Number(it.shellCost) || 50) * (Number(it.quantity) || 1), 0);

  // 3. Find active Garena shell account
  const { data: shellAccounts } = await adminSupabase
    .from('shell_accounts')
    .select('*')
    .gte('available_balance', totalShells)
    .order('is_main', { ascending: false })
    .order('available_balance', { ascending: false });

  let targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;
  if (!targetShellAcc) {
    const { data: anyAccs } = await adminSupabase.from('shell_accounts').select('*').limit(1);
    if (anyAccs && anyAccs.length > 0) targetShellAcc = anyAccs[0];
  }

  const dbAutocode = targetShellAcc?.autocode ? String(targetShellAcc.autocode).trim() : '';
  const isAutocodeValid = dbAutocode && !dbAutocode.includes('•') && !dbAutocode.includes('*') && dbAutocode.length >= 8;
  const shellAutocode = isAutocodeValid ? dbAutocode : (process.env.GARENA_SHELL_AUTOCODE || '');

  // 4. Deliver each item via UC Bot
  let allDelivered = true;
  let shellsUsed = 0;
  let lastGarenaTxId = '';
  let lastNickname = order.player_nickname || '';
  const deliveryNotes: string[] = [];

  for (const it of cartItems) {
    const qty = Number(it.quantity) || 1;
    for (let q = 0; q < qty; q++) {
      try {
        const topupRes = await executeUCBotTopup(
          it.playerUid,
          it.packageName,
          'sg',
          targetShellAcc?.account_username || process.env.GARENA_SHELL_USERNAME || '',
          targetShellAcc?.password || process.env.GARENA_SHELL_PASSWORD || '',
          shellAutocode
        );

        if (topupRes.success) {
          shellsUsed += Number(it.shellCost) || 50;
          if (topupRes.transactionId) lastGarenaTxId = topupRes.transactionId;
          if (topupRes.playerNickname) lastNickname = topupRes.playerNickname;
          deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Delivered (Trx: ${topupRes.transactionId || 'OK'})`);
        } else {
          allDelivered = false;
          deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Delivery failed: ${topupRes.message}`);
        }
      } catch (err: any) {
        allDelivered = false;
        deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Exception: ${err?.message}`);
      }
    }
  }

  // 5. Update Shell Account balance
  if (shellsUsed > 0 && targetShellAcc?.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
    await adminSupabase.from('shell_accounts').update({
      available_balance: Math.max(0, (targetShellAcc.available_balance || 0) - shellsUsed),
      last_synced_at: new Date().toISOString(),
    }).eq('id', targetShellAcc.id);
  }

  const userEmail = order.profiles?.email;
  const payerInfo = payerId ? ` | Payer: ${payerId}` : '';
  const providerInfo = provider ? ` (${provider})` : '';

  // 6. Handle Delivery Outcome
  if (allDelivered) {
    // SUCCESS: Mark order completed
    const updatedNote = `Dialog Pay TxID: ${transactionId}${providerInfo}${payerInfo} | Garena Trx: ${lastGarenaTxId} | Player: ${lastNickname || order.free_fire_player_id || 'UID'} | ${deliveryNotes.join('; ')}`;
    await adminSupabase.from('orders').update({
      status: 'completed',
      admin_note: updatedNote,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);

    // Record purchase transaction
    try {
      await adminSupabase.from('purchase_transactions').insert([{
        user_id: order.user_id,
        package_id: order.package_id || null,
        package_name: order.package_name || 'Free Fire Package',
        free_fire_player_id: order.free_fire_player_id || order.player_uid || targetShellAcc?.account_username || 'N/A',
        shells_deducted: shellsUsed,
        price_paid: order.total_amount,
        price_tier: order.profiles?.role || 'normal',
        status: 'completed',
        payment_method: 'dialog_pay',
      }]);
    } catch (ptErr) {
      console.warn('[DialogPay Fulfillment] purchase_transactions record failed (non-critical):', ptErr);
    }

    // Send receipt email
    if (userEmail) {
      try {
        sendPurchaseReceiptEmail(userEmail, {
          orderId: String(order.id).slice(0, 8).toUpperCase(),
          transactionId,
          packageName: order.package_name,
          itemsDelivered: cartItems.map(c => c.packageName).join(', '),
          playerUid: order.player_uid,
          playerNickname: lastNickname,
          amount: Number(order.total_amount),
          paymentMethod: 'Dialog Pay (Genie Business)',
          status: 'COMPLETED & DELIVERED',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
      } catch (emailErr) {
        console.error('[DialogPay Fulfillment] Error sending receipt email:', emailErr);
      }
    }

    checkAndNotifyLowStock(adminSupabase).catch(() => {});
    return { success: true, message: 'Payment confirmed & in-game top-up delivered!' };
  } else {
    // Delivery failed on Garena after payment was confirmed -> Credit full amount to customer's Shadow Wallet
    const refundAmount = Number(order.total_amount);
    const curBal = parseFloat(order.profiles?.wallet_balance || 0);
    const newBal = curBal + refundAmount;

    await adminSupabase.from('profiles').update({ wallet_balance: newBal }).eq('id', order.user_id);

    await adminSupabase.from('wallet_transactions').insert([{
      user_id: order.user_id,
      type: 'WALLET_REFUND',
      amount: refundAmount,
      balance_after: newBal,
      description: `Auto-refund for Dialog Pay order #${String(order.id).slice(0, 8).toUpperCase()} (Garena delivery error: ${deliveryNotes.join('; ')}). Funds safely credited to your Shadow Wallet.`,
      created_at: new Date().toISOString(),
    }]);

    await adminSupabase.from('orders').update({
      status: 'refunded',
      admin_note: `Dialog Pay TxID: ${transactionId} confirmed, but Garena delivery failed. LKR ${refundAmount} auto-credited to customer Shadow Wallet. ${deliveryNotes.join('; ')}`,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);

    return {
      success: false,
      refunded_to_wallet: true,
      message: `Dialog Pay payment was confirmed, but automated delivery encountered an issue. LKR ${refundAmount.toLocaleString()} has been safely credited to your Shadow Wallet balance!`,
    };
  }
}

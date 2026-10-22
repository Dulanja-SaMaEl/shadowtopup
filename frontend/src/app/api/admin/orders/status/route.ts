import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';
import { executeUCBotTopup } from '@/lib/ucbotService';
import { sendPurchaseReceiptEmail } from '@/lib/emailService';
import { checkAndNotifyLowStock } from '@/lib/stockMonitor';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, order_id, shortId, id, status, autoFulfill = true } = body;
    const targetId = (orderId || order_id || shortId || id || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
    const uppercaseStatus = (status || '').toUpperCase();
    const allowedStatuses = ['COMPLETED', 'PENDING', 'REJECTED', 'REFUNDED'];

    if (!targetId || !allowedStatuses.includes(uppercaseStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid request: targetId and valid status required' }, { status: 400 });
    }

    const orderStatusVal = uppercaseStatus === 'COMPLETED' ? 'completed' : uppercaseStatus === 'REFUNDED' ? 'refunded' : uppercaseStatus === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = uppercaseStatus === 'COMPLETED' ? 'success' : uppercaseStatus === 'REFUNDED' ? 'refunded' : uppercaseStatus === 'REJECTED' ? 'failed' : 'pending';

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details first to get user_id, amount, and package_name (UUID-safe query)
    let orderRow: any = null;
    const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    if (isFullUuid) {
      const { data: directOrder } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();
      if (directOrder) {
        orderRow = directOrder;
      } else {
        const { data: directTx } = await adminSupabase
          .from('purchase_transactions')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();
        if (directTx) orderRow = directTx;
      }
    } else {
      // Short ID resolution (e.g. F8E6) without causing Postgres UUID type mismatch errors
      const cleanTarget = targetId.toLowerCase().replace(/[^a-z0-9]/g, '');
      const { data: recentOrders } = await adminSupabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      orderRow = (recentOrders || []).find((o: any) => {
        const cleanId = String(o.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanId.startsWith(cleanTarget);
      });

      if (!orderRow) {
        const { data: recentTxs } = await adminSupabase
          .from('purchase_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        orderRow = (recentTxs || []).find((t: any) => {
          const cleanId = String(t.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanId.startsWith(cleanTarget);
        });
      }
    }

    const matchedId = orderRow?.id || targetId;
    const userId = orderRow?.user_id;
    const refundAmount = Number(orderRow?.total_amount || orderRow?.price_paid || 0);
    const packageName = orderRow?.package_name || 'Top-up Package';

    // Handle Wallet Refund Logic
    if (uppercaseStatus === 'REFUNDED') {
      if (orderRow && (orderRow.status || '').toLowerCase() === 'refunded') {
        return NextResponse.json({
          success: false,
          message: 'Order has already been refunded to user wallet.',
        }, { status: 400 });
      }

      if (userId && refundAmount > 0) {
        // Fetch current user wallet balance
        const { data: userProfile } = await adminSupabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single();

        const currentBal = Number(userProfile?.wallet_balance || 0);
        const newBal = currentBal + refundAmount;

        // 1. Credit wallet balance in profiles table
        await adminSupabase
          .from('profiles')
          .update({
            wallet_balance: newBal,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // 2. Insert audit transaction into wallet_transactions
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: userId,
          type: 'WALLET_REFUND',
          amount: refundAmount,
          balance_after: newBal,
          description: `Refund for unavailable package: ${packageName} (Order #${matchedId.slice(0, 8)})`,
          created_at: new Date().toISOString(),
        }]);
      }
    }

    // Handle Automated UC Bot Fulfillment upon Approval (COMPLETED)
    let ucBotDispatchSummary: string | null = null;
    const isAlreadyDelivered = Boolean(
      orderRow?.admin_note?.includes('Delivered via UCBot') ||
      orderRow?.admin_note?.includes('Garena Trx:')
    );

    if (uppercaseStatus === 'COMPLETED' && autoFulfill && !isAlreadyDelivered) {
      const targetPlayerUid = String(orderRow?.free_fire_player_id || orderRow?.player_uid || body?.playerUid || body?.playerId || '').trim();

      if (!targetPlayerUid || targetPlayerUid.length < 5) {
        return NextResponse.json({
          success: false,
          message: 'Cannot auto-deliver via UC Bot: No valid Player UID found on this order.',
        }, { status: 400 });
      }

      // Parse cart items or single package
      let itemsToFulfill: { packageName: string; playerUid: string; shellCost?: number; quantity?: number }[] = [];
      try {
        const cartMatch = orderRow?.admin_note?.match(/Cart:\s*(\[\{.*?\}\])/);
        if (cartMatch && cartMatch[1]) {
          const parsed = JSON.parse(cartMatch[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            itemsToFulfill = parsed.map((it: any) => ({
              packageName: it.packageName || it.name,
              playerUid: it.playerUid || targetPlayerUid,
              shellCost: Number(it.shellCost) || 0,
              quantity: Number(it.quantity) || 1,
            }));
          }
        }
      } catch (err) {
        console.warn('[Admin Approve] Could not parse cart details from admin_note:', err);
      }

      if (itemsToFulfill.length === 0) {
        itemsToFulfill = [{
          packageName: orderRow?.package_name || packageName,
          playerUid: targetPlayerUid,
          shellCost: 0,
          quantity: 1,
        }];
      }

      // Fetch active Garena shell account with available shells
      const { data: shellAccounts } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .order('is_main', { ascending: false })
        .order('available_balance', { ascending: false });

      let targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;
      if (!targetShellAcc) {
        targetShellAcc = {
          id: 'shell_fallback_1',
          account_username: process.env.GARENA_SHELL_USERNAME || '',
          password: process.env.GARENA_SHELL_PASSWORD || '',
          autocode: process.env.GARENA_SHELL_AUTOCODE || '',
          available_balance: 6508,
          is_main: true,
        };
      }

      const dbAutocode = targetShellAcc?.autocode ? String(targetShellAcc.autocode).trim() : '';
      const isAutocodeValid = dbAutocode && !dbAutocode.includes('•') && !dbAutocode.includes('*') && dbAutocode.length >= 8;
      const shellAutocode = isAutocodeValid ? dbAutocode : (process.env.GARENA_SHELL_AUTOCODE || '');
      const shellUser = targetShellAcc?.account_username || process.env.GARENA_SHELL_USERNAME || '';
      const shellPass = targetShellAcc?.password || process.env.GARENA_SHELL_PASSWORD || '';

      let allDelivered = true;
      let shellsUsed = 0;
      let lastGarenaTxId = '';
      let lastNickname = '';
      const deliveryNotes: string[] = [];

      for (const it of itemsToFulfill) {
        const qty = Math.max(1, Number(it.quantity) || 1);
        for (let q = 0; q < qty; q++) {
          try {
            const topupRes = await executeUCBotTopup(
              it.playerUid,
              it.packageName,
              'sg',
              shellUser,
              shellPass,
              shellAutocode
            );

            if (topupRes.success) {
              const deducted = typeof topupRes.balanceUsed === 'number' ? topupRes.balanceUsed : (it.shellCost || 0);
              shellsUsed += deducted;
              if (topupRes.transactionId) lastGarenaTxId = topupRes.transactionId;
              if (topupRes.playerNickname) lastNickname = topupRes.playerNickname;
              deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Delivered (Trx: ${topupRes.transactionId || 'OK'})`);
            } else {
              allDelivered = false;
              deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Failed (${topupRes.message})`);
              break;
            }
          } catch (err: any) {
            allDelivered = false;
            deliveryNotes.push(`[${it.packageName} -> ${it.playerUid}]: Error (${err?.message})`);
            break;
          }
        }
        if (!allDelivered) break;
      }

      if (!allDelivered) {
        // Record failure in admin_note so admin can inspect the reason
        await adminSupabase.from('orders').update({
          admin_note: (orderRow?.admin_note ? `${orderRow.admin_note} | ` : '') + `UCBot Dispatch Failed: ${deliveryNotes.join('; ')}`,
          updated_at: new Date().toISOString(),
        }).eq('id', matchedId);

        return NextResponse.json({
          success: false,
          message: `UC Bot delivery failed: ${deliveryNotes.join('; ')}. Order was NOT approved.`,
        }, { status: 500 });
      }

      // Update Shell Account balance
      if (shellsUsed > 0 && targetShellAcc?.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
        await adminSupabase.from('shell_accounts').update({
          available_balance: Math.max(0, (targetShellAcc.available_balance || 0) - shellsUsed),
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', targetShellAcc.id);
      }

      ucBotDispatchSummary = `Delivered via UCBot TxID: ${lastGarenaTxId} | Player: ${lastNickname || targetPlayerUid} | ${deliveryNotes.join('; ')}`;
    }

    // Update order status and admin note
    const updatedAdminNote = ucBotDispatchSummary
      ? (orderRow?.admin_note ? `${orderRow.admin_note} | ${ucBotDispatchSummary}` : ucBotDispatchSummary)
      : orderRow?.admin_note;

    const orderUpdatePayload: any = {
      status: orderStatusVal,
      updated_at: new Date().toISOString(),
    };
    if (uppercaseStatus === 'COMPLETED') {
      orderUpdatePayload.verified_at = new Date().toISOString();
      if (updatedAdminNote) orderUpdatePayload.admin_note = updatedAdminNote;
    }

    await adminSupabase.from('orders').update(orderUpdatePayload).eq('id', matchedId);
    await adminSupabase.from('purchase_transactions').update({
      status: txStatusVal,
      updated_at: new Date().toISOString(),
    }).or(`id.eq.${matchedId},package_id.eq.${matchedId}`);

    // If order completed and customer has an email, send confirmation email
    if (uppercaseStatus === 'COMPLETED' && userId) {
      try {
        const { data: userProfile } = await adminSupabase.from('profiles').select('email').eq('id', userId).single();
        if (userProfile?.email) {
          sendPurchaseReceiptEmail(userProfile.email, {
            orderId: String(matchedId).slice(0, 8).toUpperCase(),
            transactionId: ucBotDispatchSummary ? 'UCBOT_AUTO_DISPATCH' : 'APPROVED_BY_ADMIN',
            packageName: orderRow?.package_name || packageName,
            itemsDelivered: orderRow?.package_name || packageName,
            playerUid: orderRow?.free_fire_player_id || orderRow?.player_uid,
            amount: Number(orderRow?.total_amount || 0),
            paymentMethod: 'Bank Transfer (Approved & Delivered)',
            status: 'COMPLETED & DELIVERED',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          }).catch((e) => console.warn('[EmailReceipt] Admin approve email error:', e));
        }
      } catch (emailErr) {
        console.warn('[Admin Approve] Email send failed (non-critical):', emailErr);
      }
    }

    checkAndNotifyLowStock(adminSupabase).catch(() => {});

    return NextResponse.json({
      success: true,
      message: ucBotDispatchSummary
        ? `⚡ Order approved and delivered via UC Bot! (${ucBotDispatchSummary})`
        : uppercaseStatus === 'REFUNDED'
          ? `Order #${matchedId.slice(0, 8)} refunded successfully! LKR ${refundAmount.toFixed(2)} credited to user Shadow Wallet.`
          : 'Order status updated successfully',
      status: orderStatusVal,
      ucBotDispatchSummary,
      refundedAmount: uppercaseStatus === 'REFUNDED' ? refundAmount : 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { executeUCBotTopup } from '@/lib/ucbotService';
import { getAuthenticatedUser } from '@/lib/authGuard';
import { verifyEZCashTransaction } from '@/lib/ezcashService';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';
import { sendPurchaseReceiptEmail } from '@/lib/emailService';
import { checkAndNotifyLowStock } from '@/lib/stockMonitor';
import { getRestockAlert } from '@/lib/restockAlertService';

// Max packages sent in a single UC Bot request. Bundles never contain the same package code
// twice (duplicates go to the next request) so a provider-side de-dupe can't silently drop items.
const MAX_PACKS_PER_UCBOT_REQUEST = 5;

interface CartDispatchItem {
  dbPackage: any;
  packageName: string;
  playerUid: string;
  shellCost: number;
}

type CartItemOutcome = 'delivered' | 'failed' | 'review';

interface CartDispatchResult<T> {
  item: T;
  outcome: CartItemOutcome;
  reason: string;
  transactionId?: string;
  playerNickname?: string;
  bundleNote: string;
}

function getPackageIdentifier(it: CartDispatchItem): string {
  return it.dbPackage?.package_code && String(it.dbPackage.package_code).trim()
    ? String(it.dbPackage.package_code).trim()
    : it.packageName;
}

/**
 * Delivers cart items through UC Bot.
 * Items for the same Player UID are bundled into ONE request ("LITE,WEEKLY"), so Garena only
 * logs in once per bundle instead of once per item.
 *
 * Outcomes per item:
 *  - delivered: UC Bot confirmed success
 *  - failed:    UC Bot failed with no sign of delivery -> caller refunds
 *  - review:    a multi-pack bundle failed but UC Bot reported a trx_id or shells used, so some
 *               packs may have been delivered -> caller must NOT auto-refund; admin reviews
 */
async function dispatchCartTopups<T extends CartDispatchItem>(
  items: T[],
  shellAcc: any
): Promise<{ results: CartDispatchResult<T>[]; lastPostBalance?: number }> {
  const dbAutocode = shellAcc?.autocode ? String(shellAcc.autocode).trim() : '';
  const isDbAutocodeValid = dbAutocode && !dbAutocode.includes('•') && !dbAutocode.includes('*') && dbAutocode.length >= 8;
  const shellAutocode = isDbAutocodeValid ? dbAutocode : (process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J');

  // 1. Group by Player UID (keeps cart order)
  const groups = new Map<string, T[]>();
  for (const it of items) {
    const list = groups.get(it.playerUid) || [];
    list.push(it);
    groups.set(it.playerUid, list);
  }

  // 2. Split each group into bundles of unique package codes
  const bundles: { uid: string; items: T[] }[] = [];
  for (const [uid, groupItems] of groups) {
    const uidBundles: T[][] = [];
    for (const it of groupItems) {
      const code = getPackageIdentifier(it).toUpperCase();
      const target = uidBundles.find(
        (b) => b.length < MAX_PACKS_PER_UCBOT_REQUEST && !b.some((x) => getPackageIdentifier(x).toUpperCase() === code)
      );
      if (target) target.push(it);
      else uidBundles.push([it]);
    }
    uidBundles.forEach((b) => bundles.push({ uid, items: b }));
  }

  // 3. One UC Bot request per bundle
  const results: CartDispatchResult<T>[] = [];
  let lastPostBalance: number | undefined;

  for (const bundle of bundles) {
    const codes = bundle.items.map(getPackageIdentifier);
    const isMulti = codes.length > 1;
    const expectedShells = bundle.items.reduce((sum, i) => sum + (Number(i.shellCost) || 0), 0);

    let res: any;
    try {
      res = await executeUCBotTopup(
        bundle.uid,
        isMulti ? codes : codes[0],
        'sg',
        shellAcc?.account_username || 'SHADOW_TOPUP1',
        shellAcc?.password || 'Shadow123@',
        shellAutocode
      );
    } catch (e: any) {
      res = { success: false, message: e?.message || 'Topup delivery failed' };
    }

    if (typeof res?.postBalance === 'number') lastPostBalance = res.postBalance;

    const usedNote = typeof res?.balanceUsed === 'number' ? ` | balance_used=${res.balanceUsed} (expected ${expectedShells})` : '';
    const bundleNote = isMulti ? `Bundled ${codes.length} packs in 1 UCBot request [${codes.join(',')}]${usedNote}` : '';
    const reason = typeof res?.message === 'string' ? res.message : JSON.stringify(res?.message ?? 'Topup delivery failed');

    let outcome: CartItemOutcome;
    if (res?.success) {
      outcome = 'delivered';
    } else {
      const raw = res?.rawResponse || {};
      const maybePartlyDelivered = Boolean(raw.trx_id) || (typeof res?.balanceUsed === 'number' && res.balanceUsed > 0);
      outcome = isMulti && maybePartlyDelivered ? 'review' : 'failed';
    }

    for (const it of bundle.items) {
      results.push({
        item: it,
        outcome,
        reason,
        transactionId: res?.transactionId,
        playerNickname: res?.playerNickname,
        bundleNote,
      });
    }
  }

  return { results, lastPostBalance };
}

/**
 * Inserts a refunded cart order. Tries status 'refunded' (what the dashboards display as
 * "REFUNDED TO WALLET"); if the live DB check constraint doesn't allow it yet, falls back to
 * 'rejected' so the failed item is never silently missing from the customer's order history.
 */
async function insertRefundedOrder(adminSupabase: any, row: Record<string, any>) {
  const first = await adminSupabase.from('orders').insert([{ ...row, status: 'refunded' }]).select();
  if (!first.error) return first.data?.[0] || null;

  const fallback = await adminSupabase.from('orders').insert([{ ...row, status: 'rejected' }]).select();
  if (fallback.error) {
    console.error('[Order Flow] Failed to record refunded cart order:', fallback.error);
    return null;
  }
  return fallback.data?.[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    // 1. Enforce strict server-side session authentication
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in to complete your order.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      packageId,
      packageName,
      playerUid,
      paymentMethod = 'bank_transfer',
      receiptUrl = null,
      ezCashTrxId = null,
      items,
    } = body;

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 1.B Batch Cart Checkout Handler (when items array is provided from Shopping Cart)
    if (items && Array.isArray(items) && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const uid = String(it.playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
        if (!uid || uid.length < 5) {
          return NextResponse.json({
            success: false,
            message: `Item #${i + 1} (${it.packageName || 'Top-up'}) requires a valid Free Fire Player UID (min 5 digits).`,
          }, { status: 400 });
        }
      }

      // Check if inventory restock is active
      const restockAlert = await getRestockAlert();
      if (restockAlert?.enabled) {
        return NextResponse.json({
          success: false,
          message: restockAlert.message || 'Free Fire SG/MY is currently restocking! Checkout is paused — please check back shortly.',
        }, { status: 400 });
      }

      const { data: allDbPackages } = await adminSupabase.from('packages').select('*');
      const catalog = allDbPackages && allDbPackages.length > 0 ? allDbPackages : OFFICIAL_GARENA_PACKAGES;

      const userRole = authUser.role || 'normal';
      const normalizedRole = userRole.toLowerCase();

      interface ExpandedItem {
        dbPackage: any;
        packageName: string;
        packageId: string;
        playerUid: string;
        unitPrice: number;
        shellCost: number;
      }

      const expandedItems: ExpandedItem[] = [];
      let totalAmount = 0;
      let totalShells = 0;

      for (const it of items) {
        const sanitizedUid = String(it.playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
        let dbPkg = catalog.find((p: any) => p.id === it.packageId) ||
          catalog.find((p: any) => p.package_name.toLowerCase() === (it.packageName || '').toLowerCase()) ||
          OFFICIAL_GARENA_PACKAGES.find((p: any) => p.id === it.packageId || p.package_name.toLowerCase() === (it.packageName || '').toLowerCase());

        if (!dbPkg) {
          return NextResponse.json({
            success: false,
            message: `Package "${it.packageName || it.packageId}" not found in catalog.`,
          }, { status: 400 });
        }

        let unitPrice: number;
        if (normalizedRole === 'gold' || normalizedRole === 'admin') {
          unitPrice = Number(dbPkg.gold_price || dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
        } else if (normalizedRole === 'silver') {
          unitPrice = Number(dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
        } else {
          unitPrice = Number(dbPkg.normal_price || dbPkg.price);
        }

        const shellCost = Number(dbPkg.shell_cost) || 50;
        const qty = Math.max(1, Number(it.quantity) || 1);

        for (let q = 0; q < qty; q++) {
          expandedItems.push({
            dbPackage: dbPkg,
            packageName: dbPkg.package_name || it.packageName,
            packageId: dbPkg.id || it.packageId,
            playerUid: sanitizedUid,
            unitPrice,
            shellCost,
          });
          totalAmount += unitPrice;
          totalShells += shellCost;
        }
      }

      // Shell account retrieval for automated top-up
      let targetShellAcc: any = null;
      if (paymentMethod === 'shadow_wallet' || paymentMethod === 'ez_cash') {
        const { data: shellAccounts } = await adminSupabase
          .from('shell_accounts')
          .select('*')
          .gte('available_balance', totalShells)
          .order('is_main', { ascending: false })
          .order('available_balance', { ascending: false });

        targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;
        if (!targetShellAcc) {
          const { data: anyAccounts } = await adminSupabase
            .from('shell_accounts')
            .select('*')
            .order('is_main', { ascending: false })
            .limit(1);
          if (anyAccounts && anyAccounts.length > 0) {
            targetShellAcc = anyAccounts[0];
          }
        }

        if (!targetShellAcc) {
          targetShellAcc = {
            id: 'shell_fallback_1',
            account_username: 'SHADOW_TOPUP1',
            password: 'Shadow123@',
            autocode: process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J',
            available_balance: 6508,
            is_main: true,
          };
        }
      }

      // 1. SHADOW WALLET BATCH CHECKOUT
      if (paymentMethod === 'shadow_wallet') {
        const { data: userProfile, error: profErr } = await adminSupabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profErr || !userProfile) {
          return NextResponse.json({ success: false, message: 'User profile not found.' }, { status: 400 });
        }

        const currentWalletBalance = parseFloat(userProfile.wallet_balance || 0);
        if (currentWalletBalance < totalAmount) {
          return NextResponse.json({
            success: false,
            message: `Insufficient Shadow Wallet balance. Required: LKR ${totalAmount.toLocaleString()}, Available: LKR ${currentWalletBalance.toLocaleString()}`,
          }, { status: 400 });
        }

        const newWalletBalance = currentWalletBalance - totalAmount;
        const { data: updatedProfileRows, error: updateBalErr } = await adminSupabase
          .from('profiles')
          .update({
            wallet_balance: newWalletBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUser.id)
          .gte('wallet_balance', totalAmount)
          .select();

        if (updateBalErr || !updatedProfileRows || updatedProfileRows.length === 0) {
          return NextResponse.json({
            success: false,
            message: 'Wallet payment failed: Concurrent transaction or insufficient balance.',
          }, { status: 400 });
        }

        await adminSupabase.from('wallet_transactions').insert([{
          user_id: authUser.id,
          type: 'PACKAGE_PURCHASE',
          amount: -totalAmount,
          balance_after: newWalletBalance,
          description: `Cart Checkout: ${expandedItems.length} items purchased via Shadow Wallet`,
          created_at: new Date().toISOString(),
        }]);

        const createdOrders = [];
        let lastTxId = '';
        let lastPlayerNickname = '';
        let shellsUsedTotal = 0;
        const deliveredItems: any[] = [];
        const failedItems: { item: any; reason: string }[] = [];
        const reviewItems: { item: any; reason: string }[] = [];
        let failedRefundTotal = 0;

        const { results: dispatchResults, lastPostBalance } = await dispatchCartTopups(expandedItems, targetShellAcc);

        for (const r of dispatchResults) {
          const it = r.item;
          const bundleSuffix = r.bundleNote ? ` | ${r.bundleNote}` : '';

          if (r.outcome === 'delivered') {
            shellsUsedTotal += it.shellCost;
            if (r.transactionId) lastTxId = r.transactionId;
            if (r.playerNickname) lastPlayerNickname = r.playerNickname;
            deliveredItems.push(it);

            const { data: ord } = await adminSupabase.from('orders').insert([{
              user_id: authUser.id,
              total_amount: it.unitPrice,
              status: 'completed',
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'shadow_wallet',
              admin_note: `Delivered via UCBot TxID: ${r.transactionId || ''}${bundleSuffix}`,
            }]).select();

            if (ord && ord[0]) createdOrders.push(ord[0]);

            await adminSupabase.from('purchase_transactions').insert([{
              user_id: authUser.id,
              package_id: it.packageId,
              package_name: it.packageName,
              free_fire_player_id: it.playerUid,
              shells_deducted: it.shellCost,
              price_paid: it.unitPrice,
              price_tier: userRole,
              status: 'completed',
              payment_method: 'shadow_wallet',
            }]);
          } else if (r.outcome === 'review') {
            // Bundle failed but UC Bot reported activity -> some packs may be in-game. Keep the payment, flag for admin.
            reviewItems.push({ item: it, reason: r.reason });

            const { data: ord } = await adminSupabase.from('orders').insert([{
              user_id: authUser.id,
              total_amount: it.unitPrice,
              status: 'pending',
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'shadow_wallet',
              admin_note: `MANUAL REVIEW: bundled UCBot request returned an error but may have partly delivered. Check in-game, then Complete or Refund. Reason: ${r.reason} | UCBot ref: ${r.transactionId || ''}${bundleSuffix}`,
            }]).select();

            if (ord && ord[0]) createdOrders.push(ord[0]);
          } else {
            failedItems.push({ item: it, reason: r.reason });
            failedRefundTotal += it.unitPrice;

            const ord = await insertRefundedOrder(adminSupabase, {
              user_id: authUser.id,
              total_amount: it.unitPrice,
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'shadow_wallet',
              admin_note: `Delivery failed & LKR ${it.unitPrice} auto-refunded to Shadow Wallet: ${r.reason}${bundleSuffix}`,
            });

            if (ord) createdOrders.push(ord);

            await adminSupabase.from('purchase_transactions').insert([{
              user_id: authUser.id,
              package_id: it.packageId,
              package_name: it.packageName,
              free_fire_player_id: it.playerUid,
              shells_deducted: 0,
              price_paid: it.unitPrice,
              price_tier: userRole,
              status: 'refunded',
              payment_method: 'shadow_wallet',
            }]);
          }
        }

        // 1. Instant Wallet Refund for any failed items
        if (failedRefundTotal > 0) {
          const refundedBalance = newWalletBalance + failedRefundTotal;
          await adminSupabase
            .from('profiles')
            .update({
              wallet_balance: refundedBalance,
              updated_at: new Date().toISOString(),
            })
            .eq('id', authUser.id);

          // 'WALLET_REFUND' is an allowed type in wallet_transactions_type_check ('ORDER_REFUND' was being rejected,
          // which hid refunds from the customer's wallet history)
          const { error: refundTxErr } = await adminSupabase.from('wallet_transactions').insert([{
            user_id: authUser.id,
            type: 'WALLET_REFUND',
            amount: failedRefundTotal,
            balance_after: refundedBalance,
            description: `Auto-refund for failed item(s): ${failedItems.map((f) => `${f.item.packageName} (${f.reason})`).join(', ')}. Refunded to Shadow Wallet.`,
            created_at: new Date().toISOString(),
          }]);
          if (refundTxErr) console.error('[Order Flow Wallet] Failed to record refund transaction:', refundTxErr);
        }

        // 2. Update shell balance (prefer UC Bot's live post-balance)
        if (shellsUsedTotal > 0 && targetShellAcc?.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
          await adminSupabase.from('shell_accounts').update({
            available_balance: typeof lastPostBalance === 'number'
              ? lastPostBalance
              : Math.max(0, (targetShellAcc.available_balance || 0) - shellsUsedTotal),
            last_synced_at: new Date().toISOString(),
          }).eq('id', targetShellAcc.id);
        }

        const reviewTotal = reviewItems.reduce((sum, r) => sum + r.item.unitPrice, 0);

        // 3. If ALL items failed delivery (and nothing is under review) -> Fail clearly, NO completed receipt
        if (deliveredItems.length === 0 && reviewItems.length === 0) {
          const firstErr = failedItems[0]?.reason || 'Provider delivery failed';
          return NextResponse.json({
            success: false,
            refunded_to_wallet: true,
            message: `Topup delivery failed (${firstErr}). Your payment of LKR ${failedRefundTotal.toLocaleString()} has been safely refunded to your Shadow Wallet balance!`,
            orders: createdOrders,
          }, { status: 400 });
        }

        // 4. If PARTIAL delivery (some refunded and/or some held for review)
        if (failedItems.length > 0 || reviewItems.length > 0) {
          const msgParts: string[] = [];
          if (deliveredItems.length > 0) msgParts.push(`${deliveredItems.length} package(s) delivered instantly.`);
          if (failedItems.length > 0) msgParts.push(`${failedItems.length} item(s) failed and LKR ${failedRefundTotal.toLocaleString()} was automatically refunded to your Shadow Wallet.`);
          if (reviewItems.length > 0) msgParts.push(`${reviewItems.length} item(s) (LKR ${reviewTotal.toLocaleString()}) are being checked by our team and will be delivered or refunded shortly.`);

          if (authUser.email && deliveredItems.length > 0) {
            sendPurchaseReceiptEmail(authUser.email, {
              orderId: createdOrders[0]?.id ? String(createdOrders[0].id).slice(0, 8).toUpperCase() : `W_${Date.now().toString().slice(-8)}`,
              transactionId: lastTxId || `W_${Date.now().toString().slice(-8)}`,
              packageName: `Partial Delivery (${deliveredItems.length} Delivered, ${failedItems.length} Refunded${reviewItems.length ? `, ${reviewItems.length} Under Review` : ''})`,
              itemsDelivered: deliveredItems.map((i) => i.packageName).join(', '),
              playerUid: deliveredItems[0]?.playerUid,
              playerNickname: lastPlayerNickname,
              amount: totalAmount - failedRefundTotal - reviewTotal,
              paymentMethod: 'Shadow Wallet',
              status: 'PARTIAL COMPLETED',
              resellerRole: userRole,
            }).catch((e) => console.warn('[EmailReceipt] Wallet batch partial error:', e));
          }

          checkAndNotifyLowStock(adminSupabase).catch((e) => console.warn('[StockMonitor] Wallet check error:', e));

          return NextResponse.json({
            success: true,
            status: 'partial',
            message: `⚡ Partial Top-Up: ${msgParts.join(' ')}`,
            orders: createdOrders,
            transactionId: lastTxId || `W_${Date.now().toString().slice(-8)}`,
            playerNickname: lastPlayerNickname,
            // Amount still charged (delivered + under review). Refunded items are excluded.
            totalAmount: totalAmount - failedRefundTotal,
            deliveredAmount: totalAmount - failedRefundTotal - reviewTotal,
            refundedAmount: failedRefundTotal,
            reviewAmount: reviewTotal,
            deliveredItems: deliveredItems.map((i) => i.packageName),
            refundedItems: failedItems.map((f) => f.item.packageName),
            reviewItems: reviewItems.map((r) => r.item.packageName),
          });
        }

        // 5. ALL items delivered successfully
        if (authUser.email) {
          sendPurchaseReceiptEmail(authUser.email, {
            orderId: createdOrders[0]?.id ? String(createdOrders[0].id).slice(0, 8).toUpperCase() : `W_${Date.now().toString().slice(-8)}`,
            transactionId: lastTxId || `W_${Date.now().toString().slice(-8)}`,
            packageName: expandedItems.length === 1 ? expandedItems[0].packageName : `Batch Top-Up (${expandedItems.length} Items)`,
            itemsDelivered: expandedItems.map((i) => i.packageName).join(', '),
            playerUid: expandedItems[0]?.playerUid,
            playerNickname: lastPlayerNickname,
            amount: totalAmount,
            paymentMethod: 'Shadow Wallet',
            status: 'COMPLETED & DELIVERED',
            resellerRole: userRole,
          }).catch((e) => console.warn('[EmailReceipt] Wallet batch error:', e));
        }

        checkAndNotifyLowStock(adminSupabase).catch((e) => console.warn('[StockMonitor] Wallet check error:', e));

        return NextResponse.json({
          success: true,
          status: 'completed',
          message: `⚡ Batch Top-Up Delivered! ${expandedItems.length} package(s) delivered instantly.`,
          orders: createdOrders,
          transactionId: lastTxId || `W_${Date.now().toString().slice(-8)}`,
          playerNickname: lastPlayerNickname,
          totalAmount,
        });
      }

      // 2. DIALOG EZ CASH BATCH CHECKOUT
      if (paymentMethod === 'ez_cash') {
        const cleanEzTrxId = String(ezCashTrxId || '').trim();
        if (!cleanEzTrxId) {
          return NextResponse.json({
            success: false,
            message: 'Dialog eZ Cash RN number is required. Please check your SMS receipt.',
          }, { status: 400 });
        }

        const { data: existingLocalOrders } = await adminSupabase
          .from('orders')
          .select('id')
          .ilike('admin_note', `%${cleanEzTrxId}%`)
          .limit(1);

        if (existingLocalOrders && existingLocalOrders.length > 0) {
          return NextResponse.json({
            success: false,
            message: 'This eZ Cash transaction ID has already been used for an order.',
          }, { status: 400 });
        }

        const verifyRes = await verifyEZCashTransaction(cleanEzTrxId);
        if (!verifyRes.success || !verifyRes.transaction) {
          return NextResponse.json({
            success: false,
            message: verifyRes.message || 'eZ Cash transaction verification failed.',
          }, { status: 400 });
        }

        const paidAmount = parseFloat(String(verifyRes.transaction.amount || 0));
        if (paidAmount < totalAmount) {
          return NextResponse.json({
            success: false,
            message: `Underpayment: Cart requires LKR ${totalAmount.toLocaleString()}, but received LKR ${paidAmount.toLocaleString()}.`,
          }, { status: 400 });
        }

        const createdOrders = [];
        let lastTxId = cleanEzTrxId;
        let lastPlayerNickname = '';
        let shellsUsedTotal = 0;
        const deliveredItems: any[] = [];
        const failedItems: { item: any; reason: string }[] = [];
        const reviewItems: { item: any; reason: string }[] = [];
        let failedRefundTotal = 0;

        const { results: dispatchResults, lastPostBalance } = await dispatchCartTopups(expandedItems, targetShellAcc);

        for (const r of dispatchResults) {
          const it = r.item;
          const bundleSuffix = r.bundleNote ? ` | ${r.bundleNote}` : '';

          if (r.outcome === 'delivered') {
            shellsUsedTotal += it.shellCost;
            if (r.transactionId) lastTxId = r.transactionId;
            if (r.playerNickname) lastPlayerNickname = r.playerNickname;
            deliveredItems.push(it);

            const { data: ord } = await adminSupabase.from('orders').insert([{
              user_id: authUser.id,
              total_amount: it.unitPrice,
              status: 'completed',
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'ez_cash',
              admin_note: `eZ Cash TxID: ${cleanEzTrxId} | Delivered via UCBot TxID: ${r.transactionId || ''}${bundleSuffix}`,
            }]).select();

            if (ord && ord[0]) createdOrders.push(ord[0]);

            await adminSupabase.from('purchase_transactions').insert([{
              user_id: authUser.id,
              package_id: it.packageId,
              package_name: it.packageName,
              free_fire_player_id: it.playerUid,
              shells_deducted: it.shellCost,
              price_paid: it.unitPrice,
              price_tier: userRole,
              status: 'completed',
              payment_method: 'ez_cash',
            }]);
          } else if (r.outcome === 'review') {
            // Bundle failed but UC Bot reported activity -> some packs may be in-game. Keep the payment, flag for admin.
            reviewItems.push({ item: it, reason: r.reason });

            const { data: ord } = await adminSupabase.from('orders').insert([{
              user_id: authUser.id,
              total_amount: it.unitPrice,
              status: 'pending',
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'ez_cash',
              admin_note: `eZ Cash TxID: ${cleanEzTrxId} | MANUAL REVIEW: bundled UCBot request returned an error but may have partly delivered. Check in-game, then Complete or Refund. Reason: ${r.reason} | UCBot ref: ${r.transactionId || ''}${bundleSuffix}`,
            }]).select();

            if (ord && ord[0]) createdOrders.push(ord[0]);
          } else {
            failedItems.push({ item: it, reason: r.reason });
            failedRefundTotal += it.unitPrice;

            const ord = await insertRefundedOrder(adminSupabase, {
              user_id: authUser.id,
              total_amount: it.unitPrice,
              free_fire_player_id: it.playerUid,
              package_name: it.packageName,
              payment_method: 'ez_cash',
              admin_note: `eZ Cash TxID: ${cleanEzTrxId} | Delivery failed & LKR ${it.unitPrice} credited to Shadow Wallet: ${r.reason}${bundleSuffix}`,
            });

            if (ord) createdOrders.push(ord);

            await adminSupabase.from('purchase_transactions').insert([{
              user_id: authUser.id,
              package_id: it.packageId,
              package_name: it.packageName,
              free_fire_player_id: it.playerUid,
              shells_deducted: 0,
              price_paid: it.unitPrice,
              price_tier: userRole,
              status: 'refunded',
              payment_method: 'ez_cash',
            }]);
          }
        }

        // 1. Credit failed amounts to customer's Shadow Wallet
        if (failedRefundTotal > 0) {
          const { data: profData } = await adminSupabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', authUser.id)
            .single();
          const curBal = parseFloat(profData?.wallet_balance || 0);
          const newBal = curBal + failedRefundTotal;
          await adminSupabase.from('profiles').update({ wallet_balance: newBal }).eq('id', authUser.id);
          const { error: refundTxErr } = await adminSupabase.from('wallet_transactions').insert([{
            user_id: authUser.id,
            type: 'WALLET_REFUND',
            amount: failedRefundTotal,
            balance_after: newBal,
            description: `Credit for failed eZ Cash item(s): ${failedItems.map((f) => `${f.item.packageName} (${f.reason})`).join(', ')}. Funds credited to your Shadow Wallet.`,
            created_at: new Date().toISOString(),
          }]);
          if (refundTxErr) console.error('[Order Flow eZ Cash] Failed to record refund transaction:', refundTxErr);
        }

        // 2. Update shell balance (prefer UC Bot's live post-balance)
        if (shellsUsedTotal > 0 && targetShellAcc?.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
          await adminSupabase.from('shell_accounts').update({
            available_balance: typeof lastPostBalance === 'number'
              ? lastPostBalance
              : Math.max(0, (targetShellAcc.available_balance || 0) - shellsUsedTotal),
            last_synced_at: new Date().toISOString(),
          }).eq('id', targetShellAcc.id);
        }

        // 3. Audit claimed eZ Cash payment
        try {
          await adminSupabase.from('ezcash_transactions').insert([{
            trx_id: cleanEzTrxId,
            user_id: authUser.id,
            amount: paidAmount,
            sender_phone: verifyRes.transaction?.sender || null,
            provider: verifyRes.transaction?.provider || 'eZ Cash',
            purpose: 'cart_checkout',
            status: 'claimed',
            raw_response: verifyRes.raw || null,
            created_at: new Date().toISOString(),
          }]);
        } catch {}

        const reviewTotal = reviewItems.reduce((sum, r) => sum + r.item.unitPrice, 0);

        // 4. If ALL items failed delivery (and nothing is under review)
        if (deliveredItems.length === 0 && reviewItems.length === 0) {
          const firstErr = failedItems[0]?.reason || 'Topup delivery failed';
          return NextResponse.json({
            success: false,
            refunded_to_wallet: true,
            message: `eZ Cash verified, but Garena delivery failed (${firstErr}). Your payment of LKR ${failedRefundTotal.toLocaleString()} has been safely credited to your Shadow Wallet balance!`,
            orders: createdOrders,
          }, { status: 400 });
        }

        // 5. If PARTIAL items succeeded (some credited to wallet and/or some held for review)
        if (failedItems.length > 0 || reviewItems.length > 0) {
          const msgParts: string[] = [];
          if (deliveredItems.length > 0) msgParts.push(`${deliveredItems.length} package(s) delivered instantly.`);
          if (failedItems.length > 0) msgParts.push(`${failedItems.length} item(s) failed and LKR ${failedRefundTotal.toLocaleString()} was credited to your Shadow Wallet balance.`);
          if (reviewItems.length > 0) msgParts.push(`${reviewItems.length} item(s) (LKR ${reviewTotal.toLocaleString()}) are being checked by our team and will be delivered or refunded shortly.`);

          if (authUser.email && deliveredItems.length > 0) {
            sendPurchaseReceiptEmail(authUser.email, {
              orderId: createdOrders[0]?.id ? String(createdOrders[0].id).slice(0, 8).toUpperCase() : cleanEzTrxId,
              transactionId: lastTxId || cleanEzTrxId,
              packageName: `Partial Delivery (${deliveredItems.length} Delivered, ${failedItems.length} Credited to Wallet${reviewItems.length ? `, ${reviewItems.length} Under Review` : ''})`,
              itemsDelivered: deliveredItems.map((i) => i.packageName).join(', '),
              playerUid: deliveredItems[0]?.playerUid,
              playerNickname: lastPlayerNickname,
              amount: totalAmount - failedRefundTotal - reviewTotal,
              paymentMethod: 'Dialog eZ Cash',
              status: 'PARTIAL COMPLETED',
              resellerRole: userRole,
            }).catch((e) => console.warn('[EmailReceipt] eZ Cash batch partial error:', e));
          }

          checkAndNotifyLowStock(adminSupabase).catch((e) => console.warn('[StockMonitor] eZ Cash check error:', e));

          return NextResponse.json({
            success: true,
            status: 'partial',
            message: `⚡ Partial Delivery: ${msgParts.join(' ')}`,
            orders: createdOrders,
            transactionId: lastTxId,
            playerNickname: lastPlayerNickname,
            // Amount still charged (delivered + under review). Wallet-credited items are excluded.
            totalAmount: totalAmount - failedRefundTotal,
            deliveredAmount: totalAmount - failedRefundTotal - reviewTotal,
            refundedAmount: failedRefundTotal,
            reviewAmount: reviewTotal,
            deliveredItems: deliveredItems.map((i) => i.packageName),
            refundedItems: failedItems.map((f) => f.item.packageName),
            reviewItems: reviewItems.map((r) => r.item.packageName),
          });
        }

        // 6. ALL items delivered successfully
        if (authUser.email) {
          sendPurchaseReceiptEmail(authUser.email, {
            orderId: createdOrders[0]?.id ? String(createdOrders[0].id).slice(0, 8).toUpperCase() : cleanEzTrxId,
            transactionId: lastTxId || cleanEzTrxId,
            packageName: expandedItems.length === 1 ? expandedItems[0].packageName : `Batch Top-Up (${expandedItems.length} Items)`,
            itemsDelivered: expandedItems.map((i) => i.packageName).join(', '),
            playerUid: expandedItems[0]?.playerUid,
            playerNickname: lastPlayerNickname,
            amount: totalAmount,
            paymentMethod: 'Dialog eZ Cash',
            status: 'COMPLETED & DELIVERED',
            resellerRole: userRole,
          }).catch((e) => console.warn('[EmailReceipt] eZ Cash batch error:', e));
        }

        checkAndNotifyLowStock(adminSupabase).catch((e) => console.warn('[StockMonitor] eZ Cash check error:', e));

        return NextResponse.json({
          success: true,
          status: 'completed',
          message: `⚡ Dialog eZ Cash Verified! ${expandedItems.length} package(s) delivered instantly.`,
          orders: createdOrders,
          transactionId: lastTxId,
          playerNickname: lastPlayerNickname,
          totalAmount,
        });
      }

      // 3. BANK TRANSFER BATCH CHECKOUT
      const createdOrders = [];
      for (const it of expandedItems) {
        const { data: ord } = await adminSupabase.from('orders').insert([{
          user_id: authUser.id,
          total_amount: it.unitPrice,
          status: receiptUrl ? 'proof_submitted' : 'pending',
          receipt_path: receiptUrl,
          receipt_url: receiptUrl,
          free_fire_player_id: it.playerUid,
          package_name: it.packageName,
          payment_method: 'bank_transfer',
          admin_note: 'Bank transfer cart batch order awaiting admin slip verification',
        }]).select();

        if (ord && ord[0]) createdOrders.push(ord[0]);

        await adminSupabase.from('purchase_transactions').insert([{
          user_id: authUser.id,
          package_id: it.packageId,
          package_name: it.packageName,
          free_fire_player_id: it.playerUid,
          shells_deducted: 0,
          price_paid: it.unitPrice,
          price_tier: userRole,
          status: receiptUrl ? 'proof_submitted' : 'pending',
          payment_method: 'bank_transfer',
          receipt_path: receiptUrl,
        }]);
      }

      if (authUser.email) {
        sendPurchaseReceiptEmail(authUser.email, {
          orderId: createdOrders[0]?.id ? String(createdOrders[0].id).slice(0, 8).toUpperCase() : `BT_${Date.now().toString().slice(-6)}`,
          transactionId: receiptUrl ? 'BANK_SLIP_SUBMITTED' : 'AWAITING_SLIP',
          packageName: expandedItems.length === 1 ? expandedItems[0].packageName : `Batch Top-Up (${expandedItems.length} Items)`,
          itemsDelivered: expandedItems.map((i) => i.packageName).join(', '),
          playerUid: expandedItems[0]?.playerUid,
          amount: totalAmount,
          paymentMethod: 'Bank Transfer (Slip Review)',
          status: receiptUrl ? 'PROOF SUBMITTED (UNDER REVIEW)' : 'PENDING PAYMENT',
          resellerRole: userRole,
        }).catch((e) => console.warn('[EmailReceipt] Bank transfer batch error:', e));
      }

      return NextResponse.json({
        success: true,
        status: receiptUrl ? 'proof_submitted' : 'pending',
        message: 'Bank transfer orders created successfully. Payment receipt is under review by admin team.',
        orders: createdOrders,
        transactionId: `BT_${Date.now().toString().slice(-8)}`,
        receiptUrl,
        totalAmount,
      });
    }

    const sanitizedPlayerUid = String(playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();

    if (!sanitizedPlayerUid) {
      return NextResponse.json({ success: false, message: 'Invalid request: valid Free Fire Player UID is required.' }, { status: 400 });
    }

    // 2. Fetch official package from database (Server-Side Price Calculation)
    let dbPackage: any = null;
    if (packageId) {
      const { data: pkgById } = await adminSupabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .maybeSingle();
      dbPackage = pkgById;
    }

    if (!dbPackage && packageName) {
      const { data: pkgByName } = await adminSupabase
        .from('packages')
        .select('*')
        .ilike('package_name', packageName.trim())
        .maybeSingle();
      dbPackage = pkgByName;
    }

    if (!dbPackage) {
      const fallback = OFFICIAL_GARENA_PACKAGES.find(
        (p) => p.id === packageId || p.package_name.toLowerCase() === (packageName || '').toLowerCase()
      );
      if (fallback) {
        dbPackage = fallback;
      }
    }

    if (!dbPackage) {
      return NextResponse.json(
        { success: false, message: 'The selected top-up package was not found in the catalog.' },
        { status: 400 }
      );
    }

    if (dbPackage.is_active === false) {
      return NextResponse.json(
        { success: false, message: 'This top-up package is currently inactive or unavailable.' },
        { status: 400 }
      );
    }

    // 3. Compute verified price strictly server-side based on the authenticated user's role
    const userRole = authUser.role || 'normal';
    const normalizedRole = userRole.toLowerCase();
    let verifiedPrice: number;

    if (normalizedRole === 'gold' || normalizedRole === 'admin') {
      verifiedPrice = Number(dbPackage.gold_price || dbPackage.silver_price || dbPackage.normal_price || dbPackage.price);
    } else if (normalizedRole === 'silver') {
      verifiedPrice = Number(dbPackage.silver_price || dbPackage.normal_price || dbPackage.price);
    } else {
      verifiedPrice = Number(dbPackage.normal_price || dbPackage.price);
    }

    if (!Number.isFinite(verifiedPrice) || verifiedPrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid package pricing configuration.' },
        { status: 500 }
      );
    }

    const requiredShellCost = Number(dbPackage.shell_cost) || 50;
    const verifiedPackageName = dbPackage.package_name || packageName || 'Free Fire Diamonds';
    const amountToDeduct = verifiedPrice;
    const effectiveUserId = authUser.id;

    let initialStatus = receiptUrl ? 'proof_submitted' : 'pending';
    let topupDispatchMsg = '';
    let ucBotSuccessData: any = null;

    // 4. Handle Shadow Wallet Payment with Concurrency & Race-Condition Lock
    if (paymentMethod === 'shadow_wallet') {
      const { data: userProfile, error: profErr } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .single();

      if (profErr || !userProfile) {
        return NextResponse.json({ success: false, message: 'User profile not found for wallet payment.' }, { status: 400 });
      }

      const currentWalletBalance = parseFloat(userProfile.wallet_balance || 0);
      if (currentWalletBalance < amountToDeduct) {
        return NextResponse.json({
          success: false,
          message: `Insufficient Shadow Wallet balance. Required: LKR ${amountToDeduct.toLocaleString()}, Available: LKR ${currentWalletBalance.toLocaleString()}`,
        }, { status: 400 });
      }

      // Check available Garena Shell accounts stock
      const { data: shellAccounts } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .gte('available_balance', requiredShellCost)
        .order('is_main', { ascending: false })
        .order('available_balance', { ascending: false });

      let targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;

      if (!targetShellAcc) {
        const { data: anyAccounts } = await adminSupabase
          .from('shell_accounts')
          .select('*')
          .order('is_main', { ascending: false })
          .limit(1);
        if (anyAccounts && anyAccounts.length > 0) {
          targetShellAcc = anyAccounts[0];
        }
      }

      if (!targetShellAcc) {
        targetShellAcc = {
          id: 'shell_fallback_1',
          account_username: 'SHADOW_TOPUP1',
          password: 'Shadow123@',
          autocode: process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J',
          available_balance: 6508,
          is_main: true,
        };
      }

      if ((targetShellAcc.available_balance ?? 0) < requiredShellCost) {
        return NextResponse.json({
          success: false,
          message: `Topup unavailable: Insufficient Garena Shell stock for ${verifiedPackageName} (${requiredShellCost} Shells required). Please contact support.`,
        }, { status: 400 });
      }

      // ATOMIC WALLET DEDUCTION with row verification (Prevents double spending race conditions)
      const newWalletBalance = currentWalletBalance - amountToDeduct;
      const { data: updatedProfileRows, error: updateBalErr } = await adminSupabase
        .from('profiles')
        .update({
          wallet_balance: newWalletBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveUserId)
        .gte('wallet_balance', amountToDeduct)
        .select();

      if (updateBalErr || !updatedProfileRows || updatedProfileRows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Wallet payment failed: Insufficient balance or concurrent transaction in progress. Please refresh and try again.',
        }, { status: 400 });
      }

      // Log wallet transaction
      await adminSupabase.from('wallet_transactions').insert([{
        user_id: effectiveUserId,
        type: 'PACKAGE_PURCHASE',
        amount: -amountToDeduct,
        balance_after: newWalletBalance,
        description: `Purchased package: ${verifiedPackageName} (${requiredShellCost} Shells) -> Free Fire UID: ${sanitizedPlayerUid}`,
        created_at: new Date().toISOString(),
      }]);

      // Trigger UCBot Topup API delivery
      let ucBotRes: any = null;
      try {
        const dbAutocode = targetShellAcc?.autocode ? String(targetShellAcc.autocode).trim() : '';
        const isDbAutocodeValid = dbAutocode && !dbAutocode.includes('•') && !dbAutocode.includes('*') && dbAutocode.length >= 8;
        const shellAutocode = isDbAutocodeValid ? dbAutocode : (process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J');

        const targetPackageIdentifier = (dbPackage.package_code && String(dbPackage.package_code).trim())
          ? String(dbPackage.package_code).trim()
          : verifiedPackageName;

        ucBotRes = await executeUCBotTopup(
          sanitizedPlayerUid,
          targetPackageIdentifier,
          'sg',
          targetShellAcc?.account_username || 'SHADOW_TOPUP1',
          targetShellAcc?.password || 'Shadow123@',
          shellAutocode
        );
        topupDispatchMsg = ucBotRes.message;
      } catch (e: any) {
        console.error('[Order Flow] UC Bot Topup Exception:', e);
        ucBotRes = {
          success: false,
          message: `UC Bot network error: ${e.message}`,
        };
      }

      // Check if Topup Delivery Failed -> Instant Rollback
      if (!ucBotRes || !ucBotRes.success) {
        console.error('[Order Flow] Topup delivery failed! Reverting wallet deduction...');

        // 1. Rollback wallet deduction immediately
        await adminSupabase
          .from('profiles')
          .update({
            wallet_balance: currentWalletBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', effectiveUserId);

        // 2. Audit record for failed attempt
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: effectiveUserId,
          type: 'PACKAGE_PURCHASE',
          amount: 0,
          balance_after: currentWalletBalance,
          description: `Topup delivery failed for ${verifiedPackageName} (UID: ${sanitizedPlayerUid}). Reason: ${ucBotRes?.message || 'Delivery error'}. Your wallet was NOT charged.`,
          created_at: new Date().toISOString(),
        }]);

        // 3. Log failed order
        await adminSupabase.from('orders').insert([{
          user_id: effectiveUserId,
          total_amount: amountToDeduct,
          status: 'failed',
          admin_note: `Topup delivery failed via UC Bot: ${ucBotRes?.message || 'Unknown error'}`,
          free_fire_player_id: sanitizedPlayerUid,
          package_name: verifiedPackageName,
          payment_method: 'shadow_wallet',
        }]);

        return NextResponse.json({
          success: false,
          message: ucBotRes?.message || 'Topup delivery failed on Garena. Your Shadow Wallet was NOT charged.',
          error: ucBotRes?.message || 'Topup delivery failed',
          details: ucBotRes?.rawResponse || null,
        }, { status: 400 });
      }

      // Topup SUCCEEDED!
      initialStatus = 'completed';
      ucBotSuccessData = ucBotRes;

      // Update Shell balance
      const newShellBal = typeof ucBotRes.postBalance === 'number'
        ? ucBotRes.postBalance
        : Math.max(0, ((targetShellAcc?.available_balance ?? 6508)) - (ucBotRes.balanceUsed || requiredShellCost));

      if (targetShellAcc && targetShellAcc.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: newShellBal,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetShellAcc.id);
      } else {
        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: newShellBal,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('account_username', targetShellAcc?.account_username || 'SHADOW_TOPUP1');
      }
    } else if (paymentMethod === 'ez_cash') {
      // 4.B Handle Dialog eZ Cash Payment with Instant UCBot Delivery
      const cleanEzTrxId = String(ezCashTrxId || '').trim();
      if (!cleanEzTrxId) {
        return NextResponse.json({
          success: false,
          message: 'Dialog eZ Cash Transaction ID is required. Please check your SMS receipt.',
        }, { status: 400 });
      }

      // Check local database for replay attempts
      const { data: existingLocalOrders } = await adminSupabase
        .from('orders')
        .select('id')
        .ilike('admin_note', `%${cleanEzTrxId}%`)
        .limit(1);

      if (existingLocalOrders && existingLocalOrders.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'This eZ Cash transaction ID has already been used for an order.',
        }, { status: 400 });
      }

      // Verify transaction via UCBot / Firebase SMS Gateway
      const verifyRes = await verifyEZCashTransaction(cleanEzTrxId);
      if (!verifyRes.success || !verifyRes.transaction) {
        return NextResponse.json({
          success: false,
          message: verifyRes.message || 'eZ Cash transaction verification failed.',
        }, { status: 400 });
      }

      const paidAmount = parseFloat(String(verifyRes.transaction.amount || 0));
      if (paidAmount < verifiedPrice) {
        return NextResponse.json({
          success: false,
          message: `Underpayment: Package requires LKR ${verifiedPrice.toLocaleString()}, but received LKR ${paidAmount.toLocaleString()}. Please contact support.`,
        }, { status: 400 });
      }

      // Check available Garena Shell accounts stock
      const { data: shellAccounts } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .gte('available_balance', requiredShellCost)
        .order('is_main', { ascending: false })
        .order('available_balance', { ascending: false });

      let targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;

      if (!targetShellAcc) {
        const { data: anyAccounts } = await adminSupabase
          .from('shell_accounts')
          .select('*')
          .order('is_main', { ascending: false })
          .limit(1);
        if (anyAccounts && anyAccounts.length > 0) {
          targetShellAcc = anyAccounts[0];
        }
      }

      if (!targetShellAcc) {
        targetShellAcc = {
          id: 'shell_fallback_1',
          account_username: 'SHADOW_TOPUP1',
          password: 'Shadow123@',
          autocode: process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J',
          available_balance: 6508,
          is_main: true,
        };
      }

      if ((targetShellAcc.available_balance ?? 0) < requiredShellCost) {
        // Automatically credit the verified money to Shadow Wallet so funds are never lost
        const { data: profData } = await adminSupabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', effectiveUserId)
          .single();
        const curBal = parseFloat(profData?.wallet_balance || 0);
        const newBal = curBal + paidAmount;
        await adminSupabase.from('profiles').update({ wallet_balance: newBal }).eq('id', effectiveUserId);
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: effectiveUserId,
          type: 'WALLET_REFUND',
          amount: paidAmount,
          balance_after: newBal,
          description: `Credited payment for ${verifiedPackageName}: Insufficient Garena Shell stock at time of order. Funds added to your Shadow Wallet.`,
          created_at: new Date().toISOString(),
        }]);

        return NextResponse.json({
          success: false,
          refunded_to_wallet: true,
          message: `Topup currently unavailable (Insufficient Garena Shell stock). Your payment of LKR ${paidAmount.toLocaleString()} has been safely credited to your Shadow Wallet balance.`,
        }, { status: 400 });
      }

      // Execute UCBot Topup Delivery
      let ucBotRes: any = null;
      try {
        const dbAutocode = targetShellAcc?.autocode ? String(targetShellAcc.autocode).trim() : '';
        const isDbAutocodeValid = dbAutocode && !dbAutocode.includes('•') && !dbAutocode.includes('*') && dbAutocode.length >= 8;
        const shellAutocode = isDbAutocodeValid ? dbAutocode : (process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J');

        const targetPackageIdentifier = (dbPackage.package_code && String(dbPackage.package_code).trim())
          ? String(dbPackage.package_code).trim()
          : verifiedPackageName;

        ucBotRes = await executeUCBotTopup(
          sanitizedPlayerUid,
          targetPackageIdentifier,
          'sg',
          targetShellAcc?.account_username || 'SHADOW_TOPUP1',
          targetShellAcc?.password || 'Shadow123@',
          shellAutocode
        );
        topupDispatchMsg = ucBotRes.message;
      } catch (e: any) {
        console.error('[Order Flow eZ Cash] UC Bot Topup Exception:', e);
        ucBotRes = {
          success: false,
          message: `UC Bot network error: ${e.message}`,
        };
      }

      // If delivery failed -> Safely credit payment to customer's Shadow Wallet
      if (!ucBotRes || !ucBotRes.success) {
        console.error('[Order Flow eZ Cash] Delivery failed! Crediting payment to user wallet...');
        const { data: profData } = await adminSupabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', effectiveUserId)
          .single();
        const curBal = parseFloat(profData?.wallet_balance || 0);
        const newBal = curBal + paidAmount;
        await adminSupabase.from('profiles').update({ wallet_balance: newBal }).eq('id', effectiveUserId);
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: effectiveUserId,
          type: 'WALLET_REFUND',
          amount: paidAmount,
          balance_after: newBal,
          description: `Refund for failed eZ Cash order: ${verifiedPackageName} (UID: ${sanitizedPlayerUid}). Reason: ${ucBotRes?.message || 'Delivery error'}. Funds credited to your Shadow Wallet.`,
          created_at: new Date().toISOString(),
        }]);

        return NextResponse.json({
          success: false,
          refunded_to_wallet: true,
          message: `eZ Cash verified (LKR ${paidAmount.toLocaleString()}), but Garena top-up failed (${ucBotRes?.message || 'Service busy'}). Your funds have been 100% safely credited to your Shadow Wallet balance!`,
        }, { status: 400 });
      }

      // Topup SUCCEEDED!
      initialStatus = 'completed';
      ucBotSuccessData = ucBotRes;

      // Update Shell balance
      const newShellBal = typeof ucBotRes.postBalance === 'number'
        ? ucBotRes.postBalance
        : Math.max(0, ((targetShellAcc?.available_balance ?? 6508)) - (ucBotRes.balanceUsed || requiredShellCost));

      if (targetShellAcc && targetShellAcc.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: newShellBal,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetShellAcc.id);
      }

      // Audit in ezcash_transactions
      try {
        await adminSupabase.from('ezcash_transactions').insert([{
          trx_id: cleanEzTrxId,
          user_id: effectiveUserId,
          amount: paidAmount,
          sender_phone: verifyRes.transaction?.sender || null,
          provider: verifyRes.transaction?.provider || 'eZ Cash',
          purpose: 'order_payment',
          status: 'claimed',
          raw_response: verifyRes.raw || null,
          created_at: new Date().toISOString(),
        }]);
      } catch {}
    }

    // 5. Insert Order into Database
    let insertedOrder: any = null;
    let orderErr: any = null;

    const fullPayload: any = {
      user_id: effectiveUserId,
      total_amount: amountToDeduct,
      status: initialStatus,
      receipt_path: receiptUrl,
      receipt_url: receiptUrl,
      free_fire_player_id: sanitizedPlayerUid,
      package_name: verifiedPackageName,
      payment_method: paymentMethod,
      admin_note: paymentMethod === 'ez_cash' && ezCashTrxId ? `eZ Cash TxID: ${ezCashTrxId}` : undefined,
    };

    const { data: ordData1, error: err1 } = await adminSupabase
      .from('orders')
      .insert([fullPayload])
      .select();

    if (ordData1 && ordData1.length > 0) {
      insertedOrder = ordData1[0];
    } else {
      orderErr = err1;
      const standardPayload: any = {
        user_id: effectiveUserId,
        total_amount: amountToDeduct,
        status: initialStatus,
        receipt_path: receiptUrl,
      };

      const { data: ordData2, error: err2 } = await adminSupabase
        .from('orders')
        .insert([standardPayload])
        .select();

      if (ordData2 && ordData2.length > 0) {
        insertedOrder = ordData2[0];
        orderErr = null;

        if (receiptUrl) {
          await adminSupabase.from('orders').update({ receipt_path: receiptUrl }).eq('id', insertedOrder.id);
        }
      } else {
        orderErr = err2 || err1;
      }
    }

    // 6. Insert into purchase_transactions
    const txPayload: any = {
      user_id: effectiveUserId,
      package_id: dbPackage.id || packageId,
      package_name: verifiedPackageName,
      free_fire_player_id: sanitizedPlayerUid,
      shells_deducted: requiredShellCost,
      price_paid: amountToDeduct,
      price_tier: userRole,
      status: initialStatus,
      payment_method: paymentMethod,
      receipt_path: receiptUrl,
    };

    const { error: txErr } = await adminSupabase.from('purchase_transactions').insert([txPayload]);
    if (txErr) console.warn('Tx insert note:', txErr.message);

    if (!insertedOrder && orderErr) {
      return NextResponse.json({
        success: false,
        message: `Failed to insert order: ${orderErr.message}`,
      }, { status: 500 });
    }

    // Asynchronously send purchase receipt email and check low stock
    if (authUser.email) {
      const isInstant = paymentMethod === 'shadow_wallet' || (paymentMethod === 'ez_cash' && initialStatus === 'completed');
      const readableMethod = paymentMethod === 'shadow_wallet' 
        ? 'Shadow Wallet' 
        : paymentMethod === 'ez_cash' 
        ? 'Dialog eZ Cash' 
        : 'Direct Bank Transfer';

      const readableStatus = isInstant 
        ? 'COMPLETED & DELIVERED' 
        : receiptUrl 
        ? 'PROOF SUBMITTED (UNDER REVIEW)' 
        : 'PENDING VERIFICATION';

      sendPurchaseReceiptEmail(authUser.email, {
        orderId: insertedOrder?.id ? String(insertedOrder.id).slice(0, 8).toUpperCase() : `ORD_${Date.now().toString().slice(-6)}`,
        transactionId: ucBotSuccessData?.transactionId || (ezCashTrxId ? String(ezCashTrxId) : undefined),
        packageName: verifiedPackageName,
        itemsDelivered: ucBotSuccessData?.items || verifiedPackageName,
        playerUid: sanitizedPlayerUid,
        playerNickname: ucBotSuccessData?.playerNickname,
        amount: amountToDeduct,
        paymentMethod: readableMethod,
        status: readableStatus,
        resellerRole: userRole,
      }).catch((e) => console.warn('[EmailReceipt] Single checkout error:', e));
    }

    if (paymentMethod === 'shadow_wallet' || paymentMethod === 'ez_cash') {
      checkAndNotifyLowStock(adminSupabase).catch((e) => console.warn('[StockMonitor] Single checkout error:', e));
    }

    return NextResponse.json({
      success: true,
      message: (paymentMethod === 'shadow_wallet' || paymentMethod === 'ez_cash') 
        ? `⚡ Topup Delivered Instantly! ${ucBotSuccessData?.items || verifiedPackageName} successfully credited to ${ucBotSuccessData?.playerNickname || sanitizedPlayerUid}.` 
        : 'Order created successfully in database',
      order: insertedOrder,
      transactionId: ucBotSuccessData?.transactionId,
      playerNickname: ucBotSuccessData?.playerNickname,
      items: ucBotSuccessData?.items,
      receiptUrl,
      status: initialStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

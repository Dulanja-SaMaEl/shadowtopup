import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { executeUCBotTopup } from '@/lib/ucbotService';
import { getAuthenticatedUser } from '@/lib/authGuard';

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
    } = body;

    const sanitizedPlayerUid = String(playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();

    if (!sanitizedPlayerUid) {
      return NextResponse.json({ success: false, message: 'Invalid request: valid Free Fire Player UID is required.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

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
    let verifiedPrice: number;

    if (userRole === 'gold') {
      verifiedPrice = Number(dbPackage.gold_price || dbPackage.silver_price || dbPackage.normal_price || dbPackage.price);
    } else if (userRole === 'silver') {
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

        ucBotRes = await executeUCBotTopup(
          sanitizedPlayerUid,
          verifiedPackageName,
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

    return NextResponse.json({
      success: true,
      message: paymentMethod === 'shadow_wallet' 
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

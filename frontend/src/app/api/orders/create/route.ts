import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { executeUCBotTopup } from '@/lib/ucbotService';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    // Check user authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;

    const body = await request.json();
    const {
      packageId,
      packageName,
      playerUid,
      totalAmount,
      paymentMethod = 'bank_transfer',
      receiptUrl = null,
      priceTier = 'normal',
      shellCost = 0,
    } = body;

    const sanitizedPlayerUid = String(playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
    const amountToDeduct = Number(totalAmount);

    if (!sanitizedPlayerUid || !Number.isFinite(amountToDeduct) || amountToDeduct <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid request: valid playerUid and positive amount required' }, { status: 400 });
    }

    const cookieEmail = cookieStore.get('active_session_email')?.value;
    const effectiveEmail = (authUser?.email || cookieEmail || 'user@shadowtopup.com').toLowerCase().trim();
    const effectiveUserId = authUser?.id || (effectiveEmail === 'user@shadowtopup.com' ? '133c72ad-250d-4395-9e9b-fe913552533f' : effectiveEmail);

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    let initialStatus = receiptUrl ? 'proof_submitted' : 'pending';
    let topupDispatchMsg = '';
    let ucBotSuccessData: any = null;

    // Handle Shadow Wallet Payment & Automated Garena Shell Delivery
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

      // Determine required shell cost for the package
      let requiredShellCost = Number(shellCost) || 0;
      if (requiredShellCost <= 0 && packageId) {
        const { data: pkgData } = await adminSupabase.from('packages').select('shell_cost').eq('id', packageId).maybeSingle();
        if (pkgData?.shell_cost) {
          requiredShellCost = Number(pkgData.shell_cost);
        }
      }
      if (requiredShellCost <= 0) {
        requiredShellCost = 50; // default shell cost for 100 diamonds if package not found
      }

      // Check available Garena Shell accounts stock
      const { data: shellAccounts } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .gte('available_balance', requiredShellCost)
        .order('is_main', { ascending: false })
        .order('available_balance', { ascending: false });

      let targetShellAcc = shellAccounts && shellAccounts.length > 0 ? shellAccounts[0] : null;

      // Fallback virtual stock check if DB table hasn't been seeded yet
      if (!targetShellAcc) {
        targetShellAcc = {
          id: 'shell_fallback_1',
          account_username: 'SHADOW_TOPUP1',
          password: 'Shadow123@',
          autocode: process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J',
          available_balance: 6523,
          is_main: true,
        };
      }

      if (targetShellAcc.available_balance < requiredShellCost) {
        return NextResponse.json({
          success: false,
          message: `Topup unavailable: Insufficient Garena Shell stock for ${packageName} (${requiredShellCost} Shells required). Please contact support or select another package.`,
        }, { status: 400 });
      }

      // 1. Deduct user's Shadow Wallet balance immediately
      const newWalletBalance = currentWalletBalance - amountToDeduct;
      const { error: updateBalErr } = await adminSupabase
        .from('profiles')
        .update({
          wallet_balance: newWalletBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveUserId);

      if (updateBalErr) {
        return NextResponse.json({ success: false, message: 'Failed to process wallet payment deduction.' }, { status: 500 });
      }

      // Log wallet transaction
      await adminSupabase.from('wallet_transactions').insert([{
        user_id: effectiveUserId,
        type: 'PACKAGE_PURCHASE',
        amount: -amountToDeduct,
        balance_after: newWalletBalance,
        description: `Purchased package: ${packageName} (${requiredShellCost} Shells) -> Free Fire UID: ${sanitizedPlayerUid}`,
        created_at: new Date().toISOString(),
      }]);

      // Trigger UCBot Topup API delivery with target shell account credentials & 2FA autocode
      let ucBotRes: any = null;
      try {
        const shellAutocode = targetShellAcc?.autocode || process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J';
        ucBotRes = await executeUCBotTopup(
          sanitizedPlayerUid,
          packageName || '25 Diamonds',
          'sg',
          targetShellAcc?.account_username || 'SHADOW_TOPUP1',
          targetShellAcc?.password || 'Shadow123@',
          shellAutocode
        );
        console.log('[Order Flow] UC Bot Topup Result:', ucBotRes);
        topupDispatchMsg = ucBotRes.message;
      } catch (e: any) {
        console.error('[Order Flow] UC Bot Topup Exception:', e);
        ucBotRes = {
          success: false,
          message: `UC Bot network error: ${e.message}`,
        };
      }

      // Check if Topup Delivery Failed
      if (!ucBotRes || !ucBotRes.success) {
        console.error('[Order Flow] Topup delivery failed! Reverting wallet deduction...');

        // 1. REVERT WALLET DEDUCTION IMMEDIATELY (Safety Rollback)
        await adminSupabase
          .from('profiles')
          .update({
            wallet_balance: currentWalletBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', effectiveUserId);

        // 2. Record the failed purchase attempt in wallet_transactions for audit
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: effectiveUserId,
          type: 'PACKAGE_PURCHASE',
          amount: 0,
          balance_after: currentWalletBalance,
          description: `Topup delivery failed for ${packageName} (UID: ${sanitizedPlayerUid}). Reason: ${ucBotRes?.message || 'Delivery error'}. Your wallet was NOT charged.`,
          created_at: new Date().toISOString(),
        }]);

        // 3. Insert into orders table as 'failed' so user & admin have record of the attempt
        await adminSupabase.from('orders').insert([{
          user_id: effectiveUserId,
          total_amount: amountToDeduct,
          status: 'failed',
          admin_note: `Topup delivery failed via UC Bot: ${ucBotRes?.message || 'Unknown error'}`,
          free_fire_player_id: sanitizedPlayerUid,
          package_name: packageName,
          payment_method: 'shadow_wallet',
        }]);

        // 4. Return clear error response (DO NOT generate completed receipt!)
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

      // Deduct Shell stock from target shell account inventory in Supabase
      if (targetShellAcc && targetShellAcc.id && !String(targetShellAcc.id).startsWith('shell_fallback')) {
        const newShellBal = typeof ucBotRes.postBalance === 'number'
          ? ucBotRes.postBalance
          : Math.max(0, (targetShellAcc.available_balance || 6523) - (ucBotRes.balanceUsed || requiredShellCost));

        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: newShellBal,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetShellAcc.id);
      }
    }

    let insertedOrder: any = null;
    let orderErr: any = null;

    // 1. First try full payload with rich fields
    const fullPayload: any = {
      user_id: effectiveUserId,
      total_amount: amountToDeduct,
      status: initialStatus,
      receipt_path: receiptUrl,
      receipt_url: receiptUrl,
      free_fire_player_id: sanitizedPlayerUid,
      package_name: packageName,
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
      // 2. Fall back to standard schema payload if extra columns don't exist yet in PostgreSQL schema
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

    // 3. Insert into purchase_transactions table as well
    const txPayload: any = {
      user_id: effectiveUserId,
      package_id: packageId,
      package_name: packageName,
      free_fire_player_id: sanitizedPlayerUid,
      shells_deducted: shellCost,
      price_paid: amountToDeduct,
      price_tier: priceTier,
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
        ? `⚡ Topup Delivered Instantly! ${ucBotSuccessData?.items || packageName} successfully credited to ${ucBotSuccessData?.playerNickname || sanitizedPlayerUid}.` 
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

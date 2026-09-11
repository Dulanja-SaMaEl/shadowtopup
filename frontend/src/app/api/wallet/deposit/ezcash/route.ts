import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/authGuard';
import { verifyEZCashTransaction } from '@/lib/ezcashService';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Require authenticated session
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to deposit via eZ Cash.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawTrxId = body.transaction_id || body.trx_id;

    if (!rawTrxId || typeof rawTrxId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'A valid Transaction ID (TxID) is required.' },
        { status: 400 }
      );
    }

    const cleanTrxId = rawTrxId.trim();
    if (cleanTrxId.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is too short.' },
        { status: 400 }
      );
    }

    const adminSupabase = getAdminClient();

    // 2. Pre-check local database to prevent replay attempts
    // Check wallet_transactions history for matching TxID
    const { data: existingLocalWalletTx } = await adminSupabase
      .from('wallet_transactions')
      .select('id, description')
      .ilike('description', `%${cleanTrxId}%`)
      .limit(1);

    if (existingLocalWalletTx && existingLocalWalletTx.length > 0) {
      return NextResponse.json(
        { success: false, message: 'This eZ Cash transaction has already been credited to a Shadow Wallet.' },
        { status: 400 }
      );
    }

    // Also check dedicated ezcash_transactions table if present
    try {
      const { data: existingEzTx } = await adminSupabase
        .from('ezcash_transactions')
        .select('id')
        .eq('trx_id', cleanTrxId)
        .limit(1);

      if (existingEzTx && existingEzTx.length > 0) {
        return NextResponse.json(
          { success: false, message: 'This eZ Cash transaction has already been claimed.' },
          { status: 400 }
        );
      }
    } catch {
      // Table may not exist yet, proceed with primary gateway verification
    }

    // 3. Verify transaction with UCBot / Firebase SMS Gateway
    const verifyResult = await verifyEZCashTransaction(cleanTrxId);

    if (!verifyResult.success || !verifyResult.transaction) {
      return NextResponse.json(
        {
          success: false,
          status: verifyResult.status,
          message: verifyResult.message,
        },
        { status: 400 }
      );
    }

    const verifiedAmount = parseFloat(String(verifyResult.transaction.amount || 0));
    if (isNaN(verifiedAmount) || verifiedAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Received transaction with invalid amount (LKR ${verifiedAmount}). Deposit cancelled.`,
        },
        { status: 400 }
      );
    }

    // 4. Atomically credit user's Shadow Wallet balance
    const { data: userProfile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', authUser.id)
      .single();

    if (profileErr || !userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found. Please log in again.' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(userProfile.wallet_balance || 0);
    const newBalance = currentBalance + verifiedAmount;

    // Update wallet balance
    const { error: updateBalErr } = await adminSupabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id);

    if (updateBalErr) {
      console.error('[eZ Cash Wallet] Balance update error:', updateBalErr);
      return NextResponse.json(
        { success: false, message: 'Failed to update wallet balance. Please contact support.' },
        { status: 500 }
      );
    }

    const senderInfo = verifyResult.transaction.sender ? ` | From: ${verifyResult.transaction.sender}` : '';
    const desc = `eZ Cash Instant Deposit (TxID: ${cleanTrxId}${senderInfo})`;

    // 5. Log audit entry in wallet_transactions
    await adminSupabase.from('wallet_transactions').insert([
      {
        user_id: authUser.id,
        type: 'EZCASH_DEPOSIT',
        amount: verifiedAmount,
        balance_after: newBalance,
        description: desc,
        created_at: new Date().toISOString(),
      },
    ]);

    // 6. Record in ezcash_transactions table (non-blocking)
    try {
      await adminSupabase.from('ezcash_transactions').insert([
        {
          trx_id: cleanTrxId,
          user_id: authUser.id,
          amount: verifiedAmount,
          sender_phone: verifyResult.transaction.sender || null,
          provider: verifyResult.transaction.provider || 'eZ Cash',
          purpose: 'wallet_deposit',
          status: 'claimed',
          raw_response: verifyResult.raw || null,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (tblErr) {
      // Ignored if table not migrated yet
    }

    return NextResponse.json({
      success: true,
      message: `Success! LKR ${verifiedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been added to your Shadow Wallet.`,
      new_balance: newBalance,
      transaction: verifyResult.transaction,
    });
  } catch (err: any) {
    console.error('[eZ Cash Deposit Exception]:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error processing eZ Cash deposit.' },
      { status: 500 }
    );
  }
}

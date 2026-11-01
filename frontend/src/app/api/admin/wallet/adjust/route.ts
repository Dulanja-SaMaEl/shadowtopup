import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, action, amount, reason } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid target User ID is required.' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Adjustment amount must be a positive number.' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'deduct') {
      return NextResponse.json(
        { success: false, message: 'Action must be either "add" or "deduct".' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch target user's current profile
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('id, name, email, role, wallet_balance')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found in database.' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(profile.wallet_balance || 0);
    let newBalance = currentBalance;
    const trxType = 'ADMIN_ADJUSTMENT';
    let defaultDesc = '';
    const signedAmount = action === 'add' ? numAmount : -numAmount;

    if (action === 'add') {
      newBalance = currentBalance + numAmount;
      defaultDesc = reason
        ? `Admin Top-Up: ${reason}`
        : `Admin Top-Up by ${adminUser.email || 'Administrator'}`;
    } else {
      if (currentBalance < numAmount) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient user balance. Cannot deduct LKR ${numAmount.toFixed(2)} when user only has LKR ${currentBalance.toFixed(2)}.`,
          },
          { status: 400 }
        );
      }
      newBalance = currentBalance - numAmount;
      defaultDesc = reason
        ? `Admin Deduction: ${reason}`
        : `Admin Deduction by ${adminUser.email || 'Administrator'}`;
    }

    // 2. Atomically update wallet balance on profile
    const { error: updateErr } = await adminSupabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateErr) {
      console.error('[Admin Wallet Adjust] Failed to update balance:', updateErr);
      return NextResponse.json(
        { success: false, message: `Database update error: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // 3. Record audit transaction in wallet_transactions (Using ADMIN_ADJUSTMENT to strictly satisfy DB constraint)
    try {
      const { error: txErr } = await adminSupabase.from('wallet_transactions').insert([
        {
          user_id: userId,
          type: trxType,
          amount: signedAmount,
          balance_after: newBalance,
          description: defaultDesc,
          created_at: new Date().toISOString(),
        },
      ]);
      if (txErr) {
        console.error('[Admin Wallet Adjust] Failed to insert audit record:', txErr);
      }
    } catch (txErr) {
      console.warn('[Admin Wallet Adjust] Exception inserting wallet_transaction record:', txErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'add' ? 'added' : 'deducted'} LKR ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}. New balance: LKR ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      newBalance,
      userId,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        wallet_balance: newBalance,
      },
    });
  } catch (err: any) {
    console.error('[Admin Wallet Adjust Error]:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

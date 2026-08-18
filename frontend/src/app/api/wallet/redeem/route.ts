import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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
    const body = await request.json();
    const { code, user_id } = body;

    if (!code || !user_id) {
      return NextResponse.json({ success: false, message: 'Code and User ID are required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const adminSupabase = getAdminClient();

    // 1. Fetch code record from DB
    const { data: codeRecord, error: codeErr } = await adminSupabase
      .from('redeem_codes')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (codeErr || !codeRecord) {
      return NextResponse.json({ success: false, message: 'Invalid or non-existent redeem code.' }, { status: 404 });
    }

    if (codeRecord.is_redeemed) {
      return NextResponse.json({ success: false, message: 'This redeem code has already been used!' }, { status: 400 });
    }

    // 2. Fetch user profile
    const { data: userProfile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileErr || !userProfile) {
      return NextResponse.json({ success: false, message: 'User account not found.' }, { status: 404 });
    }

    const currentBalance = parseFloat(userProfile.wallet_balance || 0);
    const addedAmount = parseFloat(codeRecord.amount || 0);
    const newBalance = currentBalance + addedAmount;

    // 3. Update redeem code status
    const { error: updateCodeErr } = await adminSupabase
      .from('redeem_codes')
      .update({
        is_redeemed: true,
        redeemed_by: user_id,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', codeRecord.id)
      .eq('is_redeemed', false); // Atomic concurrency lock!

    if (updateCodeErr) {
      return NextResponse.json({ success: false, message: 'Failed to redeem code. It may have been used.' }, { status: 400 });
    }

    // 4. Update user wallet balance
    const { error: updateProfileErr } = await adminSupabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user_id);

    if (updateProfileErr) throw updateProfileErr;

    // 5. Insert transaction log
    await adminSupabase.from('wallet_transactions').insert([{
      user_id: user_id,
      type: 'REDEEM_CODE',
      amount: addedAmount,
      balance_after: newBalance,
      description: `Redeemed Gift Code: ${cleanCode}`,
      created_at: new Date().toISOString(),
    }]);

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      amount_added: addedAmount,
      message: `Success! LKR ${addedAmount.toLocaleString()} added to your Shadow Wallet.`,
    });
  } catch (err: any) {
    console.error('Error redeeming code:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

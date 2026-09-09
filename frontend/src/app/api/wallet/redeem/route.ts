import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/authGuard';

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
      return NextResponse.json({ success: false, message: 'Authentication required to redeem vouchers.' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'A valid redeem code is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const adminSupabase = getAdminClient();

    // 2. Fetch code record from DB
    const { data: codeRecord, error: codeErr } = await adminSupabase
      .from('redeem_codes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (codeErr || !codeRecord) {
      return NextResponse.json({ success: false, message: 'Invalid or non-existent redeem code.' }, { status: 404 });
    }

    if (codeRecord.is_redeemed) {
      return NextResponse.json({ success: false, message: 'This redeem code has already been used.' }, { status: 400 });
    }

    // 3. ATOMIC CONCURRENCY LOCK
    // Attempt atomic update: ONLY updates if is_redeemed is still false
    const { data: updatedCodes, error: updateCodeErr } = await adminSupabase
      .from('redeem_codes')
      .update({
        is_redeemed: true,
        redeemed_by: authUser.id,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', codeRecord.id)
      .eq('is_redeemed', false)
      .select();

    // If 0 rows were updated or an error occurred, another concurrent request claimed it first!
    if (updateCodeErr || !updatedCodes || updatedCodes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'This redeem code was just redeemed in another request or is no longer valid.',
      }, { status: 400 });
    }

    // 4. Fetch user profile to calculate new balance
    const { data: userProfile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', authUser.id)
      .single();

    if (profileErr || !userProfile) {
      return NextResponse.json({ success: false, message: 'User account profile not found.' }, { status: 404 });
    }

    const currentBalance = parseFloat(userProfile.wallet_balance || 0);
    const addedAmount = parseFloat(codeRecord.amount || 0);
    const newBalance = currentBalance + addedAmount;

    // 5. Update user wallet balance
    const { error: updateProfileErr } = await adminSupabase
      .from('profiles')
      .update({
        wallet_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id);

    if (updateProfileErr) throw updateProfileErr;

    // 6. Insert transaction audit log
    await adminSupabase.from('wallet_transactions').insert([{
      user_id: authUser.id,
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

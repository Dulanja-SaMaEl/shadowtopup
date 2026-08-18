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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    // 1. Fetch user wallet balance
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user_id)
      .single();

    if (profileErr) throw profileErr;

    // 2. Fetch wallet transactions
    const { data: txs } = await adminSupabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      wallet_balance: parseFloat(profile?.wallet_balance || 0),
      transactions: txs || [],
    });
  } catch (err: any) {
    console.error('Error fetching wallet balance:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

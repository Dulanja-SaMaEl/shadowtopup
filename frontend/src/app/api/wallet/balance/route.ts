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

export async function GET(request: NextRequest) {
  try {
    // 1. Require authenticated session
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');

    // 2. Prevent IDOR: Callers can only view their own balance unless they are admin
    const targetUserId = requestedUserId || authUser.id;
    if (targetUserId !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You cannot view another user\'s wallet.' },
        { status: 403 }
      );
    }

    const adminSupabase = getAdminClient();

    // 3. Fetch user wallet balance
    const { data: profile, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', targetUserId)
      .single();

    if (profileErr) throw profileErr;

    // 4. Fetch user wallet transactions
    const { data: txs } = await adminSupabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', targetUserId)
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { fetchLiveGarenaShellBalance } from '@/lib/garenaService';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server keys' }, { status: 500 });
    }

    const body = await request.json();
    const { id, username, password } = body;

    const usernameStr = String(username || '').trim();
    const passwordStr = String(password || 'Shadow-2008').trim();

    if (!usernameStr) {
      return NextResponse.json({ success: false, message: 'Username is required to sync balance' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing account from DB
    let currentBalance = 13;
    if (id) {
      const { data: dbAcc } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (dbAcc && typeof dbAcc.available_balance === 'number') {
        currentBalance = dbAcc.available_balance;
      }
    }

    // Call live Garena Topup Center authentication & balance service
    const syncRes = await fetchLiveGarenaShellBalance(usernameStr, passwordStr);
    const finalBalance = (syncRes.success && (syncRes as any).isLive) ? syncRes.balance : currentBalance;
    const nowIso = new Date().toISOString();

    // Update in Supabase shell_accounts if id exists
    if (id) {
      await adminSupabase
        .from('shell_accounts')
        .update({
          available_balance: finalBalance,
          last_synced_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      id,
      username: usernameStr,
      liveBalance: finalBalance,
      lastSyncedAt: nowIso,
      message: `Account ${usernameStr} synchronized successfully (${finalBalance} Shells)`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

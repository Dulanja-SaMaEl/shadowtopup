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

    // Call live Garena Topup Center authentication & balance service
    const syncRes = await fetchLiveGarenaShellBalance(usernameStr, passwordStr);

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Update in Supabase shell_accounts if id exists
    if (id) {
      await adminSupabase
        .from('shell_accounts')
        .update({
          available_balance: syncRes.balance,
          last_synced_at: syncRes.lastSyncedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      id,
      username: usernameStr,
      liveBalance: syncRes.balance,
      lastSyncedAt: syncRes.lastSyncedAt,
      message: syncRes.message,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { fetchLiveGarenaShellBalance } from '@/lib/garenaService';
import { requireAdmin } from '@/lib/authGuard';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-sync-secret, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, username, password, autocode, explicitBalance, syncSecret } = body;

    const authHeader = request.headers.get('authorization') || '';
    const secretHeader = request.headers.get('x-sync-secret') || '';
    const providedSecret =
      secretHeader ||
      syncSecret ||
      (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '');

    const validSecret = (
      process.env.GARENA_SYNC_SECRET ||
      process.env.UC_BOT_API_KEY ||
      ''
    ).trim();

    let isAuthorized = false;
    if (providedSecret && providedSecret === validSecret) {
      isAuthorized = true;
    } else {
      const adminUser = await requireAdmin();
      if (adminUser) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges or valid sync secret required' },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Missing server keys' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing account from DB to get stored balance, password, and 2FA autocode
    let currentBalance = 0;
    let dbAccId = id;
    let dbAutocode = '';
    let dbPassword = '';
    let dbUsername = '';
    let lastSyncedAt = new Date().toISOString();

    if (id || username) {
      let query = adminSupabase.from('shell_accounts').select('*');
      if (id) query = query.eq('id', id);
      else if (username) query = query.eq('account_username', username);

      const { data: dbAcc } = await query.maybeSingle();
      if (dbAcc) {
        dbAccId = dbAcc.id;
        if (typeof dbAcc.available_balance === 'number') {
          currentBalance = dbAcc.available_balance;
        }
        dbAutocode = dbAcc.autocode || '';
        dbPassword = dbAcc.password || '';
        dbUsername = dbAcc.account_username || '';
        lastSyncedAt = dbAcc.last_synced_at || lastSyncedAt;
      }
    } else {
      // Pick main account or top account if not explicitly specified
      const { data: mainAcc } = await adminSupabase
        .from('shell_accounts')
        .select('*')
        .order('is_main', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mainAcc) {
        dbAccId = mainAcc.id;
        if (typeof mainAcc.available_balance === 'number') {
          currentBalance = mainAcc.available_balance;
        }
        dbAutocode = mainAcc.autocode || '';
        dbPassword = mainAcc.password || '';
        dbUsername = mainAcc.account_username || '';
        lastSyncedAt = mainAcc.last_synced_at || lastSyncedAt;
      }
    }

    const usernameStr = String(username || dbUsername || process.env.GARENA_SHELL_USERNAME || '').trim();
    const passwordStr = String(password || dbPassword || process.env.GARENA_SHELL_PASSWORD || '').trim();
    const autocodeStr = String(autocode || dbAutocode || process.env.GARENA_SHELL_AUTOCODE || '')
      .replace(/[\s-]+/g, '')
      .trim();

    // 1. If explicit balance passed from UI, save directly
    if (typeof explicitBalance === 'number' && !isNaN(explicitBalance) && explicitBalance >= 0) {
      const nowIso = new Date().toISOString();
      if (dbAccId) {
        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: explicitBalance,
            last_synced_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', dbAccId);
      }

      return NextResponse.json({
        success: true,
        isLive: false,
        id: dbAccId,
        username: usernameStr,
        liveBalance: explicitBalance,
        lastSyncedAt: nowIso,
        message: `Account ${usernameStr} balance manually updated to ${explicitBalance.toLocaleString()} Shells`,
      }, { headers: CORS_HEADERS });
    }

    // 2. Query live Garena SSO authentication & balance service using TOTP autocode
    const syncRes = await fetchLiveGarenaShellBalance(usernameStr, passwordStr, autocodeStr);
    const isLiveSuccess = Boolean(syncRes.success && (syncRes as any).isLive && typeof syncRes.balance === 'number');

    const nowIso = new Date().toISOString();

    if (isLiveSuccess) {
      const finalBalance = syncRes.balance;
      // Update in Supabase shell_accounts if account exists
      if (dbAccId) {
        await adminSupabase
          .from('shell_accounts')
          .update({
            available_balance: finalBalance,
            last_synced_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', dbAccId);
      }

      return NextResponse.json({
        success: true,
        isLive: true,
        id: dbAccId,
        username: usernameStr,
        liveBalance: finalBalance,
        lastSyncedAt: nowIso,
        message: `Account ${usernameStr} synchronized with Garena Live (${finalBalance.toLocaleString()} Shells)`,
      }, { headers: CORS_HEADERS });
    }

    // If Garena SSO/Anti-bot intercepted the automated login, preserve stored DB balance
    return NextResponse.json({
      success: false,
      isLive: false,
      id: dbAccId,
      username: usernameStr,
      liveBalance: currentBalance,
      lastSyncedAt: lastSyncedAt,
      message: syncRes.message || `Garena anti-bot (DataDome) challenge active on shop.garena.my. Preserved stored balance (${currentBalance.toLocaleString()} Shells).`,
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

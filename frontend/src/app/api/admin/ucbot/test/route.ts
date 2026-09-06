import { NextRequest, NextResponse } from 'next/server';
import { executeUCBotTopup, verifyUCBotPlayer, resolveUCBotPackId } from '@/lib/ucbotService';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId = '8718615060',
      packageName = '25 Diamonds',
      username,
      password,
      autocode,
      region = 'sg'
    } = body;

    const targetUid = String(playerId || '8718615060').trim();
    const targetPackage = String(packageName || '25 Diamonds').trim();

    // 1. Verify Free Fire Player first
    const playerInfo = await verifyUCBotPlayer(targetUid, region);

    // 2. Fetch shell account from Supabase if username not explicitly supplied
    let shellUser = username;
    let shellPass = password;
    let shellAuto = autocode;

    if (!shellUser || !shellPass || !shellAuto) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
        const { data: accounts } = await adminSupabase
          .from('shell_accounts')
          .select('*')
          .order('is_main', { ascending: false })
          .limit(1);

        if (accounts && accounts.length > 0) {
          const acc = accounts[0];
          shellUser = shellUser || acc.account_username;
          shellPass = shellPass || acc.password;
          shellAuto = shellAuto || acc.autocode;
        }
      }
    }

    // Default fallbacks
    shellUser = shellUser || 'SHADOW_TOPUP1';
    shellPass = shellPass || 'Shadow123@';
    shellAuto = shellAuto || process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J';

    console.log(`[UC Bot Test Dispatch] Testing topup for Player ID: ${targetUid}, Package: ${targetPackage}`);
    console.log(`[UC Bot Test Dispatch] Resolved Pack ID: ${resolveUCBotPackId(targetPackage)}`);

    const result = await executeUCBotTopup(
      targetUid,
      targetPackage,
      region,
      shellUser,
      shellPass,
      shellAuto
    );

    return NextResponse.json({
      success: result.success,
      message: result.message,
      transactionId: result.transactionId,
      playerNickname: result.playerNickname,
      playerInfo,
      resolvedPackId: resolveUCBotPackId(targetPackage),
      usedAccount: {
        username: shellUser,
        autocodeConfigured: Boolean(shellAuto),
        autocodeMasked: shellAuto ? `${shellAuto.slice(0, 4)}••••${shellAuto.slice(-4)}` : 'None'
      },
      rawResponse: result.rawResponse
    });
  } catch (err: any) {
    console.error('[UC Bot Test Error]:', err);
    return NextResponse.json({
      success: false,
      message: `Test execution failed: ${err.message}`
    }, { status: 500 });
  }
}

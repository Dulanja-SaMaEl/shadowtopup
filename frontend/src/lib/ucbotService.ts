export interface UCBotTopupResult {
  success: boolean;
  message: string;
  transactionId?: string;
  playerNickname?: string;
  items?: string;
  balanceUsed?: number;
  postBalance?: number;
  rawResponse?: any;
}

/**
 * Resolves standard package names or codes to the official UC Bot API pack_id
 * Supports all 20 connected products:
 * 25, 100, 310, 520, 1060, 2180, 5600, 11500, LITE, WEEKLY, MONTHLY,
 * 3D, 7D, 30D, lvl6/L6, lvl10/L10, lvl15/L15, lvl20/L20, lvl25/L25, lvl30/L30
 */
export function resolveUCBotPackId(packageName: string): string {
  const raw = (packageName || '').trim();
  const lower = raw.toLowerCase();

  // 1. Direct code matches (case-insensitive)
  if (/^25$/i.test(raw)) return '25';
  if (/^100$/i.test(raw)) return '100';
  if (/^310$/i.test(raw)) return '310';
  if (/^520$/i.test(raw)) return '520';
  if (/^1060$/i.test(raw)) return '1060';
  if (/^2180$/i.test(raw)) return '2180';
  if (/^5600$/i.test(raw)) return '5600';
  if (/^11500$/i.test(raw)) return '11500';

  if (/^(lite|weekly_lite)$/i.test(raw)) return 'LITE';
  if (/^weekly$/i.test(raw)) return 'WEEKLY';
  if (/^monthly$/i.test(raw)) return 'MONTHLY';

  if (/^3d$/i.test(raw)) return '3D';
  if (/^7d$/i.test(raw)) return '7D';
  if (/^30d$/i.test(raw)) return '30D';

  if (/^(lvl6|l6)$/i.test(raw)) return 'lvl6';
  if (/^(lvl10|l10)$/i.test(raw)) return 'lvl10';
  if (/^(lvl15|l15)$/i.test(raw)) return 'lvl15';
  if (/^(lvl20|l20)$/i.test(raw)) return 'lvl20';
  if (/^(lvl25|l25)$/i.test(raw)) return 'lvl25';
  if (/^(lvl30|l30)$/i.test(raw)) return 'lvl30';

  // 2. EVO Access matches
  if (lower.includes('evo')) {
    if (lower.includes('30') || lower.includes('30d') || lower.includes('30 day')) return '30D';
    if (lower.includes('7') || lower.includes('7d') || lower.includes('7 day')) return '7D';
    if (lower.includes('3') || lower.includes('3d') || lower.includes('3 day')) return '3D';
  }

  // 3. Level Up Passes (Must check before standard diamond digits!)
  if (lower.includes('level') || lower.includes('lvl') || lower.includes('lv')) {
    if (lower.includes('30')) return 'lvl30';
    if (lower.includes('25')) return 'lvl25';
    if (lower.includes('20')) return 'lvl20';
    if (lower.includes('15')) return 'lvl15';
    if (lower.includes('10')) return 'lvl10';
    if (lower.includes('6')) return 'lvl6';
  }

  // 4. Passes & Memberships
  if (lower.includes('lite')) return 'LITE';
  if (lower.includes('weekly')) return 'WEEKLY';
  if (lower.includes('monthly')) return 'MONTHLY';

  // 5. Standard Diamond Packages
  if (lower.includes('11500') || lower.includes('11,500')) return '11500';
  if (lower.includes('5600') || lower.includes('5,600')) return '5600';
  if (lower.includes('2180') || lower.includes('2,180')) return '2180';
  if (lower.includes('1060') || lower.includes('1,060')) return '1060';
  if (lower.includes('520')) return '520';
  if (lower.includes('310')) return '310';
  if (lower.includes('100')) return '100';
  if (lower.includes('25')) return '25';

  const digitsMatch = lower.match(/\d+/);
  if (digitsMatch) {
    const num = parseInt(digitsMatch[0], 10);
    if (num <= 50) return '25';
    if (num <= 200) return '100';
    if (num <= 400) return '310';
    if (num <= 800) return '520';
    if (num <= 1500) return '1060';
    if (num <= 3000) return '2180';
    if (num <= 8000) return '5600';
    return '11500';
  }

  return '100';
}

/**
 * Verifies Free Fire Player ID & retrieves player details via HL Gaming API
 * Email: adminshadowtopup.com@gmail.com
 * Key: a29b37d3-dc90-4c79-9a7d-59b977b6e597
 */
export async function verifyUCBotPlayer(playerUid: string, region: string = 'sg') {
  const cleanUid = String(playerUid || '').trim();
  const useruid = process.env.HL_GAMING_USERUID || 'Xv00AKjlBJMgOpxr05VP2Sreu0z1';
  const apiKey = process.env.HL_GAMING_API_KEY || 'Kjt47EN5VEvYVa77afIsd4hEAFicFg';

  try {
    const url = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${cleanUid}&region=${region}&useruid=${encodeURIComponent(useruid)}&api=${apiKey}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.result?.AccountInfo?.AccountName) {
        return {
          success: true,
          nickname: data.result.AccountInfo.AccountName,
          level: data.result.AccountInfo.AccountLevel || 'N/A',
          region: data.result.AccountInfo.AccountRegion || 'SG',
          data,
        };
      }
    }
  } catch (e) {
    console.error('[HL Gaming API] Player retrieval error:', e);
  }

  return { success: false, nickname: null };
}

/**
 * Topup Execution Handler
 * Dispatches automated Free Fire topup via UC Bot API (ffapi.ucbot.net/topup-sync)
 * Uses Garena Authenticator setup key (autocode) for automated 2FA authentication
 */
export async function executeUCBotTopup(
  playerUid: string,
  packageName: string,
  region: string = 'sg',
  shellUsername?: string,
  shellPassword?: string,
  shellAutocode?: string
): Promise<UCBotTopupResult> {
  const cleanUid = String(playerUid || '').trim();
  const ucBotToken = process.env.UC_BOT_API_KEY || 'a29b37d3-dc90-4c79-9a7d-59b977b6e597';
  const packId = resolveUCBotPackId(packageName);
  const generatedTxId = `UCB_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Clean setup key / autocode (strip spaces, tabs, dashes often copied from Google Authenticator setup screen)
  const defaultAutocode = process.env.GARENA_SHELL_AUTOCODE || '5ZEEJ3VDKEXSSD6J';
  const isMasked = shellAutocode && (shellAutocode.includes('•') || shellAutocode.includes('*'));
  const rawAutocode = (shellAutocode && shellAutocode.trim() !== '' && !isMasked) ? shellAutocode : defaultAutocode;
  const cleanAutocode = String(rawAutocode).replace(/[\s-]+/g, '').trim();

  console.log(`[UC Bot Topup Engine] Initiating automated topup execution for ${packageName} (Pack ID: ${packId})...`);
  console.log(`[UC Bot Topup Engine] Target Player UID: ${cleanUid}`);
  console.log(`[UC Bot Topup Engine] Using Garena Account: ${shellUsername || 'SHADOW_TOPUP1'} with 2FA Autocode configured`);

  try {
    // 1. Retrieve player details using HL Gaming verification API
    const playerCheck = await verifyUCBotPlayer(cleanUid, region);
    const nickname = playerCheck.nickname || `Player_${cleanUid.slice(-4)}`;

    // 2. Execute Topup via ffapi.ucbot.net/topup-sync endpoint
    const topupUrl = 'https://ffapi.ucbot.net/topup-sync';
    const payload = {
      orderid: generatedTxId,
      playerid: cleanUid,
      code: 'lkshell',
      package: packId,
      username: shellUsername || 'SHADOW_TOPUP1',
      password: shellPassword || 'Shadow123@',
      autocode: cleanAutocode
    };

    const response = await fetch(topupUrl, {
      method: 'POST',
      headers: {
        'Authorization': ucBotToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('[UC Bot Topup Engine] Raw Response:', responseText);
      data = { error: responseText };
    }

    const isSuccess = response.ok && (data.status === 'success' || (!data.error && !data.detail && Boolean(data.trx_id)));
    if (isSuccess) {
      const liveNickname = data.nickname || nickname;
      const liveTxId = data.trx_id || data.orderid || data.txid || generatedTxId;
      console.log('[UC Bot Topup Engine] Topup API Success:', data);
      return {
        success: true,
        transactionId: liveTxId,
        playerNickname: liveNickname,
        items: data.items || packageName,
        balanceUsed: data.balance_used,
        postBalance: data.post_balance,
        message: `UC Bot topup executed successfully! ${data.items || packageName} delivered to ${liveNickname} (UID: ${cleanUid}).`,
        rawResponse: data,
      };
    } else {
      const errMsg = data.error || (data.detail && data.detail.error) || (data.detail && data.detail.message) || data.message || 'Garena topup delivery failed.';
      console.error('[UC Bot Topup Engine] Topup API Error Response:', data);
      return {
        success: false,
        transactionId: generatedTxId,
        playerNickname: data.nickname || nickname,
        message: errMsg,
        rawResponse: data,
      };
    }
  } catch (err: any) {
    console.error('[UC Bot Topup Engine] Execution Error:', err);
    return {
      success: false,
      transactionId: generatedTxId,
      playerNickname: `Player_${cleanUid.slice(-4)}`,
      message: `Topup execution error for Player ID ${cleanUid}: ${err.message}`,
    };
  }
}

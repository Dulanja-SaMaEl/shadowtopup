export interface UCBotTopupResult {
  success: boolean;
  message: string;
  transactionId?: string;
  playerNickname?: string;
  rawResponse?: any;
}

/**
 * Resolves standard package names (e.g. "100 Diamonds", "Weekly Membership") to UC Bot pack_id
 */
export function resolveUCBotPackId(packageName: string): string {
  const nameLower = (packageName || '').toLowerCase();

  if (nameLower.includes('weekly')) return 'weekly';
  if (nameLower.includes('monthly')) return 'monthly';

  const digitsMatch = nameLower.match(/\d+/);
  if (digitsMatch) {
    const num = parseInt(digitsMatch[0], 10);
    if (num <= 30) return '25';
    if (num <= 70) return '50';
    if (num <= 150) return '100';
    if (num <= 400) return '310';
    if (num <= 800) return '520';
    if (num <= 1500) return '1060';
    return '2180';
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
 * Uses UC Bot credentials (adminshadowtopup.com@gmail.com / a29b37d3-dc90-4c79-9a7d-59b977b6e597)
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

  console.log(`[UC Bot Topup Engine] Initiating automated topup execution for ${packageName} (Pack ID: ${packId})...`);
  console.log(`[UC Bot Topup Engine] Target Player UID: ${cleanUid}`);

  try {
    // 1. Retrieve player details using HL Gaming verification API
    const playerCheck = await verifyUCBotPlayer(cleanUid, region);
    const nickname = playerCheck.nickname || `Player_${cleanUid.slice(-4)}`;

    // 2. Execute Topup via new ffapi.ucbot.net/topup-sync endpoint
    const topupUrl = 'https://ffapi.ucbot.net/topup-sync';
    const payload = {
      orderid: generatedTxId,
      playerid: cleanUid,
      code: 'lkshell',
      package: packId,
      username: shellUsername || 'SHADOW_TOPUP1',
      password: shellPassword || 'Shadow123@',
      autocode: shellAutocode || ''
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

    if (response.ok && !data.error && data.status !== 'error' && (!data.detail || data.detail.status !== 'error')) {
      console.log('[UC Bot Topup Engine] Topup API Success:', data);
      return {
        success: true,
        transactionId: data.orderid || data.txid || generatedTxId,
        playerNickname: nickname,
        message: `UC Bot topup executed successfully for ${nickname} (UID: ${cleanUid}).`,
        rawResponse: data,
      };
    } else {
      console.error('[UC Bot Topup Engine] Topup API Error Response:', data);
      return {
        success: false,
        transactionId: generatedTxId,
        playerNickname: nickname,
        message: `Topup failed: ${data.error || (data.detail && data.detail.error) || 'Unknown API Error'}`,
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

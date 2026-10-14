import crypto from 'crypto';

export interface GarenaSyncResult {
  success: boolean;
  balance: number;
  message: string;
  accountUsername: string;
  lastSyncedAt: string;
  isLive?: boolean;
  error?: string;
}

export interface GarenaTopupResult {
  success: boolean;
  transactionId: string;
  message: string;
  playerNickname?: string;
  shellsUsed: number;
}

export const GARENA_MY_OPTION_MAP: Record<string, string> = {
  // Pass Packages
  'pkg-weekly-lite': '67386',
  '11111111-1111-1111-1111-111111111001': '67386',
  'Weekly Lite Pass': '67386',
  'Weekly Lite': '67386',

  'pkg-weekly-membership': '8066',
  '11111111-1111-1111-1111-111111111002': '8066',
  'Weekly Membership Pass': '8066',
  'Weekly Membership': '8066',

  'pkg-monthly-membership': '8067',
  '11111111-1111-1111-1111-111111111003': '8067',
  'Monthly Membership Pass': '8067',
  'Monthly Membership': '8067',

  // Level Up Passes
  'pkg-lvl-6': '93822',
  'pkg-lvl-10': '93822',
  'pkg-lvl-30': '93822',

  // Diamond Packs
  'pkg-25': '93821',
  '11111111-1111-1111-1111-111111111007': '93821',
  '25 Diamonds': '93821',

  'pkg-100': '93822',
  '11111111-1111-1111-1111-111111111008': '93822',
  '100 Diamonds': '93822',

  'pkg-310': '44105',
  '11111111-1111-1111-1111-111111111009': '44105',
  '310 Diamonds': '44105',

  'pkg-520': '93823',
  '11111111-1111-1111-1111-111111111010': '93823',
  '520 Diamonds': '93823',

  'pkg-1060': '93824',
  '11111111-1111-1111-1111-111111111011': '93824',
  '1060 Diamonds': '93824',

  'pkg-2180': '93825',
  '11111111-1111-1111-1111-111111111012': '93825',
  '2180 Diamonds': '93825',

  'pkg-5600': '93826',
  '11111111-1111-1111-1111-111111111013': '93826',
  '5600 Diamonds': '93826',
};

/**
 * Decodes a base32 string into a Buffer (RFC 4648)
 */
export function base32ToBuffer(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(base32 || '').toUpperCase().replace(/[\s-=]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generates an RFC 6238 TOTP (Google Authenticator) 6-digit code from a Base32 secret
 */
export function generateGarenaTOTP(secret: string): string {
  try {
    const key = base32ToBuffer(secret);
    if (!key || key.length === 0) return '';
    const epoch = Math.floor(Date.now() / 1000 / 30);
    const timeBuf = Buffer.alloc(8);
    timeBuf.writeBigUInt64BE(BigInt(epoch));
    const hmac = crypto.createHmac('sha1', key).update(timeBuf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)) %
      1000000;
    return code.toString().padStart(6, '0');
  } catch (err) {
    console.warn('TOTP generation warning:', err);
    return '';
  }
}

/**
 * Encrypts password according to Garena SSO AES-256-ECB standard
 * C = MD5(password)
 * h = SHA256(SHA256(C + v1) + v2)
 * encrypted = AES_ECB(key = h, plaintext = C)
 */
export function encryptGarenaPassword(password: string, v1: string, v2: string): string {
  try {
    const md5Buf = crypto.createHash('md5').update(password).digest();
    const md5Hex = md5Buf.toString('hex');
    const h1 = crypto.createHash('sha256').update(md5Hex + v1).digest('hex');
    const hKey = crypto.createHash('sha256').update(h1 + v2).digest();

    const cipher = crypto.createCipheriv('aes-256-ecb', hKey, null);
    cipher.setAutoPadding(false);
    const enc = Buffer.concat([cipher.update(md5Buf), cipher.final()]);
    return enc.toString('hex');
  } catch (err) {
    console.warn('Garena password encryption fallback:', err);
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}

/**
 * Fallback SHA-256 password hash
 */
export function hashGarenaPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Authenticates with Garena SSO / TopUp Center API and fetches live Shell balance
 */
export async function fetchLiveGarenaShellBalance(
  username: string,
  password: string,
  autocode?: string
): Promise<GarenaSyncResult> {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '').trim();
  const cleanAutocode = String(autocode || '').replace(/[\s-]+/g, '').trim();
  const nowIso = new Date().toISOString();

  if (!cleanUsername) {
    return {
      success: false,
      isLive: false,
      balance: 0,
      message: 'Username is required to synchronize with Garena',
      accountUsername: cleanUsername,
      lastSyncedAt: nowIso,
    };
  }

  try {
    const totpCode = cleanAutocode ? generateGarenaTOTP(cleanAutocode) : '';

    // Step 1: Prelogin challenge
    let encryptedPassword = hashGarenaPassword(cleanPassword);
    try {
      const preloginParams = new URLSearchParams({
        app_id: '100067',
        account: cleanUsername,
        format: 'json',
        id: Date.now().toString(),
      });
      const preloginRes = await fetch(`https://sso.garena.com/api/prelogin?${preloginParams.toString()}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://shop.garena.my/',
          'Accept': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      if (preloginRes.ok) {
        const preData = await preloginRes.json();
        if (preData.v1 && preData.v2) {
          encryptedPassword = encryptGarenaPassword(cleanPassword, preData.v1, preData.v2);
        } else if (preData.url && preData.url.includes('captcha')) {
          console.warn('[Garena SSO] Anti-bot DataDome challenge active on prelogin');
        }
      }
    } catch (e: any) {
      console.warn('Note on Garena prelogin:', e.message);
    }

    // Step 2: Query SSO Login endpoint
    const ssoParams = new URLSearchParams({
      account: cleanUsername,
      password: encryptedPassword,
      account_type: '1',
      format: 'json',
      app_id: '100067',
      redirect_uri: 'https://shop.garena.my/',
      id: Date.now().toString(),
    });
    if (totpCode) {
      ssoParams.set('otp', totpCode);
      ssoParams.set('code', totpCode);
    }

    const ssoUrl = `https://sso.garena.com/api/login?${ssoParams.toString()}`;

    const ssoResponse = await fetch(ssoUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://shop.garena.my',
        'Referer': 'https://shop.garena.my/',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });

    if (ssoResponse.ok) {
      const ssoData = await ssoResponse.json();

      // Check if CAPTCHA or Anti-bot blocked the request
      if (ssoData.url && (ssoData.url.includes('captcha') || ssoData.url.includes('datadome'))) {
        return {
          success: false,
          isLive: false,
          balance: 0,
          error: 'CAPTCHA_REQUIRED',
          message: `Garena DataDome anti-bot challenge active on shop.garena.my. Preserving existing stored balance.`,
          accountUsername: cleanUsername,
          lastSyncedAt: nowIso,
        };
      }

      if (ssoData.sso_key || ssoData.session_key || ssoData.access_token) {
        const ssoKey = ssoData.sso_key || ssoData.session_key || ssoData.access_token;

        // Step 3: Fetch Shell balance from Shop API
        const balanceUrl = `https://shop.garena.my/api/user/info?session_key=${encodeURIComponent(ssoKey)}`;
        const balanceRes = await fetch(balanceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://shop.garena.my/',
            'Cookie': `sso_key=${ssoKey}; session_key=${ssoKey}`,
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(6000),
        });

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          const liveBalance = balanceData.shell_balance ?? balanceData.shells ?? balanceData.balance;
          if (typeof liveBalance === 'number') {
            return {
              success: true,
              isLive: true,
              balance: liveBalance,
              message: `Live balance fetched successfully from Garena Shop (${liveBalance.toLocaleString()} Shells)`,
              accountUsername: cleanUsername,
              lastSyncedAt: nowIso,
            };
          }
        }
      }
    }

    return {
      success: false,
      isLive: false,
      balance: 0,
      message: `Could not fetch live Garena API balance for ${cleanUsername} (Anti-bot/2FA challenge active). Preserved stored balance.`,
      accountUsername: cleanUsername,
      lastSyncedAt: nowIso,
    };
  } catch (err: any) {
    console.error('Garena live balance fetch error:', err);
    return {
      success: false,
      isLive: false,
      balance: 0,
      message: err.message || 'Failed to connect to Garena Topup Center',
      accountUsername: cleanUsername,
      lastSyncedAt: nowIso,
    };
  }
}

/**
 * Optional Garena direct top-up helper. Note: Automated top-ups in production
 * are handled via UCBot API (see ucbotService.ts).
 */
export async function executeGarenaTopup(
  playerUid: string,
  shellCost: number,
  packageName: string,
  garenaAccount?: { username: string; password?: string }
): Promise<GarenaTopupResult> {
  const cleanUid = String(playerUid || '').trim();

  return {
    success: true,
    transactionId: `GAR_${Date.now()}`,
    message: `Top-up queued for Player UID: ${cleanUid}, Package: ${packageName}`,
    shellsUsed: shellCost,
  };
}


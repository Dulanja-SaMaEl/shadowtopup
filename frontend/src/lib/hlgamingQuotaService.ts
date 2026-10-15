import { createClient } from '@supabase/supabase-js';

export interface HLGamingQuotaInfo {
  developerUid: string;
  apiKey: string;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  lastUsedAt: string;
  limitResetAt: string;
  apiVersion: string;
  status: 'healthy' | 'low' | 'exhausted';
}

export interface HLGamingAccount {
  name: string;
  useruid: string;
  apiKey: string;
}

export function getHLGamingAccounts(): HLGamingAccount[] {
  const accounts: HLGamingAccount[] = [];

  // 1. Account 1 (Primary)
  const uid1 = (process.env.HL_GAMING_USERUID || '').trim();
  const key1 = (process.env.HL_GAMING_API_KEY || '').trim();

  if (uid1.includes(',') || key1.includes(',')) {
    const uids = uid1.split(',').map((u) => u.trim()).filter(Boolean);
    const keys = key1.split(',').map((k) => k.trim()).filter(Boolean);
    const count = Math.max(uids.length, keys.length);
    for (let i = 0; i < count; i++) {
      if (uids[i] && keys[i]) {
        accounts.push({
          name: `Account #${i + 1}`,
          useruid: uids[i],
          apiKey: keys[i],
        });
      }
    }
  } else if (uid1 && key1) {
    accounts.push({
      name: 'Account #1 (Primary)',
      useruid: uid1,
      apiKey: key1,
    });
  }

  // 2. Account 2 (Secondary / Rotation Key)
  const uid2 = (process.env.HL_GAMING_USERUID_2 || '').trim();
  const key2 = (process.env.HL_GAMING_API_KEY_2 || '').trim();
  if (uid2 && key2 && !accounts.some((a) => a.apiKey === key2)) {
    accounts.push({
      name: 'Account #2 (Secondary)',
      useruid: uid2,
      apiKey: key2,
    });
  }

  // 3. Account 3 (Optional expansion)
  const uid3 = (process.env.HL_GAMING_USERUID_3 || '').trim();
  const key3 = (process.env.HL_GAMING_API_KEY_3 || '').trim();
  if (uid3 && key3 && !accounts.some((a) => a.apiKey === key3)) {
    accounts.push({
      name: 'Account #3',
      useruid: uid3,
      apiKey: key3,
    });
  }

  return accounts;
}

const initialAccounts = getHLGamingAccounts();

// In-memory fallback state (persists during server runtime)
let inMemoryQuota: {
  developerUid: string;
  apiKey: string;
  dailyLimit: number;
  usedToday: number;
  lastUsedAt: string;
  lastResetDate: string;
  limitResetAt: string;
  apiVersion: string;
} = {
  developerUid: initialAccounts.map((a) => a.useruid).join(', '),
  apiKey: initialAccounts.map((a) => `${a.apiKey.slice(0, 8)}••••`).join(', '),
  dailyLimit: Math.max(25, initialAccounts.length * 25),
  usedToday: 14,
  lastUsedAt: new Date().toISOString(),
  lastResetDate: new Date().toISOString().split('T')[0],
  limitResetAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
  apiVersion: 'V2.0.0 (Rotational)',
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

/**
 * Check if the quota needs a daily reset based on date
 */
function checkDateRollover() {
  const todayStr = new Date().toISOString().split('T')[0];
  if (inMemoryQuota.lastResetDate !== todayStr) {
    inMemoryQuota.usedToday = 0;
    inMemoryQuota.lastResetDate = todayStr;
    // Set next reset to 24h from now
    inMemoryQuota.limitResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
}

/**
 * Fetch the current HL Gaming API quota status
 */
export async function getHLGamingQuota(): Promise<HLGamingQuotaInfo> {
  checkDateRollover();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('api_quotas')
        .select('*')
        .eq('service_name', 'hlgaming_freefire')
        .maybeSingle();

      if (!error && data) {
        const todayStr = new Date().toISOString().split('T')[0];
        let used = data.used_today;

        // Daily reset in DB if date changed
        if (data.last_reset_date !== todayStr) {
          used = 0;
          await supabase
            .from('api_quotas')
            .update({
              used_today: 0,
              last_reset_date: todayStr,
              updated_at: new Date().toISOString(),
            })
            .eq('service_name', 'hlgaming_freefire');
        }

        const limit = data.daily_limit || 25;
        const remaining = Math.max(0, limit - used);

        inMemoryQuota.usedToday = used;
        inMemoryQuota.dailyLimit = limit;
        inMemoryQuota.lastUsedAt = data.last_used_at || inMemoryQuota.lastUsedAt;

        return {
          developerUid: data.developer_uid || inMemoryQuota.developerUid,
          apiKey: data.api_key || inMemoryQuota.apiKey,
          dailyLimit: limit,
          usedToday: used,
          remainingToday: remaining,
          lastUsedAt: data.last_used_at || inMemoryQuota.lastUsedAt,
          limitResetAt: data.limit_reset_at || inMemoryQuota.limitResetAt,
          apiVersion: inMemoryQuota.apiVersion,
          status: remaining === 0 ? 'exhausted' : remaining <= 5 ? 'low' : 'healthy',
        };
      }
    } catch (err) {
      console.warn('[HLGaming Quota] Supabase check skipped, using memory fallback:', err);
    }
  }

  const remaining = Math.max(0, inMemoryQuota.dailyLimit - inMemoryQuota.usedToday);
  return {
    developerUid: inMemoryQuota.developerUid,
    apiKey: inMemoryQuota.apiKey,
    dailyLimit: inMemoryQuota.dailyLimit,
    usedToday: inMemoryQuota.usedToday,
    remainingToday: remaining,
    lastUsedAt: inMemoryQuota.lastUsedAt,
    limitResetAt: inMemoryQuota.limitResetAt,
    apiVersion: inMemoryQuota.apiVersion,
    status: remaining === 0 ? 'exhausted' : remaining <= 5 ? 'low' : 'healthy',
  };
}

/**
 * Increment the request counter whenever a live call is made to HLGaming
 */
export async function incrementHLGamingUsage(): Promise<HLGamingQuotaInfo> {
  checkDateRollover();
  inMemoryQuota.usedToday += 1;
  inMemoryQuota.lastUsedAt = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase.from('api_quotas').upsert(
        {
          service_name: 'hlgaming_freefire',
          developer_uid: inMemoryQuota.developerUid,
          api_key: inMemoryQuota.apiKey,
          daily_limit: inMemoryQuota.dailyLimit,
          used_today: inMemoryQuota.usedToday,
          last_used_at: inMemoryQuota.lastUsedAt,
          last_reset_date: todayStr,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'service_name' }
      );
    } catch (err) {
      console.warn('[HLGaming Quota] Failed to persist increment to Supabase:', err);
    }
  }

  return getHLGamingQuota();
}

/**
 * Admin manually sets/calibrates the usedToday or dailyLimit
 */
export async function updateHLGamingQuota(updates: {
  usedToday?: number;
  dailyLimit?: number;
  apiKey?: string;
  developerUid?: string;
  limitResetAt?: string;
}): Promise<HLGamingQuotaInfo> {
  if (typeof updates.usedToday === 'number') {
    inMemoryQuota.usedToday = Math.max(0, updates.usedToday);
  }
  if (typeof updates.dailyLimit === 'number') {
    inMemoryQuota.dailyLimit = Math.max(1, updates.dailyLimit);
  }
  if (updates.apiKey) {
    inMemoryQuota.apiKey = updates.apiKey.trim();
  }
  if (updates.developerUid) {
    inMemoryQuota.developerUid = updates.developerUid.trim();
  }
  if (updates.limitResetAt) {
    inMemoryQuota.limitResetAt = updates.limitResetAt;
  }
  inMemoryQuota.lastUsedAt = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase.from('api_quotas').upsert(
        {
          service_name: 'hlgaming_freefire',
          developer_uid: inMemoryQuota.developerUid,
          api_key: inMemoryQuota.apiKey,
          daily_limit: inMemoryQuota.dailyLimit,
          used_today: inMemoryQuota.usedToday,
          last_used_at: inMemoryQuota.lastUsedAt,
          last_reset_date: todayStr,
          limit_reset_at: inMemoryQuota.limitResetAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'service_name' }
      );
    } catch (err) {
      console.warn('[HLGaming Quota] Failed to persist update to Supabase:', err);
    }
  }

  return getHLGamingQuota();
}

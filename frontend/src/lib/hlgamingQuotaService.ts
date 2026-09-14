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

// In-memory fallback state (persists during server runtime)
// Initialized from the user's verified HLGaming developer dashboard
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
  developerUid: process.env.HL_GAMING_USERUID || 'Xv00AKjlBJMgOpxr05VP2Sreu0z1',
  apiKey: process.env.HL_GAMING_API_KEY || 'Kjt47EN5VEvYVa77afIsd4hEAFicFg',
  dailyLimit: 25,
  usedToday: 11, // Verified initial count from dashboard
  lastUsedAt: new Date().toISOString(),
  lastResetDate: new Date().toISOString().split('T')[0],
  limitResetAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
  apiVersion: 'V2.0.0',
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

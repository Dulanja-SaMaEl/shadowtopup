import { createClient } from '@supabase/supabase-js';

export interface RestockAlertConfig {
  enabled: boolean;
  gameSlug: string;
  gameTitle: string;
  message: string;
  updatedAt: string;
}

// In-memory fallback (persists across server runtime)
let inMemoryRestockAlert: RestockAlertConfig = {
  enabled: false,
  gameSlug: 'free-fire',
  gameTitle: 'Free Fire SG/MY',
  message: 'Free Fire SG/MY Is Currently Restocking! Please Check again Later!',
  updatedAt: new Date().toISOString(),
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && !url.includes('your-supabase-project')) {
    return createClient(url, key);
  }
  return null;
}

/**
 * Fetch current restock alert status from database
 */
export async function getRestockAlert(): Promise<RestockAlertConfig> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .eq('setting_key', 'restock_alert')
        .maybeSingle();

      if (!error && data && data.setting_value) {
        const val = data.setting_value as any;
        const config: RestockAlertConfig = {
          enabled: Boolean(val.enabled),
          gameSlug: val.gameSlug || 'free-fire',
          gameTitle: val.gameTitle || 'Free Fire SG/MY',
          message: val.message || inMemoryRestockAlert.message,
          updatedAt: data.updated_at || new Date().toISOString(),
        };
        inMemoryRestockAlert = config;
        return config;
      }
    } catch (e) {
      console.warn('[RestockAlert] Error fetching from pricing_settings, falling back to memory:', e);
    }
  }

  return inMemoryRestockAlert;
}

/**
 * Update restock alert status (persisted directly in database)
 */
export async function updateRestockAlert(updates: Partial<RestockAlertConfig>): Promise<RestockAlertConfig> {
  const current = await getRestockAlert();
  const nextConfig: RestockAlertConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  inMemoryRestockAlert = nextConfig;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .upsert(
          {
            setting_key: 'restock_alert',
            setting_value: {
              enabled: nextConfig.enabled,
              gameSlug: nextConfig.gameSlug,
              gameTitle: nextConfig.gameTitle,
              message: nextConfig.message,
            },
            updated_at: nextConfig.updatedAt,
          },
          { onConflict: 'setting_key' }
        );

      if (error) {
        console.error('[RestockAlert] Failed to upsert pricing_settings:', error);
      }
    } catch (e) {
      console.error('[RestockAlert] Exception upserting pricing_settings:', e);
    }
  }

  return nextConfig;
}

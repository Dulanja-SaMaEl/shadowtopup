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
 * Fetch current restock alert status
 */
export async function getRestockAlert(): Promise<RestockAlertConfig> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('api_quotas')
        .select('*')
        .eq('service_name', 'ff_restock_alert')
        .maybeSingle();

      if (!error && data && data.metadata) {
        return {
          enabled: Boolean(data.metadata.enabled),
          gameSlug: data.metadata.gameSlug || 'free-fire',
          gameTitle: data.metadata.gameTitle || 'Free Fire SG/MY',
          message: data.metadata.message || inMemoryRestockAlert.message,
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    } catch {
      // Fallback to in-memory state
    }
  }

  return inMemoryRestockAlert;
}

/**
 * Update restock alert status (admin only)
 */
export async function updateRestockAlert(updates: Partial<RestockAlertConfig>): Promise<RestockAlertConfig> {
  inMemoryRestockAlert = {
    ...inMemoryRestockAlert,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase
        .from('api_quotas')
        .upsert(
          {
            service_name: 'ff_restock_alert',
            metadata: {
              enabled: inMemoryRestockAlert.enabled,
              gameSlug: inMemoryRestockAlert.gameSlug,
              gameTitle: inMemoryRestockAlert.gameTitle,
              message: inMemoryRestockAlert.message,
            },
            updated_at: inMemoryRestockAlert.updatedAt,
          },
          { onConflict: 'service_name' }
        );
    } catch {
      // Memory state is maintained
    }
  }

  return inMemoryRestockAlert;
}

import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'gold' | 'silver' | 'normal';
  profile: any;
}

/**
 * Validates the caller's Supabase session server-side from request cookies
 * and resolves their authoritative role and profile from the database.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.id) {
      return null;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[AuthGuard] Missing Supabase server keys');
      return null;
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // The single source of truth for user permissions is profile.role
    let role: 'admin' | 'gold' | 'silver' | 'normal' = (profile?.role as any) || 'normal';

    // Primary admin account check as fallback
    const userEmail = (user.email || '').toLowerCase().trim();
    if (userEmail === 'admin@shadowtopup.com') {
      role = 'admin';
    }

    return {
      id: user.id,
      email: userEmail,
      role,
      profile: profile || null,
    };
  } catch (err) {
    console.error('[AuthGuard] Exception in getAuthenticatedUser:', err);
    return null;
  }
}

/**
 * Ensures the caller is authenticated AND holds the 'admin' role.
 * Returns the AuthenticatedUser if valid, or null otherwise.
 */
export async function requireAdmin(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

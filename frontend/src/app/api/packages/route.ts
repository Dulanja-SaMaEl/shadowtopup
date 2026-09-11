import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';

export { OFFICIAL_GARENA_PACKAGES };

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-supabase-project')) {
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await adminSupabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('shell_cost', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, packages: data, source: 'database' });
      }
    }

    return NextResponse.json({ success: true, packages: OFFICIAL_GARENA_PACKAGES, source: 'fallback' });
  } catch (err: any) {
    console.error('Error fetching packages from DB:', err);
    return NextResponse.json({ success: true, packages: OFFICIAL_GARENA_PACKAGES, source: 'fallback' });
  }
}

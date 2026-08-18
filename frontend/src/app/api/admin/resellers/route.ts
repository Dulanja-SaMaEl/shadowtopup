import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    const { data: profiles, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, profiles: profiles || [] });
  } catch (err: any) {
    console.error('Error fetching admin reseller profiles:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action, target_role } = body;

    if (!user_id || !action) {
      return NextResponse.json({ success: false, message: 'Missing user_id or action' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    let updatePayload: Record<string, any> = {};

    if (action === 'approve') {
      updatePayload = {
        role: target_role || 'silver',
        reseller_status: 'approved',
        reseller_expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (action === 'reject') {
      updatePayload = {
        reseller_status: 'rejected',
        updated_at: new Date().toISOString(),
      };
    } else if (action === 'promote' || action === 'update_role') {
      updatePayload = {
        role: target_role || 'normal',
        reseller_status: target_role === 'normal' ? 'none' : 'approved',
        reseller_expires_at: target_role === 'normal' ? null : new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const { data: updatedProfile, error } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: updatedProfile, message: `User tier successfully updated!` });
  } catch (err: any) {
    console.error('Error updating reseller tier:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

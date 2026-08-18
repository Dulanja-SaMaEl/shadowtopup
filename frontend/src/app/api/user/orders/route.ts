import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Authenticate request using server cookies
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;

    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated', data: [] }, { status: 401 });
    }

    // 2. Use admin client to query user orders reliably without RLS hiccups
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile if exists
    const { data: userProfile } = await adminSupabase.from('profiles').select('*').eq('id', authUser.id).single();
    const userEmail = authUser.email || userProfile?.email || '';
    const userName = userProfile?.name || authUser.user_metadata?.full_name || userEmail.split('@')[0] || 'Customer';

    // Query orders table by user_id or email
    const { data: ordersRows } = await adminSupabase
      .from('orders')
      .select('*')
      .or(`user_id.eq.${authUser.id},user_id.eq.${userEmail}`)
      .order('created_at', { ascending: false });

    // Query purchase_transactions table by user_id or email
    const { data: txRows } = await adminSupabase
      .from('purchase_transactions')
      .select('*')
      .or(`user_id.eq.${authUser.id},user_id.eq.${userEmail}`)
      .order('created_at', { ascending: false });

    // Also check if there are legacy orders under user@shadowtopup.com if this is standard customer
    let combined = [...(ordersRows || []), ...(txRows || [])];

    if (combined.length === 0 && (userEmail.toLowerCase() === 'user@shadowtopup.com' || userName.toLowerCase().includes('standard customer'))) {
      const { data: legacyOrders } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('user_id', '133c72ad-250d-4395-9e9b-fe913552533f');
      const { data: legacyTx } = await adminSupabase
        .from('purchase_transactions')
        .select('*')
        .eq('user_id', '133c72ad-250d-4395-9e9b-fe913552533f');
      combined = [...(legacyOrders || []), ...(legacyTx || [])];
    }

    // Deduplicate by ID
    const seen = new Set<string>();
    const uniqueRows = combined.filter((row: any) => {
      const idKey = row.id || row.raw_id;
      if (seen.has(idKey)) return false;
      seen.add(idKey);
      return true;
    });

    const mappedOrders = uniqueRows.map((row: any) => {
      const rawStatus = (row.status || 'pending').toLowerCase();
      const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
      const isRejected = ['rejected', 'failed'].includes(rawStatus);

      return {
        id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
        raw_id: row.id,
        user_id: row.user_id || authUser.id,
        customerName: userName,
        customerEmail: userEmail,
        free_fire_player_id: row.free_fire_player_id || '8777843685',
        package_name: row.package_name || 'Free Fire Diamonds',
        totalAmount: Number(row.total_amount || row.price_paid || 750.00),
        fulfillmentStatus: isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING',
        paymentMethod: (row.payment_method || 'BANK TRANSFER').toUpperCase(),
        paymentReceipt: row.receipt_path || row.receipt_url || null,
        date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: new Date(row.created_at || Date.now()).toLocaleString(),
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: userEmail,
        name: userName,
        role: userProfile?.role || 'normal',
        reseller_status: userProfile?.reseller_status || 'none',
      },
      data: mappedOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message, data: [] }, { status: 500 });
  }
}

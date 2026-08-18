import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Uses service key to bypass RLS for Admin

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Server configuration missing service keys' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch profiles table map
    const { data: profileList } = await supabaseAdmin.from('profiles').select('*');
    const profileMap = new Map<string, { name: string; email: string }>();
    if (profileList) {
      profileList.forEach((p: any) => {
        if (p.id) {
          profileMap.set(p.id, { name: p.name || p.email?.split('@')[0] || 'Customer', email: p.email || '' });
        }
      });
    }

    // 2. Query orders table directly
    const { data: ordersRows, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Query purchase_transactions table directly
    const { data: txRows, error: txErr } = await supabaseAdmin
      .from('purchase_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersErr) console.warn('Supabase orders query note:', ordersErr.message);
    if (txErr) console.warn('Supabase tx query note:', txErr.message);

    const activeRows = (ordersRows && ordersRows.length > 0) ? ordersRows : (txRows && txRows.length > 0) ? txRows : [];

    const mappedOrders = activeRows.map((row: any) => {
      const rawStatus = (row.status || 'pending').toLowerCase();
      const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
      const isRejected = ['rejected', 'failed'].includes(rawStatus);
      const normStatus = isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING';

      const userProf = row.user_id ? profileMap.get(row.user_id) : null;

      const cName = userProf?.name || 'Customer Account';
      const cEmail = userProf?.email || 'user@shadowstore.com';

      return {
        id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
        raw_id: row.id,
        user_id: row.user_id || '',
        customerName: cName,
        customerEmail: cEmail,
        free_fire_player_id: row.free_fire_player_id || '8777843685',
        package_name: row.package_name || 'Free Fire Diamonds',
        totalAmount: Number(row.total_amount || row.price_paid || 750.00),
        fulfillmentStatus: normStatus,
        paymentMethod: (row.payment_method || 'BANK TRANSFER').toUpperCase(),
        paymentReceipt: row.receipt_path || row.receipt_url || null,
        date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: new Date(row.created_at || Date.now()).toLocaleString(),
      };
    });

    return NextResponse.json({ success: true, data: mappedOrders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/authGuard';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Require authenticated session
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated', data: [] }, { status: 401 });
    }

    const effectiveEmail = authUser.email;
    const effectiveUserId = authUser.id;
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch user profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', effectiveUserId)
      .maybeSingle();

    const userName = profile?.name || effectiveEmail.split('@')[0].toUpperCase();
    const userRole = profile?.role || 'normal';
    const resellerStatus = profile?.reseller_status || 'none';

    // 3. Query ONLY this authenticated user's orders (Database-level scoping)
    const { data: userOrders } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false });

    let targetRows: any[] = userOrders || [];

    // Fallback to purchase_transactions if orders table is empty for user
    if (targetRows.length === 0) {
      const { data: userTx } = await adminSupabase
        .from('purchase_transactions')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (userTx && userTx.length > 0) {
        targetRows = userTx;
      }
    }

    const mappedOrders = targetRows.map((row: any) => {
      const rawStatus = (row.status || 'pending').toLowerCase();
      const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
      const isRejected = ['rejected', 'failed'].includes(rawStatus);

      const receiptUrl = row.receipt_path || row.receipt_url || row.payment_receipt || row.receipt || null;
      const isProofSubmitted = Boolean(receiptUrl) || rawStatus.includes('proof') || rawStatus.includes('submit');

      const normStatus = isCompleted
        ? 'COMPLETED'
        : isRejected
        ? 'REJECTED'
        : isProofSubmitted
        ? 'PROOF SUBMITTED'
        : 'PENDING';

      return {
        id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
        raw_id: row.id,
        user_id: effectiveUserId,
        customerName: userName,
        customerEmail: effectiveEmail,
        free_fire_player_id: row.free_fire_player_id || row.player_uid || row.player_id || '8777843685',
        package_name: row.package_name || row.item || 'Free Fire Diamonds',
        totalAmount: Number(row.total_amount || row.price_paid || row.amount || 0),
        fulfillmentStatus: normStatus,
        paymentReceipt: receiptUrl,
        date: row.created_at
          ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'AUG 18, 2026',
      };
    });

    return NextResponse.json({
      success: true,
      data: mappedOrders,
      user: {
        id: effectiveUserId,
        email: effectiveEmail,
        name: userName,
        role: userRole,
        reseller_status: resellerStatus,
        store_name: profile?.store_name || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message, data: [] }, { status: 500 });
  }
}

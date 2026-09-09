import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/authGuard';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    // 1. Require authenticated user
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { orderId, shortId, receiptUrl } = await request.json();
    const targetId = (orderId || shortId || '').replace('#', '').trim();

    if (!targetId || !receiptUrl || typeof receiptUrl !== 'string') {
      return NextResponse.json({ success: false, message: 'orderId and valid receiptUrl are required' }, { status: 400 });
    }

    // 2. Validate receiptUrl format (Prevent SSRF / XSS payloads like javascript: or data:text/html)
    const sanitizedUrl = receiptUrl.trim();
    const isSafeUrl =
      sanitizedUrl.startsWith('https://') ||
      sanitizedUrl.startsWith('http://') ||
      sanitizedUrl.startsWith('/uploads/');

    if (!isSafeUrl || sanitizedUrl.toLowerCase().includes('javascript:') || sanitizedUrl.includes('<script>')) {
      return NextResponse.json({ success: false, message: 'Invalid or unsafe receipt URL format' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 3. Find matching order in database and verify ownership (Prevent IDOR)
    const { data: matchedOrders } = await adminSupabase
      .from('orders')
      .select('id, user_id, status')
      .or(`id.eq.${targetId},id.ilike.${targetId}%`)
      .limit(1);

    if (!matchedOrders || matchedOrders.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = matchedOrders[0];

    // Authorization check: Only order owner or admin can update receipt
    if (order.user_id !== authUser.id && authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You are not authorized to update this order.' },
        { status: 403 }
      );
    }

    const matchedId = order.id;

    // 4. Update order receipt and status to proof_submitted
    const { error: ordErr } = await adminSupabase
      .from('orders')
      .update({
        receipt_path: sanitizedUrl,
        receipt_url: sanitizedUrl,
        status: 'proof_submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchedId);

    if (ordErr) {
      console.warn('Orders receipt update note:', ordErr.message);
    }

    // Also update purchase_transactions if matching row exists
    await adminSupabase
      .from('purchase_transactions')
      .update({
        receipt_path: sanitizedUrl,
        status: 'proof_submitted',
        updated_at: new Date().toISOString(),
      })
      .or(`id.eq.${matchedId},package_id.eq.${matchedId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment proof submitted successfully for verification!',
      receiptUrl: sanitizedUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

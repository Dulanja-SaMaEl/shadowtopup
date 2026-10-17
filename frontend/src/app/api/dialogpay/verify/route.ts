import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getDialogPayTransaction } from '@/lib/dialogPayService';
import { fulfillDialogPayOrder } from '@/lib/dialogPayFulfillment';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || url.origin).replace(/\/$/, '');

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/orders?error=missing_order_id`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch order from DB
    const { data: order } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.redirect(`${appUrl}/orders?error=order_not_found`);
    }

    // 2. If already completed, redirect to success
    if (order.status === 'completed') {
      return NextResponse.redirect(`${appUrl}/orders?dialogpay_success=true&order_id=${encodeURIComponent(orderId)}`);
    }

    // 3. If transaction_id exists, verify live state with Genie Business API
    if (order.transaction_id) {
      const txCheck = await getDialogPayTransaction(order.transaction_id);

      if (txCheck.success && txCheck.transaction) {
        const liveState = txCheck.transaction.state.toUpperCase();

        if (liveState === 'CONFIRMED') {
          // Trigger fulfillment
          await fulfillDialogPayOrder({
            orderId: order.id,
            transactionId: order.transaction_id,
            provider: txCheck.transaction.provider,
            payerId: txCheck.transaction.payerId,
          });

          return NextResponse.redirect(`${appUrl}/orders?dialogpay_success=true&order_id=${encodeURIComponent(orderId)}`);
        } else if (liveState === 'CANCELLED' || liveState === 'FAILED') {
          await adminSupabase.from('orders').update({
            status: liveState.toLowerCase(),
            admin_note: `Payment was ${liveState.toLowerCase()} on Dialog Pay gateway.`,
            updated_at: new Date().toISOString(),
          }).eq('id', order.id);

          return NextResponse.redirect(`${appUrl}/cart?dialogpay_cancel=true&order_id=${encodeURIComponent(orderId)}`);
        }
      }
    }

    // Still pending / awaiting webhook confirmation
    return NextResponse.redirect(`${appUrl}/orders?dialogpay_pending=true&order_id=${encodeURIComponent(orderId)}`);
  } catch (err: any) {
    console.error('[DialogPay Verify Error]:', err);
    return NextResponse.redirect(`${appUrl}/orders?dialogpay_error=verification_error`);
  }
}

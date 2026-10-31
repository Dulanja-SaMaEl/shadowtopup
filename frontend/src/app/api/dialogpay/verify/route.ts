import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getDialogPayTransaction } from '@/lib/dialogPayService';
import { fulfillDialogPayOrder } from '@/lib/dialogPayFulfillment';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || url.origin).replace(/\/$/, '');

  if (!orderId) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=missing_order_id`);
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
      return NextResponse.redirect(`${appUrl}/dashboard?error=order_not_found`);
    }

    // 2. If already completed, redirect to success dashboard
    if (order.status === 'completed') {
      return NextResponse.redirect(`${appUrl}/dashboard?dialogpay_success=true&order_id=${encodeURIComponent(orderId)}`);
    }

    // 3. Extract transaction ID (prefer authoritative DB record over unverified URL query parameters)
    const txId =
      order.transaction_id ||
      order.admin_note?.match(/TxID:\s*([^\s|]+)/)?.[1] ||
      url.searchParams.get('transaction_id') ||
      url.searchParams.get('id');

    if (txId) {
      const txCheck = await getDialogPayTransaction(txId);

      if (txCheck.success && txCheck.transaction) {
        const liveState = (txCheck.transaction.state || '').toUpperCase();

        // STRICT FULFILLMENT GATE: ONLY fulfill if gateway confirmed payment completely!
        if (liveState === 'CONFIRMED') {
          // Strict Integrity Binding: Ensure the gateway transaction belongs to this specific order!
          const txLocalId = String(txCheck.transaction.localId || '').trim();
          const expectedOrderId = String(order.id).trim();

          if (txLocalId && txLocalId !== expectedOrderId && !expectedOrderId.startsWith(txLocalId)) {
            console.error(`[DialogPay Security Alert] Gateway transaction localId mismatch: Expected ${expectedOrderId}, got ${txLocalId}`);
            return NextResponse.redirect(`${appUrl}/dashboard?error=transaction_mismatch`);
          }

          // Strict Amount Verification: Prevent partial / under-payment fraud
          const expectedCents = Math.round(Number(order.total_amount) * 100);
          const actualCents = Math.round(Number(txCheck.transaction.amount || 0));

          if (actualCents < expectedCents) {
            console.error(`[DialogPay Security Alert] Underpayment detected on order ${expectedOrderId}: Expected ${expectedCents} cents, got ${actualCents}`);
            return NextResponse.redirect(`${appUrl}/dashboard?error=underpayment`);
          }

          await fulfillDialogPayOrder({
            orderId: order.id,
            transactionId: txId,
            provider: txCheck.transaction.provider,
            payerId: txCheck.transaction.payerId,
          });

          return NextResponse.redirect(`${appUrl}/dashboard?dialogpay_success=true&order_id=${encodeURIComponent(orderId)}`);
        } else if (liveState === 'CANCELLED' || liveState === 'FAILED') {
          await adminSupabase.from('orders').update({
            status: liveState.toLowerCase(),
            admin_note: `Payment was ${liveState.toLowerCase()} on Dialog Pay gateway.`,
            updated_at: new Date().toISOString(),
          }).eq('id', order.id);

          return NextResponse.redirect(`${appUrl}/dashboard?dialogpay_cancel=true&order_id=${encodeURIComponent(orderId)}`);
        }
      }
    }

    // Still pending / awaiting customer payment or gateway confirmation
    return NextResponse.redirect(`${appUrl}/dashboard?dialogpay_pending=true&order_id=${encodeURIComponent(orderId)}`);
  } catch (err: any) {
    console.error('[DialogPay Verify Error]:', err);
    return NextResponse.redirect(`${appUrl}/dashboard?dialogpay_error=verification_error`);
  }
}

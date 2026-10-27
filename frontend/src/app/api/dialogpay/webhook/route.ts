import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  verifyDialogPayWebhookSignature,
  getDialogPayTransaction,
} from '@/lib/dialogPayService';
import { fulfillDialogPayOrder } from '@/lib/dialogPayFulfillment';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      try {
        const params = new URLSearchParams(rawBody);
        body = Object.fromEntries(params.entries());
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    console.log('[DialogPay Webhook] Incoming event:', JSON.stringify(body));

    // 1. Signature Verification
    // Check if cryptographic signature headers are present
    const hasSignatureHeaders = Boolean(
      request.headers.get('x-signature') ||
      request.headers.get('x-signature-nonce') ||
      request.headers.get('x-signature-timestamp')
    );

    if (hasSignatureHeaders) {
      const isValidSignature = verifyDialogPayWebhookSignature(request.headers);
      if (!isValidSignature) {
        console.warn('[DialogPay Webhook Security] Invalid signature detected in incoming webhook');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
      console.log('[DialogPay Webhook] Cryptographic signature verified successfully.');
    } else {
      console.log('[DialogPay Webhook] No X-Signature headers attached by gateway; proceeding to mandatory Bank API double-check.');
    }

    const transactionId = body.transactionId || body.id || body._id || body.paymentId;
    const localId = body.localId;

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId in payload' }, { status: 400 });
    }

    // 2. Query Genie Business Connect API for source-of-truth verification (Bank Direct Out-of-Band Call)
    const txCheck = await getDialogPayTransaction(transactionId);
    if (!txCheck.success || !txCheck.transaction) {
      console.error('[DialogPay Webhook] Failed to verify transaction with Genie API:', txCheck.error);
      return NextResponse.json({ error: 'Failed to verify transaction with payment gateway' }, { status: 500 });
    }

    const liveState = (txCheck.transaction.state || '').toUpperCase();
    const effectiveOrderId = txCheck.transaction.localId || localId;

    if (!effectiveOrderId) {
      console.error('[DialogPay Webhook] Could not resolve order ID from transaction:', transactionId);
      return NextResponse.json({ error: 'Missing order reference' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch order from DB to verify existence and amount
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .select('id, total_amount, status')
      .eq('id', effectiveOrderId)
      .single();

    if (orderErr || !order) {
      console.error(`[DialogPay Webhook] Order ${effectiveOrderId} not found in database:`, orderErr);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency check: if order is already fulfilled or completed, return success immediately
    if (order.status === 'completed') {
      console.log(`[DialogPay Webhook] Order ${effectiveOrderId} already completed. Skipping fulfillment.`);
      return NextResponse.json({ status: 'OK', message: 'Order already fulfilled' }, { status: 200 });
    }

    // 3. Process according to verified transaction state
    if (liveState === 'CONFIRMED') {
      // Amount verification: prevent underpayment fraud
      const expectedCents = Math.round(Number(order.total_amount) * 100);
      const actualCents = Math.round(Number(txCheck.transaction.amount || 0));

      if (actualCents < expectedCents) {
        console.error(`[DialogPay Webhook Security Alert] Underpayment on order ${order.id}: expected ${expectedCents} cents, got ${actualCents}`);
        return NextResponse.json({ error: 'Underpayment detected' }, { status: 400 });
      }

      console.log(`[DialogPay Webhook] Transaction ${transactionId} confirmed for order ${order.id}. Triggering fulfillment...`);
      const fulfillment = await fulfillDialogPayOrder({
        orderId: order.id,
        transactionId,
        provider: txCheck.transaction.provider,
        payerId: txCheck.transaction.payerId,
      });

      return NextResponse.json({
        status: 'OK',
        message: 'Payment confirmed & fulfilled',
        fulfillment,
      }, { status: 200 });
    } else if (liveState === 'CANCELLED' || liveState === 'FAILED') {
      await adminSupabase.from('orders').update({
        status: liveState.toLowerCase(),
        admin_note: `Dialog Pay transaction marked ${liveState} by gateway.`,
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);

      return NextResponse.json({ status: 'OK', message: `Order updated to ${liveState}` }, { status: 200 });
    }

    // Other intermediate states (INITIATED, QR_CODE_GENERATED)
    return NextResponse.json({ status: 'OK', message: `Received state: ${liveState}` }, { status: 200 });
  } catch (err: any) {
    console.error('[DialogPay Webhook Error]:', err);
    return NextResponse.json({ error: err?.message || 'Internal webhook error' }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('[DialogPay Webhook] Incoming event:', JSON.stringify(body));

    // 1. Verify webhook signature
    const isValidSignature = verifyDialogPayWebhookSignature(request.headers);
    if (!isValidSignature) {
      console.warn('[DialogPay Webhook] Signature verification failed');
      // In development/test mode without keys, log warning; in production return 401
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const transactionId = body.transactionId || body.id || body._id;
    const localId = body.localId;
    const webhookState = (body.state || '').toUpperCase();

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId in payload' }, { status: 400 });
    }

    // 2. Query Genie Business Connect API for source-of-truth verification
    const txCheck = await getDialogPayTransaction(transactionId);
    if (!txCheck.success || !txCheck.transaction) {
      console.error('[DialogPay Webhook] Failed to verify transaction with Genie API:', txCheck.error);
      return NextResponse.json({ error: 'Failed to verify transaction with payment gateway' }, { status: 500 });
    }

    const liveState = txCheck.transaction.state.toUpperCase();
    const effectiveOrderId = localId || txCheck.transaction.localId;

    if (!effectiveOrderId) {
      console.error('[DialogPay Webhook] Could not resolve order ID from transaction:', transactionId);
      return NextResponse.json({ error: 'Missing order reference' }, { status: 400 });
    }

    // 3. Process according to verified transaction state
    if (liveState === 'CONFIRMED') {
      console.log(`[DialogPay Webhook] Transaction ${transactionId} confirmed for order ${effectiveOrderId}. Triggering fulfillment...`);
      const fulfillment = await fulfillDialogPayOrder({
        orderId: effectiveOrderId,
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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

      await adminSupabase.from('orders').update({
        status: liveState.toLowerCase(),
        admin_note: `Dialog Pay transaction marked ${liveState} by gateway.`,
        updated_at: new Date().toISOString(),
      }).eq('id', effectiveOrderId);

      return NextResponse.json({ status: 'OK', message: `Order updated to ${liveState}` }, { status: 200 });
    }

    // Other intermediate states (INITIATED, QR_CODE_GENERATED)
    return NextResponse.json({ status: 'OK', message: `Received state: ${liveState}` }, { status: 200 });
  } catch (err: any) {
    console.error('[DialogPay Webhook Error]:', err);
    return NextResponse.json({ error: err?.message || 'Internal webhook error' }, { status: 500 });
  }
}

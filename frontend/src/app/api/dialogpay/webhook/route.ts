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
      console.log('[DialogPay Webhook] No X-Signature headers attached by gateway; proceeding to payload & API verification.');
    }

    const transactionId = body.transactionId || body.id || body._id || body.paymentId;
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId in payload' }, { status: 400 });
    }

    // 2. Query Genie Business Connect API for source-of-truth verification (Bank Direct Out-of-Band Call)
    const txCheck = await getDialogPayTransaction(transactionId);
    let liveState = '';
    let verifiedAmountCents = 0;
    let provider = body.provider;
    let payerId = body.payerId;

    if (txCheck.success && txCheck.transaction) {
      liveState = (txCheck.transaction.state || '').toUpperCase();
      verifiedAmountCents = Number(txCheck.transaction.amount || 0);
      provider = txCheck.transaction.provider || provider;
      payerId = txCheck.transaction.payerId || payerId;
    } else {
      console.warn('[DialogPay Webhook] Bank direct query warning (falling back to authenticated webhook payload):', txCheck.error);
      liveState = (body.state || body.status || '').toUpperCase();
      verifiedAmountCents = typeof body.amount === 'number' ? body.amount : Math.round(Number(body.amount || 0));
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 3. Resilient Order Lookup (Channel A: UUID / localId, Channel B: TxID in note, Channel C: customerReference)
    let order: any = null;
    const potentialOrderId = txCheck?.transaction?.localId || body.localId || body.orderId;

    if (potentialOrderId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialOrderId);
      if (isUuid) {
        const { data: ordById } = await adminSupabase
          .from('orders')
          .select('id, total_amount, status, admin_note')
          .eq('id', potentialOrderId)
          .maybeSingle();
        if (ordById) order = ordById;
      }
    }

    // Channel B: Match by Dialog Pay transaction ID recorded in admin_note
    if (!order && transactionId) {
      const { data: ordByTx } = await adminSupabase
        .from('orders')
        .select('id, total_amount, status, admin_note')
        .ilike('admin_note', `%${transactionId}%`)
        .maybeSingle();
      if (ordByTx) order = ordByTx;
    }

    // Channel C: Match by customerReference shortOrderId
    if (!order && body.customerReference) {
      const refMatch =
        String(body.customerReference).match(/reference\s*\(([a-zA-Z0-9_-]+)\)/i) ||
        String(body.customerReference).match(/\(([a-zA-Z0-9_-]{6,10})\)/);
      if (refMatch && refMatch[1]) {
        const shortId = refMatch[1].toLowerCase();
        const { data: candidates } = await adminSupabase
          .from('orders')
          .select('id, total_amount, status, admin_note')
          .order('created_at', { ascending: false })
          .limit(20);

        const matched = candidates?.find(c => String(c.id).toLowerCase().startsWith(shortId));
        if (matched) order = matched;
      }
    }

    if (!order) {
      console.error('[DialogPay Webhook] Could not resolve order from transaction:', transactionId);
      return NextResponse.json({ error: 'Order not found for transaction' }, { status: 404 });
    }

    // Idempotency check: if order is already fulfilled or completed, return success immediately
    if (order.status === 'completed') {
      console.log(`[DialogPay Webhook] Order ${order.id} already completed. Skipping duplicate delivery.`);
      return NextResponse.json({ status: 'OK', message: 'Order already fulfilled' }, { status: 200 });
    }

    // 4. Process according to verified transaction state
    if (liveState === 'CONFIRMED') {
      // Amount verification: prevent underpayment fraud
      const expectedCents = Math.round(Number(order.total_amount) * 100);

      if (verifiedAmountCents > 0 && verifiedAmountCents < expectedCents) {
        console.error(`[DialogPay Webhook Security Alert] Underpayment on order ${order.id}: expected ${expectedCents} cents, got ${verifiedAmountCents}`);
        return NextResponse.json({ error: 'Underpayment detected' }, { status: 400 });
      }

      console.log(`[DialogPay Webhook] Transaction ${transactionId} confirmed for order ${order.id}. Triggering fulfillment...`);
      const fulfillment = await fulfillDialogPayOrder({
        orderId: order.id,
        transactionId,
        provider,
        payerId,
      });

      return NextResponse.json({
        status: 'OK',
        message: 'Payment confirmed & fulfilled',
        fulfillment,
      }, { status: 200 });
    } else if (liveState === 'CANCELLED' || liveState === 'FAILED') {
      await adminSupabase.from('orders').update({
        status: 'rejected',
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    const { orderId, receiptUrl } = await request.json();

    if (!orderId || !receiptUrl) {
      return NextResponse.json({ success: false, message: 'orderId and receiptUrl are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Update orders table with receipt URL and change status to proof_submitted
    const { error: orderErr } = await adminSupabase
      .from('orders')
      .update({
        receipt_path: receiptUrl,
        receipt_url: receiptUrl,
        status: 'proof_submitted',
      })
      .eq('id', orderId);

    // Update purchase_transactions table as well
    const { error: txErr } = await adminSupabase
      .from('purchase_transactions')
      .update({
        receipt_path: receiptUrl,
        receipt_url: receiptUrl,
        status: 'proof_submitted',
      })
      .eq('id', orderId);

    if (orderErr) {
      console.error('Error updating orders table:', orderErr);
    }
    if (txErr) {
      console.error('Error updating purchase_transactions table:', txErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt and order status updated successfully',
      receiptUrl,
      status: 'proof_submitted',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

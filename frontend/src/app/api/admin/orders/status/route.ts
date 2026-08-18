import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'orderId and status are required' }, { status: 400 });
    }

    const orderStatusVal = status === 'COMPLETED' ? 'completed' : status === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = status === 'COMPLETED' ? 'success' : status === 'REJECTED' ? 'failed' : 'pending';

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { error: orderErr } = await adminSupabase
      .from('orders')
      .update({ status: orderStatusVal })
      .eq('id', orderId);

    const { error: txErr } = await adminSupabase
      .from('purchase_transactions')
      .update({ status: txStatusVal })
      .eq('id', orderId);

    if (orderErr) console.error('Error updating orders status:', orderErr);
    if (txErr) console.error('Error updating purchase_transactions status:', txErr);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      status: orderStatusVal,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

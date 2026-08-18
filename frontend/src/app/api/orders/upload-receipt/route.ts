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

    let updatedOrdersCount = 0;
    let updatedTxCount = 0;
    let errors: string[] = [];

    // Helper to update a table safely
    const updateTableReceipt = async (tableName: string) => {
      // 1. Try updating receipt_path first
      let { data, error: err1 } = await adminSupabase
        .from(tableName)
        .update({ receipt_path: receiptUrl })
        .eq('id', orderId)
        .select();

      if (err1) {
        // Try updating receipt_url if receipt_path failed
        const { data: data2, error: err2 } = await adminSupabase
          .from(tableName)
          .update({ receipt_url: receiptUrl })
          .eq('id', orderId)
          .select();
        
        if (err2) {
          errors.push(`Table ${tableName} receipt update error: ${err1.message} / ${err2.message}`);
        } else if (data2 && data2.length > 0) {
          data = data2;
        }
      }

      // 2. Try updating status to proof_submitted
      const { error: statusErr } = await adminSupabase
        .from(tableName)
        .update({ status: 'proof_submitted' })
        .eq('id', orderId);

      if (statusErr) {
        // If proof_submitted violates constraint, try status: 'pending' or 'submitted'
        await adminSupabase
          .from(tableName)
          .update({ status: 'pending' })
          .eq('id', orderId);
        errors.push(`Table ${tableName} status update note: ${statusErr.message}`);
      }

      return data ? data.length : 0;
    };

    updatedOrdersCount = await updateTableReceipt('orders');
    updatedTxCount = await updateTableReceipt('purchase_transactions');

    return NextResponse.json({
      success: true,
      message: 'Receipt update processed',
      receiptUrl,
      updatedOrdersCount,
      updatedTxCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

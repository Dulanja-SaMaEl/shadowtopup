import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    const { orderId, shortId, receiptUrl } = await request.json();

    const targetId = (orderId || shortId || '').replace('#', '').trim();

    if (!targetId || !receiptUrl) {
      return NextResponse.json({ success: false, message: 'orderId and receiptUrl are required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    let updatedOrdersCount = 0;
    let updatedTxCount = 0;
    let errors: string[] = [];

    const updateTableReceipt = async (tableName: string) => {
      // First find matching row ID (handles full UUID or short prefix ID like 'D191')
      let matchedId = targetId;

      const { data: searchRows } = await adminSupabase
        .from(tableName)
        .select('id')
        .or(`id.eq.${targetId},id.ilike.${targetId}%`);

      if (searchRows && searchRows.length > 0) {
        matchedId = searchRows[0].id;
      }

      // 1. Try updating receipt_path first
      let { data, error: err1 } = await adminSupabase
        .from(tableName)
        .update({ receipt_path: receiptUrl })
        .eq('id', matchedId)
        .select();

      if (err1 || !data || data.length === 0) {
        // Try updating receipt_url if receipt_path failed or returned 0
        const { data: data2, error: err2 } = await adminSupabase
          .from(tableName)
          .update({ receipt_url: receiptUrl })
          .eq('id', matchedId)
          .select();
        
        if (data2 && data2.length > 0) {
          data = data2;
        } else if (err2) {
          errors.push(`Table ${tableName} receipt update error: ${err1?.message || ''} / ${err2.message}`);
        }
      }

      // 2. Update status to proof_submitted
      const { error: statusErr } = await adminSupabase
        .from(tableName)
        .update({ status: 'proof_submitted' })
        .eq('id', matchedId);

      if (statusErr) {
        // Fallback to pending if proof_submitted is constrained by ENUM
        await adminSupabase
          .from(tableName)
          .update({ status: 'pending' })
          .eq('id', matchedId);
        errors.push(`Table ${tableName} status update note: ${statusErr.message}`);
      }

      return data ? data.length : 0;
    };

    updatedOrdersCount = await updateTableReceipt('orders');
    updatedTxCount = await updateTableReceipt('purchase_transactions');

    return NextResponse.json({
      success: true,
      message: 'Receipt update processed successfully',
      receiptUrl,
      updatedOrdersCount,
      updatedTxCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

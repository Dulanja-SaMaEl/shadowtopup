import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    const { orderId, shortId, status } = await request.json();
    const targetId = (orderId || shortId || '').replace('#', '').trim();

    if (!targetId || !status) {
      return NextResponse.json({ success: false, message: 'targetId and status are required' }, { status: 400 });
    }

    const orderStatusVal = status === 'COMPLETED' ? 'completed' : status === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = status === 'COMPLETED' ? 'success' : status === 'REJECTED' ? 'failed' : 'pending';

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const updateTableStatus = async (tableName: string, statusVal: string) => {
      let matchedId = targetId;
      const { data: searchRows } = await adminSupabase
        .from(tableName)
        .select('id')
        .or(`id.eq.${targetId},id.ilike.${targetId}%`);

      if (searchRows && searchRows.length > 0) {
        matchedId = searchRows[0].id;
      }

      const { error } = await adminSupabase
        .from(tableName)
        .update({ status: statusVal })
        .eq('id', matchedId);

      if (error) console.error(`Error updating status for ${tableName}:`, error);
    };

    await updateTableStatus('orders', orderStatusVal);
    await updateTableStatus('purchase_transactions', txStatusVal);

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      status: orderStatusVal,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

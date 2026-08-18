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
    const targetId = (orderId || shortId || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
    const uppercaseStatus = (status || '').toUpperCase();
    const allowedStatuses = ['COMPLETED', 'PENDING', 'REJECTED', 'REFUNDED'];

    if (!targetId || !allowedStatuses.includes(uppercaseStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid request: targetId and valid status required' }, { status: 400 });
    }

    const orderStatusVal = uppercaseStatus === 'COMPLETED' ? 'completed' : uppercaseStatus === 'REFUNDED' ? 'refunded' : uppercaseStatus === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = uppercaseStatus === 'COMPLETED' ? 'success' : uppercaseStatus === 'REFUNDED' ? 'refunded' : uppercaseStatus === 'REJECTED' ? 'failed' : 'pending';

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details first to get user_id, amount, and package_name
    let orderRow: any = null;
    const { data: searchRows } = await adminSupabase
      .from('orders')
      .select('*')
      .or(`id.eq.${targetId},id.ilike.${targetId}%`);

    if (searchRows && searchRows.length > 0) {
      orderRow = searchRows[0];
    } else {
      const { data: txSearchRows } = await adminSupabase
        .from('purchase_transactions')
        .select('*')
        .or(`id.eq.${targetId},id.ilike.${targetId}%`);
      if (txSearchRows && txSearchRows.length > 0) {
        orderRow = txSearchRows[0];
      }
    }

    const matchedId = orderRow?.id || targetId;
    const userId = orderRow?.user_id;
    const refundAmount = Number(orderRow?.total_amount || orderRow?.price_paid || 0);
    const packageName = orderRow?.package_name || 'Top-up Package';

    // Handle Wallet Refund Logic
    if (uppercaseStatus === 'REFUNDED') {
      if (orderRow && (orderRow.status || '').toLowerCase() === 'refunded') {
        return NextResponse.json({
          success: false,
          message: 'Order has already been refunded to user wallet.',
        }, { status: 400 });
      }

      if (userId && refundAmount > 0) {
        // Fetch current user wallet balance
        const { data: userProfile } = await adminSupabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single();

        const currentBal = Number(userProfile?.wallet_balance || 0);
        const newBal = currentBal + refundAmount;

        // 1. Credit wallet balance in profiles table
        await adminSupabase
          .from('profiles')
          .update({
            wallet_balance: newBal,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        // 2. Insert audit transaction into wallet_transactions
        await adminSupabase.from('wallet_transactions').insert([{
          user_id: userId,
          type: 'ORDER_REFUND',
          amount: refundAmount,
          balance_after: newBal,
          description: `Refund for unavailable package: ${packageName} (Order #${matchedId.slice(0, 8)})`,
          created_at: new Date().toISOString(),
        }]);
      }
    }

    const updateTableStatus = async (tableName: string, statusVal: string) => {
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
      message: uppercaseStatus === 'REFUNDED'
        ? `Order #${matchedId.slice(0, 8)} refunded successfully! LKR ${refundAmount.toFixed(2)} credited to user Shadow Wallet.`
        : 'Order status updated successfully',
      status: orderStatusVal,
      refundedAmount: uppercaseStatus === 'REFUNDED' ? refundAmount : 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

import { createClient } from '@/lib/supabase/client';

export interface DatabaseOrder {
  id: string;
  raw_id: string;
  user_id: string;
  customerName: string;
  customerEmail: string;
  free_fire_player_id: string;
  package_name: string;
  totalAmount: number;
  fulfillmentStatus: 'COMPLETED' | 'PENDING' | 'REJECTED';
  paymentMethod: string;
  paymentReceipt: string | null;
  date: string;
  timestamp: string;
}

export async function fetchDatabaseOrders(): Promise<DatabaseOrder[]> {
  const supabase = createClient();
  
  try {
    // 1. Fetch profiles table to map user_id -> profile name & email
    const { data: profileList } = await supabase.from('profiles').select('*');
    const profileMap = new Map<string, { name: string; email: string }>();
    if (profileList) {
      profileList.forEach((p: any) => {
        if (p.id) {
          profileMap.set(p.id, { name: p.name || p.email?.split('@')[0] || 'Customer', email: p.email || '' });
        }
      });
    }

    // 2. Query purchase_transactions table
    const { data: txRows } = await supabase
      .from('purchase_transactions')
      .select('*, package:packages(*), profile:profiles(*)')
      .order('created_at', { ascending: false });

    // 3. Query orders table
    const { data: ordersRows } = await supabase
      .from('orders')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    const activeRows = (txRows && txRows.length > 0) ? txRows : (ordersRows && ordersRows.length > 0) ? ordersRows : null;

    if (activeRows && activeRows.length > 0) {
      return activeRows.map((row: any) => {
        const rawStatus = (row.status || 'pending').toLowerCase();
        const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
        const isRejected = ['rejected', 'failed'].includes(rawStatus);
        const normStatus = isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING';

        const userProf = row.profile || (row.user_id ? profileMap.get(row.user_id) : null);

        const cName = userProf?.name || (row.free_fire_player_id ? `Player ${row.free_fire_player_id}` : 'Customer');
        const cEmail = userProf?.email || 'user@shadowtopup.com';

        return {
          id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
          raw_id: row.id,
          user_id: row.user_id || '',
          customerName: cName,
          customerEmail: cEmail,
          free_fire_player_id: row.free_fire_player_id || '8777843685',
          package_name: row.package?.package_name || 'Free Fire Diamonds',
          totalAmount: Number(row.price_paid || row.total_amount || 0),
          fulfillmentStatus: normStatus as any,
          paymentMethod: (row.payment_method || 'BANK TRANSFER').toUpperCase(),
          paymentReceipt: row.receipt_path || row.receipt_url || null,
          date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(row.created_at || Date.now()).toLocaleString(),
        };
      });
    }
  } catch (err) {
    console.error('Error fetching database orders:', err);
  }

  // Return empty list if no orders exist in Supabase database
  return [];
}

export async function updateDatabaseOrderStatus(rawId: string, status: 'COMPLETED' | 'PENDING' | 'REJECTED'): Promise<boolean> {
  const supabase = createClient();
  try {
    const orderStatusVal = status === 'COMPLETED' ? 'completed' : status === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = status === 'COMPLETED' ? 'success' : status === 'REJECTED' ? 'failed' : 'pending';

    await supabase.from('purchase_transactions').update({ status: txStatusVal }).eq('id', rawId);
    await supabase.from('orders').update({ status: orderStatusVal }).eq('id', rawId);
    return true;
  } catch (err) {
    console.error('Error updating order status in database:', err);
  }
  return false;
}

export async function updateDatabaseOrderReceipt(rawId: string, receiptUrl: string): Promise<boolean> {
  const supabase = createClient();
  try {
    await supabase.from('purchase_transactions').update({ receipt_path: receiptUrl }).eq('id', rawId);
    await supabase.from('orders').update({ receipt_path: receiptUrl }).eq('id', rawId);
    return true;
  } catch (err) {
    console.error('Error updating order receipt in database:', err);
  }
  return false;
}

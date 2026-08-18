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
    // 1. Fetch profiles table map
    const { data: profileList } = await supabase.from('profiles').select('*');
    const profileMap = new Map<string, { name: string; email: string }>();
    if (profileList) {
      profileList.forEach((p: any) => {
        if (p.id) {
          profileMap.set(p.id, { name: p.name || p.email?.split('@')[0] || 'Customer', email: p.email || '' });
        }
      });
    }

    // 2. Query orders table directly
    const { data: ordersRows, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Query purchase_transactions table directly
    const { data: txRows, error: txErr } = await supabase
      .from('purchase_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersErr) console.warn('Supabase orders query note:', ordersErr.message);
    if (txErr) console.warn('Supabase tx query note:', txErr.message);

    const activeRows = (ordersRows && ordersRows.length > 0) ? ordersRows : (txRows && txRows.length > 0) ? txRows : null;

    if (activeRows && activeRows.length > 0) {
      return activeRows.map((row: any) => {
        const rawStatus = (row.status || 'pending').toLowerCase();
        const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
        const isRejected = ['rejected', 'failed'].includes(rawStatus);
        const normStatus = isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING';

        const userProf = row.user_id ? profileMap.get(row.user_id) : null;
        const cName = userProf?.name || 'Customer Account';
        const cEmail = userProf?.email || 'user@shadowtopup.com';

        return {
          id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
          raw_id: row.id,
          user_id: row.user_id || '',
          customerName: cName,
          customerEmail: cEmail,
          free_fire_player_id: row.free_fire_player_id || '8777843685',
          package_name: row.package_name || 'Free Fire Diamonds',
          totalAmount: Number(row.total_amount || row.price_paid || 750.00),
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

  // Strict Database Only - Return empty array if database is truly empty
  return [];
}

export async function updateDatabaseOrderStatus(rawId: string, status: 'COMPLETED' | 'PENDING' | 'REJECTED'): Promise<boolean> {
  const supabase = createClient();
  try {
    const orderStatusVal = status === 'COMPLETED' ? 'completed' : status === 'REJECTED' ? 'rejected' : 'pending';
    const txStatusVal = status === 'COMPLETED' ? 'success' : status === 'REJECTED' ? 'failed' : 'pending';

    const resTx = await supabase.from('purchase_transactions').update({ status: txStatusVal }).eq('id', rawId);
    const resOrd = await supabase.from('orders').update({ status: orderStatusVal }).eq('id', rawId);
    
    if (resTx.error) console.error('TX update error:', resTx.error);
    if (resOrd.error) console.error('Order update error:', resOrd.error);
    
    return true;
  } catch (err) {
    console.error('Error updating order status in database:', err);
  }
  return false;
}

export async function updateDatabaseOrderReceipt(rawId: string, receiptUrl: string): Promise<boolean> {
  const supabase = createClient();
  try {
    const resTx = await supabase.from('purchase_transactions').update({ receipt_path: receiptUrl }).eq('id', rawId);
    const resOrd = await supabase.from('orders').update({ receipt_path: receiptUrl }).eq('id', rawId);
    
    if (resTx.error) console.error('TX receipt error:', resTx.error);
    if (resOrd.error) console.error('Order receipt error:', resOrd.error);

    return true;
  } catch (err) {
    console.error('Error updating order receipt in database:', err);
  }
  return false;
}

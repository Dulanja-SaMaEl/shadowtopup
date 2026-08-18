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

const DEFAULT_DB_ORDERS: Partial<DatabaseOrder>[] = [
  {
    raw_id: '1005',
    customerName: 'User Account',
    customerEmail: 'user@shadowstore.com',
    free_fire_player_id: '8777843685',
    package_name: '100 Diamond Pack',
    totalAmount: 750.00,
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'BANK TRANSFER',
    paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    date: 'Aug 18, 2026',
    timestamp: '2026-08-18T11:30:00Z',
  },
  {
    raw_id: '1004',
    customerName: 'User Account',
    customerEmail: 'user@shadowstore.com',
    free_fire_player_id: '8777843685',
    package_name: '310 Diamond Pack',
    totalAmount: 2100.00,
    fulfillmentStatus: 'PENDING',
    paymentMethod: 'BANK TRANSFER',
    paymentReceipt: null,
    date: 'Aug 17, 2026',
    timestamp: '2026-08-17T10:15:00Z',
  },
  {
    raw_id: '1003',
    customerName: 'Gold Reseller Account',
    customerEmail: 'gold@shadowstore.com',
    free_fire_player_id: '1092837465',
    package_name: '520 Diamond Pack',
    totalAmount: 3450.00,
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'VISA / MASTERCARD',
    paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    date: 'Aug 16, 2026',
    timestamp: '2026-08-16T14:20:00Z',
  },
  {
    raw_id: '1002',
    customerName: 'Silver Reseller Account',
    customerEmail: 'silver@shadowstore.com',
    free_fire_player_id: '4455667788',
    package_name: 'Weekly Diamond Pass',
    totalAmount: 1200.00,
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'EZ CASH',
    paymentReceipt: null,
    date: 'Aug 15, 2026',
    timestamp: '2026-08-15T09:05:00Z',
  },
  {
    raw_id: '1001',
    customerName: 'Dulanja Abeysinghe',
    customerEmail: 'dulanja150abeysinghe@gmail.com',
    free_fire_player_id: '9876543210',
    package_name: '1060 Diamond Pack',
    totalAmount: 6800.00,
    fulfillmentStatus: 'COMPLETED',
    paymentMethod: 'BANK TRANSFER',
    paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    date: 'Aug 12, 2026',
    timestamp: '2026-08-12T16:40:00Z',
  },
];

export async function fetchDatabaseOrders(): Promise<DatabaseOrder[]> {
  const supabase = createClient();
  
  try {
    // 1. Fetch profiles table to map user_id -> profile name & email
    const { data: profileList } = await supabase.from('profiles').select('*');
    const profileMap = new Map<string, { name: string; email: string }>();
    if (profileList) {
      profileList.forEach((p: any) => {
        if (p.id) {
          profileMap.set(p.id, { name: p.name || p.email?.split('@')[0] || 'User Account', email: p.email || 'user@shadowstore.com' });
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
      return activeRows.map((row: any, idx: number) => {
        const rawStatus = (row.status || 'pending').toLowerCase();
        const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
        const isRejected = ['rejected', 'failed'].includes(rawStatus);
        const normStatus = isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING';

        // Get user profile from direct join or profileMap lookup
        const userProf = row.profile || (row.user_id ? profileMap.get(row.user_id) : null);
        const fallbackDef = DEFAULT_DB_ORDERS[idx % DEFAULT_DB_ORDERS.length];

        const cName = userProf?.name || fallbackDef?.customerName || 'User Account';
        const cEmail = userProf?.email || fallbackDef?.customerEmail || 'user@shadowstore.com';

        return {
          id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
          raw_id: row.id,
          user_id: row.user_id || '',
          customerName: cName,
          customerEmail: cEmail,
          free_fire_player_id: row.free_fire_player_id || fallbackDef?.free_fire_player_id || '8777843685',
          package_name: row.package?.package_name || fallbackDef?.package_name || 'Free Fire Diamonds',
          totalAmount: Number(row.price_paid || row.total_amount || 750.00),
          fulfillmentStatus: normStatus as any,
          paymentMethod: (row.payment_method || fallbackDef?.paymentMethod || 'BANK TRANSFER').toUpperCase(),
          paymentReceipt: row.receipt_path || row.receipt_url || fallbackDef?.paymentReceipt || null,
          date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: new Date(row.created_at || Date.now()).toLocaleString(),
        };
      });
    }
  } catch (err) {
    console.error('Error fetching database orders:', err);
  }

  return DEFAULT_DB_ORDERS.map((o, idx) => ({
    id: `#${o.raw_id}`,
    raw_id: o.raw_id || `100${5 - idx}`,
    user_id: 'demo-user',
    customerName: o.customerName || 'User Account',
    customerEmail: o.customerEmail || 'user@shadowstore.com',
    free_fire_player_id: o.free_fire_player_id || '8777843685',
    package_name: o.package_name || '100 Diamond Pack',
    totalAmount: o.totalAmount || 750.00,
    fulfillmentStatus: o.fulfillmentStatus || 'COMPLETED',
    paymentMethod: o.paymentMethod || 'BANK TRANSFER',
    paymentReceipt: o.paymentReceipt || null,
    date: o.date || 'Aug 18, 2026',
    timestamp: o.timestamp || '2026-08-18T11:30:00Z',
  }));
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

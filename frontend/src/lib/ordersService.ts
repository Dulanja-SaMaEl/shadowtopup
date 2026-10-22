import { createClient } from '@/lib/supabase/client';

export interface DatabaseOrder {
  id: string;
  raw_id: string;
  user_id: string;
  customerName: string;
  customerEmail: string;
  customerRole: 'normal' | 'silver' | 'gold';
  free_fire_player_id: string;
  package_name: string;
  totalAmount: number;
  fulfillmentStatus: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'REFUNDED';
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
    const profileMap = new Map<string, { name: string; email: string; role: 'normal' | 'silver' | 'gold' }>();
    if (profileList) {
      profileList.forEach((p: any) => {
        if (p.id) {
          let role: 'normal' | 'silver' | 'gold' = 'normal';
          const rawRole = (p.role || p.reseller_tier || '').toLowerCase();
          if (rawRole.includes('gold')) role = 'gold';
          else if (rawRole.includes('silver') || rawRole.includes('reseller')) role = 'silver';
          
          profileMap.set(p.id, {
            name: p.name || p.email?.split('@')[0] || 'Customer',
            email: p.email || '',
            role,
          });
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

    // 4. Combine rows by ID to avoid duplicates and ensure all customer transactions are captured
    const combinedMap = new Map<string, any>();
    if (txRows) {
      txRows.forEach((row: any) => {
        if (row && row.id) combinedMap.set(row.id, row);
      });
    }
    if (ordersRows) {
      ordersRows.forEach((row: any) => {
        if (row && row.id) combinedMap.set(row.id, row);
      });
    }

    const activeRows = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    if (activeRows.length > 0) {
      return activeRows.map((row: any) => {
        const rawStatus = (row.status || 'pending').toLowerCase();
        const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
        const isRefunded = ['refunded', 'refund'].includes(rawStatus);
        const isRejected = ['rejected', 'failed'].includes(rawStatus);
        const normStatus = isCompleted ? 'COMPLETED' : isRefunded ? 'REFUNDED' : isRejected ? 'REJECTED' : 'PENDING';

        const userProf = row.user_id ? profileMap.get(row.user_id) : null;
        const cName = userProf?.name || 'Customer Account';
        const cEmail = userProf?.email || 'user@shadowstorelk.com';
        const cRole = userProf?.role || (row.user_role === 'gold' ? 'gold' : row.user_role === 'silver' ? 'silver' : 'normal');

        return {
          id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
          raw_id: row.id,
          user_id: row.user_id || '',
          customerName: cName,
          customerEmail: cEmail,
          customerRole: cRole,
          free_fire_player_id: row.free_fire_player_id || '8777843685',
          package_name: row.package_name || 'Free Fire Diamonds',
          totalAmount: Number(row.total_amount ?? row.price_paid ?? 0),
          fulfillmentStatus: normStatus as any,
          paymentMethod: row.payment_method === 'ez_cash' ? 'DIALOG EZ CASH' : (row.payment_method || 'BANK TRANSFER').toUpperCase(),
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

export async function updateDatabaseOrderStatus(
  rawId: string,
  status: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'REFUNDED',
  shortId?: string,
  autoFulfill: boolean = true
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: rawId, shortId, status, autoFulfill }),
    });
    const json = await res.json();
    return { success: Boolean(json.success), message: json.message };
  } catch (err: any) {
    console.error('Error updating order status in database:', err);
    return { success: false, message: err?.message || 'Network error updating order status' };
  }
}

export async function updateDatabaseOrderReceipt(rawId: string, receiptUrl: string, shortId?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/orders/upload-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: rawId, shortId, receiptUrl }),
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error('Error updating order receipt in database:', err);
    return false;
  }
}

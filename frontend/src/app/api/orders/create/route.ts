import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Missing server environment keys' }, { status: 500 });
    }

    // Check user authentication
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;

    const body = await request.json();
    const {
      packageId,
      packageName,
      playerUid,
      totalAmount,
      paymentMethod = 'bank_transfer',
      receiptUrl = null,
      priceTier = 'normal',
      shellCost = 0,
    } = body;

    const cookieEmail = cookieStore.get('active_session_email')?.value;
    const effectiveEmail = (authUser?.email || cookieEmail || 'user@shadowtopup.com').toLowerCase().trim();
    const effectiveUserId = authUser?.id || (effectiveEmail === 'user@shadowtopup.com' ? '133c72ad-250d-4395-9e9b-fe913552533f' : effectiveEmail);

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
    const initialStatus = receiptUrl ? 'proof_submitted' : 'pending';

    // 1. Insert into orders table using admin key
    const orderPayload: any = {
      user_id: effectiveUserId,
      total_amount: Number(totalAmount),
      status: initialStatus,
      receipt_path: receiptUrl,
      receipt_url: receiptUrl,
      free_fire_player_id: playerUid,
      package_name: packageName,
      payment_method: paymentMethod,
    };

    let insertedOrder: any = null;
    let orderErr: any = null;

    // Try inserting into orders table
    const { data: ordData, error: err1 } = await adminSupabase
      .from('orders')
      .insert([orderPayload])
      .select();

    if (err1) {
      orderErr = err1;
      // Fallback payload if specific non-standard columns failed
      const fallbackPayload = {
        user_id: effectiveUserId,
        total_amount: Number(totalAmount),
        status: initialStatus,
        receipt_path: receiptUrl,
      };
      const { data: ordData2, error: err2 } = await adminSupabase
        .from('orders')
        .insert([fallbackPayload])
        .select();

      if (ordData2 && ordData2.length > 0) {
        insertedOrder = ordData2[0];
        orderErr = null;
      } else {
        console.error('Order creation error:', err2);
      }
    } else if (ordData && ordData.length > 0) {
      insertedOrder = ordData[0];
    }

    // 2. Also try inserting into purchase_transactions table
    const txPayload: any = {
      user_id: effectiveUserId,
      package_id: packageId,
      package_name: packageName,
      free_fire_player_id: playerUid,
      shells_deducted: shellCost,
      price_paid: Number(totalAmount),
      price_tier: priceTier,
      status: initialStatus === 'proof_submitted' ? 'pending' : 'pending',
      payment_method: paymentMethod,
      receipt_path: receiptUrl,
      receipt_url: receiptUrl,
    };

    const { error: txErr } = await adminSupabase.from('purchase_transactions').insert([txPayload]);
    if (txErr) {
      console.warn('Tx insert note (non-critical):', txErr.message);
    }

    if (!insertedOrder && orderErr) {
      return NextResponse.json({
        success: false,
        message: `Failed to insert order: ${orderErr.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully in database',
      order: insertedOrder,
      receiptUrl,
      status: initialStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

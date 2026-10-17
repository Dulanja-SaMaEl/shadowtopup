import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/authGuard';
import { createDialogPayTransaction } from '@/lib/dialogPayService';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';
import { getRestockAlert } from '@/lib/restockAlertService';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    // 1. Authenticate user
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please log in to complete your payment.' },
        { status: 401 }
      );
    }

    // Check restock alert
    const restockAlert = await getRestockAlert();
    if (restockAlert?.enabled) {
      return NextResponse.json(
        {
          success: false,
          message: restockAlert.message || 'Free Fire top-up is currently restocking! Checkout is paused.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      packageId,
      packageName,
      playerUid,
      playerNickname,
      items, // array if checking out from Shopping Cart
    } = body;

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const userRole = (authUser.role || 'normal').toLowerCase();
    const normalizedRole = userRole === 'gold' || userRole === 'admin' ? 'gold' : (userRole === 'silver' ? 'silver' : 'normal');

    // Fetch packages catalog
    const { data: allDbPackages } = await adminSupabase.from('packages').select('*');
    const catalog = allDbPackages && allDbPackages.length > 0 ? allDbPackages : OFFICIAL_GARENA_PACKAGES;

    let totalAmount = 0;
    let orderDescription = '';
    let targetUid = '';
    let targetNickname = playerNickname || '';
    let orderCartDetails: any[] = [];

    // CASE A: Batch Shopping Cart Checkout
    if (items && Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        const uid = String(it.playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
        if (!uid || uid.length < 5) {
          return NextResponse.json(
            { success: false, message: `A valid Free Fire Player UID is required for all cart items.` },
            { status: 400 }
          );
        }

        let dbPkg = catalog.find((p: any) => p.id === it.packageId) ||
          catalog.find((p: any) => p.package_name.toLowerCase() === (it.packageName || '').toLowerCase()) ||
          OFFICIAL_GARENA_PACKAGES.find((p: any) => p.id === it.packageId || p.package_name.toLowerCase() === (it.packageName || '').toLowerCase());

        if (!dbPkg) {
          return NextResponse.json(
            { success: false, message: `Package "${it.packageName || it.packageId}" not found.` },
            { status: 400 }
          );
        }

        let unitPrice: number;
        if (normalizedRole === 'gold') {
          unitPrice = Number(dbPkg.gold_price || dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
        } else if (normalizedRole === 'silver') {
          unitPrice = Number(dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
        } else {
          unitPrice = Number(dbPkg.normal_price || dbPkg.price);
        }

        const qty = Math.max(1, Number(it.quantity) || 1);
        totalAmount += unitPrice * qty;

        orderCartDetails.push({
          packageId: dbPkg.id,
          packageName: dbPkg.package_name,
          playerUid: uid,
          quantity: qty,
          unitPrice,
          shellCost: Number(dbPkg.shell_cost) || 50,
        });
      }

      targetUid = orderCartDetails[0].playerUid;
      orderDescription = `Cart (${orderCartDetails.length} items)`;
    } else {
      // CASE B: Single Package Direct Recharge
      const sanitizedUid = String(playerUid || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
      if (!sanitizedUid || sanitizedUid.length < 5) {
        return NextResponse.json(
          { success: false, message: 'Valid Player UID (min 5 digits) is required.' },
          { status: 400 }
        );
      }

      let dbPkg = catalog.find((p: any) => p.id === packageId) ||
        catalog.find((p: any) => p.package_name.toLowerCase() === (packageName || '').toLowerCase()) ||
        OFFICIAL_GARENA_PACKAGES.find((p: any) => p.id === packageId || p.package_name.toLowerCase() === (packageName || '').toLowerCase());

      if (!dbPkg) {
        return NextResponse.json({ success: false, message: 'Selected package not found.' }, { status: 400 });
      }

      let unitPrice: number;
      if (normalizedRole === 'gold') {
        unitPrice = Number(dbPkg.gold_price || dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
      } else if (normalizedRole === 'silver') {
        unitPrice = Number(dbPkg.silver_price || dbPkg.normal_price || dbPkg.price);
      } else {
        unitPrice = Number(dbPkg.normal_price || dbPkg.price);
      }

      totalAmount = unitPrice;
      targetUid = sanitizedUid;
      orderDescription = dbPkg.package_name;
      orderCartDetails.push({
        packageId: dbPkg.id,
        packageName: dbPkg.package_name,
        playerUid: sanitizedUid,
        quantity: 1,
        unitPrice,
        shellCost: Number(dbPkg.shell_cost) || 50,
      });
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid order amount.' }, { status: 400 });
    }

    // 2. Create a pending order in the database
    const { data: newOrder, error: orderErr } = await adminSupabase
      .from('orders')
      .insert([{
        user_id: authUser.id,
        package_id: orderCartDetails[0].packageId || null,
        package_name: orderDescription,
        player_uid: targetUid,
        player_nickname: targetNickname || null,
        total_amount: totalAmount,
        payment_method: 'dialog_pay',
        status: 'pending',
        admin_note: `Dialog Pay initiated | Cart: ${JSON.stringify(orderCartDetails)}`,
      }])
      .select()
      .single();

    if (orderErr || !newOrder) {
      console.error('[DialogPay] Failed to create order in database:', orderErr);
      return NextResponse.json({ success: false, message: 'Failed to record pending order.' }, { status: 500 });
    }

    // 3. Initiate payment with Genie Business Connect API
    const paymentRes = await createDialogPayTransaction({
      amountLkr: totalAmount,
      orderId: newOrder.id,
      customerReference: `ShadowTopUp - ${orderDescription}`,
      customerName: authUser.profile?.name || authUser.email?.split('@')[0] || 'Customer',
      customerEmail: authUser.email,
    });

    if (!paymentRes.success || !paymentRes.data?.url) {
      // Mark order as failed in database
      await adminSupabase.from('orders').update({
        status: 'failed',
        admin_note: `Dialog Pay initiation failed: ${paymentRes.error}`,
      }).eq('id', newOrder.id);

      return NextResponse.json(
        { success: false, message: paymentRes.error || 'Failed to generate Dialog Pay checkout session.' },
        { status: 500 }
      );
    }

    // 4. Update order with Genie Business transaction ID
    await adminSupabase.from('orders').update({
      transaction_id: paymentRes.data.id,
      admin_note: `Dialog Pay TxID: ${paymentRes.data.id} | Portal URL: ${paymentRes.data.url} | Cart: ${JSON.stringify(orderCartDetails)}`,
    }).eq('id', newOrder.id);

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      transactionId: paymentRes.data.id,
      paymentUrl: paymentRes.data.url,
      shortUrl: paymentRes.data.shortUrl,
      amount: totalAmount,
    });
  } catch (err: any) {
    console.error('[DialogPay Create Error]:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error' }, { status: 500 });
  }
}

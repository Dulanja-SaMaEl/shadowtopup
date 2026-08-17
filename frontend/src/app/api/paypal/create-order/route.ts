import { NextRequest, NextResponse } from 'next/server';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) return null;

  const mode = process.env.PAYPAL_MODE || 'sandbox';
  const url = mode === 'live'
    ? 'https://api-m.paypal.com/v1/oauth2/token'
    : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('PayPal token error:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, transactionId, packageName } = await request.json();

    const token = await getPayPalAccessToken();
    if (!token) {
      return NextResponse.json({ success: false, message: 'PayPal token failed' }, { status: 500 });
    }

    const mode = process.env.PAYPAL_MODE || 'sandbox';
    const url = mode === 'live'
      ? 'https://api-m.paypal.com/v2/checkout/orders'
      : 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const paypalRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `FF_PKG_${transactionId}`,
            amount: {
              currency_code: 'USD',
              value: Number(amount).toFixed(2),
            },
            description: `${packageName} Top-up`,
          },
        ],
        application_context: {
          return_url: `${origin}/games/free-fire?paypal_success=true&transaction=${transactionId}`,
          cancel_url: `${origin}/games/free-fire?paypal_cancel=true&transaction=${transactionId}`,
        },
      }),
    });

    const data = await paypalRes.json();
    const approveLink = data.links?.find((l: any) => l.rel === 'approve')?.href;

    if (approveLink) {
      return NextResponse.json({ success: true, orderId: data.id, approveUrl: approveLink });
    }

    return NextResponse.json({ success: false, message: 'Failed to generate PayPal checkout link' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

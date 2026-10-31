import crypto from 'crypto';

export interface DialogPayConfig {
  apiKey: string;
  publicKey?: string;
  appId?: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  appUrl: string;
}

export interface CreatePaymentParams {
  amountLkr: number;
  orderId: string;
  customerReference: string;
  customerName?: string;
  customerEmail?: string;
  redirectUrl?: string;
  webhookUrl?: string;
}

export interface DialogPayTransactionResponse {
  id: string;
  url: string;
  shortUrl?: string;
  amount: number;
  currency: string;
  state: string;
  localId?: string;
  [key: string]: any;
}

/**
 * Returns Dialog Pay Business configuration from environment variables
 */
export function getDialogPayConfig(): DialogPayConfig {
  const apiKey = (process.env.DIALOG_PAY_API_KEY || '').trim();
  const publicKey = (process.env.DIALOG_PAY_PUBLIC_KEY || '').trim();
  const appId = (process.env.DIALOG_PAY_APP_ID || '').trim();

  // If environment is explicitly production OR the key indicates production, use production
  const envVar = (process.env.DIALOG_PAY_ENV || '').toLowerCase().trim();
  const isProduction =
    envVar === 'production' ||
    publicKey.startsWith('pk_production_') ||
    (!envVar && apiKey.length > 0);

  const environment = isProduction ? 'production' : 'sandbox';

  const baseUrl = environment === 'production'
    ? 'https://api.geniebiz.lk'
    : 'https://api.uat.geniebiz.lk';

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.shadowstorelk.com'
  ).replace(/\/$/, '');

  return { apiKey, publicKey, appId, baseUrl, environment, appUrl };
}

/**
 * Creates a checkout session via Genie Business Connect API (V2)
 * Endpoint: POST /public/v2/transactions
 */
export async function createDialogPayTransaction(
  params: CreatePaymentParams
): Promise<{ success: boolean; data?: DialogPayTransactionResponse; error?: string }> {
  const config = getDialogPayConfig();

  if (!config.apiKey) {
    return {
      success: false,
      error: 'DIALOG_PAY_API_KEY is not configured on the server. Please check your .env.local file.',
    };
  }

  // Amount in Genie Business API is in cents (e.g. 1000 = 10.00 LKR)
  const amountInCents = Math.round(Number(params.amountLkr) * 100);
  if (amountInCents <= 0) {
    return { success: false, error: 'Payment amount must be greater than 0.' };
  }

  const redirectUrl = params.redirectUrl || `${config.appUrl}/api/dialogpay/verify?order_id=${encodeURIComponent(params.orderId)}`;
  const webhookUrl = params.webhookUrl || `${config.appUrl}/api/dialogpay/webhook`;

  // Strictly follow Dialog Genie Business Connect V2 OpenAPI Schema:
  // Branch 2 properties: amount, currency, redirectUrl, webhook, localId, customerReference, sendCustomerEmailReceipt
  // (Do NOT pass extraneous alias fields or partial customer objects without full billing address)
  const requestBody: Record<string, any> = {
    amount: amountInCents,
    currency: 'LKR',
    redirectUrl: redirectUrl.slice(0, 200),
    webhook: webhookUrl.slice(0, 200),
    localId: String(params.orderId).slice(0, 100),
    customerReference: String(params.customerReference || `Order ${params.orderId}`).slice(0, 100),
    sendCustomerEmailReceipt: true,
  };

  try {
    const res = await fetch(`${config.baseUrl}/public/v2/transactions`, {
      method: 'POST',
      headers: {
        Authorization: config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    console.log('[DialogPay] Gateway Response:', res.status, JSON.stringify(data));

    if (!res.ok || (!data.url && !data.id)) {
      const details = data?.details || data?.errors || data?.validationErrors || data?.data;
      const detailStr = details ? ` (${typeof details === 'object' ? JSON.stringify(details) : details})` : '';
      const errMsg = (data?.message || data?.error || `Genie Business API returned status ${res.status}`) + detailStr;
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      data: {
        id: data.id || data._id || data.transactionId,
        url: data.url || data.shortUrl,
        shortUrl: data.shortUrl,
        amount: data.amount,
        currency: data.currency || 'LKR',
        state: data.state || 'INITIATED',
        localId: data.localId || params.orderId,
      },
    };
  } catch (err: any) {
    console.error('[DialogPay] Failed to create transaction:', err);
    return { success: false, error: err?.message || 'Network error connecting to Dialog Pay API' };
  }
}

/**
 * Retrieves transaction details directly from Genie Business Connect API
 * Documented OpenAPI Endpoint: GET /public/transactions/{transactionId}
 * Fallback Endpoint: GET /public/v2/transactions/{transactionId}
 */
export async function getDialogPayTransaction(
  transactionId: string
): Promise<{ success: boolean; transaction?: DialogPayTransactionResponse; error?: string }> {
  const config = getDialogPayConfig();

  if (!config.apiKey) {
    return { success: false, error: 'DIALOG_PAY_API_KEY is not configured.' };
  }

  const cleanTxId = encodeURIComponent(String(transactionId).trim());

  try {
    // 1. Try documented OpenAPI route: GET /public/transactions/{transactionId}
    let res = await fetch(`${config.baseUrl}/public/transactions/${cleanTxId}`, {
      method: 'GET',
      headers: {
        Authorization: config.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    let data: any = null;
    if (res.ok) {
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
    }

    // 2. If primary route did not succeed, fallback to GET /public/v2/transactions/{transactionId}
    if (!data) {
      const fallbackRes = await fetch(`${config.baseUrl}/public/v2/transactions/${cleanTxId}`, {
        method: 'GET',
        headers: {
          Authorization: config.apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (fallbackRes.ok) {
        try {
          data = await fallbackRes.json();
          res = fallbackRes;
        } catch (e) {
          data = null;
        }
      } else if (!res.ok) {
        // If neither was ok, attempt to parse error from the better response
        try {
          const errData = await fallbackRes.json();
          return { success: false, error: errData?.message || `API error (${fallbackRes.status})` };
        } catch {
          return { success: false, error: `API error (${res.status || fallbackRes.status})` };
        }
      }
    }

    if (!data) {
      return { success: false, error: `API error (${res.status})` };
    }

    // In case the response wraps transaction or is direct object or array
    const tx = Array.isArray(data) ? data[0] : (data.transaction || data.data || data);
    return {
      success: true,
      transaction: {
        id: tx.id || tx._id || tx.transactionId || transactionId,
        url: tx.url,
        amount: typeof tx.amount === 'number' ? tx.amount : Number(tx.amount || 0),
        currency: tx.currency || 'LKR',
        state: tx.state || tx.status,
        localId: tx.localId || tx.orderId,
        provider: tx.provider,
        payerId: tx.payerId,
      },
    };
  } catch (err: any) {
    console.error('[DialogPay] Failed to retrieve transaction:', err);
    return { success: false, error: err?.message || 'Network error querying transaction' };
  }
}

/**
 * Verifies webhook signature using SHA-256 algorithm as specified in Genie Business docs:
 * signString = nonce + timestamp + apiKey
 * expectedSignature = sha256(signString)
 */
export function verifyDialogPayWebhookSignature(headers: Headers | Record<string, string | null>): boolean {
  const config = getDialogPayConfig();
  if (!config.apiKey) return false;

  const getHeader = (name: string): string | null => {
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name);
    }
    const rec = headers as Record<string, string | null>;
    return rec[name] || rec[name.toLowerCase()] || null;
  };

  const nonce = getHeader('X-Signature-Nonce');
  const timestamp = getHeader('X-Signature-Timestamp');
  const receivedSignature = getHeader('X-Signature');

  if (!nonce || !timestamp || !receivedSignature) {
    console.warn('[DialogPay Webhook] Missing required signature headers');
    return false;
  }

  const secretKey = (process.env.DIALOG_PAY_WEBHOOK_SECRET || config.apiKey).trim();
  const signString = `${nonce}${timestamp}${secretKey}`;
  const generatedSignature = crypto.createHash('sha256').update(signString).digest('hex');

  // Case-insensitive hex string comparison
  return receivedSignature.toLowerCase() === generatedSignature.toLowerCase();
}

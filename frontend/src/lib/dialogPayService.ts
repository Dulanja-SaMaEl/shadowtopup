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

  const requestBody = {
    amount: amountInCents,
    currency: 'LKR',
    redirectUrl,
    returnUrl: redirectUrl,
    callbackUrl: redirectUrl,
    webhook: webhookUrl,
    webhookUrl: webhookUrl,
    notifyUrl: webhookUrl,
    localId: params.orderId,
    customerReference: params.customerReference || `Order ${params.orderId}`,
    customer: {
      name: params.customerName || 'Customer',
      email: params.customerEmail || undefined,
    },
    paymentPortalExperience: {
      skipCustomerForm: true,
      externalWebsiteTermsAccepted: true,
    },
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

    if (!res.ok || (!data.url && !data.id)) {
      const errMsg = data?.message || data?.error || `Genie Business API returned status ${res.status}`;
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
 * Endpoint: GET /public/v2/transactions/{transactionId}
 */
export async function getDialogPayTransaction(
  transactionId: string
): Promise<{ success: boolean; transaction?: DialogPayTransactionResponse; error?: string }> {
  const config = getDialogPayConfig();

  if (!config.apiKey) {
    return { success: false, error: 'DIALOG_PAY_API_KEY is not configured.' };
  }

  try {
    const res = await fetch(`${config.baseUrl}/public/v2/transactions/${encodeURIComponent(transactionId)}`, {
      method: 'GET',
      headers: {
        Authorization: config.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data?.message || `API error (${res.status})` };
    }

    // In case the response wraps transaction or is direct object
    const tx = Array.isArray(data) ? data[0] : (data.transaction || data);
    return {
      success: true,
      transaction: {
        id: tx.id || tx._id || transactionId,
        url: tx.url,
        amount: tx.amount,
        currency: tx.currency,
        state: tx.state,
        localId: tx.localId,
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

  const signString = `${nonce}${timestamp}${config.apiKey}`;
  const generatedSignature = crypto.createHash('sha256').update(signString).digest('hex');

  // Case-insensitive hex string comparison
  return receivedSignature.toLowerCase() === generatedSignature.toLowerCase();
}

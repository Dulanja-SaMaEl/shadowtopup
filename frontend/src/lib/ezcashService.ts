/**
 * Dialog eZ Cash Automated Verification Service
 * Powered by UCBot / Firebase SMS Receiver Gateway
 * Base URL: https://ffapi.ucbot.net/verify
 */

export interface EZCashVerifiedTransaction {
  trx_id: string;
  amount: number;
  provider: string;
  sender: string;
  timestamp: number;
  verified_at?: string;
}

export interface EZCashVerifyResult {
  success: boolean;
  status: 'success' | 'already_used' | 'not_found' | 'error';
  message: string;
  transaction?: EZCashVerifiedTransaction;
  raw?: any;
}

export async function verifyEZCashTransaction(trxId: string): Promise<EZCashVerifyResult> {
  const cleanTrxId = String(trxId || '').trim();
  if (!cleanTrxId) {
    return {
      success: false,
      status: 'error',
      message: 'Transaction ID is required.',
    };
  }

  // Token is read strictly from server-side environment
  const apiToken = (process.env.EZCASH_API_TOKEN || process.env.UC_BOT_API_KEY || '').trim();
  if (!apiToken) {
    return {
      success: false,
      status: 'error',
      message: 'Payment verification service is temporarily unavailable (missing API configuration).',
    };
  }
  const endpoint = 'https://ffapi.ucbot.net/verify';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': apiToken,
      },
      body: JSON.stringify({
        transaction_id: cleanTrxId,
      }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return {
        success: false,
        status: 'error',
        message: 'Invalid response from eZ Cash verification gateway.',
      };
    }

    if (res.status === 401 || data.status === 'error' && data.message?.toLowerCase().includes('token')) {
      console.error('[eZ Cash Gateway] 401 Unauthorized token:', apiToken);
      return {
        success: false,
        status: 'error',
        message: 'eZ Cash gateway authentication failed. Please contact administrator.',
      };
    }

    if (data.status === 'success') {
      const parsedAmount = parseFloat(data.transaction?.amount ?? 0);
      return {
        success: true,
        status: 'success',
        message: data.message || 'Transaction verified successfully!',
        transaction: {
          trx_id: data.transaction?.trx_id || cleanTrxId,
          amount: isNaN(parsedAmount) ? 0 : parsedAmount,
          provider: data.transaction?.provider || 'eZ Cash',
          sender: data.transaction?.sender || '',
          timestamp: data.transaction?.timestamp || Date.now(),
          verified_at: data.transaction?.verified_at || new Date().toISOString(),
        },
        raw: data,
      };
    }

    if (data.status === 'already_used') {
      return {
        success: false,
        status: 'already_used',
        message: 'This transaction has already been verified and claimed.',
        raw: data,
      };
    }

    if (data.status === 'not_found') {
      return {
        success: false,
        status: 'not_found',
        message: 'Transaction ID not found. If you just sent money via Dialog eZ Cash, please allow 30-60 seconds for the SMS to sync, then try again.',
        raw: data,
      };
    }

    return {
      success: false,
      status: 'error',
      message: data.message || 'Transaction verification failed. Please verify your RN number.',
      raw: data,
    };
  } catch (err: any) {
    console.error('[eZ Cash Gateway Exception]:', err);
    return {
      success: false,
      status: 'error',
      message: `Failed to connect to eZ Cash verification gateway: ${err.message || 'Network error'}`,
    };
  }
}

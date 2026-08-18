import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

// Generate unguessable, cryptographically secure 16-character code
// Format: SHADOW-XXXX-XXXX-XXXX
function generateSecureCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // non-ambiguous chars
  const generateChunk = (len: number) => {
    let result = '';
    const bytes = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  };
  return `SHADOW-${generateChunk(4)}-${generateChunk(4)}-${generateChunk(4)}`;
}

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    const { data: codes, error } = await adminSupabase
      .from('redeem_codes')
      .select('*, profiles:redeemed_by(email, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, codes: codes || [] });
  } catch (err: any) {
    console.error('Error fetching redeem codes:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, count = 1 } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid voucher code amount' }, { status: 400 });
    }

    const qty = Math.min(50, Math.max(1, parseInt(count) || 1));
    const adminSupabase = getAdminClient();
    const newCodes = [];

    for (let i = 0; i < qty; i++) {
      const codeStr = generateSecureCode();
      newCodes.push({
        code: codeStr,
        amount: parsedAmount,
        is_redeemed: false,
        created_at: new Date().toISOString(),
      });
    }

    const { data, error } = await adminSupabase
      .from('redeem_codes')
      .insert(newCodes)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      codes: data,
      message: `Successfully generated ${qty} redeem code(s) worth LKR ${parsedAmount.toLocaleString()} each!`,
    });
  } catch (err: any) {
    console.error('Error generating redeem codes:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

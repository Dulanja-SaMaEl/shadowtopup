import { NextResponse } from 'next/server';
import { getActiveBankAccounts } from '@/lib/bankService';

// GET: Public endpoint to fetch active bank accounts for customer checkout
export async function GET() {
  try {
    const accounts = await getActiveBankAccounts();
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    console.error('[Public Bank Details GET Error]:', err);
    return NextResponse.json({ success: false, message: 'Failed to retrieve bank accounts' }, { status: 500 });
  }
}

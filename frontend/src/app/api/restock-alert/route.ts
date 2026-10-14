import { NextResponse } from 'next/server';
import { getRestockAlert } from '@/lib/restockAlertService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const alert = await getRestockAlert();
    return NextResponse.json({
      success: true,
      restockAlert: alert,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch restock alert' },
      { status: 500 }
    );
  }
}

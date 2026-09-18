import { NextRequest, NextResponse } from 'next/server';
import { getExpectedProfits, saveExpectedProfits, DEFAULT_EXPECTED_PROFITS } from '@/lib/expectedProfitsService';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profits = getExpectedProfits();
    return NextResponse.json({
      success: true,
      profits,
      defaults: DEFAULT_EXPECTED_PROFITS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch expected profits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = saveExpectedProfits(body);

    return NextResponse.json({
      success: true,
      message: 'Expected profit formula updated successfully',
      profits: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update expected profits' },
      { status: 500 }
    );
  }
}

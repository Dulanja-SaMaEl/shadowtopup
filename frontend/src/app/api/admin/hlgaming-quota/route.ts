import { NextRequest, NextResponse } from 'next/server';
import { getHLGamingQuota, updateHLGamingQuota } from '@/lib/hlgamingQuotaService';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quota = await getHLGamingQuota();
    return NextResponse.json({
      success: true,
      quota,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch quota' },
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
    const { usedToday, dailyLimit, apiKey, developerUid, limitResetAt } = body;

    const updated = await updateHLGamingQuota({
      usedToday: typeof usedToday === 'number' ? usedToday : undefined,
      dailyLimit: typeof dailyLimit === 'number' ? dailyLimit : undefined,
      apiKey: typeof apiKey === 'string' ? apiKey : undefined,
      developerUid: typeof developerUid === 'string' ? developerUid : undefined,
      limitResetAt: typeof limitResetAt === 'string' ? limitResetAt : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'HL Gaming API quota updated successfully',
      quota: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update quota' },
      { status: 500 }
    );
  }
}

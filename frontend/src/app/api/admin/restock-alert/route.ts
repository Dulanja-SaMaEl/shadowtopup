import { NextRequest, NextResponse } from 'next/server';
import { getRestockAlert, updateRestockAlert } from '@/lib/restockAlertService';
import { requireAdmin } from '@/lib/authGuard';

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
    const { enabled, message, gameSlug, gameTitle } = body;

    const updated = await updateRestockAlert({
      enabled: typeof enabled === 'boolean' ? enabled : undefined,
      message: typeof message === 'string' ? message : undefined,
      gameSlug: typeof gameSlug === 'string' ? gameSlug : undefined,
      gameTitle: typeof gameTitle === 'string' ? gameTitle : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Restock warning alert ${updated.enabled ? 'activated' : 'deactivated'} successfully`,
      restockAlert: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update restock alert' },
      { status: 500 }
    );
  }
}

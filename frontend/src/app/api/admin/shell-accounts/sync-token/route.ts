import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authGuard';

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const syncSecret =
      process.env.GARENA_SYNC_SECRET ||
      process.env.UC_BOT_API_KEY ||
      'a29b37d3-dc90-4c79-9a7d-59b977b6e597';

    // Get site URL from env or request host
    const origin = request.headers.get('origin') || '';
    const host = request.headers.get('host') || 'www.shadowstorelk.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    return NextResponse.json({
      success: true,
      syncSecret,
      siteUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

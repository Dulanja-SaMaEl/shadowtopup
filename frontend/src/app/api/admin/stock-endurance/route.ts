import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

// Default packages with shell cost mappings if database is fresh
const defaultPackageMap: Record<string, number> = {
  '100 Diamonds': 100,
  '310 Diamonds': 300,
  '520 Diamonds': 500,
  '1060 Diamonds': 1000,
  '2180 Diamonds': 2000,
  '5600 Diamonds': 5000,
  'Weekly Membership Pass': 210,
  'Weekly Pass': 210,
  'Weekly Lite Pass': 80,
  'Monthly VIP Pass': 1000,
  'Monthly Pass': 1000,
  'Level Up Pass': 300,
  'EVO Gun Access Pass': 210,
};

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Missing server keys' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch live shell accounts
    const { data: accountsData } = await adminSupabase
      .from('shell_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    const accounts = accountsData && accountsData.length > 0
      ? accountsData
      : [
          {
            id: 'shell_1',
            account_username: 'SHADOW_TOPUP1',
            available_balance: 6495,
            is_main: true,
          },
        ];

    const totalShellStock = accounts.reduce(
      (sum: number, acc: any) => sum + Number(acc.available_balance || 0),
      0
    );

    // 2. Fetch active packages
    const { data: packagesData } = await adminSupabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('shell_cost', { ascending: true });

    const packages = packagesData && packagesData.length > 0
      ? packagesData
      : [
          {
            id: 'pkg-100',
            package_name: '100 Diamonds',
            package_type: 'diamond',
            diamond_amount: 100,
            shell_cost: 100,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
          {
            id: 'pkg-weekly',
            package_name: 'Weekly Membership Pass',
            package_type: 'weekly_pass',
            diamond_amount: 450,
            shell_cost: 210,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/000/002/logo.png',
          },
          {
            id: 'pkg-310',
            package_name: '310 Diamonds',
            package_type: 'diamond',
            diamond_amount: 310,
            shell_cost: 300,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
          {
            id: 'pkg-520',
            package_name: '520 Diamonds',
            package_type: 'diamond',
            diamond_amount: 520,
            shell_cost: 500,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
          {
            id: 'pkg-monthly',
            package_name: 'Monthly VIP Pass',
            package_type: 'monthly_pass',
            diamond_amount: 2600,
            shell_cost: 1000,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png',
          },
          {
            id: 'pkg-1060',
            package_name: '1060 Diamonds',
            package_type: 'diamond',
            diamond_amount: 1060,
            shell_cost: 1000,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
          {
            id: 'pkg-2180',
            package_name: '2180 Diamonds',
            package_type: 'diamond',
            diamond_amount: 2180,
            shell_cost: 2000,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
          {
            id: 'pkg-5600',
            package_name: '5600 Diamonds',
            package_type: 'diamond',
            diamond_amount: 5600,
            shell_cost: 5000,
            image_url: 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
          },
        ];

    // Build package cost lookup
    const packageCostLookup: Record<string, number> = { ...defaultPackageMap };
    packages.forEach((pkg: any) => {
      if (pkg.package_name && pkg.shell_cost) {
        packageCostLookup[pkg.package_name.trim().toLowerCase()] = Number(pkg.shell_cost);
      }
    });

    // 3. Fetch completed orders from the last 7 days
    const now = Date.now();
    const sevenDaysAgoIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgoMs = now - 24 * 60 * 60 * 1000;

    const { data: ordersData } = await adminSupabase
      .from('orders')
      .select('id, package_name, total_amount, status, created_at')
      .gte('created_at', sevenDaysAgoIso)
      .order('created_at', { ascending: false });

    const { data: txData } = await adminSupabase
      .from('purchase_transactions')
      .select('id, package_name, price_paid, total_amount, status, created_at')
      .gte('created_at', sevenDaysAgoIso)
      .order('created_at', { ascending: false });

    const allRows = [
      ...(ordersData || []),
      ...(txData || []),
    ];

    // Filter unique completed orders
    const seenIds = new Set<string>();
    const completedOrders: Array<{
      id: string;
      packageName: string;
      shellCost: number;
      createdAt: number;
    }> = [];

    allRows.forEach((row: any) => {
      if (!row || !row.id || seenIds.has(row.id)) return;
      seenIds.add(row.id);

      const rawStatus = (row.status || '').toLowerCase();
      const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
      if (!isCompleted) return;

      const pkgName = String(row.package_name || '').trim();
      const lookupKey = pkgName.toLowerCase();

      // Resolve shell cost
      let cost = packageCostLookup[lookupKey];
      if (!cost) {
        const totalAmount = Number(row.total_amount || row.price_paid || 0);
        cost = totalAmount > 0 ? Math.round(totalAmount / 3.2) : 100;
      }

      const createdAtMs = new Date(row.created_at || now).getTime();

      completedOrders.push({
        id: row.id,
        packageName: pkgName,
        shellCost: cost,
        createdAt: createdAtMs,
      });
    });

    // 4. Calculate burn rate
    const orders24h = completedOrders.filter((o) => o.createdAt >= oneDayAgoMs);
    const shellsConsumed24h = orders24h.reduce((sum, o) => sum + o.shellCost, 0);
    const shellsConsumed7d = completedOrders.reduce((sum, o) => sum + o.shellCost, 0);

    // Hourly burn rate
    let burnRatePerHour = shellsConsumed24h / 24;
    let burnRateSource = '24h';

    if (burnRatePerHour <= 0) {
      if (shellsConsumed7d > 0) {
        burnRatePerHour = shellsConsumed7d / (7 * 24);
        burnRateSource = '7d';
      } else {
        // Fallback default assumption velocity (25 shells/hr baseline)
        burnRatePerHour = 25;
        burnRateSource = 'baseline';
      }
    }

    // 5. Stock endurance in hours
    const enduranceHours = burnRatePerHour > 0 ? totalShellStock / burnRatePerHour : 999;

    // Formatting endurance duration
    let enduranceFormatted = '';
    if (enduranceHours < 1) {
      enduranceFormatted = Math.max(1, Math.round(enduranceHours * 60)) + 'm';
    } else if (enduranceHours < 24) {
      const h = Math.floor(enduranceHours);
      const m = Math.round((enduranceHours - h) * 60);
      enduranceFormatted = m > 0 ? h + 'h ' + m + 'm' : h + 'h';
    } else if (enduranceHours < 72) {
      const d = Math.floor(enduranceHours / 24);
      const h = Math.round(enduranceHours % 24);
      enduranceFormatted = h > 0 ? d + 'd ' + h + 'h' : d + 'd';
    } else {
      const days = (enduranceHours / 24).toFixed(1);
      enduranceFormatted = days + ' days';
    }

    // Status classification
    let status: 'critical' | 'warning' | 'moderate' | 'healthy' = 'healthy';
    if (enduranceHours <= 3) {
      status = 'critical'; // < 3h
    } else if (enduranceHours <= 12) {
      status = 'warning'; // 3h - 12h
    } else if (enduranceHours <= 24) {
      status = 'moderate'; // 12h - 24h
    } else {
      status = 'healthy'; // > 24h
    }

    // Estimated Depletion Timestamp
    const depletionDate = new Date(now + enduranceHours * 3600 * 1000);
    const isToday = depletionDate.toDateString() === new Date(now).toDateString();
    const isTomorrow =
      depletionDate.toDateString() === new Date(now + 24 * 3600 * 1000).toDateString();

    const timeStr = depletionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let estimatedDepletionFormatted = '';
    if (isToday) {
      estimatedDepletionFormatted = 'Today at ~' + timeStr;
    } else if (isTomorrow) {
      estimatedDepletionFormatted = 'Tomorrow at ~' + timeStr;
    } else {
      estimatedDepletionFormatted = depletionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ' at ~' + timeStr;
    }

    // 6. Pack purchasing capacity matrix
    const packCapacities = packages.map((pkg: any) => {
      const cost = Number(pkg.shell_cost || 100);
      const maxPacks = cost > 0 ? Math.floor(totalShellStock / cost) : 0;
      let packStatus: 'low' | 'moderate' | 'healthy' = 'healthy';
      if (maxPacks < 5) packStatus = 'low';
      else if (maxPacks < 20) packStatus = 'moderate';

      return {
        id: pkg.id,
        packageName: pkg.package_name,
        packageType: pkg.package_type || 'diamond',
        diamondAmount: pkg.diamond_amount || 0,
        shellCost: cost,
        maxPacks,
        status: packStatus,
        imageUrl: pkg.image_url || null,
        badge: pkg.badge || null,
      };
    });

    return NextResponse.json({
      success: true,
      totalShellStock,
      accountsCount: accounts.length,
      burnRatePerHour: Math.round(burnRatePerHour * 10) / 10,
      burnRateSource,
      shellsConsumed24h,
      ordersCount24h: orders24h.length,
      enduranceHours: Math.round(enduranceHours * 10) / 10,
      enduranceFormatted,
      estimatedDepletionTime: depletionDate.toISOString(),
      estimatedDepletionFormatted,
      status,
      packCapacities,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in stock-endurance API:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
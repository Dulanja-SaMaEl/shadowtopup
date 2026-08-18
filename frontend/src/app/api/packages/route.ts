import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const DIAMOND_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png';
const WEEKLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/000/002/logo.png';
const WEEKLY_LITE_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png';
const MONTHLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png';

const fallbackPackages = [
  {
    id: 'pkg-weekly-membership',
    package_name: 'Weekly Membership Pass',
    package_type: 'weekly_pass',
    diamond_amount: 450,
    shell_cost: 210,
    normal_price: 650.00,
    silver_price: 600.00,
    gold_price: 550.00,
    badge: 'SPECIAL PASS',
    image_url: WEEKLY_PASS_CDN,
    is_active: true,
  },
  {
    id: 'pkg-weekly-lite',
    package_name: 'Weekly Lite Pass',
    package_type: 'weekly_pass',
    diamond_amount: 120,
    shell_cost: 70,
    normal_price: 280.00,
    silver_price: 250.00,
    gold_price: 230.00,
    badge: 'NEW LITE PASS',
    image_url: WEEKLY_LITE_CDN,
    is_active: true,
  },
  {
    id: 'pkg-monthly-membership',
    package_name: 'Monthly Membership Pass',
    package_type: 'monthly_pass',
    diamond_amount: 2600,
    shell_cost: 1050,
    normal_price: 3200.00,
    silver_price: 3000.00,
    gold_price: 2800.00,
    badge: 'VIP BEST VALUE',
    image_url: MONTHLY_PASS_CDN,
    is_active: true,
  },
  {
    id: 'pkg-100',
    package_name: '100 Diamonds',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 100,
    normal_price: 350.00,
    silver_price: 320.00,
    gold_price: 300.00,
    badge: 'STARTER',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-310',
    package_name: '310 Diamonds',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 300,
    normal_price: 1050.00,
    silver_price: 980.00,
    gold_price: 920.00,
    badge: 'POPULAR',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-520',
    package_name: '520 Diamonds',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 500,
    normal_price: 1750.00,
    silver_price: 1620.00,
    gold_price: 1500.00,
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-1060',
    package_name: '1060 Diamonds',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 1000,
    normal_price: 3450.00,
    silver_price: 3200.00,
    gold_price: 3000.00,
    badge: 'HOT DEAL',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-2180',
    package_name: '2180 Diamonds',
    package_type: 'diamond',
    diamond_amount: 2180,
    shell_cost: 2000,
    normal_price: 6900.00,
    silver_price: 6400.00,
    gold_price: 6000.00,
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-5600',
    package_name: '5600 Diamonds',
    package_type: 'diamond',
    diamond_amount: 5600,
    shell_cost: 5000,
    normal_price: 17500.00,
    silver_price: 16200.00,
    gold_price: 15000.00,
    badge: 'PRO VAULT',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (supabaseUrl && supabaseServiceKey) {
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await adminSupabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('diamond_amount', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, packages: data, source: 'database' });
      }
    }

    return NextResponse.json({ success: true, packages: fallbackPackages, source: 'fallback' });
  } catch (err: any) {
    console.error('Error fetching packages from DB:', err);
    return NextResponse.json({ success: true, packages: fallbackPackages, source: 'fallback' });
  }
}

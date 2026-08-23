import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const DIAMOND_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png';
const WEEKLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/002/010/logo.png';
const WEEKLY_LITE_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png';
const MONTHLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png';

// Official Verified Garena MY Packages with exact Shell Costs
export const OFFICIAL_GARENA_PACKAGES = [
  {
    id: 'pkg-weekly-lite',
    package_name: 'Weekly Lite Pass',
    package_type: 'weekly_pass',
    diamond_amount: 120,
    shell_cost: 18,
    normal_price: 141.00,
    silver_price: 129.00,
    gold_price: 120.00,
    badge: 'NEW LITE PASS',
    image_url: WEEKLY_LITE_CDN,
    is_active: true,
  },
  {
    id: 'pkg-weekly-membership',
    package_name: 'Weekly Membership Pass',
    package_type: 'weekly_pass',
    diamond_amount: 450,
    shell_cost: 86,
    normal_price: 677.00,
    silver_price: 617.00,
    gold_price: 577.00,
    badge: 'SPECIAL PASS',
    image_url: WEEKLY_PASS_CDN,
    is_active: true,
  },
  {
    id: 'pkg-monthly-membership',
    package_name: 'Monthly Membership Pass',
    package_type: 'monthly_pass',
    diamond_amount: 2600,
    shell_cost: 430,
    normal_price: 3387.00,
    silver_price: 3086.00,
    gold_price: 2885.00,
    badge: 'VIP BEST VALUE',
    image_url: MONTHLY_PASS_CDN,
    is_active: true,
  },
  {
    id: 'pkg-lvl-6',
    package_name: 'Level Up Pass - LV6',
    package_type: 'levelup_pass',
    diamond_amount: 200,
    shell_cost: 16,
    normal_price: 126.00,
    silver_price: 115.00,
    gold_price: 107.00,
    badge: 'LEVEL 6',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-lvl-10',
    package_name: 'Level Up Pass - LV10',
    package_type: 'levelup_pass',
    diamond_amount: 400,
    shell_cost: 34,
    normal_price: 268.00,
    silver_price: 244.00,
    gold_price: 228.00,
    badge: 'LEVEL 10',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-lvl-30',
    package_name: 'Level Up Pass - LV30 (LV15/20/25/30)',
    package_type: 'levelup_pass',
    diamond_amount: 1000,
    shell_cost: 50,
    normal_price: 394.00,
    silver_price: 359.00,
    gold_price: 336.00,
    badge: 'LEVEL 30 MAX',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-25',
    package_name: '25 Diamonds',
    package_type: 'diamond',
    diamond_amount: 25,
    shell_cost: 13,
    normal_price: 102.00,
    silver_price: 93.00,
    gold_price: 87.00,
    badge: 'MINI',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-100',
    package_name: '100 Diamonds',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 50,
    normal_price: 394.00,
    silver_price: 359.00,
    gold_price: 336.00,
    badge: 'STARTER',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-310',
    package_name: '310 Diamonds',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 152,
    normal_price: 1198.00,
    silver_price: 1091.00,
    gold_price: 1020.00,
    badge: 'POPULAR',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-520',
    package_name: '520 Diamonds',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 254,
    normal_price: 2002.00,
    silver_price: 1823.00,
    gold_price: 1706.00,
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-1060',
    package_name: '1060 Diamonds',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 500,
    normal_price: 3938.00,
    silver_price: 3588.00,
    gold_price: 3358.00,
    badge: 'HOT DEAL',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-2180',
    package_name: '2180 Diamonds',
    package_type: 'diamond',
    diamond_amount: 2180,
    shell_cost: 1010,
    normal_price: 7954.00,
    silver_price: 7247.00,
    gold_price: 6782.00,
    image_url: DIAMOND_CDN,
    is_active: true,
  },
  {
    id: 'pkg-5600',
    package_name: '5600 Diamonds',
    package_type: 'diamond',
    diamond_amount: 5600,
    shell_cost: 2500,
    normal_price: 19688.00,
    silver_price: 17938.00,
    gold_price: 16790.00,
    badge: 'PRO VAULT',
    image_url: DIAMOND_CDN,
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('your-supabase-project')) {
      const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await adminSupabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('shell_cost', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, packages: data, source: 'database' });
      }
    }

    return NextResponse.json({ success: true, packages: OFFICIAL_GARENA_PACKAGES, source: 'fallback' });
  } catch (err: any) {
    console.error('Error fetching packages from DB:', err);
    return NextResponse.json({ success: true, packages: OFFICIAL_GARENA_PACKAGES, source: 'fallback' });
  }
}

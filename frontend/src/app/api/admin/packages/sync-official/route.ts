import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { OFFICIAL_GARENA_PACKAGES } from '@/app/api/packages/route';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function POST() {
  try {
    const adminSupabase = getAdminClient();

    // 1. Fetch active pricing rules to calculate accurate initial prices
    let basePrice1300 = 3380;
    let normalMarkup = 35;
    let silverMarkup = 23;
    let goldMarkup = 15;
    let isFixed = false;

    try {
      const { data: rules } = await adminSupabase
        .from('pricing_rules')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (rules) {
        basePrice1300 = Number(rules.base_price_1300) || 3380;
        normalMarkup = Number(rules.normal_markup) || 35;
        silverMarkup = Number(rules.silver_markup) || 23;
        goldMarkup = Number(rules.gold_markup) || 15;
        isFixed = String(rules.markup_type || '').includes('Fixed');
      }
    } catch (e) {
      console.warn('Note reading pricing rules:', e);
    }

    const costPerShell = basePrice1300 / 1300;

    const upsertPayload = OFFICIAL_GARENA_PACKAGES.map((pkg) => {
      const baseCost = pkg.shell_cost * costPerShell;
      let normal_price: number;
      let silver_price: number;
      let gold_price: number;

      if (isFixed) {
        normal_price = Math.round(baseCost + normalMarkup);
        silver_price = Math.round(baseCost + silverMarkup);
        gold_price = Math.round(baseCost + goldMarkup);
      } else {
        normal_price = Math.round(baseCost * (1 + normalMarkup / 100));
        silver_price = Math.round(baseCost * (1 + silverMarkup / 100));
        gold_price = Math.round(baseCost * (1 + goldMarkup / 100));
      }

      return {
        id: pkg.id,
        package_name: pkg.package_name,
        package_type: pkg.package_type,
        diamond_amount: pkg.diamond_amount,
        shell_cost: pkg.shell_cost,
        normal_price,
        silver_price,
        gold_price,
        image_url: pkg.image_url,
        badge: pkg.badge || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await adminSupabase
      .from('packages')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${data.length} official Garena MY packages with accurate Shell costs!`,
      packages: data,
    });
  } catch (err: any) {
    console.error('Error syncing official Garena packages:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

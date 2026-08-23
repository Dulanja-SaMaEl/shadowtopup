import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

const DEFAULT_RULES = {
  basePrice1300: 3380,
  normalMarkup: 35,
  silverMarkup: 23,
  goldMarkup: 15,
  markupType: 'Percentage (%)',
};

// GET: Fetch saved pricing settings from database
export async function GET() {
  try {
    const adminSupabase = getAdminClient();

    // 1. Try fetching from pricing_rules table
    const { data: dbRules, error: err1 } = await adminSupabase
      .from('pricing_rules')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (dbRules && !err1) {
      return NextResponse.json({
        success: true,
        pricingRules: {
          basePrice1300: Number(dbRules.base_price_1300 ?? dbRules.basePrice1300 ?? 3380),
          normalMarkup: Number(dbRules.normal_markup ?? dbRules.normalMarkup ?? 35),
          silverMarkup: Number(dbRules.silver_markup ?? dbRules.silverMarkup ?? 23),
          goldMarkup: Number(dbRules.gold_markup ?? dbRules.goldMarkup ?? 15),
          markupType: dbRules.markup_type ?? dbRules.markupType ?? 'Percentage (%)',
        },
      });
    }

    // 2. Try fetching from system_settings table
    const { data: dbSettings, error: err2 } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('key', 'pricing_rules')
      .maybeSingle();

    if (dbSettings && !err2 && dbSettings.value) {
      const val = typeof dbSettings.value === 'string' ? JSON.parse(dbSettings.value) : dbSettings.value;
      return NextResponse.json({
        success: true,
        pricingRules: {
          basePrice1300: Number(val.basePrice1300 ?? 3380),
          normalMarkup: Number(val.normalMarkup ?? 35),
          silverMarkup: Number(val.silverMarkup ?? 23),
          goldMarkup: Number(val.goldMarkup ?? 15),
          markupType: val.markupType ?? 'Percentage (%)',
        },
      });
    }

    // Fallback to default
    return NextResponse.json({
      success: true,
      pricingRules: DEFAULT_RULES,
    });
  } catch (err: any) {
    console.error('Error fetching pricing rules:', err);
    return NextResponse.json({ success: true, pricingRules: DEFAULT_RULES });
  }
}

// POST: Save pricing settings to DB and recalculate package catalog prices
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      basePrice1300 = 3380,
      normalMarkup = 35,
      silverMarkup = 23,
      goldMarkup = 15,
      markupType = 'Percentage (%)',
    } = body;

    const basePriceNum = Number(basePrice1300) || 3380;
    const nMarkupNum = Number(normalMarkup) || 35;
    const sMarkupNum = Number(silverMarkup) || 23;
    const gMarkupNum = Number(goldMarkup) || 15;

    const adminSupabase = getAdminClient();

    // 1. Save / Upsert to pricing_rules table
    try {
      await adminSupabase.from('pricing_rules').upsert(
        [
          {
            id: 'default',
            base_price_1300: basePriceNum,
            normal_markup: nMarkupNum,
            silver_markup: sMarkupNum,
            gold_markup: gMarkupNum,
            markup_type: markupType,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'id' }
      );
    } catch (e) {
      console.warn('Note on pricing_rules upsert:', e);
    }

    // 2. Save / Upsert to system_settings table for double redundancy
    try {
      await adminSupabase.from('system_settings').upsert(
        [
          {
            key: 'pricing_rules',
            value: {
              basePrice1300: basePriceNum,
              normalMarkup: nMarkupNum,
              silverMarkup: sMarkupNum,
              goldMarkup: gMarkupNum,
              markupType,
            },
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'key' }
      );
    } catch (e) {
      console.warn('Note on system_settings upsert:', e);
    }

    // 3. Fetch all packages to recalculate prices
    const { data: packages, error: fetchErr } = await adminSupabase
      .from('packages')
      .select('*');

    if (fetchErr) throw fetchErr;

    const costPerShell = basePriceNum / 1300;
    const nMarkup = nMarkupNum / 100;
    const sMarkup = sMarkupNum / 100;
    const gMarkup = gMarkupNum / 100;

    const updatedPackages = [];

    if (packages && packages.length > 0) {
      for (const pkg of packages) {
        const shells = Number(pkg.shell_cost) || 100;
        const baseCost = shells * costPerShell;

        const newNormalPrice = Math.round(baseCost * (1 + nMarkup));
        const newSilverPrice = Math.round(baseCost * (1 + sMarkup));
        const newGoldPrice = Math.round(baseCost * (1 + gMarkup));

        const { data: updated, error: updateErr } = await adminSupabase
          .from('packages')
          .update({
            normal_price: newNormalPrice,
            silver_price: newSilverPrice,
            gold_price: newGoldPrice,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pkg.id)
          .select()
          .single();

        if (!updateErr && updated) {
          updatedPackages.push(updated);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pricing rules saved to database! Recalculated ${updatedPackages.length} package prices.`,
      recalculatedCount: updatedPackages.length,
      unitShellCost: costPerShell.toFixed(2),
      pricingRules: {
        basePrice1300: basePriceNum,
        normalMarkup: nMarkupNum,
        silverMarkup: sMarkupNum,
        goldMarkup: gMarkupNum,
        markupType,
      },
    });
  } catch (err: any) {
    console.error('Error recalculating pricing rules:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

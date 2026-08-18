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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basePrice1300 = 3380, normalMarkup = 35, silverMarkup = 23, goldMarkup = 15 } = body;

    const adminSupabase = getAdminClient();

    // 1. Fetch all packages
    const { data: packages, error: fetchErr } = await adminSupabase
      .from('packages')
      .select('*');

    if (fetchErr) throw fetchErr;

    if (!packages || packages.length === 0) {
      return NextResponse.json({ success: false, message: 'No packages found to recalculate' }, { status: 404 });
    }

    // Cost per single Garena shell (e.g. 3380 / 1300 = 2.60 LKR / shell)
    const costPerShell = Number(basePrice1300) / 1300;

    const nMarkup = Number(normalMarkup) / 100;
    const sMarkup = Number(silverMarkup) / 100;
    const gMarkup = Number(goldMarkup) / 100;

    const updatedPackages = [];

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

    return NextResponse.json({
      success: true,
      message: `Successfully recalculated catalog prices for ${updatedPackages.length} packages!`,
      recalculatedCount: updatedPackages.length,
      unitShellCost: costPerShell.toFixed(2),
    });
  } catch (err: any) {
    console.error('Error recalculating pricing rules:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

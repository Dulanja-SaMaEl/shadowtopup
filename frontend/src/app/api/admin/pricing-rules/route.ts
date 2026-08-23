import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// File-backed persistence fallback
const CACHE_FILE_PATH = path.join(process.cwd(), '.pricing_rules_cache.json');

interface PricingRulesConfig {
  basePrice1300: number;
  normalMarkup: number;
  silverMarkup: number;
  goldMarkup: number;
  markupType: string;
  updatedAt?: string;
}

const DEFAULT_RULES: PricingRulesConfig = {
  basePrice1300: 3380,
  normalMarkup: 35,
  silverMarkup: 23,
  goldMarkup: 15,
  markupType: 'Percentage (%)',
};

// Global in-memory cache
let inMemoryRules: PricingRulesConfig = { ...DEFAULT_RULES };

// Helper to read disk cache
function readDiskCache(): PricingRulesConfig {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.basePrice1300 === 'number') {
        inMemoryRules = { ...DEFAULT_RULES, ...parsed };
        return inMemoryRules;
      }
    }
  } catch (e) {
    console.warn('Note reading pricing rules disk cache:', e);
  }
  return inMemoryRules;
}

// Helper to write disk cache
function writeDiskCache(rules: PricingRulesConfig) {
  try {
    inMemoryRules = { ...rules, updatedAt: new Date().toISOString() };
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(inMemoryRules, null, 2), 'utf8');
  } catch (e) {
    console.warn('Note writing pricing rules disk cache:', e);
  }
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-supabase-project')) {
    return null;
  }
  try {
    return createAdminClient(supabaseUrl, supabaseServiceKey);
  } catch (e) {
    return null;
  }
}

// GET: Fetch saved pricing settings (from DB or persistent cache)
export async function GET() {
  try {
    const adminSupabase = getAdminClient();

    if (adminSupabase) {
      // 1. Try fetching from pricing_rules table
      const { data: dbRules, error: err1 } = await adminSupabase
        .from('pricing_rules')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (dbRules && !err1) {
        const rulesFromDb: PricingRulesConfig = {
          basePrice1300: Number(dbRules.base_price_1300 ?? dbRules.basePrice1300 ?? 3380),
          normalMarkup: Number(dbRules.normal_markup ?? dbRules.normalMarkup ?? 35),
          silverMarkup: Number(dbRules.silver_markup ?? dbRules.silverMarkup ?? 23),
          goldMarkup: Number(dbRules.gold_markup ?? dbRules.goldMarkup ?? 15),
          markupType: dbRules.markup_type ?? dbRules.markupType ?? 'Percentage (%)',
        };
        writeDiskCache(rulesFromDb);
        return NextResponse.json({ success: true, pricingRules: rulesFromDb });
      }

      // 2. Try fetching from system_settings table
      const { data: dbSettings, error: err2 } = await adminSupabase
        .from('system_settings')
        .select('*')
        .eq('key', 'pricing_rules')
        .maybeSingle();

      if (dbSettings && !err2 && dbSettings.value) {
        const val = typeof dbSettings.value === 'string' ? JSON.parse(dbSettings.value) : dbSettings.value;
        const rulesFromSettings: PricingRulesConfig = {
          basePrice1300: Number(val.basePrice1300 ?? 3380),
          normalMarkup: Number(val.normalMarkup ?? 35),
          silverMarkup: Number(val.silverMarkup ?? 23),
          goldMarkup: Number(val.goldMarkup ?? 15),
          markupType: val.markupType ?? 'Percentage (%)',
        };
        writeDiskCache(rulesFromSettings);
        return NextResponse.json({ success: true, pricingRules: rulesFromSettings });
      }
    }

    // Fallback to disk or in-memory cache
    const cachedRules = readDiskCache();
    return NextResponse.json({
      success: true,
      pricingRules: cachedRules,
    });
  } catch (err: any) {
    console.error('Error fetching pricing rules:', err);
    return NextResponse.json({ success: true, pricingRules: readDiskCache() });
  }
}

// POST: Save pricing settings to DB and persistent cache, recalculate package catalog prices
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

    const updatedRules: PricingRulesConfig = {
      basePrice1300: basePriceNum,
      normalMarkup: nMarkupNum,
      silverMarkup: sMarkupNum,
      goldMarkup: gMarkupNum,
      markupType,
    };

    // Save to disk & memory cache immediately
    writeDiskCache(updatedRules);

    const adminSupabase = getAdminClient();
    let dbUpdated = false;
    let updatedPackagesCount = 0;

    if (adminSupabase) {
      // 1. Save / Upsert to pricing_rules table
      try {
        const { error: upsertErr } = await adminSupabase.from('pricing_rules').upsert(
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

        if (!upsertErr) {
          dbUpdated = true;
        }
      } catch (e) {
        console.warn('Note on pricing_rules upsert:', e);
      }

      // 2. Save / Upsert to system_settings table
      try {
        await adminSupabase.from('system_settings').upsert(
          [
            {
              key: 'pricing_rules',
              value: updatedRules,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'key' }
        );
      } catch (e) {
        console.warn('Note on system_settings upsert:', e);
      }

      // 3. Fetch all packages to recalculate prices
      const costPerShell = basePriceNum / 1300;
      const nMarkup = nMarkupNum / 100;
      const sMarkup = sMarkupNum / 100;
      const gMarkup = gMarkupNum / 100;

      const { data: packages } = await adminSupabase.from('packages').select('*');

      if (packages && packages.length > 0) {
        for (const pkg of packages) {
          const shells = Number(pkg.shell_cost) || 100;
          const baseCost = shells * costPerShell;

          const newNormalPrice = Math.round(baseCost * (1 + nMarkup));
          const newSilverPrice = Math.round(baseCost * (1 + sMarkup));
          const newGoldPrice = Math.round(baseCost * (1 + gMarkup));

          const { error: updateErr } = await adminSupabase
            .from('packages')
            .update({
              normal_price: newNormalPrice,
              silver_price: newSilverPrice,
              gold_price: newGoldPrice,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pkg.id);

          if (!updateErr) {
            updatedPackagesCount++;
          }
        }
      }
    }

    const costPerShell = basePriceNum / 1300;

    return NextResponse.json({
      success: true,
      message: dbUpdated
        ? `Pricing settings saved to database! Recalculated ${updatedPackagesCount} package prices.`
        : `Pricing settings saved & persisted! (Recalculated ${updatedPackagesCount} packages).`,
      recalculatedCount: updatedPackagesCount,
      unitShellCost: costPerShell.toFixed(2),
      pricingRules: updatedRules,
    });
  } catch (err: any) {
    console.error('Error recalculating pricing rules:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

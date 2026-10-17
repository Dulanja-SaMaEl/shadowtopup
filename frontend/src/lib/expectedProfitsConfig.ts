export type UserTier = 'normal' | 'silver' | 'gold';

export interface ExpectedProfitsTierConfig {
  weekly: number;              // Weekly Membership (LKR)
  monthly: number;             // Monthly Membership (LKR)
  lite: number;                // Weekly Lite (LKR)
  d100: number;                // 100 Diamonds (LKR)
  d310: number;                // 310 Diamonds (LKR)
  d520: number;                // 520 Diamonds (LKR)
  d1060: number;               // 1060 Diamonds (LKR)
  d2180: number;               // 2180 Diamonds (LKR)
  d5600: number;               // 5600 Diamonds (LKR)
  d11500: number;              // 11500 Diamonds (LKR)
  fallbackMarginPercent: number; // For other / custom packages (% of price)
}

export interface MultiTierExpectedProfitsConfig {
  autoCalculate?: boolean;
  normal: ExpectedProfitsTierConfig;
  silver: ExpectedProfitsTierConfig;
  gold: ExpectedProfitsTierConfig;
  updatedAt?: string;
}

// Backward compatibility alias
export type ExpectedProfitsConfig = MultiTierExpectedProfitsConfig;

export const DEFAULT_TIER_PROFITS: Record<UserTier, ExpectedProfitsTierConfig> = {
  // 1. Normal Customers (Full Retail Price Profit)
  normal: {
    weekly: 104.00,
    monthly: 470.00,
    lite: 93.00,
    d100: 90.00,
    d310: 270.00,
    d520: 450.00,
    d1060: 850.00,
    d2180: 1700.00,
    d5600: 4500.00,
    d11500: 9200.00,
    fallbackMarginPercent: 26.0,
  },
  // 2. Standard Resellers (Silver Tier Wholesale Profit)
  silver: {
    weekly: 54.00,
    monthly: 270.00,
    lite: 68.00,
    d100: 60.00,
    d310: 200.00,
    d520: 320.00,
    d1060: 600.00,
    d2180: 1200.00,
    d5600: 3200.00,
    d11500: 6600.00,
    fallbackMarginPercent: 15.0,
  },
  // 3. Elite Resellers (Gold Tier Maximum Discount Wholesale Profit)
  gold: {
    weekly: 25.00,
    monthly: 70.00,
    lite: 48.00,
    d100: 40.00,
    d310: 140.00,
    d520: 200.00,
    d1060: 400.00,
    d2180: 800.00,
    d5600: 2000.00,
    d11500: 4200.00,
    fallbackMarginPercent: 8.0,
  },
};

export const DEFAULT_EXPECTED_PROFITS: MultiTierExpectedProfitsConfig = {
  autoCalculate: true,
  normal: { ...DEFAULT_TIER_PROFITS.normal },
  silver: { ...DEFAULT_TIER_PROFITS.silver },
  gold: { ...DEFAULT_TIER_PROFITS.gold },
};

export function getTierProfitConfig(
  config: MultiTierExpectedProfitsConfig | null | undefined,
  tier: UserTier | string = 'normal'
): ExpectedProfitsTierConfig {
  if (!config) return DEFAULT_TIER_PROFITS.normal;
  if (tier === 'gold' && config.gold) return config.gold;
  if (tier === 'silver' && config.silver) return config.silver;
  if (config.normal) return config.normal;
  return DEFAULT_TIER_PROFITS.normal;
}

export function generateAutoProfitsFromPackages(
  packages: any[],
  basePrice1300: number = 3380
): MultiTierExpectedProfitsConfig {
  const unitShellCost = (basePrice1300 || 3380) / 1300;

  const findPkg = (predicate: (p: any) => boolean) => {
    return (packages || []).find(predicate);
  };

  const getTierProfit = (
    pkg: any,
    tier: UserTier,
    fallbackShells: number,
    fallbackDefaultProfit: number
  ): number => {
    if (!pkg) return fallbackDefaultProfit;
    const shells = pkg.shell_cost ?? fallbackShells;
    const cost = shells * unitShellCost;
    const price =
      tier === 'gold'
        ? Number(pkg.gold_price) || Number(pkg.normal_price) || 0
        : tier === 'silver'
        ? Number(pkg.silver_price) || Number(pkg.normal_price) || 0
        : Number(pkg.normal_price) || 0;
    const profit = Math.round((price - cost) * 100) / 100;
    return profit > 0 ? profit : fallbackDefaultProfit;
  };

  const weeklyPkg = findPkg((p) => {
    const n = (p.package_name || '').toLowerCase();
    const c = (p.code || '').toLowerCase();
    return c === 'weekly' || (n.includes('weekly') && !n.includes('lite'));
  });

  const monthlyPkg = findPkg((p) => {
    const n = (p.package_name || '').toLowerCase();
    const c = (p.code || '').toLowerCase();
    return c === 'monthly' || n.includes('monthly');
  });

  const litePkg = findPkg((p) => {
    const n = (p.package_name || '').toLowerCase();
    const c = (p.code || '').toLowerCase();
    return c === 'lite' || n.includes('lite');
  });

  const d100Pkg = findPkg((p) => (p.package_name || '').includes('100') || p.diamond_amount === 100);
  const d310Pkg = findPkg((p) => (p.package_name || '').includes('310') || p.diamond_amount === 310);
  const d520Pkg = findPkg((p) => (p.package_name || '').includes('520') || p.diamond_amount === 520);
  const d1060Pkg = findPkg((p) => (p.package_name || '').includes('1060') || p.diamond_amount === 1060);
  const d2180Pkg = findPkg((p) => (p.package_name || '').includes('2180') || p.diamond_amount === 2180);
  const d5600Pkg = findPkg((p) => (p.package_name || '').includes('5600') || p.diamond_amount === 5600);
  const d11500Pkg = findPkg((p) => (p.package_name || '').includes('11500') || p.diamond_amount === 11500);

  const buildTier = (tier: UserTier): ExpectedProfitsTierConfig => ({
    weekly: getTierProfit(weeklyPkg, tier, 86, DEFAULT_TIER_PROFITS[tier].weekly),
    monthly: getTierProfit(monthlyPkg, tier, 430, DEFAULT_TIER_PROFITS[tier].monthly),
    lite: getTierProfit(litePkg, tier, 18, DEFAULT_TIER_PROFITS[tier].lite),
    d100: getTierProfit(d100Pkg, tier, 40, DEFAULT_TIER_PROFITS[tier].d100),
    d310: getTierProfit(d310Pkg, tier, 124, DEFAULT_TIER_PROFITS[tier].d310),
    d520: getTierProfit(d520Pkg, tier, 208, DEFAULT_TIER_PROFITS[tier].d520),
    d1060: getTierProfit(d1060Pkg, tier, 416, DEFAULT_TIER_PROFITS[tier].d1060),
    d2180: getTierProfit(d2180Pkg, tier, 832, DEFAULT_TIER_PROFITS[tier].d2180),
    d5600: getTierProfit(d5600Pkg, tier, 2080, DEFAULT_TIER_PROFITS[tier].d5600),
    d11500: getTierProfit(d11500Pkg, tier, 4160, DEFAULT_TIER_PROFITS[tier].d11500),
    fallbackMarginPercent: DEFAULT_TIER_PROFITS[tier].fallbackMarginPercent,
  });

  return {
    autoCalculate: true,
    normal: buildTier('normal'),
    silver: buildTier('silver'),
    gold: buildTier('gold'),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeExpectedProfits(raw: any): MultiTierExpectedProfitsConfig {
  if (!raw) return { ...DEFAULT_EXPECTED_PROFITS };

  const autoCalculate = raw.autoCalculate !== undefined ? Boolean(raw.autoCalculate) : true;

  // If already in 3-tier format:
  if (raw.normal && typeof raw.normal.weekly === 'number') {
    return {
      autoCalculate,
      normal: { ...DEFAULT_TIER_PROFITS.normal, ...raw.normal },
      silver: { ...DEFAULT_TIER_PROFITS.silver, ...(raw.silver || {}) },
      gold: { ...DEFAULT_TIER_PROFITS.gold, ...(raw.gold || {}) },
      updatedAt: raw.updatedAt,
    };
  }

  // If legacy single flat format:
  if (typeof raw.weekly === 'number') {
    return {
      autoCalculate,
      normal: {
        weekly: raw.weekly ?? DEFAULT_TIER_PROFITS.normal.weekly,
        monthly: raw.monthly ?? DEFAULT_TIER_PROFITS.normal.monthly,
        lite: raw.lite ?? DEFAULT_TIER_PROFITS.normal.lite,
        d100: raw.d100 ?? DEFAULT_TIER_PROFITS.normal.d100,
        d310: raw.d310 ?? DEFAULT_TIER_PROFITS.normal.d310,
        d520: raw.d520 ?? DEFAULT_TIER_PROFITS.normal.d520,
        d1060: raw.d1060 ?? DEFAULT_TIER_PROFITS.normal.d1060,
        d2180: raw.d2180 ?? DEFAULT_TIER_PROFITS.normal.d2180,
        d5600: raw.d5600 ?? DEFAULT_TIER_PROFITS.normal.d5600,
        d11500: raw.d11500 ?? DEFAULT_TIER_PROFITS.normal.d11500,
        fallbackMarginPercent: raw.fallbackMarginPercent ?? DEFAULT_TIER_PROFITS.normal.fallbackMarginPercent,
      },
      silver: { ...DEFAULT_TIER_PROFITS.silver },
      gold: { ...DEFAULT_TIER_PROFITS.gold },
      updatedAt: raw.updatedAt,
    };
  }

  return { ...DEFAULT_EXPECTED_PROFITS };
}

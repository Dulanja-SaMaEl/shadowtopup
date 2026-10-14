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

export function normalizeExpectedProfits(raw: any): MultiTierExpectedProfitsConfig {
  if (!raw) return { ...DEFAULT_EXPECTED_PROFITS };

  // If already in 3-tier format:
  if (raw.normal && typeof raw.normal.weekly === 'number') {
    return {
      normal: { ...DEFAULT_TIER_PROFITS.normal, ...raw.normal },
      silver: { ...DEFAULT_TIER_PROFITS.silver, ...(raw.silver || {}) },
      gold: { ...DEFAULT_TIER_PROFITS.gold, ...(raw.gold || {}) },
      updatedAt: raw.updatedAt,
    };
  }

  // If legacy single flat format:
  if (typeof raw.weekly === 'number') {
    return {
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

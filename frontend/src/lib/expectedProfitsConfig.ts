export interface ExpectedProfitsConfig {
  weekly: number;              // Weekly Membership Pass (LKR)
  monthly: number;             // Monthly Membership Pass (LKR)
  lite: number;                // Weekly Lite Pass (LKR)
  d100: number;                // 100 Diamonds (LKR)
  d310: number;                // 310 Diamonds (LKR)
  d520: number;                // 520 Diamonds (LKR)
  d1060: number;               // 1060 Diamonds (LKR)
  d2180: number;               // 2180 Diamonds (LKR)
  d5600: number;               // 5600 Diamonds (LKR)
  d11500: number;              // 11500 Diamonds (LKR)
  fallbackMarginPercent: number; // For other / custom packages (% of price)
  updatedAt?: string;
}

export const DEFAULT_EXPECTED_PROFITS: ExpectedProfitsConfig = {
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
};

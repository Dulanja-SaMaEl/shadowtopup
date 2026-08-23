-- ==========================================================
-- SHADOWTOPUP: OFFICIAL GARENA MY SHELL COST PACKAGES SEED
-- Execute this SQL in your Supabase SQL Editor
-- (https://app.supabase.com -> SQL Editor -> New Query)
-- ==========================================================

-- 1. Ensure packages table exists
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    package_name TEXT NOT NULL,
    package_type TEXT NOT NULL DEFAULT 'diamond',
    diamond_amount INTEGER NOT NULL DEFAULT 0,
    shell_cost INTEGER NOT NULL DEFAULT 0,
    normal_price NUMERIC NOT NULL DEFAULT 0,
    silver_price NUMERIC NOT NULL DEFAULT 0,
    gold_price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    badge TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON TABLE public.packages TO postgres, anon, authenticated, service_role;

-- 2. Upsert Official Packages with verified Garena MY shell costs
INSERT INTO public.packages (id, package_name, package_type, diamond_amount, shell_cost, normal_price, silver_price, gold_price, image_url, badge, is_active)
VALUES
  -- Pass Packages
  ('pkg-weekly-lite', 'Weekly Lite Pass', 'weekly_pass', 120, 18, 141, 129, 120, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png', 'NEW LITE PASS', true),
  ('pkg-weekly-membership', 'Weekly Membership Pass', 'weekly_pass', 450, 86, 677, 617, 577, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/002/010/logo.png', 'SPECIAL PASS', true),
  ('pkg-monthly-membership', 'Monthly Membership Pass', 'monthly_pass', 2600, 430, 3387, 3086, 2885, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png', 'VIP BEST VALUE', true),

  -- Level Up Pass Packages
  ('pkg-lvl-6', 'Level Up Pass - LV6', 'levelup_pass', 200, 16, 126, 115, 107, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'LEVEL 6', true),
  ('pkg-lvl-10', 'Level Up Pass - LV10', 'levelup_pass', 400, 34, 268, 244, 228, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'LEVEL 10', true),
  ('pkg-lvl-30', 'Level Up Pass - LV30 (LV15/20/25/30)', 'levelup_pass', 1000, 50, 394, 359, 336, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'LEVEL 30 MAX', true),

  -- Diamond Packs
  ('pkg-25', '25 Diamonds', 'diamond', 25, 13, 102, 93, 87, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'MINI', true),
  ('pkg-100', '100 Diamonds', 'diamond', 100, 50, 394, 359, 336, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'STARTER', true),
  ('pkg-310', '310 Diamonds', 'diamond', 310, 152, 1198, 1091, 1020, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'POPULAR', true),
  ('pkg-520', '520 Diamonds', 'diamond', 520, 254, 2002, 1823, 1706, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', null, true),
  ('pkg-1060', '1060 Diamonds', 'diamond', 1060, 500, 3938, 3588, 3358, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'HOT DEAL', true),
  ('pkg-2180', '2180 Diamonds', 'diamond', 2180, 1010, 7954, 7247, 6782, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', null, true),
  ('pkg-5600', '5600 Diamonds', 'diamond', 5600, 2500, 19688, 17938, 16790, 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png', 'PRO VAULT', true)
ON CONFLICT (id) DO UPDATE SET
  package_name = EXCLUDED.package_name,
  package_type = EXCLUDED.package_type,
  diamond_amount = EXCLUDED.diamond_amount,
  shell_cost = EXCLUDED.shell_cost,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  is_active = true;

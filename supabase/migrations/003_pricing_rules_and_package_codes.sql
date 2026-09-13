-- =========================================================
-- 003_PRICING_RULES_AND_PACKAGE_CODES.SQL
-- =========================================================

-- 1. Ensure package_code column exists on packages
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS package_code TEXT;

-- 2. Create pricing_rules table for dynamic markup & margins
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT UNIQUE NOT NULL CHECK (tier IN ('normal', 'silver', 'gold')),
    markup_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    min_margin_percentage NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default pricing rules if not exists
INSERT INTO public.pricing_rules (tier, markup_percentage, min_margin_percentage, description)
VALUES 
    ('normal', 35.00, 25.00, 'Standard Retail Customer Tier (~35% markup over base cost)'),
    ('silver', 23.00, 18.00, 'Silver Reseller VIP Tier (~23% markup over base cost)'),
    ('gold',   15.00, 12.00, 'Gold Reseller Wholesale Tier (~15% markup over base cost)')
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pricing rules readable"
  ON public.pricing_rules FOR SELECT USING (true);

CREATE POLICY "Service role full access on pricing_rules"
  ON public.pricing_rules FOR ALL USING (true);

GRANT ALL ON TABLE public.pricing_rules TO postgres, anon, authenticated, service_role;

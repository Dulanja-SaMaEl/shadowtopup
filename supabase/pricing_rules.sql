-- ==========================================================
-- SHADOWTOPUP: PRICING RULES DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor
-- (https://app.supabase.com -> SQL Editor -> New Query)
-- ==========================================================

-- 1. Create pricing_rules table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id TEXT PRIMARY KEY DEFAULT 'default',
    base_price_1300 NUMERIC NOT NULL DEFAULT 3380.00,
    markup_type TEXT NOT NULL DEFAULT 'Percentage (%)',
    normal_markup NUMERIC NOT NULL DEFAULT 35.00,
    silver_markup NUMERIC NOT NULL DEFAULT 23.00,
    gold_markup NUMERIC NOT NULL DEFAULT 15.00,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert initial default record
INSERT INTO public.pricing_rules (id, base_price_1300, markup_type, normal_markup, silver_markup, gold_markup)
VALUES ('default', 3380.00, 'Percentage (%)', 35.00, 23.00, 15.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Grant full permissions
GRANT ALL ON TABLE public.pricing_rules TO postgres, anon, authenticated, service_role;

-- 4. Enable Row Level Security (RLS) with open read/write for admin service
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pricing rules viewable by everyone" ON public.pricing_rules;
DROP POLICY IF EXISTS "Pricing rules editable by everyone" ON public.pricing_rules;

CREATE POLICY "Pricing rules viewable by everyone" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "Pricing rules editable by everyone" ON public.pricing_rules FOR ALL USING (true);

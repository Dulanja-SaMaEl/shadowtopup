-- =========================================================
-- 005_API_QUOTAS.SQL: 3rd Party API Quota Tracking (HL Gaming)
-- =========================================================

CREATE TABLE IF NOT EXISTS public.api_quotas (
    service_name TEXT PRIMARY KEY,
    daily_limit INTEGER DEFAULT 25 NOT NULL,
    used_today INTEGER DEFAULT 0 NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    last_reset_date DATE DEFAULT CURRENT_DATE NOT NULL,
    limit_reset_at TIMESTAMPTZ DEFAULT NULL,
    api_key TEXT,
    developer_uid TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_quotas ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated admins and public fallback
CREATE POLICY "Public read for service quotas" ON public.api_quotas
    FOR SELECT USING (true);

-- Allow admins/service role to update quotas
CREATE POLICY "Admins update service quotas" ON public.api_quotas
    FOR ALL USING (true);

-- Seed initial row for HLGaming Free Fire verification
INSERT INTO public.api_quotas (
    service_name,
    daily_limit,
    used_today,
    last_used_at,
    last_reset_date,
    developer_uid,
    api_key,
    notes
)
VALUES (
    'hlgaming_freefire',
    25,
    11,
    NOW(),
    CURRENT_DATE,
    'Xv00AKjlBJMgOpxr05VP2Sreu0z1',
    'Kjt47EN5VEvYVa77afIsd4hEAFicFg',
    'HL Gaming Official Free Fire Player UID Verification API (25 requests/day limit)'
)
ON CONFLICT (service_name) DO UPDATE
SET daily_limit = EXCLUDED.daily_limit;

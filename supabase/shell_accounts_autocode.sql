-- ==========================================================
-- SHADOWTOPUP: GARENA SHELL ACCOUNTS 2FA AUTOCODE MIGRATION
-- Execute this SQL in your Supabase SQL Editor
-- (https://app.supabase.com -> SQL Editor -> New Query)
-- ==========================================================

-- 1. Create shell_accounts table if it does not exist
CREATE TABLE IF NOT EXISTS public.shell_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_username TEXT NOT NULL,
    password TEXT NOT NULL,
    autocode TEXT,
    available_balance INTEGER NOT NULL DEFAULT 0,
    is_main BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add autocode column if table already exists
ALTER TABLE public.shell_accounts 
ADD COLUMN IF NOT EXISTS autocode TEXT;

-- 3. Enable RLS and grant permissions
ALTER TABLE public.shell_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access on shell_accounts" ON public.shell_accounts;
CREATE POLICY "Allow service role full access on shell_accounts" 
ON public.shell_accounts FOR ALL USING (true);

GRANT ALL ON TABLE public.shell_accounts TO postgres, anon, authenticated, service_role;

-- 4. Upsert primary Garena shell account with 2FA Authenticator setup key
INSERT INTO public.shell_accounts (
    account_username,
    password,
    autocode,
    available_balance,
    is_main,
    last_synced_at,
    updated_at
)
VALUES (
    'SHADOW_TOPUP1',
    'Shadow123@',
    '5ZEEJ3VDKEXSSD6J',
    6523,
    true,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- If SHADOW_TOPUP1 already exists, update its autocode
UPDATE public.shell_accounts
SET autocode = '5ZEEJ3VDKEXSSD6J'
WHERE UPPER(account_username) = 'SHADOW_TOPUP1'
  AND (autocode IS NULL OR autocode = '');

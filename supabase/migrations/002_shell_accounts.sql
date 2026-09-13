-- =========================================================
-- 002_SHELL_ACCOUNTS.SQL: Garena Shell Accounts & Autocode
-- =========================================================

CREATE TABLE IF NOT EXISTS public.shell_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    autocode TEXT,
    available_balance INTEGER DEFAULT 0 NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shell_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on shell_accounts"
  ON public.shell_accounts FOR ALL USING (true);

GRANT ALL ON TABLE public.shell_accounts TO postgres, service_role;

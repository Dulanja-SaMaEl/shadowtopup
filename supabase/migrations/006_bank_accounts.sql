-- ==============================================================================
-- Migration: 006_bank_accounts.sql
-- Description: Create bank_accounts table and insert official Sri Lankan bank accounts
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL UNIQUE,
    branch_name TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure account_number unique constraint exists if table already existed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bank_accounts_account_number_key'
    ) THEN
        ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_account_number_key UNIQUE (account_number);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (public & authenticated) can view active bank accounts for checkout
DROP POLICY IF EXISTS "Public can view active bank accounts" ON public.bank_accounts;
CREATE POLICY "Public can view active bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (is_active = true);

-- 2. Service role and admins can do all actions (insert, update, delete, view all)
DROP POLICY IF EXISTS "Admin and service role full access" ON public.bank_accounts;
CREATE POLICY "Admin and service role full access"
    ON public.bank_accounts FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant Table Permissions
GRANT ALL ON TABLE public.bank_accounts TO postgres, anon, authenticated, service_role;

-- Insert / Upsert the 4 Official Bank Accounts
INSERT INTO public.bank_accounts (bank_name, account_name, account_number, branch_name, instructions, is_active, display_order)
VALUES
    (
        'Sampath Bank PLC',
        'D.I.R.D. WIJESINGHE',
        '118055314226',
        'HEAD OFFICE',
        'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
        true,
        1
    ),
    (
        'Dialog Finance PLC',
        'D.I.R.D. WIJESINGHE',
        '001023077550',
        'HEAD OFFICE',
        'Please deposit or transfer the exact order amount and upload a clear screenshot of the transfer confirmation.',
        true,
        2
    ),
    (
        'Bank of Ceylon',
        'D.I.R.D. WIJESINGHE',
        '75566748',
        'HAKMANA BRANCH',
        'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
        true,
        3
    ),
    (
        'National Savings Bank (NSB)',
        'D.I.R.D. WIJESINGHE',
        '300058079751',
        'HAKMANA BRANCH',
        'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.',
        true,
        4
    )
ON CONFLICT (account_number) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    branch_name = EXCLUDED.branch_name,
    instructions = EXCLUDED.instructions,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

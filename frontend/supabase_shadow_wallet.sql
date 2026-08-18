-- =========================================================
-- SHADOW WALLET & REDEEM CODES SYSTEM MIGRATION FOR SUPABASE
-- =========================================================

-- 1. Add wallet_balance column to public.profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL;

-- 2. Create public.redeem_codes table
CREATE TABLE IF NOT EXISTS public.redeem_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  is_redeemed BOOLEAN DEFAULT FALSE NOT NULL,
  redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create public.wallet_transactions audit table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('REDEEM_CODE', 'PACKAGE_PURCHASE', 'ADMIN_ADJUSTMENT')),
  amount NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Allow service role full access on redeem_codes" 
ON public.redeem_codes FOR ALL USING (true);

CREATE POLICY "Allow users to view own wallet_transactions" 
ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow service role full access on wallet_transactions" 
ON public.wallet_transactions FOR ALL USING (true);

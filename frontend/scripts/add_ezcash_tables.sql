-- ==========================================================
-- Migration: Add ezcash_transactions table for Dialog eZ Cash
-- Run this in your Supabase SQL Editor:
-- ==========================================================

CREATE TABLE IF NOT EXISTS ezcash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trx_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  sender_phone TEXT,
  provider TEXT DEFAULT 'eZ Cash',
  purpose TEXT DEFAULT 'wallet_deposit', -- 'wallet_deposit' or 'order_payment'
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'claimed',
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ezcash_trx_id ON ezcash_transactions(trx_id);

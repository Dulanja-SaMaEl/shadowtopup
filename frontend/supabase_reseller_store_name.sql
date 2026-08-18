-- =========================================================
-- ADD STORE NAME TO PROFILES FOR RESELLERS
-- =========================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT NULL;

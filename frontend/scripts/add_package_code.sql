-- ==========================================================
-- Migration: Add package_code column to packages table
-- Run this in your Supabase SQL Editor:
-- ==========================================================

ALTER TABLE packages ADD COLUMN IF NOT EXISTS package_code TEXT;

-- Update the 20 active packages with their corresponding UCBot codes:
UPDATE packages SET package_code = '25' WHERE id = '11111111-1111-1111-1111-111111111001';
UPDATE packages SET package_code = '100' WHERE id = '11111111-1111-1111-1111-111111111002';
UPDATE packages SET package_code = '310' WHERE id = '11111111-1111-1111-1111-111111111003';
UPDATE packages SET package_code = '520' WHERE id = '11111111-1111-1111-1111-111111111004';
UPDATE packages SET package_code = '1060' WHERE id = '11111111-1111-1111-1111-111111111005';
UPDATE packages SET package_code = '2180' WHERE id = '11111111-1111-1111-1111-111111111006';
UPDATE packages SET package_code = '5600' WHERE id = '11111111-1111-1111-1111-111111111007';
UPDATE packages SET package_code = '11500' WHERE id = '11111111-1111-1111-1111-111111111008';
UPDATE packages SET package_code = 'LITE' WHERE id = '11111111-1111-1111-1111-111111111009';
UPDATE packages SET package_code = 'WEEKLY' WHERE id = '11111111-1111-1111-1111-111111111010';
UPDATE packages SET package_code = 'MONTHLY' WHERE id = '11111111-1111-1111-1111-111111111011';
UPDATE packages SET package_code = '3D' WHERE id = '11111111-1111-1111-1111-111111111012';
UPDATE packages SET package_code = '7D' WHERE id = '11111111-1111-1111-1111-111111111013';
UPDATE packages SET package_code = '30D' WHERE id = '11111111-1111-1111-1111-111111111014';
UPDATE packages SET package_code = 'lvl6' WHERE id = '11111111-1111-1111-1111-111111111015';
UPDATE packages SET package_code = 'lvl10' WHERE id = '11111111-1111-1111-1111-111111111016';
UPDATE packages SET package_code = 'lvl15' WHERE id = '11111111-1111-1111-1111-111111111017';
UPDATE packages SET package_code = 'lvl20' WHERE id = '11111111-1111-1111-1111-111111111018';
UPDATE packages SET package_code = 'lvl25' WHERE id = '11111111-1111-1111-1111-111111111019';
UPDATE packages SET package_code = 'lvl30' WHERE id = '11111111-1111-1111-1111-111111111020';

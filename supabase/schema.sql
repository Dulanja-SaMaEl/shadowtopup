-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'gold', 'silver', 'normal')) DEFAULT 'normal',
    banned_at TIMESTAMPTZ DEFAULT NULL,
    reseller_status TEXT CHECK (reseller_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    requested_tier TEXT CHECK (requested_tier IN ('silver', 'gold')) DEFAULT NULL,
    reseller_expires_at TIMESTAMPTZ DEFAULT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile automatically on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'), new.email, 'normal')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_path TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    category TEXT DEFAULT 'Mobile',
    developer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    silver_price NUMERIC(10, 2),
    gold_price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PACKAGES TABLE (Free Fire Diamond & Shell Pricing)
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_name TEXT NOT NULL,
    package_type TEXT DEFAULT 'diamond',
    diamond_amount INTEGER NOT NULL,
    shell_cost INTEGER NOT NULL,
    normal_price NUMERIC(10, 2) NOT NULL,
    silver_price NUMERIC(10, 2) DEFAULT 0,
    gold_price NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SHELL ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.shell_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_username TEXT NOT NULL,
    password TEXT NOT NULL,
    available_balance INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT FALSE,
    session_cookie TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PURCHASE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages(id) ON DELETE RESTRICT,
    shell_account_id UUID REFERENCES public.shell_accounts(id) ON DELETE SET NULL,
    free_fire_player_id TEXT NOT NULL,
    shells_deducted INTEGER NOT NULL,
    price_paid NUMERIC(10, 2) NOT NULL,
    price_tier TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'payment_pending', 'success', 'failed')) DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    receipt_path TEXT, -- ImgBB direct URL
    paypal_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS & ORDER ITEMS TABLES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'verified', 'completed', 'rejected')) DEFAULT 'pending',
    receipt_path TEXT, -- ImgBB direct URL
    admin_note TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    player_id TEXT,
    server_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CART ITEMS & PRICING SETTINGS
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    player_id TEXT,
    server_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles readable by self or admin" ON public.profiles;
CREATE POLICY "Profiles readable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Cart accessible by owner" ON public.cart_items;
CREATE POLICY "Cart accessible by owner" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Orders viewable by owner or admin" ON public.orders;
CREATE POLICY "Orders viewable by owner or admin" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ====================================================================
-- SEED DATA & PRE-CONFIGURED TEST USER ACCOUNTS (PASSWORD: Password123!)
-- ====================================================================

-- 1. Seed Demo Auth Accounts into Supabase auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@shadowtopup.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Dulanja"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'gold@reseller.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Gold Wholesaler"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'silver@reseller.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Silver Merchant"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'user@shadowtopup.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Casual Gamer"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Assign User Roles & Reseller Statuses in Profiles
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@shadowtopup.com';
UPDATE public.profiles SET role = 'gold', reseller_status = 'approved' WHERE email = 'gold@reseller.com';
UPDATE public.profiles SET role = 'silver', reseller_status = 'approved' WHERE email = 'silver@reseller.com';
UPDATE public.profiles SET role = 'normal' WHERE email = 'user@shadowtopup.com';

-- 3. Seed Games Catalog
INSERT INTO public.games (title, slug, category, developer, description, image_path, is_active)
VALUES
('Garena Free Fire', 'free-fire', 'Mobile', 'Garena', 'Instant Garena Shell top-up for Free Fire diamonds with automated player UID verification.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000', true),
('Mobile Legends: Bang Bang', 'mobile-legends', 'Mobile', 'Moonton', 'Direct top-up for Mobile Legends Diamonds and Weekly Diamond Pass.', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000', true),
('PUBG Mobile', 'pubg-mobile', 'Mobile', 'Tencent Games', 'Instant Unknown Cash (UC) top-up via Character ID.', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Free Fire Diamond Packages (with Reseller Tier Pricing Matrix)
INSERT INTO public.packages (package_name, package_type, diamond_amount, shell_cost, normal_price, silver_price, gold_price, is_active)
VALUES
('100 Diamonds', 'diamond', 100, 100, 1.20, 1.10, 1.00, true),
('310 Diamonds', 'diamond', 310, 300, 3.50, 3.25, 3.00, true),
('520 Diamonds', 'diamond', 520, 500, 5.80, 5.40, 5.00, true),
('1060 Diamonds', 'diamond', 1060, 1000, 11.50, 10.80, 10.00, true),
('2180 Diamonds', 'diamond', 2180, 2000, 22.80, 21.20, 20.00, true),
('5600 Diamonds', 'diamond', 5600, 5000, 56.00, 52.00, 49.00, true);

-- 5. Seed Main Garena Shell Account Pool
INSERT INTO public.shell_accounts (account_username, password, available_balance, is_main, last_synced_at)
VALUES
('garena_main_supplier', 'EncryptedPass123!', 14500, true, NOW()),
('garena_secondary_reseller', 'EncryptedPass456!', 3200, false, NOW());

-- 6. Seed Global Pricing Settings
INSERT INTO public.pricing_settings (setting_key, setting_value)
VALUES
('tier_discounts', '{"silver_discount_percent": 8, "gold_discount_percent": 15}'::jsonb),
('bank_payment_details', '{"bank_name": "Commercial Bank", "account_name": "ShadowTopUp", "account_number": "8009123456", "branch": "Colombo"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

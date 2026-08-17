-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant Schema Permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'gold', 'silver', 'normal')) DEFAULT 'normal',
    banned_at TIMESTAMPTZ DEFAULT NULL,
    reseller_status TEXT CHECK (reseller_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
    requested_tier TEXT CHECK (requested_tier IN ('silver', 'gold')) DEFAULT NULL,
    reseller_expires_at TIMESTAMPTZ DEFAULT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Failsafe Trigger to create profile automatically on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    'normal'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent any profile constraint conflict from breaking Supabase Auth signup
  RETURN NEW;
END;
$$;

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
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRICING SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.pricing_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PURCHASE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.purchase_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    free_fire_player_id TEXT NOT NULL,
    price_paid NUMERIC(10, 2) NOT NULL,
    shell_account_id UUID REFERENCES public.shell_accounts(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'success', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
GRANT ALL ON TABLE public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.games TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.packages TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.shell_accounts TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.purchase_transactions TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.cart_items TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.pricing_settings TO postgres, anon, authenticated, service_role;

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
-- SEED DATA (GAMES, PACKAGES, SHELL ACCOUNTS & PRICING SETTINGS)
-- ====================================================================

-- 1. Seed Games Catalog
INSERT INTO public.games (title, slug, category, developer, description, image_path, is_active)
VALUES
('Garena Free Fire', 'free-fire', 'Mobile', 'Garena', 'Instant Garena Shell top-up for Free Fire diamonds with automated player UID verification.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000', true),
('Mobile Legends: Bang Bang', 'mobile-legends', 'Mobile', 'Moonton', 'Direct top-up for Mobile Legends Diamonds and Weekly Diamond Pass.', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000', true),
('PUBG Mobile', 'pubg-mobile', 'Mobile', 'Tencent Games', 'Instant Unknown Cash (UC) top-up via Character ID.', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Free Fire Diamond Packages
INSERT INTO public.packages (package_name, package_type, diamond_amount, shell_cost, normal_price, silver_price, gold_price, is_active)
VALUES
('100 Diamonds', 'diamond', 100, 100, 1.20, 1.10, 1.00, true),
('310 Diamonds', 'diamond', 310, 300, 3.50, 3.25, 3.00, true),
('520 Diamonds', 'diamond', 520, 500, 5.80, 5.40, 5.00, true),
('1060 Diamonds', 'diamond', 1060, 1000, 11.50, 10.80, 10.00, true),
('2180 Diamonds', 'diamond', 2180, 2000, 22.80, 21.20, 20.00, true),
('5600 Diamonds', 'diamond', 5600, 5000, 56.00, 52.00, 49.00, true);

-- 3. Seed Main Garena Shell Account Pool
INSERT INTO public.shell_accounts (account_username, password, available_balance, is_main, last_synced_at)
VALUES
('garena_main_supplier', 'EncryptedPass123!', 14500, true, NOW()),
('garena_secondary_reseller', 'EncryptedPass456!', 3200, false, NOW());

-- 4. Helper Script to Set Roles for Test User Accounts
-- Run this in Supabase SQL Editor after creating users via registration page:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@shadowtopup.com';
-- UPDATE public.profiles SET role = 'gold' WHERE email = 'gold@shadowtopup.com';
-- UPDATE public.profiles SET role = 'silver' WHERE email = 'silver@shadowtopup.com';
-- UPDATE public.profiles SET role = 'normal' WHERE email = 'user@shadowtopup.com';

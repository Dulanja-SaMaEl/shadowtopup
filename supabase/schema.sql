-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE public.profiles (
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
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'), new.email, 'normal');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. GAMES TABLE
CREATE TABLE public.games (
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
CREATE TABLE public.products (
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
CREATE TABLE public.packages (
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
CREATE TABLE public.shell_accounts (
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
CREATE TABLE public.purchase_transactions (
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
CREATE TABLE public.orders (
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

CREATE TABLE public.order_items (
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
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    player_id TEXT,
    server_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pricing_settings (
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

CREATE POLICY "Profiles readable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Cart accessible by owner" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Orders viewable by owner or admin" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

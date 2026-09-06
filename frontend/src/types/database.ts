export type UserRole = 'normal' | 'silver' | 'gold' | 'admin';
export type ResellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'verified' | 'completed' | 'rejected';
export type TransactionStatus = 'pending' | 'payment_pending' | 'success' | 'failed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  banned_at?: string | null;
  reseller_status: ResellerStatus;
  store_name?: string | null;
  requested_tier?: 'silver' | 'gold' | null;
  reseller_expires_at?: string | null;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  image_path?: string | null;
  description?: string | null;
  is_active: boolean;
  category: string;
  developer?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  game_id: string;
  name: string;
  price: number;
  silver_price?: number | null;
  gold_price?: number | null;
  stock: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  package_name: string;
  package_type: string;
  diamond_amount: number;
  shell_cost: number;
  normal_price: number;
  silver_price: number;
  gold_price: number;
  image_url?: string;
  badge?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShellAccount {
  id: string;
  account_username: string;
  password?: string;
  autocode?: string | null;
  available_balance: number;
  is_main: boolean;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseTransaction {
  id: string;
  user_id: string;
  package_id: string;
  shell_account_id?: string | null;
  free_fire_player_id: string;
  shells_deducted: number;
  price_paid: number;
  price_tier: string;
  status: TransactionStatus;
  payment_method: 'paypal' | 'bank_transfer';
  receipt_path?: string | null;
  paypal_order_id?: string | null;
  created_at: string;
  package?: Package;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  receipt_path?: string | null;
  admin_note?: string | null;
  verified_at?: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  player_id?: string | null;
  server_id?: string | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  player_id?: string | null;
  server_id?: string | null;
  product?: Product;
}

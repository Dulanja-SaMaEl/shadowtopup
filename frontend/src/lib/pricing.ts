import { Package, Product, UserRole } from '@/types/database';

export function calculatePackagePrice(pkg: Package, role?: UserRole | string | null): number {
  const normalizedRole = (role || '').toLowerCase();
  if ((normalizedRole === 'gold' || normalizedRole === 'admin') && pkg.gold_price && Number(pkg.gold_price) > 0) {
    return Number(pkg.gold_price);
  }
  if (normalizedRole === 'silver' && pkg.silver_price && Number(pkg.silver_price) > 0) {
    return Number(pkg.silver_price);
  }
  return Number(pkg.normal_price || (pkg as any).price || 0);
}

export function calculateProductPrice(product: Product, role?: UserRole | string | null): number {
  const normalizedRole = (role || '').toLowerCase();
  if ((normalizedRole === 'gold' || normalizedRole === 'admin') && product.gold_price && Number(product.gold_price) > 0) {
    return Number(product.gold_price);
  }
  if (normalizedRole === 'silver' && product.silver_price && Number(product.silver_price) > 0) {
    return Number(product.silver_price);
  }
  return Number(product.price);
}

export function formatCurrency(amount: number): string {
  return `LKR ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

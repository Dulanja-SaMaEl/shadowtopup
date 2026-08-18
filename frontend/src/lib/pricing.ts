import { Package, Product, UserRole } from '@/types/database';

export function calculatePackagePrice(pkg: Package, role?: UserRole): number {
  if (role === 'gold' && pkg.gold_price && pkg.gold_price > 0) {
    return Number(pkg.gold_price);
  }
  if (role === 'silver' && pkg.silver_price && pkg.silver_price > 0) {
    return Number(pkg.silver_price);
  }
  return Number(pkg.normal_price);
}

export function calculateProductPrice(product: Product, role?: UserRole): number {
  if (role === 'gold' && product.gold_price && product.gold_price > 0) {
    return Number(product.gold_price);
  }
  if (role === 'silver' && product.silver_price && product.silver_price > 0) {
    return Number(product.silver_price);
  }
  return Number(product.price);
}

export function formatCurrency(amount: number): string {
  return `LKR ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

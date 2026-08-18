'use client';

import { useState, useEffect } from 'react';
import { Package, UserRole } from '@/types/database';
import { calculatePackagePrice, formatCurrency } from '@/lib/pricing';
import { Diamond, Check, ShieldAlert, CreditCard, Landmark, Upload, Loader2, Crown, Calendar, Sparkles, Wallet, ShoppingCart } from 'lucide-react';
import TransactionReceiptModal from './TransactionReceiptModal';
import { useCart } from '@/context/CartContext';

interface Props {
  packages: Package[];
  userRole?: UserRole;
  verifiedPlayerUid?: string | null;
  onCheckoutComplete?: () => void;
}

export default function PackageSelector({ packages, userRole, verifiedPlayerUid, onCheckoutComplete }: Props) {
  const { addToCart } = useCart();
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank_transfer' | 'shadow_wallet'>('shadow_wallet');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userStoreName, setUserStoreName] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddToCart = (pkg: Package, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!verifiedPlayerUid) {
      setMessage({ type: 'error', text: 'Please enter and verify your Player UID in Step 1 first.' });
      return;
    }
    const price = calculatePackagePrice(pkg, userRole);
    addToCart({
      packageId: pkg.id,
      packageName: pkg.package_name,
      diamonds: pkg.diamond_amount,
      price: price,
      shellCost: pkg.shell_cost,
      playerUid: verifiedPlayerUid,
      quantity: 1,
      image: pkg.image_url,
    });
    setMessage({
      type: 'success',
      text: `Added 1x ${pkg.package_name} to your Shopping Cart!`,
    });
  };

  useEffect(() => {
    async function checkWallet() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          const res = await fetch(`/api/wallet/balance?user_id=${encodeURIComponent(authData.user.id)}`);
          const data = await res.json();
          if (data.success) {
            setWalletBalance(data.wallet_balance || 0);
          }

          const userOrdersRes = await fetch('/api/user/orders');
          const userOrdersJson = await userOrdersRes.json();
          if (userOrdersJson.success && userOrdersJson.user?.store_name) {
            setUserStoreName(userOrdersJson.user.store_name);
          }
        }
      } catch (e) {
        console.warn('Wallet check note:', e);
      }
    }
    checkWallet();
  }, []);

  const handleCheckout = async () => {
    if (!selectedPkg) {
      setMessage({ type: 'error', text: 'Please select a top-up package' });
      return;
    }
    if (!verifiedPlayerUid) {
      setMessage({ type: 'error', text: 'Please verify your Player UID above first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const price = calculatePackagePrice(selectedPkg, userRole);
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setMessage({ type: 'error', text: 'You must be logged in to place an order.' });
      setLoading(false);
      return;
    }
    const userId = authData.user.id;
    const tier = userRole === 'gold' || userRole === 'silver' ? userRole : 'normal';

    if (paymentMethod === 'shadow_wallet') {
      try {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPkg.id,
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            totalAmount: price,
            paymentMethod: 'shadow_wallet',
            priceTier: tier,
            shellCost: selectedPkg.shell_cost,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage({
            type: 'success',
            text: `Order placed successfully! LKR ${price.toLocaleString()} deducted from your Shadow Wallet.`,
          });
          if (walletBalance !== null) {
            setWalletBalance(walletBalance - price);
          }

          setGeneratedReceipt({
            orderId: data.order?.id ? String(data.order.id).slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase(),
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            amount: price,
            paymentMethod: 'Shadow Wallet',
            status: 'COMPLETED',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerName: authData.user.email?.split('@')[0].toUpperCase(),
            customerEmail: authData.user.email,
            storeName: userStoreName,
            resellerRole: userRole,
          });

          if (onCheckoutComplete) onCheckoutComplete();
        } else {
          setMessage({ type: 'error', text: data.message || 'Shadow Wallet checkout failed.' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to complete wallet checkout.' });
      }
      setLoading(false);
      return;
    }

    if (paymentMethod === 'paypal') {
      try {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: price,
            transactionId: Date.now(),
            packageName: selectedPkg.package_name,
          }),
        });

        const data = await res.json();
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to initiate PayPal transaction' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to process payment request' });
      }
      setLoading(false);
      return;
    }

    if (paymentMethod === 'bank_transfer') {
      let receiptUrl = null;

      if (receiptFile) {
        try {
          const formData = new FormData();
          formData.append('image', receiptFile);
          const uploadRes = await fetch('/api/upload-receipt', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            receiptUrl = uploadData.url;
          }
        } catch (e) {
          console.error('Receipt upload error:', e);
        }
      }

      try {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPkg.id,
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            totalAmount: price,
            paymentMethod: 'bank_transfer',
            receiptUrl,
            priceTier: tier,
            shellCost: selectedPkg.shell_cost,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setMessage({
            type: 'success',
            text: 'Bank transfer order created successfully! Payment under verification by admin team.',
          });

          setGeneratedReceipt({
            orderId: data.order?.id ? String(data.order.id).slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase(),
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            amount: price,
            paymentMethod: 'Bank Transfer',
            status: 'PENDING VERIFICATION',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerName: authData.user.email?.split('@')[0].toUpperCase(),
            customerEmail: authData.user.email,
            storeName: userStoreName,
            resellerRole: userRole,
            receiptUrl: receiptUrl,
          });

          if (onCheckoutComplete) onCheckoutComplete();
        } else {
          setMessage({ type: 'error', text: data.message || 'Order creation failed' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to create bank transfer order' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Diamond className="w-5 h-5 text-cyan-400" /> 2. Select Recharge Package
          </h2>
          <p className="text-xs text-slate-400">Choose your desired Free Fire Garena SG recharge amount or pass subscription</p>
        </div>
        {userRole && userRole !== 'normal' && (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase shrink-0">
            {userRole} Tier Unlocked
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const finalPrice = calculatePackagePrice(pkg, userRole);
          const isSelected = selectedPkg?.id === pkg.id;
          const isMembership = pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass';

          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className={`relative cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-900/40 via-slate-900 to-slate-950 border-purple-500 shadow-xl shadow-purple-500/20 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-[9px] font-extrabold tracking-wider uppercase shadow-md">
                  {pkg.badge}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shrink-0">
                  <img src={pkg.image_url} alt={pkg.package_name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">{pkg.package_name}</h3>
                  <span className="text-xs text-cyan-400 font-mono font-bold block mt-0.5">
                    {isMembership ? 'Subscription Pass' : `${pkg.diamond_amount} Diamonds`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Price</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    {formatCurrency(finalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(pkg, e)}
                    className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-cyan-400 hover:bg-purple-900 hover:text-white transition-all shadow-md"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPkg && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <h3 className="text-lg font-bold text-white">3. Select Payment Method & Checkout</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('shadow_wallet')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'shadow_wallet'
                  ? 'bg-purple-500/10 border-purple-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Wallet className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-xs uppercase">Shadow Wallet</span>
                <span className="text-[10px] text-emerald-400 font-mono block font-bold">
                  {walletBalance !== null ? `Bal: LKR ${walletBalance.toLocaleString()}` : 'Check Balance'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'paypal'
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <CreditCard className="w-6 h-6 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-xs uppercase">PayPal Express</span>
                <span className="text-[10px] text-slate-400 block">Instant Top-Up</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'bank_transfer'
                  ? 'bg-cyan-500/10 border-cyan-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Landmark className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-xs uppercase">Bank Transfer</span>
                <span className="text-[10px] text-slate-400 block">Manual Verification</span>
              </div>
            </button>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">
                Upload Payment Receipt (ImgBB Free Storage API)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>
          )}

          {message && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={(e) => selectedPkg && handleAddToCart(selectedPkg, e)}
              className="py-4 bg-[#141229] border border-purple-800 hover:border-purple-500 text-purple-300 hover:text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm uppercase"
            >
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold rounded-xl shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm uppercase"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>Pay {formatCurrency(calculatePackagePrice(selectedPkg, userRole))} & Recharge Now</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={generatedReceipt}
        onClose={() => setGeneratedReceipt(null)}
      />
    </div>
  );
}

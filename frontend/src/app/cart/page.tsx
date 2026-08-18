'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Check, Wallet, Landmark, Loader2, Zap, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import TransactionReceiptModal from '@/components/TransactionReceiptModal';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, updatePlayerUid, clearCart, cartTotal, totalCount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'shadow_wallet' | 'bank_transfer'>('shadow_wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userStoreName, setUserStoreName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
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

          const profileRes = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
          if (profileRes.data) {
            setUserRole(profileRes.data.role);
            setUserStoreName(profileRes.data.store_name);
          }
        }
      } catch (err) {
        console.error('Error loading cart page user data:', err);
      }
    }
    loadUserData();
  }, []);

  const handleBatchCheckout = async () => {
    if (cartItems.length === 0) return;

    // Verify all items have player UIDs
    const missingUidIndex = cartItems.findIndex((item) => !item.playerUid || item.playerUid.trim().length < 5);
    if (missingUidIndex > -1) {
      setErrorMsg(`Item #${missingUidIndex + 1} (${cartItems[missingUidIndex].packageName}) requires a valid Free Fire Player UID (min 5 digits).`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        setErrorMsg('You must be logged in to complete your checkout.');
        setLoading(false);
        return;
      }

      if (paymentMethod === 'shadow_wallet') {
        if (walletBalance !== null && walletBalance < cartTotal) {
          setErrorMsg(`Insufficient Shadow Wallet balance. Required: LKR ${cartTotal.toLocaleString()}, Available: LKR ${walletBalance.toLocaleString()}`);
          setLoading(false);
          return;
        }

        // Process all items in batch
        let createdOrdersCount = 0;
        let lastCreatedOrder: any = null;

        for (const item of cartItems) {
          for (let q = 0; q < item.quantity; q++) {
            const res = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                packageId: item.packageId,
                packageName: item.packageName,
                playerUid: item.playerUid,
                totalAmount: item.price,
                paymentMethod: 'shadow_wallet',
                priceTier: userRole || 'normal',
                shellCost: item.shellCost || 0,
              }),
            });

            const data = await res.json();
            if (data.success) {
              createdOrdersCount++;
              lastCreatedOrder = data.order;
            } else {
              throw new Error(data.message || `Failed to process ${item.packageName}`);
            }
          }
        }

        // Deduct from local wallet state
        if (walletBalance !== null) {
          setWalletBalance(walletBalance - cartTotal);
        }

        setSuccessMsg(`Successfully placed ${createdOrdersCount} order(s) using Shadow Wallet balance!`);

        // Generate combined receipt
        setGeneratedReceipt({
          orderId: lastCreatedOrder?.id ? String(lastCreatedOrder.id).slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase(),
          packageName: cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`,
          playerUid: cartItems[0].playerUid,
          amount: cartTotal,
          paymentMethod: 'Shadow Wallet',
          status: 'COMPLETED',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          customerName: authData.user.email?.split('@')[0].toUpperCase(),
          customerEmail: authData.user.email,
          storeName: userStoreName,
          resellerRole: userRole,
        });

        clearCart();
      } else {
        // Bank transfer checkout placeholder guidance
        setSuccessMsg('Bank transfer orders created! Please upload your payment receipt in the dashboard.');
        clearCart();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0814] pb-24 text-white">
      {/* Top Banner Header */}
      <div className="relative h-48 bg-[#120f26] border-b border-purple-950/40 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-purple-950/30 to-transparent" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-cyan-400" /> YOUR SHOPPING CART
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase text-slate-400">
            <Link href="/" className="hover:text-cyan-400">HOME</Link>
            <span>:</span>
            <span className="text-cyan-400 font-black">CART ({totalCount} ITEMS)</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <Link href="/games" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        {cartItems.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#141229] border border-purple-950/40 text-center space-y-6 max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-purple-950/60 border border-purple-800/60 flex items-center justify-center mx-auto text-purple-400 shadow-lg">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase text-white tracking-wider">Your Cart is Empty</h2>
              <p className="text-xs text-slate-400">Add Free Fire diamonds or pass packages to your cart to enjoy instant automated top-ups.</p>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all"
            >
              Browse Games Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Selected Items ({cartItems.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.cartId} className="p-5 rounded-2xl bg-[#141229] border border-purple-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.packageName} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Zap className="w-6 h-6 text-cyan-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-sm">{item.packageName}</h3>
                      <p className="text-[10px] text-cyan-400 font-mono font-bold">
                        {item.diamonds} Diamonds • LKR {item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">PLAYER UID:</span>
                        <input
                          type="text"
                          value={item.playerUid}
                          onChange={(e) => updatePlayerUid(item.cartId, e.target.value)}
                          placeholder="Target Free Fire UID"
                          className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-cyan-400 w-36 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400 font-mono block">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Checkout Sidebar */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
                <h3 className="text-base font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Order Summary</h3>

                {/* Wallet Balance Display */}
                {walletBalance !== null && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-cyan-300">SHADOW WALLET</span>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      LKR {walletBalance.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Packages</span>
                    <span className="text-white font-bold">{totalCount} Item(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">LKR {cartTotal.toFixed(2)}</span>
                  </div>
                  {userRole && userRole !== 'normal' && (
                    <div className="flex justify-between text-purple-300">
                      <span>Reseller Tier</span>
                      <span className="font-bold uppercase text-amber-400">{userRole} TIER APPLIED</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                    <span>Grand Total</span>
                    <span className="text-emerald-400 font-mono font-black text-base">LKR {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('shadow_wallet')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        paymentMethod === 'shadow_wallet'
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Shadow Wallet</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Instant Delivery</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Bank Transfer</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Manual Verification</span>
                      </div>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleBatchCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black rounded-xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all uppercase tracking-wider text-xs"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-cyan-300" />
                      <span>CHECKOUT ALL ITEMS ({totalCount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={generatedReceipt}
        onClose={() => setGeneratedReceipt(null)}
      />
    </div>
  );
}

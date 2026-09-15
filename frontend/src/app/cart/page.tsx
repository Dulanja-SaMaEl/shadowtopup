'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Check, Wallet, Landmark, Loader2, Zap, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import TransactionReceiptModal from '@/components/TransactionReceiptModal';
import OrderProcessingModal from '@/components/OrderProcessingModal';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, updatePlayerUid, clearCart, cartTotal, totalCount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'shadow_wallet' | 'bank_transfer'>('shadow_wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
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

        setIsProcessingOrder(true);

        // Process all items in batch
        let createdOrdersCount = 0;
        let lastCreatedOrder: any = null;
        let lastTxId: string | undefined = undefined;
        let lastPlayerNickname: string | undefined = undefined;

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
              if (data.transactionId) lastTxId = data.transactionId;
              if (data.playerNickname) lastPlayerNickname = data.playerNickname;
            } else {
              throw new Error(data.message || `Failed to process ${item.packageName}`);
            }
          }
        }

        // Deduct from local wallet state
        if (walletBalance !== null) {
          setWalletBalance(walletBalance - cartTotal);
        }

        setSuccessMsg(`⚡ Successfully placed and delivered ${createdOrdersCount} order(s) using Shadow Wallet balance!`);

        // Generate combined receipt
        setGeneratedReceipt({
          orderId: lastCreatedOrder?.id ? String(lastCreatedOrder.id).slice(0, 8).toUpperCase() : (lastTxId ? lastTxId.slice(-8) : Math.random().toString(36).slice(2, 10).toUpperCase()),
          packageName: cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`,
          playerUid: cartItems[0].playerUid,
          playerNickname: lastPlayerNickname,
          transactionId: lastTxId,
          itemsDelivered: cartItems.map(i => `${i.quantity}x ${i.packageName}`).join(', '),
          amount: cartTotal,
          paymentMethod: 'Shadow Wallet',
          status: 'COMPLETED & DELIVERED',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
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
      setIsProcessingOrder(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080711] pb-24 text-white">
      {/* Top Header */}
      <div className="py-8 bg-[#0c0a1a] border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-purple-300 font-semibold">Shopping Cart ({totalCount} items)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-purple-400" /> Shopping Cart
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <Link href="/games" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-purple-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        {cartItems.length === 0 ? (
          <div className="p-10 rounded-xl bg-[#110e24] border border-white/[0.08] text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-purple-400">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Your Cart is Empty</h2>
              <p className="text-xs sm:text-sm text-slate-400">Add Free Fire diamond packages to your cart to proceed with checkout.</p>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                <h2 className="text-sm font-semibold text-slate-300">Selected Items ({cartItems.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.cartId} className="p-4 sm:p-5 rounded-xl bg-[#110e24] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-white/20">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-[#080711] border border-white/10 flex items-center justify-center p-2 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.packageName} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Zap className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm">{item.packageName}</h3>
                      <p className="text-xs text-purple-300 font-mono">
                        {item.diamonds} Diamonds • LKR {item.price.toFixed(2)} each
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">UID:</span>
                        <input
                          type="text"
                          value={item.playerUid}
                          onChange={(e) => updatePlayerUid(item.cartId, e.target.value)}
                          placeholder="Player UID (e.g. 123456789)"
                          className="px-2.5 py-1 bg-[#080711] border border-white/10 rounded-md text-xs font-mono font-medium text-white w-full sm:w-44 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-white/[0.08] pt-3 sm:pt-0">
                    <div className="flex items-center gap-1.5 bg-[#080711] p-1 rounded-lg border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white/[0.04] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono font-semibold text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white/[0.04] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-bold text-emerald-400 font-mono block">
                        LKR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Checkout Sidebar */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-[#110e24] border border-white/[0.08] space-y-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/[0.08] pb-3">Order Summary</h3>

                {/* Wallet Balance Display */}
                {walletBalance !== null && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-300">Shadow Wallet</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      LKR {walletBalance.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Packages</span>
                    <span className="text-white font-medium">{totalCount} Item(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-white font-mono font-medium">LKR {cartTotal.toFixed(2)}</span>
                  </div>
                  {userRole && userRole !== 'normal' && (
                    <div className="flex justify-between text-purple-300">
                      <span>Reseller Tier</span>
                      <span className="font-semibold uppercase text-purple-400">{userRole} Tier Applied</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/[0.08] pt-3 text-sm font-bold text-white">
                    <span>Grand Total</span>
                    <span className="text-emerald-400 font-mono font-bold text-base">LKR {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('shadow_wallet')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                        paymentMethod === 'shadow_wallet'
                          ? 'bg-purple-500/15 border-purple-500 text-white'
                          : 'bg-[#080711] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">Shadow Wallet</span>
                        <span className="text-[10px] text-slate-400 block">Instant</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-purple-500/15 border-purple-500 text-white'
                          : 'bg-[#080711] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">Bank Transfer</span>
                        <span className="text-[10px] text-slate-400 block">Manual</span>
                      </div>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleBatchCheckout}
                  disabled={loading}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>Checkout ({totalCount} Items)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Processing Preloader Modal */}
      <OrderProcessingModal
        isOpen={isProcessingOrder}
        packageName={cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`}
        playerUid={cartItems[0]?.playerUid}
        amount={cartTotal}
        paymentMethod="Shadow Wallet"
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={generatedReceipt}
        onClose={() => setGeneratedReceipt(null)}
      />
    </div>
  );
}

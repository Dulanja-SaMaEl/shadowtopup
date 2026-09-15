'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Check, Wallet, Landmark, Loader2, Zap, AlertCircle, Smartphone, Copy, Sparkles, Upload } from 'lucide-react';
import { formatCurrency, calculatePackagePrice } from '@/lib/pricing';
import { Package, UserRole } from '@/types/database';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';
import TransactionReceiptModal from '@/components/TransactionReceiptModal';
import OrderProcessingModal from '@/components/OrderProcessingModal';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, updatePlayerUid, clearCart, cartTotal, totalCount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'shadow_wallet' | 'ez_cash' | 'bank_transfer'>('shadow_wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [userStoreName, setUserStoreName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dialog eZ Cash & Bank Transfer State
  const [ezCashTrxId, setEzCashTrxId] = useState('');
  const [copiedEzNumber, setCopiedEzNumber] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [packagesList, setPackagesList] = useState<Package[]>(OFFICIAL_GARENA_PACKAGES);

  const ezCashReceiverNumber = process.env.NEXT_PUBLIC_EZCASH_NUMBER || '0765604635';
  const ezCashReceiverName = process.env.NEXT_PUBLIC_EZCASH_NAME || 'Shadow Store';

  const handleCopyEzNumber = () => {
    navigator.clipboard.writeText(ezCashReceiverNumber);
    setCopiedEzNumber(true);
    setTimeout(() => setCopiedEzNumber(false), 2000);
  };

  useEffect(() => {
    async function loadUserData() {
      try {
        if (typeof window !== 'undefined') {
          const savedRole = localStorage.getItem('active_session_role');
          if (savedRole) setUserRole(savedRole);
        }
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('active_session_role', profileRes.data.role);
            }
            setUserStoreName(profileRes.data.store_name);
          }
        }
      } catch (err) {
        console.error('Error loading cart page user data:', err);
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function fetchDbPackages() {
      try {
        const res = await fetch('/api/packages');
        const data = await res.json();
        if (data.success && data.packages && data.packages.length > 0) {
          setPackagesList(data.packages as Package[]);
        }
      } catch (e) {
        // Fallback to official catalog
      }
    }
    fetchDbPackages();
  }, []);

  const getItemPrice = (item: { packageId: string; packageName: string; price: number }) => {
    const normalizedRole = (userRole || '').toLowerCase();
    const pkg = packagesList.find(
      (p) => p.id === item.packageId || p.package_name.toLowerCase() === item.packageName.toLowerCase()
    );
    if (pkg) {
      return calculatePackagePrice(pkg, normalizedRole as UserRole);
    }
    return item.price;
  };

  const effectiveCartTotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);

  const handleBatchCheckout = async () => {
    if (cartItems.length === 0) return;

    // Verify all items have valid Player UIDs (min 5 characters)
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

      const normalizedCartRole = (userRole || '').toLowerCase();
      const effectiveCartTier = normalizedCartRole === 'gold' || normalizedCartRole === 'admin' ? 'gold' : (normalizedCartRole === 'silver' ? 'silver' : 'normal');

      // 1. SHADOW WALLET CHECKOUT
      if (paymentMethod === 'shadow_wallet') {
        if (walletBalance !== null && walletBalance < effectiveCartTotal) {
          setErrorMsg(`Insufficient Shadow Wallet balance. Required: LKR ${effectiveCartTotal.toLocaleString()}, Available: LKR ${walletBalance.toLocaleString()}`);
          setLoading(false);
          return;
        }

        setIsProcessingOrder(true);

        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              packageId: item.packageId,
              packageName: item.packageName,
              playerUid: item.playerUid,
              quantity: item.quantity,
              price: getItemPrice(item),
              shellCost: item.shellCost || 0,
            })),
            paymentMethod: 'shadow_wallet',
            priceTier: effectiveCartTier,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to complete Shadow Wallet batch order.');
        }

        // Deduct from local wallet state
        if (walletBalance !== null) {
          setWalletBalance(walletBalance - effectiveCartTotal);
        }

        setSuccessMsg(`⚡ Successfully placed and delivered ${data.itemsCount || totalCount} item(s) using Shadow Wallet balance!`);

        setGeneratedReceipt({
          orderId: data.orders?.[0]?.id ? String(data.orders[0].id).slice(0, 8).toUpperCase() : (data.transactionId ? String(data.transactionId).slice(-8) : Math.random().toString(36).slice(2, 10).toUpperCase()),
          packageName: cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`,
          playerUid: cartItems[0].playerUid,
          playerNickname: data.playerNickname,
          transactionId: data.transactionId,
          itemsDelivered: cartItems.map((i) => `${i.quantity}x ${i.packageName}`).join(', '),
          amount: effectiveCartTotal,
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
      } else if (paymentMethod === 'ez_cash') {
        // 2. DIALOG EZ CASH CHECKOUT
        const cleanTrx = ezCashTrxId.trim();
        if (!cleanTrx) {
          setErrorMsg('Please enter the Dialog eZ Cash RN Number from your SMS receipt.');
          setLoading(false);
          return;
        }

        setIsProcessingOrder(true);

        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              packageId: item.packageId,
              packageName: item.packageName,
              playerUid: item.playerUid,
              quantity: item.quantity,
              price: getItemPrice(item),
              shellCost: item.shellCost || 0,
            })),
            paymentMethod: 'ez_cash',
            ezCashTrxId: cleanTrx,
            priceTier: effectiveCartTier,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Dialog eZ Cash verification failed.');
        }

        setSuccessMsg(`⚡ Dialog eZ Cash verified! Delivered ${data.itemsCount || totalCount} item(s) to Garena Free Fire!`);

        setGeneratedReceipt({
          orderId: data.orders?.[0]?.id ? String(data.orders[0].id).slice(0, 8).toUpperCase() : cleanTrx,
          packageName: cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`,
          playerUid: cartItems[0].playerUid,
          playerNickname: data.playerNickname,
          transactionId: data.transactionId || cleanTrx,
          itemsDelivered: cartItems.map((i) => `${i.quantity}x ${i.packageName}`).join(', '),
          amount: effectiveCartTotal,
          paymentMethod: 'Dialog eZ Cash',
          status: 'COMPLETED & DELIVERED',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
          customerEmail: authData.user.email,
          storeName: userStoreName,
          resellerRole: userRole,
        });

        clearCart();
      } else if (paymentMethod === 'bank_transfer') {
        // 3. BANK TRANSFER CHECKOUT
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
            console.error('Receipt upload note:', e);
          }
        }

        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              packageId: item.packageId,
              packageName: item.packageName,
              playerUid: item.playerUid,
              quantity: item.quantity,
              price: getItemPrice(item),
              shellCost: item.shellCost || 0,
            })),
            paymentMethod: 'bank_transfer',
            receiptUrl,
            priceTier: effectiveCartTier,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to create bank transfer order.');
        }

        setSuccessMsg('Bank transfer orders created! Payment slip is under review by admin team.');

        setGeneratedReceipt({
          orderId: data.orders?.[0]?.id ? String(data.orders[0].id).slice(0, 8).toUpperCase() : `BT_${Date.now().toString().slice(-8)}`,
          packageName: cartItems.length === 1 ? cartItems[0].packageName : `Batch Top-Up (${totalCount} Items)`,
          playerUid: cartItems[0].playerUid,
          amount: effectiveCartTotal,
          paymentMethod: 'Bank Transfer',
          status: 'PENDING VERIFICATION',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
          customerEmail: authData.user.email,
          storeName: userStoreName,
          resellerRole: userRole,
          receiptUrl,
        });

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

              {cartItems.map((item) => {
                const unitPrice = getItemPrice(item);
                const hasDiscount = unitPrice < item.price;
                const isUidMissing = !item.playerUid || item.playerUid.trim().length < 5;

                return (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-purple-300 font-mono">
                            {item.diamonds} Diamonds
                          </span>
                          <span className="text-xs text-slate-500 font-mono">•</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              LKR {unitPrice.toFixed(2)} each
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-500 line-through font-mono">
                                LKR {item.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Wholesale Tier
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-mono shrink-0">UID:</span>
                          <input
                            type="text"
                            value={item.playerUid}
                            onChange={(e) => updatePlayerUid(item.cartId, e.target.value)}
                            placeholder="Player UID (min 5 digits)"
                            className={`px-2.5 py-1 bg-[#080711] border rounded-md text-xs font-mono font-medium text-white w-full sm:w-48 focus:outline-none ${
                              isUidMissing
                                ? 'border-amber-500/60 focus:border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                : 'border-white/10 focus:border-purple-500'
                            }`}
                          />
                          {isUidMissing && (
                            <span className="text-[10px] text-amber-400 font-mono">Player UID required</span>
                          )}
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
                          LKR {(unitPrice * item.quantity).toFixed(2)}
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
                );
              })}
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
                    <span className="text-white font-mono font-medium">LKR {effectiveCartTotal.toFixed(2)}</span>
                  </div>
                  {userRole && userRole !== 'normal' && (
                    <div className="flex justify-between text-purple-300">
                      <span>Reseller Tier</span>
                      <span className="font-semibold uppercase text-amber-400 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                        {userRole === 'admin'
                          ? 'Elite Reseller (Admin)'
                          : userRole === 'gold'
                          ? 'Elite Reseller Tier Applied'
                          : userRole === 'silver'
                          ? 'Standard Reseller Tier Applied'
                          : `${userRole} Tier Applied`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/[0.08] pt-3 text-sm font-bold text-white">
                    <span>Grand Total</span>
                    <span className="text-emerald-400 font-mono font-bold text-base">LKR {effectiveCartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('shadow_wallet')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                        paymentMethod === 'shadow_wallet'
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-[#080711] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">Wallet</span>
                        <span className="text-[10px] text-slate-400 block">Instant</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ez_cash')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                        paymentMethod === 'ez_cash'
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-[#080711] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">eZ Cash</span>
                        <span className="text-[10px] text-emerald-400/80 block font-mono">Auto-Verify</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-purple-500/20 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-[#080711] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Landmark className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold block">Bank</span>
                        <span className="text-[10px] text-slate-400 block">Slip Upload</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Dialog eZ Cash Payment Details */}
                {paymentMethod === 'ez_cash' && (
                  <div className="space-y-3 bg-[#080711] p-4 rounded-xl border border-purple-950/80">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-purple-950/60">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">
                          Dialog eZ Cash Receiver
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-white tracking-wider">
                            {ezCashReceiverNumber}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyEzNumber}
                            className="px-2 py-0.5 rounded bg-[#181335] hover:bg-[#201b44] text-purple-300 text-xs font-mono flex items-center gap-1 border border-purple-700/60 transition-all"
                          >
                            {copiedEzNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedEzNumber ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400 block">Account Name: {ezCashReceiverName}</span>
                      </div>

                      <div className="bg-[#110e24] border border-purple-950/80 px-3 py-1.5 rounded-lg text-left sm:text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Exact Total</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          LKR {effectiveCartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Enter Dialog eZ Cash RN Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter RN number from Dialog SMS (e.g. 260315...)"
                        value={ezCashTrxId}
                        onChange={(e) => setEzCashTrxId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#110e24] border border-purple-950/80 rounded-lg text-white font-mono uppercase placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details & Receipt Upload */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-3 bg-[#080711] p-4 rounded-xl border border-purple-950/80">
                    <div className="p-3 rounded-lg bg-[#110e24] border border-purple-950/60 text-xs space-y-1 text-slate-300">
                      <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">Bank Account Details</span>
                      <p className="font-semibold text-white">Commercial Bank of Ceylon</p>
                      <p className="font-mono text-slate-400">Account: <span className="text-white font-bold">8009123456</span></p>
                      <p className="font-mono text-slate-400">Name: <span className="text-white font-bold">Shadow Store</span></p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Upload Payment Receipt Slip
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#181335] file:text-purple-300 hover:file:bg-[#201b44] cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Shadow Wallet Low Balance Alert */}
                {paymentMethod === 'shadow_wallet' && walletBalance !== null && walletBalance < effectiveCartTotal && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Insufficient wallet balance.</span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition-colors shrink-0"
                    >
                      Top Up Wallet
                    </Link>
                  </div>
                )}

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
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm uppercase tracking-wider font-gaming"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : paymentMethod === 'ez_cash' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>Verify & Checkout ({totalCount} Items)</span>
                    </>
                  ) : paymentMethod === 'bank_transfer' ? (
                    <>
                      <Upload className="w-4 h-4 text-purple-200" />
                      <span>Submit Slip & Order ({totalCount} Items)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>Wallet Checkout ({totalCount} Items)</span>
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
        amount={effectiveCartTotal}
        paymentMethod={paymentMethod === 'ez_cash' ? 'Dialog eZ Cash' : paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Shadow Wallet'}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={generatedReceipt}
        onClose={() => setGeneratedReceipt(null)}
      />
    </div>
  );
}

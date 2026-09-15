'use client';

import { useState, useEffect } from 'react';
import { Package, UserRole } from '@/types/database';
import { calculatePackagePrice, formatCurrency } from '@/lib/pricing';
import { Diamond, Check, ShieldAlert, CreditCard, Landmark, Upload, Loader2, Crown, Calendar, Sparkles, Wallet, ShoppingCart, CheckCircle2, XCircle, AlertTriangle, Zap, Smartphone, Copy } from 'lucide-react';
import TransactionReceiptModal from './TransactionReceiptModal';
import OrderProcessingModal from './OrderProcessingModal';
import { useCart } from '@/context/CartContext';

interface Props {
  packages: Package[];
  userRole?: UserRole;
  verifiedPlayerUid?: string | null;
  verifiedPlayerNickname?: string | null;
  onCheckoutComplete?: () => void;
}

export default function PackageSelector({ packages, userRole, verifiedPlayerUid, verifiedPlayerNickname, onCheckoutComplete }: Props) {
  const { addToCart } = useCart();
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank_transfer' | 'shadow_wallet' | 'ez_cash'>('shadow_wallet');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userStoreName, setUserStoreName] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'membership' | 'levelup' | 'diamond'>('membership');

  // eZ Cash State
  const [ezCashTrxId, setEzCashTrxId] = useState('');
  const [copiedEzNumber, setCopiedEzNumber] = useState(false);
  const ezCashReceiverNumber = process.env.NEXT_PUBLIC_EZCASH_NUMBER || '0765604635';
  const ezCashReceiverName = process.env.NEXT_PUBLIC_EZCASH_NAME || 'Shadow Store';

  // Category counts for clean tab badges
  const membershipPkgs = packages.filter((pkg) => pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass' || pkg.package_type === 'evo_access');
  const levelUpPkgs = packages.filter((pkg) => pkg.package_type === 'levelup_pass');
  const diamondPkgs = packages.filter((pkg) => pkg.package_type === 'diamond' || (!pkg.package_type && pkg.diamond_amount > 0));

  const handleCopyEzNumber = () => {
    navigator.clipboard.writeText(ezCashReceiverNumber);
    setCopiedEzNumber(true);
    setTimeout(() => setCopiedEzNumber(false), 2000);
  };

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
      setIsProcessingOrder(true);
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
        setIsProcessingOrder(false);
        if (data.success) {
          const deliveredNickname = data.playerNickname || verifiedPlayerUid;
          const txId = data.transactionId || (data.order?.id ? String(data.order.id).slice(0, 8).toUpperCase() : '');

          setMessage({
            type: 'success',
            text: `⚡ Recharge Successful! ${data.items || selectedPkg.package_name} delivered instantly to ${deliveredNickname} (UID: ${verifiedPlayerUid}). Garena Trx: ${txId || 'Confirmed'}`,
          });

          if (walletBalance !== null) {
            setWalletBalance(walletBalance - price);
          }

          setGeneratedReceipt({
            orderId: data.order?.id ? String(data.order.id).slice(0, 8).toUpperCase() : (txId ? txId.slice(-8) : Math.random().toString(36).slice(2, 10).toUpperCase()),
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            playerNickname: verifiedPlayerNickname || data.playerNickname || `UID: ${verifiedPlayerUid}`,
            transactionId: data.transactionId,
            itemsDelivered: data.items || `${selectedPkg.diamond_amount} Diamonds`,
            amount: price,
            paymentMethod: 'Shadow Wallet',
            status: 'COMPLETED & DELIVERED',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
            customerEmail: authData.user.email,
            storeName: userStoreName,
            resellerRole: userRole,
          });

          if (onCheckoutComplete) onCheckoutComplete();
        } else {
          // FAILURE: Clear any receipt, do not deduct balance, and display prominent error!
          setGeneratedReceipt(null);
          setMessage({
            type: 'error',
            text: data.message || data.error || 'Topup delivery failed on Garena. Your Shadow Wallet balance was NOT charged.',
          });
        }
      } catch (err: any) {
        setIsProcessingOrder(false);
        setGeneratedReceipt(null);
        setMessage({ type: 'error', text: err.message || 'Failed to complete wallet checkout.' });
      }
      setLoading(false);
      return;
    }

    if (paymentMethod === 'ez_cash') {
      const cleanTrx = ezCashTrxId.trim();
      if (!cleanTrx) {
        setMessage({ type: 'error', text: 'Please enter the Dialog eZ Cash RN Number from your SMS receipt.' });
        setLoading(false);
        return;
      }

      setIsProcessingOrder(true);
      try {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPkg.id,
            packageName: selectedPkg.package_name,
            playerUid: verifiedPlayerUid,
            paymentMethod: 'ez_cash',
            ezCashTrxId: cleanTrx,
          }),
        });

        const data = await res.json();
        setIsProcessingOrder(false);
        if (data.success && data.status === 'completed') {
          setMessage({
            type: 'success',
            text: data.message || `Payment verified! Diamonds delivered instantly to UID: ${verifiedPlayerUid}`,
          });

          // Generate professional customer receipt
          setGeneratedReceipt({
            orderId: data.order?.id || `EZ_${Date.now()}`,
            transactionId: data.transactionId || cleanTrx,
            playerUid: verifiedPlayerUid,
            playerNickname: data.playerNickname || `UID: ${verifiedPlayerUid}`,
            packageName: selectedPkg.package_name,
            itemsDelivered: data.items || `${selectedPkg.diamond_amount} Diamonds`,
            amount: price,
            paymentMethod: 'Dialog eZ Cash',
            status: 'COMPLETED & DELIVERED',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
            customerEmail: authData.user.email,
            storeName: userStoreName,
            resellerRole: userRole,
          });

          setEzCashTrxId('');
          if (onCheckoutComplete) onCheckoutComplete();
        } else {
          setGeneratedReceipt(null);
          setMessage({
            type: 'error',
            text: data.message || 'eZ Cash verification or top-up delivery failed.',
          });
        }
      } catch (err: any) {
        setIsProcessingOrder(false);
        setGeneratedReceipt(null);
        setMessage({ type: 'error', text: err.message || 'Failed to complete eZ Cash checkout.' });
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
            customerName: authData.user?.user_metadata?.name || authData.user?.email?.split('@')[0].toUpperCase(),
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Diamond className="w-4 h-4 text-purple-400" /> Step 2: Select Recharge Package
          </h2>
          <p className="text-xs text-slate-400">Select Free Fire diamonds, Weekly Pass, or Monthly VIP subscription</p>
        </div>
        {userRole && userRole !== 'normal' && (
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase shrink-0">
            {userRole} Tier Active
          </span>
        )}
      </div>

      {/* Category Tabs: Memberships -> Level Up Packages -> Diamonds */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-gaming">
        {[
          { id: 'membership', label: `Memberships (${membershipPkgs.length})` },
          { id: 'levelup', label: `Level Up Passes (${levelUpPkgs.length})` },
          { id: 'diamond', label: `Diamonds (${diamondPkgs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id as 'membership' | 'levelup' | 'diamond')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === tab.id
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-[#110e24] border border-purple-950/60 text-slate-400 hover:text-white hover:border-purple-500/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {packages
          .filter((pkg) => {
            if (selectedCategory === 'membership') {
              return pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass' || pkg.package_type === 'evo_access';
            }
            if (selectedCategory === 'levelup') {
              return pkg.package_type === 'levelup_pass';
            }
            if (selectedCategory === 'diamond') {
              return pkg.package_type === 'diamond' || (!pkg.package_type && pkg.diamond_amount > 0);
            }
            return true;
          })
          .sort((a, b) => {
            if (selectedCategory === 'levelup' || selectedCategory === 'diamond') {
              return (a.diamond_amount || 0) - (b.diamond_amount || 0);
            }
            const aIsEvo = a.package_type === 'evo_access' ? 1 : 0;
            const bIsEvo = b.package_type === 'evo_access' ? 1 : 0;
            if (aIsEvo !== bIsEvo) return aIsEvo - bIsEvo;
            return (a.shell_cost || 0) - (b.shell_cost || 0);
          })
          .map((pkg) => {
            const finalPrice = calculatePackagePrice(pkg, userRole);
            const isSelected = selectedPkg?.id === pkg.id;
            const isMembership = pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass';
            const isEvo = pkg.package_type === 'evo_access';
            const isLevelUp = pkg.package_type === 'levelup_pass';

            const subTitle = isMembership
              ? (pkg.diamond_amount > 0 ? `Pass (${pkg.diamond_amount} Diamonds)` : 'Subscription Pass')
              : isEvo
              ? 'EVO Gun Access Pass'
              : isLevelUp
              ? `Level Up Pass (${pkg.diamond_amount} Diamonds)`
              : `${pkg.diamond_amount} Diamonds`;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3.5 ${
                  isSelected
                    ? 'bg-[#181335] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.28)] ring-1 ring-purple-400/50'
                    : 'bg-[#110e24] border-purple-950/60 hover:border-purple-500/40 hover:bg-[#14102c] hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-2 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-purple-950/95 text-purple-300 border border-purple-600/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    {pkg.badge}
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#090714] border border-purple-950/80 flex items-center justify-center p-1.5 shrink-0">
                    <img src={pkg.image_url} alt={pkg.package_name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs">{pkg.package_name}</h3>
                    <span className="text-[11px] text-purple-300/80 font-mono block mt-0.5">
                      {subTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-purple-950/60">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Price</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(pkg, e)}
                      className="p-1.5 rounded-lg bg-[#090714] border border-purple-950/80 text-slate-300 hover:text-white hover:border-purple-500/80 hover:shadow-[0_0_10px_rgba(168,85,247,0.25)] transition-all"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'border-purple-950/80'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {selectedPkg && (
        <div className="bg-[#110e24] border border-purple-950/60 rounded-xl p-6 space-y-5 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Step 3: Select Payment Method</span>
            <span className="text-[10px] font-mono text-purple-400 font-normal">[ DIRECT DISPATCH ]</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('shadow_wallet')}
              className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'shadow_wallet'
                  ? 'bg-[#181335] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white ring-1 ring-purple-400/40'
                  : 'bg-[#090714] border-purple-950/70 text-slate-400 hover:border-purple-500/40 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-xs">Shadow Wallet</span>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  {walletBalance !== null ? `Bal: LKR ${walletBalance.toLocaleString()}` : 'Check Balance'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('ez_cash')}
              className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'ez_cash'
                  ? 'bg-[#181335] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white ring-1 ring-purple-400/40'
                  : 'bg-[#090714] border-purple-950/70 text-slate-400 hover:border-purple-500/40 hover:text-white'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-xs flex items-center gap-1">
                  Dialog eZ Cash
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Instant SMS verify</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'paypal'
                  ? 'bg-[#181335] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white ring-1 ring-purple-400/40'
                  : 'bg-[#090714] border-purple-950/70 text-slate-400 hover:border-purple-500/40 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-xs">PayPal Express</span>
                <span className="text-[10px] text-slate-400 block">International</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all text-left ${
                paymentMethod === 'bank_transfer'
                  ? 'bg-[#181335] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white ring-1 ring-purple-400/40'
                  : 'bg-[#090714] border-purple-950/70 text-slate-400 hover:border-purple-500/40 hover:text-white'
              }`}
            >
              <Landmark className="w-5 h-5 text-purple-300 shrink-0" />
              <div>
                <span className="font-semibold text-white block text-xs">Bank Transfer</span>
                <span className="text-[10px] text-slate-400 block">Slip upload</span>
              </div>
            </button>
          </div>

          {paymentMethod === 'ez_cash' && (
            <div className="space-y-3 bg-[#090714] p-4 rounded-lg border border-purple-950/80">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-purple-950/60">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold block">
                    Dialog eZ Cash Merchant Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white tracking-wider">
                      {ezCashReceiverNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEzNumber}
                      className="px-2 py-0.5 rounded bg-[#181335] hover:bg-[#201b44] text-purple-300 text-xs font-mono flex items-center gap-1 border border-purple-700/60 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all"
                    >
                      {copiedEzNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEzNumber ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Account: {ezCashReceiverName}</span>
                </div>

                <div className="bg-[#110e24] border border-purple-950/80 px-3.5 py-1.5 rounded-lg text-left sm:text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Exact Amount</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
                    LKR {calculatePackagePrice(selectedPkg, userRole).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-2 bg-[#090714] p-4 rounded-lg border border-purple-950/80">
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
          )}

          {message && (
            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                message.type === 'success'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}
            >
              <p>{message.text}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-gaming">
            <button
              type="button"
              onClick={(e) => selectedPkg && handleAddToCart(selectedPkg, e)}
              className="py-3 bg-[#090714] border border-purple-950/80 hover:border-purple-500/60 text-slate-300 hover:text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            >
              <ShoppingCart className="w-4 h-4 text-purple-400" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs uppercase tracking-wider neon-glow-btn"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : paymentMethod === 'ez_cash' ? (
                <>Verify eZ Cash ({formatCurrency(calculatePackagePrice(selectedPkg, userRole))}) & Top-Up</>
              ) : (
                <>Pay {formatCurrency(calculatePackagePrice(selectedPkg, userRole))} & Recharge Now</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Processing Preloader Modal */}
      <OrderProcessingModal
        isOpen={isProcessingOrder}
        packageName={selectedPkg?.package_name}
        playerUid={verifiedPlayerUid || undefined}
        playerNickname={verifiedPlayerNickname || undefined}
        amount={selectedPkg ? calculatePackagePrice(selectedPkg, userRole) : undefined}
        paymentMethod={paymentMethod}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={generatedReceipt}
        onClose={() => setGeneratedReceipt(null)}
      />
    </div>
  );
}

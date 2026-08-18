'use client';

import { useState } from 'react';
import { Package, UserRole } from '@/types/database';
import { calculatePackagePrice } from '@/lib/pricing';
import { Diamond, Check, ShieldAlert, CreditCard, Landmark, Upload, Loader2 } from 'lucide-react';

interface Props {
  packages: Package[];
  userRole?: UserRole;
  verifiedPlayerUid?: string | null;
  onCheckoutComplete?: () => void;
}

export default function PackageSelector({ packages, userRole, verifiedPlayerUid, onCheckoutComplete }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank_transfer'>('paypal');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        if (data.success && data.approveUrl) {
          // Note: PayPal orders should typically be inserted upon successful redirect return,
          // but for now we insert it as PENDING before redirecting
          await supabase.from('orders').insert([{ user_id: userId, total_amount: price, status: 'pending' }]);
          await supabase.from('purchase_transactions').insert([{
            user_id: userId, package_id: selectedPkg.id, free_fire_player_id: verifiedPlayerUid,
            shells_deducted: selectedPkg.shell_cost, price_paid: price, price_tier: tier,
            status: 'pending', payment_method: 'paypal', paypal_order_id: data.orderId
          }]);
          window.location.href = data.approveUrl;
        } else {
          setMessage({ type: 'error', text: data.message || 'PayPal payment setup failed' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Network error connecting to PayPal' });
      } finally {
        setLoading(false);
      }
    } else {
      // Bank Transfer with Receipt Upload
      if (!receiptFile) {
        setMessage({ type: 'error', text: 'Please select your bank payment receipt image' });
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('receipt', receiptFile);

        const uploadRes = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          
          // Insert into Database!
          const receiptUrl = uploadData.url;
          
          // 1. Insert into orders table
          const { error: orderErr } = await supabase.from('orders').insert([{
            user_id: userId,
            total_amount: price,
            status: 'pending',
            receipt_path: receiptUrl
          }]);

          // 2. Insert into purchase_transactions table
          const { error: txErr } = await supabase.from('purchase_transactions').insert([{
            user_id: userId,
            package_id: selectedPkg.id,
            package_name: selectedPkg.package_name, // Some schemas use this if package_id isn't strictly enforced
            free_fire_player_id: verifiedPlayerUid,
            shells_deducted: selectedPkg.shell_cost,
            price_paid: price,
            price_tier: tier,
            status: 'pending',
            payment_method: 'bank_transfer',
            receipt_path: receiptUrl
          }]);

          if (orderErr || txErr) {
            console.error('DB Insert Error:', orderErr, txErr);
            setMessage({ type: 'error', text: 'Order created but database insertion failed due to strict constraints.' });
          } else {
            setMessage({
              type: 'success',
              text: 'Bank receipt submitted successfully! Admin will verify your top-up shortly.',
            });
            setSelectedPkg(null);
            setReceiptFile(null);
            if (onCheckoutComplete) onCheckoutComplete();
          }
        } else {
          setMessage({ type: 'error', text: uploadData.message || 'Receipt upload failed' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Error uploading receipt' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">2. Select Diamond Package</h3>
        <p className="text-xs text-slate-400">Choose your desired diamond recharge amount</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedPkg?.id === pkg.id;
          const finalPrice = calculatePackagePrice(pkg, userRole);
          const hasDiscount = userRole && userRole !== 'normal' && finalPrice < pkg.normal_price;

          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Diamond className="w-5 h-5 fill-cyan-400/20" />
                </div>
                <h4 className="font-bold text-white text-base leading-snug">{pkg.package_name}</h4>
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  {pkg.diamond_amount} Diamonds
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-lg text-white font-mono">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-500 line-through font-mono">
                      ${pkg.normal_price.toFixed(2)}
                    </span>
                  )}
                </div>
                {userRole && userRole !== 'normal' && (
                  <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                    {userRole.toUpperCase()} Reseller Price
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPkg && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <h3 className="text-lg font-bold text-white">3. Select Payment Method & Checkout</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <span className="font-bold text-white block text-sm">PayPal Express</span>
                <span className="text-xs text-slate-400">Instant Automated Top-Up</span>
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
                <span className="font-bold text-white block text-sm">Bank Transfer</span>
                <span className="text-xs text-slate-400">Manual Receipt Verification</span>
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

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>Pay ${calculatePackagePrice(selectedPkg, userRole).toFixed(2)} & Recharge Now</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

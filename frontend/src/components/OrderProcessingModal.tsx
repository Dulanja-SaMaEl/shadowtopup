'use client';

import React from 'react';
import { ShieldCheck, Lock, Loader2, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  packageName?: string;
  playerUid?: string;
  playerNickname?: string;
  amount?: number;
  paymentMethod?: string;
}

export default function OrderProcessingModal({
  isOpen,
  packageName,
  playerUid,
  playerNickname,
  amount,
  paymentMethod,
}: Props) {
  if (!isOpen) return null;

  const isDialogPay = paymentMethod === 'dialog_pay';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl text-center space-y-5 overflow-hidden">
        
        {/* Top Status & Security Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono font-medium text-slate-300">
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {isDialogPay ? '256-Bit SSL Encrypted • Dialog Axiata IPG' : 'Automated Top-Up System • Official Garena API'}
          </span>
        </div>

        {/* Central Clean State Indicator */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center relative">
            {isDialogPay ? (
              <CreditCard className="w-7 h-7 text-purple-400" />
            ) : (
              <Sparkles className="w-7 h-7 text-emerald-400" />
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0c0d14] border border-white/10 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            </div>
          </div>
        </div>

        {/* Heading & Contextual Subtext */}
        <div className="space-y-1.5">
          <h2 id="order-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isDialogPay ? 'Connecting to Dialog Pay' : 'Processing Your Top-Up'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isDialogPay
              ? 'Opening Dialog Axiata secure gateway (Visa, Mastercard, Genie & eZ Cash). Please complete your payment on the portal.'
              : 'Securing server route and dispatching in-game items directly to your Free Fire account.'}
          </p>
        </div>

        {/* Order Details Summary Card */}
        {(packageName || playerUid || amount !== undefined) && (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-3.5 text-left text-xs space-y-2 font-mono">
            {packageName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Package</span>
                <span className="text-white font-medium truncate max-w-[200px]">{packageName}</span>
              </div>
            )}
            {playerUid && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Player UID</span>
                <span className="text-emerald-400 font-semibold">{playerUid}</span>
              </div>
            )}
            {playerNickname && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">Player Name</span>
                <span className="text-slate-200 font-medium truncate max-w-[200px]">{playerNickname}</span>
              </div>
            )}
            {amount !== undefined && (
              <div className="flex justify-between items-center border-t border-white/[0.06] pt-2">
                <span className="text-slate-400 text-[11px]">Total Due</span>
                <span className="text-white font-bold text-sm">LKR {Number(amount).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Reassurance Callout Box */}
        <div className={`p-3 rounded-xl border text-left flex items-start gap-2.5 text-xs ${
          isDialogPay
            ? 'bg-purple-950/20 border-purple-500/20 text-purple-200'
            : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
        }`}>
          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDialogPay ? 'text-purple-400' : 'text-amber-400'}`} />
          <div className="leading-snug text-[11px]">
            <strong className="block font-semibold">
              {isDialogPay ? 'Fulfillment after payment completion' : 'Please keep this tab open'}
            </strong>
            <span className="text-slate-300">
              {isDialogPay
                ? 'Your top-up will be credited automatically once your payment is confirmed by the gateway.'
                : 'Your certified transaction receipt will display automatically as soon as delivery is finalized.'}
            </span>
          </div>
        </div>

        {/* Bottom Status Indicator */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>
            {isDialogPay ? 'Redirecting to payment portal...' : 'Finalizing order verification...'}
          </span>
        </div>
      </div>
    </div>
  );
}

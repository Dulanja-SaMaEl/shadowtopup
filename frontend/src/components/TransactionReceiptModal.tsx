'use client';

import { useState } from 'react';
import {
  Check,
  FileText,
  Calendar,
  Package,
  Gamepad2,
  User,
  Hash,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Zap,
  Shield,
  Headphones,
  Heart,
  QrCode,
  ChevronRight,
  Download,
  Printer,
  X,
  RotateCcw,
  Clock,
  Store,
  Award,
  Mail,
  ExternalLink,
} from 'lucide-react';

export interface ReceiptData {
  orderId: string;
  packageName: string;
  playerUid: string;
  playerNickname?: string;
  transactionId?: string;
  itemsDelivered?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  date: string;
  time?: string;
  customerName?: string;
  customerEmail?: string;
  storeName?: string | null;
  resellerRole?: string | null;
  receiptUrl?: string | null;
}

interface Props {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function TransactionReceiptModal({ receipt, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);

  if (!receipt) return null;

  const isRefunded = receipt.status?.toLowerCase().includes('refund');
  const isPending =
    !isRefunded &&
    (receipt.status?.toLowerCase().includes('pending') || receipt.status === 'proof_submitted');

  const isReseller = Boolean(
    receipt.storeName || (receipt.resellerRole && receipt.resellerRole !== 'normal')
  );

  // Format payment method cleanly
  const rawMethod = (receipt.paymentMethod || '').toLowerCase();
  let paymentMethodLabel = 'SHADOW WALLET (INSTANT)';
  if (rawMethod.includes('ez_cash') || rawMethod.includes('ez cash')) {
    paymentMethodLabel = 'DIALOG EZ CASH (INSTANT)';
  } else if (rawMethod.includes('bank')) {
    paymentMethodLabel = 'BANK TRANSFER (MANUAL)';
  } else if (rawMethod.includes('paypal')) {
    paymentMethodLabel = 'PAYPAL (ONLINE)';
  } else if (rawMethod.includes('wallet')) {
    paymentMethodLabel = 'SHADOW WALLET (INSTANT)';
  } else if (receipt.paymentMethod) {
    paymentMethodLabel = `${receipt.paymentMethod.toUpperCase()} (VERIFIED)`;
  }

  // Format Amount Paid
  const formattedAmount = `LKR ${Number(receipt.amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Date and Time
  const formattedDateTime = receipt.time
    ? `${receipt.date} • ${receipt.time}`
    : receipt.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Store Name
  const storeDisplay = receipt.storeName || 'Shadow Store';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) {
      window.print();
      return;
    }

    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#070a13',
        useCORS: true,
        logging: false,
        windowWidth: 600,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          const link = document.createElement('a');
          link.download = `ShadowStore_Receipt_${receipt.orderId || 'Order'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setDownloading(false);
          return;
        }

        const fileName = `ShadowStore_Receipt_${receipt.orderId || 'Order'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Order Receipt #${receipt.orderId}`,
              text: `Official Transaction Receipt #${receipt.orderId}`,
            });
            setDownloading(false);
            return;
          } catch (shareErr) {
            // Fallback to direct download
          }
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error generating receipt image:', err);
      window.print();
      setDownloading(false);
    }
  };

  return (
    <div className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-transparent print:static print:block">
      {/* Dynamic Print CSS for exact 1-page high-fidelity output */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          nav, header, footer, aside, [role="navigation"], .print\\:hidden {
            display: none !important;
          }
          html, body {
            background: #070a13 !important;
            color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            width: 100% !important;
          }
          .receipt-modal-backdrop {
            position: relative !important;
            inset: auto !important;
            background: #070a13 !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            z-index: 1 !important;
          }
          .receipt-modal-card {
            border: 1px solid #1e293b !important;
            border-radius: 28px !important;
            margin: 0 auto !important;
            max-width: 580px !important;
            background-color: #070a13 !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          #printable-receipt {
            display: block !important;
            background-color: #070a13 !important;
            color: #ffffff !important;
            padding: 24px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 580px !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `,
        }}
      />

      <div className="receipt-modal-card relative w-full max-w-lg bg-[#070a13] border border-slate-800/90 rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-purple-950/20 max-h-[92vh] flex flex-col my-auto overflow-hidden print:border-none print:shadow-none print:my-0 print:max-h-none">
        {/* Top Header Action Bar (Screen Only - Sticky pinned at top) */}
        <div className="sticky top-0 z-20 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-[#0c101c] print:hidden">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 font-mono tracking-wider truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">RECEIPT #{receipt.orderId?.toUpperCase() || 'CONFIRMED'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all shrink-0 ml-2"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER (Scrolls smoothly on mobile, fully visible) */}
        <div
          id="printable-receipt"
          className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 text-white bg-[#070a13] font-sans overflow-y-auto flex-1 min-h-0 print:overflow-visible print:p-6"
        >
          {/* Reseller Shop Banner (Displayed when issued by a Reseller) */}
          {isReseller && (
            <div className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-cyan-950/60 border border-purple-800/40 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-purple-300 block truncate">
                    ISSUED BY RESELLER:
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate block">
                    {receipt.storeName || 'OFFICIAL RESELLER STORE'}
                  </span>
                </div>
              </div>
              {receipt.resellerRole && receipt.resellerRole !== 'normal' && (
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Award className="w-3 h-3 text-amber-400" />
                  {receipt.resellerRole === 'gold'
                    ? 'ELITE RESELLER'
                    : receipt.resellerRole === 'silver'
                    ? 'STANDARD RESELLER'
                    : receipt.resellerRole === 'admin'
                    ? 'ELITE RESELLER (ADMIN)'
                    : receipt.resellerRole.toUpperCase()}
                </span>
              )}
            </div>
          )}

          {/* Top Status & Glowing Icon */}
          <div className="flex flex-col items-center text-center space-y-2.5 sm:space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              {/* Radial glow */}
              <div
                className={`absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full blur-xl ${
                  isRefunded
                    ? 'bg-purple-500/30'
                    : isPending
                    ? 'bg-amber-500/30'
                    : 'bg-emerald-500/30'
                }`}
              />
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg relative z-10 border-2 ${
                  isRefunded
                    ? 'bg-purple-600 border-purple-400 text-white shadow-purple-500/40'
                    : isPending
                    ? 'bg-amber-500 border-amber-300 text-white shadow-amber-500/40'
                    : 'bg-[#22c55e] border-emerald-400 text-white shadow-emerald-500/50'
                }`}
              >
                {isRefunded ? (
                  <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
                ) : isPending ? (
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] animate-pulse" />
                ) : (
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3.5]" />
                )}
              </div>
            </div>

            <div className="space-y-1 max-w-sm px-2">
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider">
                {isRefunded
                  ? 'TRANSACTION REFUNDED'
                  : isPending
                  ? 'PAYMENT PENDING VERIFICATION'
                  : 'TRANSACTION COMPLETED'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium">
                {isRefunded
                  ? `Package unavailable for player account. Payment of ${formattedAmount} was fully refunded to your wallet.`
                  : isPending
                  ? 'Your payment proof was uploaded and is currently under review by our team.'
                  : 'Your payment has been successfully verified and the selected package has been delivered to your Free Fire account.'}
              </p>
            </div>
          </div>

          {/* Details Card Rows (100% Mobile & PC Responsive with Flex-Wrap) */}
          <div className="space-y-2 sm:space-y-2.5 pt-1">
            {/* ORDER RECEIPT ID */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  ORDER RECEIPT ID
                </span>
              </div>
              <span className="font-mono font-bold text-white text-xs sm:text-sm text-left xs:text-right break-all">
                #{receipt.orderId?.toUpperCase()}
              </span>
            </div>

            {/* DATE & TIME */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  DATE & TIME
                </span>
              </div>
              <span className="font-mono text-slate-300 text-xs sm:text-sm text-left xs:text-right">
                {formattedDateTime}
              </span>
            </div>

            {/* PACKAGE NAME */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  PACKAGE NAME
                </span>
              </div>
              <span className="font-mono font-extrabold text-cyan-400 text-xs sm:text-sm uppercase tracking-wide text-left xs:text-right break-words">
                {receipt.packageName}
              </span>
            </div>

            {/* ITEMS DELIVERED (if specified) */}
            {receipt.itemsDelivered && receipt.itemsDelivered !== receipt.packageName && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    ITEMS DELIVERED
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm text-left xs:text-right break-words">
                  {receipt.itemsDelivered}
                </span>
              </div>
            )}

            {/* FREE FIRE PLAYER UID */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <Gamepad2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  FREE FIRE PLAYER UID
                </span>
              </div>
              <span className="font-mono font-extrabold text-cyan-400 text-xs sm:text-sm text-left xs:text-right break-all">
                {receipt.playerUid}
              </span>
            </div>

            {/* PLAYER NICKNAME */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  PLAYER NICKNAME
                </span>
              </div>
              <span className="font-bold text-cyan-400 text-xs sm:text-sm text-left xs:text-right break-words">
                {receipt.playerNickname || `UID: ${receipt.playerUid}`}
              </span>
            </div>

            {/* GARENA TRX ID */}
            {receipt.transactionId && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    GARENA TRX ID
                  </span>
                </div>
                <span className="font-mono font-bold text-purple-400 text-xs sm:text-sm text-left xs:text-right break-all">
                  {receipt.transactionId}
                </span>
              </div>
            )}

            {/* PAYMENT METHOD */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                  PAYMENT METHOD
                </span>
              </div>
              <span className="font-mono font-bold text-purple-300 text-xs sm:text-sm uppercase text-left xs:text-right">
                {paymentMethodLabel}
              </span>
            </div>

            {/* RESELLER SHOP NAME (If Reseller) */}
            {isReseller && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    RESELLER SHOP
                  </span>
                </div>
                <span className="font-bold text-cyan-300 text-xs sm:text-sm uppercase text-left xs:text-right break-words">
                  {receipt.storeName || 'OFFICIAL RESELLER STORE'}
                </span>
              </div>
            )}

            {/* CUSTOMER NAME (Always displayed, or customer only if not a reseller) */}
            {receipt.customerName && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    CUSTOMER
                  </span>
                </div>
                <span className="font-bold text-white text-xs sm:text-sm uppercase text-left xs:text-right break-words">
                  {receipt.customerName}
                </span>
              </div>
            )}

            {/* CUSTOMER EMAIL (if available) */}
            {receipt.customerEmail && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    EMAIL
                  </span>
                </div>
                <span className="font-mono text-slate-300 text-xs text-left xs:text-right break-all">
                  {receipt.customerEmail}
                </span>
              </div>
            )}

            {/* PAYMENT RECEIPT PROOF (if uploaded via bank transfer) */}
            {receipt.receiptUrl && (
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 py-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase">
                    PAYMENT PROOF
                  </span>
                </div>
                <a
                  href={receipt.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 underline text-left xs:text-right"
                >
                  <span>View Bank Slip</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* AMOUNT PAID BOX */}
          <div className="rounded-2xl bg-[#091122]/90 border border-slate-800/80 p-3.5 sm:p-4 md:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-[11px] sm:text-xs font-mono font-extrabold uppercase tracking-wider text-slate-300">
                AMOUNT PAID
              </span>
            </div>
            <span className="text-lg sm:text-2xl font-black font-mono text-[#818cf8] shrink-0">
              {formattedAmount}
            </span>
          </div>

          {/* 4 TRUST / FEATURE BADGES ROW (100% Mobile Responsive Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-slate-300">
                <span>Secure</span>
                <span className="block text-slate-400">Payment</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-slate-300">
                <span>Instant</span>
                <span className="block text-slate-400">Delivery</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-slate-300">
                <span>Verified</span>
                <span className="block text-slate-400">Order</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-slate-300">
                <span>Support</span>
                <span className="block text-slate-400">24/7</span>
              </div>
            </div>
          </div>

          {/* FOOTER ROW */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-slate-800/80">
            {/* Thank you note */}
            <div className="flex items-start gap-2.5 max-w-xs">
              <Heart className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 leading-snug">
                <p>
                  Thank you for choosing{' '}
                  <strong className="text-purple-400 font-bold">{storeDisplay}</strong>.
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Please keep this receipt for future reference.
                </p>
              </div>
            </div>

            {/* Verify Receipt QR Widget */}
            <div className="w-full sm:w-auto p-2.5 rounded-xl bg-[#0b101c] border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-white">
                  <span>Verify Receipt</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">
                  Official certified transaction proof.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer (Screen Only - Sticky pinned at bottom) */}
        <div className="sticky bottom-0 z-20 shrink-0 p-3 sm:p-4 md:p-5 bg-[#0c101c] border-t border-slate-800/80 flex flex-col sm:flex-row gap-2 sm:gap-3 print:hidden">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Receipt Image...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save Receipt (PNG)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

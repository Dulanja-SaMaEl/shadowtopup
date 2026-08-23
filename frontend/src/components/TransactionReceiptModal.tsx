'use client';

import { useState } from 'react';
import { ShieldCheck, Download, Printer, X, Zap, Award, CheckCircle2, Clock, FileText, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';

export interface ReceiptData {
  orderId: string;
  packageName: string;
  playerUid: string;
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
  const isPending = !isRefunded && (receipt.status?.toLowerCase().includes('pending') || receipt.status === 'proof_submitted');
  const isWallet = receipt.paymentMethod?.toLowerCase().includes('wallet');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloading(true);
    // Print window triggers PDF save in modern browsers
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 300);
  };

  return (
    <div className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-transparent print:static print:block">
      {/* Dynamic Print CSS override to guarantee exact 1 page print with zero blank extra pages */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: fixed !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 580px !important;
            margin: 0 !important;
            padding: 24px !important;
            background-color: #0e0c1f !important;
            color: #ffffff !important;
            border: 2px solid #5b21b6 !important;
            border-radius: 20px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      ` }} />

      <div className="receipt-modal-card relative w-full max-w-lg bg-[#0e0c1f] border border-purple-900/60 rounded-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0">
        
        {/* Top Header Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#141229] print:hidden">
          <div className="flex items-center gap-2 text-xs font-black text-slate-200 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-cyan-400" /> Digital Order Receipt
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <X className="w-4 h-4 text-red-400" /> CLOSE
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 text-white bg-[#0e0c1f]">
          
          {/* Brand Header & Reseller Store Name */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">
                  SHADOW<span className="text-cyan-400">STORE</span>
                </h3>
                <p className="text-[9px] text-slate-400 font-mono">OFFICIAL RECHARGE INVOICE</p>
              </div>
            </div>

            {/* Reseller Custom Store Branding Badge */}
            {receipt.storeName ? (
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-900/40 border border-purple-500/40 text-right">
                <span className="text-[9px] font-mono font-bold text-purple-300 uppercase block tracking-wider">
                  ISSUED BY STORE:
                </span>
                <span className="text-xs font-black text-cyan-300 font-mono uppercase tracking-wide">
                  {receipt.storeName}
                </span>
              </div>
            ) : receipt.resellerRole && receipt.resellerRole !== 'normal' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                CERTIFIED RESELLER
              </span>
            ) : null}
          </div>

          {/* Verification Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isRefunded
              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
              : isPending
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {isRefunded ? (
              <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            ) : isPending ? (
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isRefunded
                    ? 'PACKAGE UNAVAILABLE - FULLY REFUNDED TO SHADOW WALLET'
                    : isPending
                    ? 'PAYMENT PENDING ADMIN VERIFICATION'
                    : 'TRANSACTION COMPLETED & DELIVERED'}
                </h4>
              </div>
              <p className="text-[10px] font-mono mt-0.5 text-slate-300">
                {isRefunded
                  ? `This top-up package was unavailable for your player account. The full payment of LKR ${receipt.amount.toFixed(2)} has been credited back to your Shadow Wallet.`
                  : isPending
                  ? 'Your bank transfer receipt is uploaded and currently under manual verification by our admin team. Top-up will be processed shortly.'
                  : 'Order paid successfully and digital diamonds/pass dispatched to target Free Fire UID.'}
              </p>
            </div>
          </div>

          {/* Order Data Summary Table */}
          <div className="space-y-3 bg-[#141229] border border-slate-800 p-5 rounded-2xl font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">ORDER RECEIPT ID</span>
              <span className="font-bold text-white uppercase">#{receipt.orderId}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">DATE & TIME</span>
              <span className="text-slate-200">{receipt.date} {receipt.time || ''}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">PACKAGE NAME</span>
              <span className="font-bold text-cyan-400 uppercase">{receipt.packageName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">FREE FIRE PLAYER UID</span>
              <span className="font-bold text-amber-400">{receipt.playerUid}</span>
            </div>

            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">PAYMENT METHOD</span>
              <span className="font-bold text-purple-300 uppercase">
                {isWallet ? 'SHADOW WALLET (INSTANT)' : 'BANK TRANSFER (MANUAL)'}
              </span>
            </div>

            {receipt.customerName && (
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">CUSTOMER</span>
                <span className="text-slate-200 uppercase">{receipt.customerName}</span>
              </div>
            )}

            <div className="flex justify-between pt-1 text-sm font-bold">
              <span className="text-slate-300">TOTAL AMOUNT PAID</span>
              <span className="text-emerald-400">{formatCurrency(receipt.amount)}</span>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-[10px] text-slate-400 font-mono">
              Thank you for purchasing with ShadowStore. Keep this digital receipt for your reference.
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              Independent Third-Party Top-Up Platform • All rights reserved.
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 bg-[#141229] border-t border-slate-800 flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download / Save Receipt PDF
          </button>

          <button
            onClick={handlePrint}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-500/30 flex items-center justify-center gap-2 transition-all"
          >
            <X className="w-4 h-4 text-red-400" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  Ticket,
  Zap,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Smartphone,
  Info,
} from 'lucide-react';

interface ShadowWalletWidgetProps {
  userId: string;
}

export default function ShadowWalletWidget({ userId }: ShadowWalletWidgetProps) {
  const [activeTab, setActiveTab] = useState<'ezcash' | 'voucher'>('ezcash');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Voucher Form State
  const [redeemCode, setRedeemCode] = useState('');
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  // eZ Cash Form State
  const [ezCashTrxId, setEzCashTrxId] = useState('');
  const [submittingEzCash, setSubmittingEzCash] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ezCashNumber = process.env.NEXT_PUBLIC_EZCASH_NUMBER || '0765604635';
  const ezCashName = process.env.NEXT_PUBLIC_EZCASH_NAME || 'Shadow Store';

  const fetchWallet = async () => {
    if (!userId || userId === 'demo-user') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/balance?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setBalance(data.wallet_balance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error('Error fetching wallet balance:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallet();
  }, [userId]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(ezCashNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleEzCashDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrx = ezCashTrxId.trim();
    if (!cleanTrx) return;

    setSubmittingEzCash(true);
    setMsg(null);
    try {
      const res = await fetch('/api/wallet/deposit/ezcash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: cleanTrx,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        setEzCashTrxId('');
        await fetchWallet();
      } else {
        setMsg({ type: 'error', text: data.message || 'Verification failed. Please check your Transaction ID.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Network connection error. Please try again.' });
    }
    setSubmittingEzCash(false);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setSubmittingVoucher(true);
    setMsg(null);
    try {
      const res = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: redeemCode.trim(),
          user_id: userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        setRedeemCode('');
        await fetchWallet();
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to redeem code' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Network error occurred. Please try again.' });
    }
    setSubmittingVoucher(false);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#141229] via-[#0c0a1a] to-[#120f26] border border-purple-950/60 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Shadow Wallet Balance</h3>
            <p className="text-xs text-slate-400">Instant Free Fire top-ups and reseller checkout without bank slips.</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Current Balance</span>
          <h2 className="text-3xl font-black text-emerald-400 font-mono">
            LKR {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Deposit Modes Navigation */}
      <div className="flex gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative z-10">
        <button
          type="button"
          onClick={() => { setActiveTab('ezcash'); setMsg(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ezcash'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
          <span>eZ Cash Instant Deposit</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('voucher'); setMsg(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'voucher'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-purple-300" />
          <span>Redeem Voucher Code</span>
        </button>
      </div>

      {/* Tab 1: Dialog eZ Cash Instant Deposit */}
      {activeTab === 'ezcash' && (
        <div className="space-y-4 relative z-10">
          {/* Merchant Transfer Details Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-950/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Dialog eZ Cash Recipient
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-extrabold text-white tracking-wider">
                  {ezCashNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1 border border-emerald-500/30 transition-all"
                >
                  {copiedNumber ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="text-xs text-slate-400 block font-medium">Account Name: <strong className="text-slate-200">{ezCashName}</strong></span>
            </div>

            <div className="text-xs text-slate-400 sm:max-w-xs space-y-0.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-300 block flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" /> How to Deposit:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                1. Transfer any amount to <strong>{ezCashNumber}</strong> via eZ Cash.<br />
                2. Enter the <strong>TxID</strong> from the Dialog SMS below. Funds will be added instantly!
              </p>
            </div>
          </div>

          <form onSubmit={handleEzCashDeposit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="Enter eZ Cash TxID (e.g. DAL3CHJ361)"
                value={ezCashTrxId}
                onChange={(e) => setEzCashTrxId(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#0e0c1f] border border-emerald-950/80 rounded-xl text-white font-mono uppercase placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400 tracking-wider"
              />
              <button
                type="submit"
                disabled={submittingEzCash}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {submittingEzCash ? (
                  'Verifying TxID...'
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" /> Verify & Credit Wallet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Redeem Voucher Code */}
      {activeTab === 'voucher' && (
        <form onSubmit={handleRedeem} className="space-y-3 relative z-10">
          <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-purple-400" /> Enter Gift Voucher Code
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Enter Code (e.g. SHADOW-XXXX-XXXX-XXXX)"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#0e0c1f] border border-purple-950/80 rounded-xl text-white font-mono uppercase placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 tracking-wider"
            />
            <button
              type="submit"
              disabled={submittingVoucher}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {submittingVoucher ? 'Redeeming...' : <><Send className="w-3.5 h-3.5" /> Redeem Code</>}
            </button>
          </div>
        </form>
      )}

      {/* Notification Toast */}
      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono relative z-10 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Wallet History Audit Trail */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80 relative z-10">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Recent Wallet Activity</h4>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-xs text-slate-500 font-mono text-center py-4">Loading activity...</p>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono text-center py-4">No wallet transactions yet. Deposit via eZ Cash or redeem a code above!</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs font-sans">{tx.description}</span>
                    <span className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold block text-xs ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}LKR {Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Bal: LKR {Number(tx.balance_after).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

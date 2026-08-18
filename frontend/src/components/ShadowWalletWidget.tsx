'use client';

import { useState, useEffect } from 'react';
import { Wallet, Ticket, Plus, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Send } from 'lucide-react';

interface ShadowWalletWidgetProps {
  userId: string;
}

export default function ShadowWalletWidget({ userId }: ShadowWalletWidgetProps) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWallet = async () => {
    if (!userId) return;
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

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setSubmitting(true);
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
    setSubmitting(false);
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
            <p className="text-xs text-slate-400">Use your wallet balance to instantly buy Free Fire diamonds & passes without payment gateways.</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Current Balance</span>
          <h2 className="text-3xl font-black text-emerald-400 font-mono">
            LKR {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Redeem Voucher Code Form */}
      <form onSubmit={handleRedeem} className="space-y-3 relative z-10">
        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-purple-400" /> Redeem Gift Voucher Code
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
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Redeeming...' : <><Send className="w-3.5 h-3.5" /> Redeem Code</>}
          </button>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}
      </form>

      {/* Wallet History Audit Trail */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80 relative z-10">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Recent Wallet Activity</h4>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-xs text-slate-500 font-mono text-center py-4">Loading activity...</p>
          ) : transactions.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono text-center py-4">No wallet transactions yet. Redeem a voucher code above!</p>
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

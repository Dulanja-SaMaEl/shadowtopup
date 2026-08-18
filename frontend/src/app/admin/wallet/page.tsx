'use client';

import { useState, useEffect } from 'react';
import { Wallet, Ticket, Plus, Copy, Check, Search, RefreshCw, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RedeemCode {
  id: string;
  code: string;
  amount: number;
  is_redeemed: boolean;
  redeemed_by?: string;
  redeemed_at?: string;
  created_at: string;
  profiles?: { email?: string; name?: string };
}

export default function AdminWalletPage() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateAmount, setGenerateAmount] = useState('1000');
  const [generateCount, setGenerateCount] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiError, setApiError] = useState<string | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/admin/redeem-codes');
      const data = await res.json();
      if (data.success && data.codes) {
        setCodes(data.codes);
      } else if (data.message) {
        setApiError(data.message);
      }
    } catch (err: any) {
      console.error('Error fetching redeem codes:', err);
      setApiError('Failed to fetch redeem codes from API');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setApiError(null);
    try {
      const res = await fetch('/api/admin/redeem-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(generateAmount),
          count: parseInt(generateCount) || 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await loadCodes();
      } else {
        setApiError(data.message || 'Error generating codes');
      }
    } catch (err: any) {
      console.error('Error generating codes:', err);
      setApiError('Network connection error');
    }
    setGenerating(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = codes.filter((c) => {
    if (statusFilter === 'active' && c.is_redeemed) return false;
    if (statusFilter === 'redeemed' && !c.is_redeemed) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchUser = c.profiles?.email?.toLowerCase().includes(q) || c.profiles?.name?.toLowerCase().includes(q);
      if (!matchCode && !matchUser) return false;
    }
    return true;
  });

  const totalValueGenerated = codes.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const activeCount = codes.filter((c) => !c.is_redeemed).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Shadow Wallet & Redeem Codes</h1>
          <p className="text-xs text-slate-400 mt-1">Generate cryptographically secure redeem codes for customers to credit their Shadow Wallet balance.</p>
        </div>

        <button
          onClick={loadCodes}
          className="px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Codes
        </button>
      </div>

      {apiError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" /> Supabase Database Notice
          </div>
          <p className="text-xs font-mono">{apiError}</p>
          {apiError.includes('does not exist') && (
            <p className="text-xs text-slate-300 font-sans">
              👉 Please copy and run the SQL migration script (found in <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">supabase_shadow_wallet.sql</code>) inside your <strong>Supabase SQL Editor</strong> to create the <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">redeem_codes</code> table!
            </p>
          )}
        </div>
      )}

      {/* Generator Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleGenerate} className="lg:col-span-2 p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Ticket className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Generate Redeem Codes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Code Value (LKR)</label>
              <input
                type="number"
                required
                min="10"
                step="10"
                value={generateAmount}
                onChange={(e) => setGenerateAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity to Generate</label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={generateCount}
                onChange={(e) => setGenerateCount(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Generate {generateCount} Code(s)</>}
          </button>
        </form>

        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Code Statistics</span>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Total Issued Value:</span>
              <h3 className="text-2xl font-black text-emerald-400 font-mono">
                LKR {totalValueGenerated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800 font-mono text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Active Codes</span>
              <span className="font-bold text-cyan-400">{activeCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Redeemed</span>
              <span className="font-bold text-amber-400">{codes.length - activeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code List Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Generated Redeem Voucher Codes</h3>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-mono"
            >
              <option value="all">All Codes</option>
              <option value="active">Active (Unredeemed)</option>
              <option value="redeemed">Redeemed</option>
            </select>

            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Search Code or User..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Redeem Code</th>
                <th className="p-4">Value (LKR)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Redeemed By</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Loading redeem codes...
                  </td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No redeem codes found. Generate some above!
                  </td>
                </tr>
              ) : (
                filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-cyan-300 text-xs">
                      {c.code}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      LKR {Number(c.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          c.is_redeemed
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {c.is_redeemed ? 'REDEEMED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-sans">
                      {c.is_redeemed ? (
                        <div>
                          <span className="font-bold text-white text-xs block">{c.profiles?.name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.profiles?.email || 'User ID'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[10px]">Unclaimed</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-[10px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => copyToClipboard(c.code)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1"
                      >
                        {copiedCode === c.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedCode === c.code ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

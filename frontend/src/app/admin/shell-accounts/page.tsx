'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShellAccount } from '@/types/database';
import { ArrowLeft, RefreshCw, Plus, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

const mockShellAccounts: ShellAccount[] = [
  {
    id: 'acc-1',
    account_username: 'garena_main_supplier',
    password: '••••••••',
    available_balance: 14500,
    is_main: true,
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    account_username: 'garena_secondary_reseller',
    password: '••••••••',
    available_balance: 3200,
    is_main: false,
    last_synced_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function AdminShellAccountsPage() {
  const [accounts, setAccounts] = useState<ShellAccount[]>(mockShellAccounts);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncBalance = async (accId: string) => {
    setSyncingId(accId);
    setTimeout(() => {
      setAccounts(accounts.map(a => a.id === accId ? { ...a, last_synced_at: new Date().toISOString() } : a));
      setSyncingId(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Garena Shell Accounts Ledger</h1>
            <p className="text-xs text-slate-400">Manage automated shell balance pools and credentials</p>
          </div>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" /> Add Shell Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Garena Account</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {acc.account_username}
                  {acc.is_main && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      MAIN POOL
                    </span>
                  )}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Available Shells</span>
                <h4 className="text-2xl font-extrabold text-cyan-400 font-mono">
                  {acc.available_balance.toLocaleString()}
                </h4>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Synced: {new Date(acc.last_synced_at!).toLocaleTimeString()}
              </span>

              <button
                onClick={() => handleSyncBalance(acc.id)}
                disabled={syncingId === acc.id}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                {syncingId === acc.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sync Scraper Balance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

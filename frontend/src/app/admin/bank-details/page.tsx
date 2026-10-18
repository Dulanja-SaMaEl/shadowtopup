'use client';

import { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Shield,
  CreditCard,
  Building,
  Terminal,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string | null;
  instructions?: string | null;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

const COMMON_BANKS = [
  'Sampath Bank PLC',
  'Dialog Finance PLC',
  'Bank of Ceylon',
  'National Savings Bank (NSB)',
  'Commercial Bank of Ceylon',
  'Hatton National Bank (HNB)',
  'People\'s Bank',
  'Seylan Bank',
  'Nations Trust Bank (NTB)',
  'DFCC Bank',
  'National Development Bank (NDB)',
  'Pan Asia Bank',
  'Union Bank',
  'Amana Bank',
];

const DEFAULT_INSTRUCTIONS =
  'Please deposit or transfer the exact order amount. Upload a clear photo or screenshot of your deposit slip / mobile transaction confirmation receipt for instant order processing.';

export default function AdminBankDetailsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newBankName, setNewBankName] = useState('Commercial Bank of Ceylon');
  const [newCustomBankName, setNewCustomBankName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newInstructions, setNewInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [newIsActive, setNewIsActive] = useState(true);
  const [newDisplayOrder, setNewDisplayOrder] = useState('1');

  // Edit modal state
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editBankName, setEditBankName] = useState('');
  const [editCustomBankName, setEditCustomBankName] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editBranchName, setEditBranchName] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDisplayOrder, setEditDisplayOrder] = useState('1');

  // Delete modal state
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlMigration, setShowSqlMigration] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const fetchAccounts = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/bank-details');
      const data = await res.json();
      if (res.ok && data.success) {
        setAccounts(data.accounts || []);
      } else {
        showToast('error', data.message || 'Failed to fetch bank accounts');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAdd = () => {
    setNewBankName('Commercial Bank of Ceylon');
    setNewCustomBankName('');
    setNewAccountName('');
    setNewAccountNumber('');
    setNewBranchName('');
    setNewInstructions(DEFAULT_INSTRUCTIONS);
    setNewIsActive(true);
    setNewDisplayOrder(String(accounts.length + 1));
    setIsAddModalOpen(true);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankName = newBankName === 'Other' ? newCustomBankName.trim() : newBankName.trim();

    if (!finalBankName) {
      showToast('error', 'Please provide a valid bank name');
      return;
    }
    if (!newAccountName.trim()) {
      showToast('error', 'Please provide the account holder name');
      return;
    }
    if (!newAccountNumber.trim()) {
      showToast('error', 'Please provide the account number');
      return;
    }

    setSavingNew(true);
    try {
      const res = await fetch('/api/admin/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: finalBankName,
          account_name: newAccountName.trim(),
          account_number: newAccountNumber.trim(),
          branch_name: newBranchName.trim() || null,
          instructions: newInstructions.trim() || null,
          is_active: newIsActive,
          display_order: parseInt(newDisplayOrder, 10) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Bank account created successfully');
        setIsAddModalOpen(false);
        fetchAccounts();
      } else {
        showToast('error', data.message || 'Failed to create bank account');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Server connection error');
    } finally {
      setSavingNew(false);
    }
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    if (COMMON_BANKS.includes(acc.bank_name)) {
      setEditBankName(acc.bank_name);
      setEditCustomBankName('');
    } else {
      setEditBankName('Other');
      setEditCustomBankName(acc.bank_name);
    }
    setEditAccountName(acc.account_name);
    setEditAccountNumber(acc.account_number);
    setEditBranchName(acc.branch_name || '');
    setEditInstructions(acc.instructions || DEFAULT_INSTRUCTIONS);
    setEditIsActive(acc.is_active);
    setEditDisplayOrder(String(acc.display_order ?? 1));
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const finalBankName = editBankName === 'Other' ? editCustomBankName.trim() : editBankName.trim();

    if (!finalBankName) {
      showToast('error', 'Please provide a valid bank name');
      return;
    }
    if (!editAccountName.trim()) {
      showToast('error', 'Please provide the account holder name');
      return;
    }
    if (!editAccountNumber.trim()) {
      showToast('error', 'Please provide the account number');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAccount.id,
          bank_name: finalBankName,
          account_name: editAccountName.trim(),
          account_number: editAccountNumber.trim(),
          branch_name: editBranchName.trim() || null,
          instructions: editInstructions.trim() || null,
          is_active: editIsActive,
          display_order: parseInt(editDisplayOrder, 10) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'Bank account updated successfully');
        setEditingAccount(null);
        fetchAccounts();
      } else {
        showToast('error', data.message || 'Failed to update bank account');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Server connection error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (acc: BankAccount) => {
    try {
      const res = await fetch('/api/admin/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: acc.id,
          is_active: !acc.is_active,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === acc.id ? { ...a, is_active: !a.is_active } : a))
        );
        showToast(
          'success',
          `${acc.bank_name} marked as ${!acc.is_active ? 'Active' : 'Inactive'}`
        );
      } else {
        showToast('error', data.message || 'Failed to change status');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Server error');
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/bank-details?id=${encodeURIComponent(deletingAccount.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Bank account removed successfully');
        setDeletingAccount(null);
        fetchAccounts();
      } else {
        showToast('error', data.message || 'Failed to delete bank account');
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Server error');
    } finally {
      setIsDeleting(false);
    }
  };

  const sqlQuery = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL UNIQUE,
    branch_name TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bank_accounts_account_number_key'
    ) THEN
        ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_account_number_key UNIQUE (account_number);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active bank accounts" ON public.bank_accounts;
CREATE POLICY "Public can view active bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Admin and service role full access" ON public.bank_accounts;
CREATE POLICY "Admin and service role full access"
    ON public.bank_accounts FOR ALL
    USING (true)
    WITH CHECK (true);

GRANT ALL ON TABLE public.bank_accounts TO postgres, anon, authenticated, service_role;

INSERT INTO public.bank_accounts (bank_name, account_name, account_number, branch_name, instructions, is_active, display_order)
VALUES
    ('Sampath Bank PLC', 'D.I.R.D. WIJESINGHE', '118055314226', 'HEAD OFFICE', 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.', true, 1),
    ('Dialog Finance PLC', 'D.I.R.D. WIJESINGHE', '001023077550', 'HEAD OFFICE', 'Please deposit or transfer the exact order amount and upload a clear screenshot of the transfer confirmation.', true, 2),
    ('Bank of Ceylon', 'D.I.R.D. WIJESINGHE', '75566748', 'HAKMANA BRANCH', 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.', true, 3),
    ('National Savings Bank (NSB)', 'D.I.R.D. WIJESINGHE', '300058079751', 'HAKMANA BRANCH', 'Please deposit or transfer the exact order amount and upload a clear screenshot of the bank receipt/slip.', true, 4)
ON CONFLICT (account_number) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    branch_name = EXCLUDED.branch_name,
    instructions = EXCLUDED.instructions,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();`;

  const copySql = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(sqlQuery);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  const activeCount = accounts.filter((a) => a.is_active).length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border flex items-center gap-3 text-sm font-semibold shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/80 to-cyan-950/40 border border-purple-900/40 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-1">
            <Landmark className="w-4 h-4 text-purple-400" />
            <span>Payment Gateway & Banking Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            Bank Transfer Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure bank accounts displayed to customers during bank transfer checkout. Active accounts will appear automatically on the Direct Top-up and Cart pages.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => fetchAccounts(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
            title="Refresh bank accounts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Account</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</p>
            <p className="text-2xl font-black text-white mt-1">{accounts.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/40 text-purple-400">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active On Checkout</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Transfer Mode</p>
            <p className="text-xs font-bold text-cyan-300 mt-1">Manual Slip Verification</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-900/40 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SQL Migration Query Assistant Accordion */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-800/50 text-purple-300">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Supabase SQL Database Migration
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute this SQL query once in your Supabase SQL editor to create the permanent table and permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySql}
              className="px-3 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-850/60 border border-purple-700/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{sqlCopied ? 'SQL Copied!' : 'Copy SQL Query'}</span>
            </button>
            <button
              onClick={() => setShowSqlMigration(!showSqlMigration)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span>{showSqlMigration ? 'Hide Query' : 'View Query'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSqlMigration ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showSqlMigration && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-purple-200 overflow-x-auto max-h-60">
              <code>{sqlQuery}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Main Bank Accounts Table & Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Configured Bank Accounts</span>
            <span className="text-xs font-mono font-normal text-slate-400">({accounts.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-purple-400" />
            <p className="text-xs">Loading bank accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-900/40 text-purple-400 flex items-center justify-center mx-auto">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Bank Accounts Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven't configured any bank accounts yet. Click the button below to add your first bank details for customer transfers.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bank Account</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className={`p-5 rounded-xl border transition-all ${
                  acc.is_active
                    ? 'bg-slate-950/60 border-purple-900/40 hover:border-purple-600/50 shadow-md'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-white">
                        {acc.bank_name}
                      </span>
                      <button
                        onClick={() => handleToggleActive(acc)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          acc.is_active
                            ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:bg-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {acc.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                    {acc.branch_name && (
                      <p className="text-xs text-purple-300/80 font-medium">
                        Branch: {acc.branch_name}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700/50 hover:border-purple-600/40 text-slate-300 hover:text-purple-300 transition-all"
                      title="Edit Account Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingAccount(acc)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/50 hover:border-rose-600/40 text-slate-300 hover:text-rose-400 transition-all"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-black/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold text-white tracking-wide">{acc.account_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 tracking-wider text-sm">
                        {acc.account_number}
                      </span>
                      <button
                        onClick={() => copyToClipboard(acc.account_number, acc.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedId === acc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {acc.display_order !== undefined && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-500">
                      <span>Display Order:</span>
                      <span className="font-mono">#{acc.display_order}</span>
                    </div>
                  )}
                </div>

                {acc.instructions && (
                  <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50">
                    <strong className="text-slate-300">Instructions: </strong>
                    {acc.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD BANK ACCOUNT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-900/60 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Bank Account</h3>
                  <p className="text-xs text-slate-400">Configure banking details for checkout</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Bank Name *</label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-white">
                      {b}
                    </option>
                  ))}
                  <option value="Other" className="bg-slate-900 text-purple-300">
                    -- Other / Custom Bank --
                  </option>
                </select>
                {newBankName === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom bank name..."
                    value={newCustomBankName}
                    onChange={(e) => setNewCustomBankName(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Account Holder Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Shadow Store LK / John Doe"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Account Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 8009123456"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-emerald-400 font-mono tracking-wider focus:outline-none focus:border-purple-500 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Branch Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Colombo City / Kandy"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={newDisplayOrder}
                    onChange={(e) => setNewDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Payment Instructions for Customers</label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-slate-300 focus:outline-none focus:border-purple-500 text-xs resize-none"
                  placeholder="Instructions displayed to customers..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="newIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Activate immediately on checkout pages
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNew}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50"
                >
                  {savingNew ? 'Saving...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BANK ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-purple-900/60 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Bank Account</h3>
                  <p className="text-xs text-slate-400">Modify details for this banking channel</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Bank Name *</label>
                <select
                  value={editBankName}
                  onChange={(e) => setEditBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-white">
                      {b}
                    </option>
                  ))}
                  <option value="Other" className="bg-slate-900 text-purple-300">
                    -- Other / Custom Bank --
                  </option>
                </select>
                {editBankName === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom bank name..."
                    value={editCustomBankName}
                    onChange={(e) => setEditCustomBankName(e.target.value)}
                    className="mt-2 w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Account Holder Name *</label>
                <input
                  type="text"
                  value={editAccountName}
                  onChange={(e) => setEditAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Account Number *</label>
                <input
                  type="text"
                  value={editAccountNumber}
                  onChange={(e) => setEditAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-emerald-400 font-mono tracking-wider focus:outline-none focus:border-purple-500 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Branch Name (Optional)</label>
                  <input
                    type="text"
                    value={editBranchName}
                    onChange={(e) => setEditBranchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Payment Instructions for Customers</label>
                <textarea
                  rows={3}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-slate-300 focus:outline-none focus:border-purple-500 text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Account is Active for Customer Checkout
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-900/40 disabled:opacity-50"
                >
                  {savingEdit ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/60 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Bank Account?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-slate-800">
              Are you sure you want to remove <strong className="text-white">{deletingAccount.bank_name}</strong> ({deletingAccount.account_number})? Customers will no longer see this account for bank transfers.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-950/60 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

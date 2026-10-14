'use client';

import { useState, useEffect } from 'react';
import { ShellAccount } from '@/types/database';
import { Plus, Edit2, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, Zap, Shield, Save, Bookmark, Copy, ExternalLink, Check } from 'lucide-react';
import AdminStockEnduranceWidget from '@/components/AdminStockEnduranceWidget';

export default function AdminShellAccountsPage() {
  const [accounts, setAccounts] = useState<ShellAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<ShellAccount | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editAutocode, setEditAutocode] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Form states for Add
  const [username, setUsername] = useState('SHADOW_TOPUP1');
  const [password, setPassword] = useState('Shadow123@');
  const [autocode, setAutocode] = useState('5ZEEJ3VDKEXSSD6J');
  const [isMain, setIsMain] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bookmarklet modal states
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState(false);
  const [syncSecret, setSyncSecret] = useState('a29b37d3-dc90-4c79-9a7d-59b977b6e597');
  const [siteUrl, setSiteUrl] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // Test UC Bot modal states
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPlayerId, setTestPlayerId] = useState('8718615060');
  const [testPackage, setTestPackage] = useState('25 Diamonds');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [enduranceRefreshKey, setEnduranceRefreshKey] = useState(0);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleSyncAccount = async (acc: ShellAccount) => {
    setSyncingId(acc.id);
    try {
      const res = await fetch('/api/admin/shell-accounts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: acc.id,
          username: acc.account_username,
        }),
      });
      const data = await res.json();
      if (data.isLive) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === acc.id
              ? {
                  ...a,
                  available_balance: data.liveBalance,
                  last_synced_at: data.lastSyncedAt,
                }
              : a
          )
        );
        showToast(
          'success',
          data.message || `Synchronized ${acc.account_username}! Live Balance: ${data.liveBalance.toLocaleString()} Shells.`
        );
        setEnduranceRefreshKey((k) => k + 1);
      } else {
        showToast(
          'error',
          data.message || `Garena anti-bot (DataDome) challenge active on shop.garena.my. Preserved stored balance (${(acc.available_balance || 0).toLocaleString()} Shells).`
        );
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to connect to Garena sync API');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (accounts.length === 0) return;
    setSyncingId('ALL');
    let anyLive = false;
    let anyErrorMsg = '';
    for (const acc of accounts) {
      try {
        const res = await fetch('/api/admin/shell-accounts/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: acc.id,
            username: acc.account_username,
          }),
        });
        const data = await res.json();
        if (data.isLive) {
          anyLive = true;
          setAccounts((prev) =>
            prev.map((a) =>
              a.id === acc.id
                ? {
                    ...a,
                    available_balance: data.liveBalance,
                    last_synced_at: data.lastSyncedAt,
                  }
                : a
            )
          );
        } else if (data.message) {
          anyErrorMsg = data.message;
        }
      } catch (err) {
        console.error('Sync failed for:', acc.account_username, err);
      }
    }
    setSyncingId(null);
    setEnduranceRefreshKey((k) => k + 1);
    if (anyLive) {
      showToast('success', 'Garena shell accounts updated with live balance!');
    } else {
      showToast(
        'error',
        anyErrorMsg || 'Garena anti-bot challenge active on shop.garena.my. Preserved stored balances.'
      );
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shell-accounts');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
      // Also fetch sync secret and site URL for bookmarklet
      const tokenRes = await fetch('/api/admin/shell-accounts/sync-token');
      const tokenData = await tokenRes.json();
      if (tokenData.success) {
        if (tokenData.syncSecret) setSyncSecret(tokenData.syncSecret);
        if (tokenData.siteUrl) setSiteUrl(tokenData.siteUrl);
      }
    } catch (err) {
      console.error('Error loading shell accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const activeSiteUrl =
    siteUrl ||
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.shadowstorelk.com');

  const bookmarkletCode = `javascript:(async function(){if(!location.hostname.includes("garena")){alert("⚠️ Please open shop.garena.my and log into your Garena account before clicking this bookmarklet.");return;}let d=document.getElementById("__shadow_sync_hud");if(!d){d=document.createElement("div");d.id="__shadow_sync_hud";d.style.cssText="position:fixed;top:24px;right:24px;z-index:99999999;padding:18px 24px;border-radius:20px;background:rgba(18,16,40,0.96);border:1.5px solid #06b6d4;box-shadow:0 15px 50px rgba(6,182,212,0.4);font-family:ui-monospace,monospace;color:#fff;font-size:13px;display:flex;flex-direction:column;gap:6px;min-width:320px;backdrop-filter:blur(14px);transition:all 0.3s ease;";document.body.appendChild(d);}function setHud(t,m,s,e){d.innerHTML=\`<div style="display:flex;align-items:center;gap:8px;font-weight:900;color:\${e?'#f43f5e':s?'#34d399':'#38bdf8'};font-size:14px;"><span>\${e?'❌':s?'⚡':'🔄'}</span><span>\${t}</span></div><div style="color:#94a3b8;font-size:12px;margin-top:2px;">\${m}</div>\`;if(s||e){setTimeout(()=>{if(d){d.style.opacity='0';setTimeout(()=>d.remove(),600);}},6000);}}setHud("Connecting...","Querying active Garena session...",false,false);let bal=null,u="SHADOW_TOPUP1";try{const r1=await fetch("/api/auth/check_session",{credentials:"include"});const d1=await r1.json();if(d1&&d1.login&&d1.session_key){const r2=await fetch("/api/auth/sso",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_key:d1.session_key}),credentials:"include"});const d2=await r2.json();if(typeof d2.shell_balance==="number"){bal=d2.shell_balance;if(d2.username)u=d2.username;}}}catch(e){console.warn(e);}if(bal===null){const els=Array.from(document.querySelectorAll("*"));for(const el of els){const txt=(el.textContent||"").trim();if(txt.length<40&&/(?:shell|gs)/i.test(txt)){const m=txt.match(/(\\d[\\d,\\.]*)\\s*(?:Shells?|GS)/i);if(m){const num=parseFloat(m[1].replace(/,/g,""));if(!isNaN(num)&&num>=0){bal=num;break;}}}}}if(bal===null){setHud("Session Not Found","Please make sure you are logged into shop.garena.my and refresh.",false,true);return;}setHud("Balance Found! 💎",bal.toLocaleString()+" Shells detected. Syncing to Shadow Store...",false,false);try{const r3=await fetch("${activeSiteUrl}/api/admin/shell-accounts/sync",{method:"POST",headers:{"Content-Type":"application/json","x-sync-secret":"${syncSecret}"},body:JSON.stringify({username:u,explicitBalance:bal,syncSecret:"${syncSecret}"})});const d3=await r3.json();if(d3.success){setHud("Synced Successfully! 🚀","Shadow Store updated to "+bal.toLocaleString()+" Shells!",true,false);}else{setHud("Sync Failed",d3.message||"Server rejected balance",false,true);}}catch(e){setHud("Connection Error","Could not reach Shadow Store API.",false,true);}})();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    showToast('success', 'Bookmarklet code copied to clipboard! Paste it into a new browser bookmark.');
    setTimeout(() => setCopiedBookmarklet(false), 3000);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAcc) return;
    const newBal = parseFloat(editBalance);
    if (isNaN(newBal) || newBal < 0) {
      showToast('error', 'Please enter a valid numeric Shell balance amount');
      return;
    }

    setSavingEdit(true);
    try {
      const cleanAuto = editAutocode.replace(/[\s-]+/g, '').trim();
      const res = await fetch('/api/admin/shell-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editAcc.id,
          available_balance: newBal,
          autocode: cleanAuto,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editAcc.id ? { ...a, available_balance: newBal, autocode: cleanAuto, last_synced_at: json.lastSyncedAt } : a))
        );
        setEnduranceRefreshKey((k) => k + 1);
        showToast('success', `Successfully updated ${editAcc.account_username}! Balance: ${newBal.toLocaleString()} Shells.`);
        setEditAcc(null);
      } else {
        showToast('error', json.message || 'Failed to update account');
      }
    } catch (e) {
      showToast('error', 'Failed to save updated account details');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanAuto = autocode.replace(/[\s-]+/g, '').trim();
      const res = await fetch('/api/admin/shell-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_username: username,
          password: password,
          autocode: cleanAuto,
          is_main: isMain,
        }),
      });

      const data = await res.json();
      if (data.success && data.account) {
        setAccounts([data.account, ...accounts.filter((a) => a.id !== data.account.id)]);
        showToast('success', data.message || `Added shell account ${username} successfully!`);
        setIsAddModalOpen(false);
        setUsername('SHADOW_TOPUP1');
        setPassword('Shadow-2008');
        setAutocode('5ZEEJ3VDKEXSSD6J');
      } else {
        showToast('error', data.message || 'Failed to add shell account');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to connect to API');
    } finally {
      setSaving(false);
    }
  };

  const handleTestUCBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/ucbot/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: testPlayerId,
          packageName: testPackage,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        showToast('success', data.message || 'UC Bot topup executed successfully!');
      } else {
        showToast('error', data.message || 'UC Bot topup failed');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
      showToast('error', 'Error calling UC Bot test endpoint');
    } finally {
      setTesting(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shell account?')) return;
    try {
      const res = await fetch(`/api/admin/shell-accounts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(accounts.filter((a) => a.id !== id));
        showToast('success', 'Shell account removed successfully.');
      }
    } catch (err: any) {
      showToast('error', 'Failed to delete account');
    }
  };

  const totalShellStock = accounts.reduce((acc, a) => acc + (a.available_balance || 0), 0);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xl transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" /> Garena Shell Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Garena Top-Up Center (<span className="text-cyan-400 font-mono">shop.garena.my</span>) automated stock sync engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBookmarkletOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border border-cyan-500/60 text-cyan-300 hover:text-white hover:border-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            title="Open 1-Click Browser Sync Bookmarklet"
          >
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span>⭐ 1-Click Browser Sync</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncingId !== null || loading || accounts.length === 0}
            className="px-4 py-2.5 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 hover:text-white hover:border-purple-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            title="Sync live Shell stock from shop.garena.my"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${syncingId === 'ALL' ? 'animate-spin' : ''}`} />
            <span>{syncingId === 'ALL' ? 'Syncing...' : 'Sync Live (Garena)'}</span>
          </button>

          <button
            onClick={() => {
              setTestPlayerId('8718615060');
              setTestPackage('25 Diamonds');
              setTestResult(null);
              setIsTestModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:text-white hover:border-cyan-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Test UC Bot Dispatch</span>
          </button>

          <button
            onClick={() => {
              setUsername('SHADOW_TOPUP1');
              setPassword('Shadow-2008');
              setAutocode('5ZEEJ3VDKEXSSD6J');
              setIsMain(true);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Shell Account
          </button>
        </div>
      </div>

      {/* Total Stock & Endurance Forecasting Widget */}
      <AdminStockEnduranceWidget refreshKey={enduranceRefreshKey} />

      {/* Account Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Account ID</th>
                <th className="p-4">Garena Username</th>
                <th className="p-4">2FA Autocode (Setup Key)</th>
                <th className="p-4">Available Shell Stock</th>
                <th className="p-4">Last Synced</th>
                <th className="p-4">Account Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">Loading shell accounts...</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">No Garena shell accounts configured. Click "Add Shell Account" above!</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-slate-400 font-bold">#{String(acc.id).slice(0, 8)}</td>
                    <td className="p-4 font-extrabold text-white uppercase flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{acc.account_username}</span>
                    </td>
                    <td className="p-4">
                      {acc.autocode ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{acc.autocode.slice(0, 4)}••••{acc.autocode.slice(-4)}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1.5 w-fit">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Default Key Active</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-base font-black text-purple-400 font-mono">
                        {acc.available_balance.toLocaleString()} Shells
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">
                      {acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString() : 'Just now'}
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                          acc.is_main
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {acc.is_main ? 'PRIMARY MAIN' : 'SECONDARY'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSyncAccount(acc)}
                          disabled={syncingId === acc.id || syncingId === 'ALL'}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 hover:text-white hover:bg-purple-900 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          title="Sync live balance from shop.garena.my"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 text-purple-400 ${
                              syncingId === acc.id || syncingId === 'ALL' ? 'animate-spin' : ''
                            }`}
                          />
                          <span>{syncingId === acc.id ? 'Syncing...' : 'Sync'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditAcc(acc);
                            setEditBalance(String(acc.available_balance || 0));
                            setEditAutocode(acc.autocode || '5ZEEJ3VDKEXSSD6J');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 hover:text-white hover:bg-indigo-900 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                          title="Edit Shell Account & Autocode"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Balance Modal */}
      {editAcc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Set Exact Shell Balance</h3>
                <p className="text-[10px] text-slate-400 font-mono">Account: {editAcc.account_username}</p>
              </div>
              <button onClick={() => setEditAcc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Available Shell Balance</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  placeholder="e.g. 1300"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold text-base focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Google Authenticator 2FA Setup Key (Autocode)
                </label>
                <input
                  type="text"
                  value={editAutocode}
                  onChange={(e) => setEditAutocode(e.target.value)}
                  placeholder="e.g. 5ZEEJ3VDKEXSSD6J"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Found in shop.garena.my Security Settings &rarr; Google Authenticator setup key
                </span>
              </div>

              {/* Quick Add Presets */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Quick Add Shells:</span>
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 2500, 5000].map((addVal) => (
                    <button
                      key={addVal}
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(editBalance) || 0;
                        setEditBalance(String(cur + addVal));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-[10px] font-bold transition-all"
                    >
                      +{addVal}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditBalance('0')}
                    className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/40 text-[10px] font-bold transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-sans">
                💡 Enter or adjust the exact Shell count and 2FA Autocode shown on your Garena account.
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-sans text-xs disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : <><Save className="w-4 h-4" /> Save Account & Autocode</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Garena Shell Account</h3>
                <p className="text-[10px] text-slate-400 font-mono">Connect official shop.garena.my credentials & 2FA key</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SHADOW_TOPUP1"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Shadow-2008"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Google Authenticator 2FA Setup Key (Autocode)
                </label>
                <input
                  type="text"
                  required
                  value={autocode}
                  onChange={(e) => setAutocode(e.target.value)}
                  placeholder="e.g. 5ZEEJ3VDKEXSSD6J"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Setup key from Google Authenticator setup on Garena
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mainAcc"
                  checked={isMain}
                  onChange={(e) => setIsMain(e.target.checked)}
                  className="rounded border-slate-800 bg-[#0e0c1f] text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="mainAcc" className="text-slate-300 font-bold text-xs font-sans">
                  Set as Primary Main Account
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-sans text-xs disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Save Account & Autocode'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Test UC Bot Topup Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-cyan-900/60 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> UC Bot API Live Dispatch Test
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Test direct connection to ffapi.ucbot.net/topup-sync</p>
              </div>
              <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTestUCBot} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Player UID</label>
                <input
                  type="text"
                  required
                  value={testPlayerId}
                  onChange={(e) => setTestPlayerId(e.target.value)}
                  placeholder="e.g. 8718615060"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Package Name / UC Bot Code
                </label>
                <input
                  type="text"
                  required
                  list="ucbot-packages"
                  value={testPackage}
                  onChange={(e) => setTestPackage(e.target.value)}
                  placeholder="e.g. 25, WEEKLY, 3D, lvl6, etc."
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
                />
                <datalist id="ucbot-packages">
                  <option value="25">25 Diamond (Code: 25)</option>
                  <option value="100">100 Diamond (Code: 100)</option>
                  <option value="310">310 Diamond (Code: 310)</option>
                  <option value="520">520 Diamond (Code: 520)</option>
                  <option value="1060">1060 Diamond (Code: 1060)</option>
                  <option value="2180">2180 Diamond (Code: 2180)</option>
                  <option value="5600">5600 Diamond (Code: 5600)</option>
                  <option value="11500">11500 Diamond (Code: 11500)</option>
                  <option value="LITE">Weekly Lite Pack (Code: LITE)</option>
                  <option value="WEEKLY">Weekly Subscription (Code: WEEKLY)</option>
                  <option value="MONTHLY">Monthly Subscription (Code: MONTHLY)</option>
                  <option value="3D">EVO 3 Days (Code: 3D)</option>
                  <option value="7D">EVO 7 Days (Code: 7D)</option>
                  <option value="30D">EVO 30 Days (Code: 30D)</option>
                  <option value="L6">Level Up 6 (Code: L6)</option>
                  <option value="L10">Level Up 10 (Code: L10)</option>
                  <option value="L15">Level Up 15 (Code: L15)</option>
                  <option value="L20">Level Up 20 (Code: L20)</option>
                  <option value="L25">Level Up 25 (Code: L25)</option>
                  <option value="L30">Level Up 30 (Code: L30)</option>
                </datalist>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e0c1f] border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-500">Active Test Configuration:</div>
                <div className="flex justify-between">
                  <span>Shell Account:</span>
                  <span className="text-white font-bold">{accounts[0]?.account_username || 'SHADOW_TOPUP1'}</span>
                </div>
                <div className="flex justify-between">
                  <span>2FA Autocode:</span>
                  <span className="text-emerald-400 font-bold">5ZEEJ3VDKEXSSD6J</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Endpoint:</span>
                  <span className="text-cyan-400 font-bold">https://ffapi.ucbot.net/topup-sync</span>
                </div>
              </div>

              {testResult && (
                <div className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.playerNickname && (
                    <div className="text-[11px] text-slate-300">
                      Player Nickname: <strong className="text-white">{testResult.playerNickname}</strong>
                    </div>
                  )}
                  {testResult.transactionId && (
                    <div className="text-[10px] text-slate-400">
                      Tx ID: {testResult.transactionId}
                    </div>
                  )}
                  {testResult.rawResponse && (
                    <details className="mt-2 text-[10px]">
                      <summary className="cursor-pointer text-slate-400 hover:text-white">View Raw Response JSON</summary>
                      <pre className="mt-1 p-2 bg-black/60 rounded border border-slate-800 overflow-x-auto text-[9px] text-slate-300">
                        {JSON.stringify(testResult.rawResponse, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={testing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black uppercase tracking-wider shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 font-sans text-xs disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing UC Bot Topup...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Send Test Topup Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Bookmarklet Modal */}
      {isBookmarkletOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#141229] border border-cyan-800/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Laser accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Bookmark className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    1-Click Garena Browser Sync
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% reliable live stock sync. Uses your authenticated browser session to bypass DataDome & Captcha.
                </p>
              </div>
              <button
                onClick={() => setIsBookmarkletOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Draggable Bookmark Button */}
            <div className="space-y-3 p-5 rounded-2xl bg-[#0e0c1f] border border-cyan-900/60 text-center">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                🖱️ Drag this button directly into your Browser Bookmarks Bar:
              </span>

              <a
                href={bookmarkletCode}
                onClick={(e) => {
                  e.preventDefault();
                  alert('Drag this button directly to your browser bookmarks bar (or click "Copy Code" below)!');
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 border border-cyan-300/40 cursor-grab active:cursor-grabbing transition-all select-none"
              >
                <Bookmark className="w-4 h-4 text-cyan-200 shrink-0" />
                <span>⚡ Sync to Shadow Store</span>
              </a>

              <p className="text-[10px] text-slate-400 font-mono">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Ctrl + Shift + B</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Cmd + Shift + B</kbd> on Mac) to show your bookmarks bar.
              </p>
            </div>

            {/* How It Works Steps */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                How to use (3 Simple Steps):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[10px]">1</span>
                    <span>Install Once</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Drag the button above to your bookmarks bar.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-400 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center text-[10px]">2</span>
                    <span>Open Garena</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Open <a href="https://shop.garena.my" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">shop.garena.my <ExternalLink className="w-2.5 h-2.5" /></a> where you are logged in.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-[10px]">3</span>
                    <span>Click Bookmark</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Click the bookmark! A neon HUD syncs live stock in 1 sec.
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Copy Option */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Can't drag? Copy the code and paste as bookmark URL:
              </span>
              <button
                type="button"
                onClick={copyBookmarklet}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white text-xs font-bold font-mono flex items-center gap-2 transition-all shrink-0"
              >
                {copiedBookmarklet ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy Bookmarklet Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

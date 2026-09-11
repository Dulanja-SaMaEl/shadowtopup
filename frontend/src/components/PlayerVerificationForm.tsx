'use client';

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, Loader2, UserCheck, Edit3, Check } from 'lucide-react';

interface PlayerInfo {
  uid: string;
  nickname: string;
  level?: string | number;
  region?: string;
  isFallback?: boolean;
}

interface Props {
  gameSlug: string;
  onVerified: (player: PlayerInfo) => void;
}

export default function PlayerVerificationForm({ gameSlug, onVerified }: Props) {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<PlayerInfo | null>(null);

  // Custom IGN Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUid = uid.trim();
    if (!cleanUid) {
      setError('Please enter your Player ID first');
      return;
    }

    setLoading(true);
    setError(null);
    setVerifiedData(null);
    setIsEditingName(false);

    try {
      const res = await fetch(`/api/verify-player?slug=${gameSlug}&uid=${encodeURIComponent(cleanUid)}`);
      const data = await res.json();

      if (data.success && data.data) {
        // Check if there is a saved IGN in local storage for this UID
        let savedIgn = '';
        try {
          savedIgn = localStorage.getItem(`ff_ign_${cleanUid}`) || '';
        } catch {}

        // Resolve best nickname
        const finalNickname = data.data.nickname || savedIgn || `Free Fire Player (${cleanUid})`;

        // Cache into localStorage if real nickname returned
        if (data.data.nickname) {
          try {
            localStorage.setItem(`ff_ign_${cleanUid}`, data.data.nickname);
          } catch {}
        }

        const resolvedPlayer: PlayerInfo = {
          uid: cleanUid,
          nickname: finalNickname,
          level: data.data.level || 'Verified',
          region: data.data.region || 'SG / MY',
          isFallback: !data.data.nickname,
        };

        setVerifiedData(resolvedPlayer);
        setCustomNameInput(savedIgn || (data.data.nickname ? data.data.nickname : ''));
        onVerified(resolvedPlayer);
      } else {
        setError(data.message || 'Player verification failed. Check your ID.');
      }
    } catch (err: any) {
      setError('Error connecting to verification server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomName = () => {
    if (!verifiedData) return;
    const cleanName = customNameInput.trim();
    const updatedName = cleanName || `Free Fire Player (${verifiedData.uid})`;

    try {
      localStorage.setItem(`ff_ign_${verifiedData.uid}`, updatedName);
    } catch {}

    const updatedData: PlayerInfo = {
      ...verifiedData,
      nickname: updatedName,
      isFallback: false,
    };

    setVerifiedData(updatedData);
    setIsEditingName(false);
    onVerified(updatedData);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">1. Verify Player Account</h3>
          <p className="text-xs text-slate-400">Enter your in-game User ID (UID) to verify account for instant delivery</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. 8718615060"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all text-sm min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Search className="w-4 h-4" /> Verify ID
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {verifiedData && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400/80 font-bold block">
                  Account Verified & Ready for Top-Up
                </span>
                
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      placeholder="Enter your exact in-game nickname"
                      className="px-3 py-1 bg-slate-950 border border-emerald-500/50 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-cyan-400 font-sans min-w-[180px]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomName}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                ) : (
                  <h4 className="font-extrabold text-base text-white flex items-center gap-2 mt-0.5">
                    <span>{verifiedData.nickname}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomNameInput(verifiedData.nickname.startsWith('Free Fire Player') ? '' : verifiedData.nickname);
                        setIsEditingName(true);
                      }}
                      className="text-slate-400 hover:text-cyan-400 p-1 transition-colors"
                      title="Edit in-game nickname"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </h4>
                )}

                <p className="text-xs text-emerald-300/80 font-mono mt-0.5">
                  UID: {verifiedData.uid} {verifiedData.level && `| Level ${verifiedData.level}`} {verifiedData.region && `(${verifiedData.region})`}
                </p>
              </div>
            </div>

            {!isEditingName && (
              <button
                type="button"
                onClick={() => {
                  setCustomNameInput(verifiedData.nickname.startsWith('Free Fire Player') ? '' : verifiedData.nickname);
                  setIsEditingName(true);
                }}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 self-end sm:self-center transition-all"
              >
                <Edit3 className="w-3 h-3" />
                <span>{verifiedData.isFallback ? 'Set In-Game Name' : 'Edit Name'}</span>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

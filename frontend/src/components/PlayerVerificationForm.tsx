'use client';

import { useState } from 'react';
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
      setError('Please enter your Player ID');
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
        let savedIgn = '';
        try {
          savedIgn = localStorage.getItem(`ff_ign_${cleanUid}`) || '';
        } catch {}

        const finalNickname = data.data.nickname || savedIgn || `Free Fire Player (${cleanUid})`;

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
        setError(data.message || 'Player verification failed. Please verify your UID.');
      }
    } catch (err: any) {
      setError('Error connecting to verification server. Please try again.');
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
    <div className="bg-[#110e24] border border-purple-950/60 rounded-xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)] shrink-0">
          <UserCheck className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Step 1: Enter Player ID (UID)</span>
            <span className="text-[10px] font-mono text-purple-400 font-normal">[ LIVE VERIFY ]</span>
          </h3>
          <p className="text-xs text-slate-400">Validate your Free Fire numeric UID to preview in-game nickname before ordering</p>
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
              className="w-full px-4 py-2.5 bg-[#090714] border border-purple-950/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_14px_rgba(6,182,212,0.3)] font-mono text-xs transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 transition-all min-w-[135px] neon-glow-btn"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-cyan-300" /> Check Account
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {verifiedData && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a1612] border border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.2)] p-4 rounded-lg text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold block">
                  Account Verified
                </span>
                
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customNameInput}
                      onChange={(e) => setCustomNameInput(e.target.value)}
                      placeholder="Enter in-game nickname"
                      className="px-2.5 py-1 bg-[#090714] border border-emerald-500/50 rounded-md text-white font-semibold text-xs focus:outline-none focus:border-purple-400 min-w-[180px]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomName}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                ) : (
                  <h4 className="font-bold text-sm text-white flex items-center gap-2 mt-0.5">
                    <span>{verifiedData.nickname}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomNameInput(verifiedData.nickname.startsWith('Free Fire Player') ? '' : verifiedData.nickname);
                        setIsEditingName(true);
                      }}
                      className="text-slate-400 hover:text-white p-0.5 transition-colors"
                      title="Edit display nickname"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </h4>
                )}

                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  UID: {verifiedData.uid} {verifiedData.level && `• Level ${verifiedData.level}`} {verifiedData.region && `• (${verifiedData.region})`}
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
                className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 self-end sm:self-center transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{verifiedData.isFallback ? 'Set Nickname' : 'Edit'}</span>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

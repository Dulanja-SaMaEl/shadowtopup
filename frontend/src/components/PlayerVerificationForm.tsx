'use client';

import { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, Loader2, UserCheck } from 'lucide-react';

interface PlayerInfo {
  uid: string;
  nickname: string;
  level?: string | number;
  region?: string;
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) {
      setError('Please enter your Player ID first');
      return;
    }

    setLoading(true);
    setError(null);
    setVerifiedData(null);

    try {
      const res = await fetch(`/api/verify-player?slug=${gameSlug}&uid=${encodeURIComponent(uid)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setVerifiedData(data.data);
        onVerified(data.data);
      } else {
        setError(data.message || 'Player verification failed. Check your ID.');
      }
    } catch (err: any) {
      setError('Error connecting to verification server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">1. Verify Player Account</h3>
          <p className="text-xs text-slate-400">Enter your in-game User ID (UID) to check nickname</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. 123456789"
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
          <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400/80">Account Verified</span>
              <h4 className="font-extrabold text-base text-white">{verifiedData.nickname}</h4>
              <p className="text-xs text-emerald-300/80 font-mono">
                UID: {verifiedData.uid} {verifiedData.level && `| Level ${verifiedData.level}`} {verifiedData.region && `(${verifiedData.region})`}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

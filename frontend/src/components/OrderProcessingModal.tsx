'use client';

import React, { useEffect, useState } from 'react';
import { Gem, ShieldCheck, Lock, AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  packageName?: string;
  playerUid?: string;
  playerNickname?: string;
  amount?: number;
  paymentMethod?: string;
}

const STEPS = [
  {
    title: 'Verifying Player Identity',
    desc: 'Validating Free Fire UID & Garena Regional Server route',
    minProgress: 0,
    targetProgress: 25,
  },
  {
    title: 'Authorizing Transaction',
    desc: 'Securing API authentication & reserving Garena Shells',
    minProgress: 25,
    targetProgress: 55,
  },
  {
    title: 'Crediting Diamonds & Pass',
    desc: 'Recharging in-game balance directly to your Free Fire account',
    minProgress: 55,
    targetProgress: 85,
  },
  {
    title: 'Finalizing Order Receipt',
    desc: 'Generating certified transaction proof and Garena TxID',
    minProgress: 85,
    targetProgress: 98,
  },
];

export default function OrderProcessingModal({
  isOpen,
  packageName,
  playerUid,
  playerNickname,
  amount,
  paymentMethod,
}: Props) {
  const [progress, setProgress] = useState(5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(5);
      setElapsedSeconds(0);
      return;
    }

    // Timer for elapsed seconds
    const intervalTimer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Realistic progress ticker spanning ~16-20 seconds smoothly
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 25) {
          return prev + Math.random() * 4 + 2; // quick start to 25% (0-3s)
        } else if (prev < 55) {
          return prev + Math.random() * 2 + 1; // 25-55% (3-8s)
        } else if (prev < 85) {
          return prev + Math.random() * 1.5 + 0.8; // 55-85% (8-14s)
        } else if (prev < 96) {
          return prev + Math.random() * 0.8 + 0.3; // 85-96% (14-18s)
        }
        return Math.min(prev + 0.1, 98); // hold at 98% until completion
      });
    }, 400);

    return () => {
      clearInterval(intervalTimer);
      clearInterval(progressTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepIndex = STEPS.findIndex(
    (step, idx) =>
      progress >= step.minProgress && (idx === STEPS.length - 1 || progress < STEPS[idx + 1].minProgress)
  );

  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0b081c] border border-purple-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 text-center space-y-6 overflow-hidden">
        {/* Top Glowing Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400">
            Automated Top-Up Gateway • Live Processing
          </span>
        </div>

        {/* Central Animated Diamond Core */}
        <div className="relative flex items-center justify-center py-2">
          {/* Concentric pulsing rings */}
          <div className="absolute w-28 h-28 rounded-full border border-purple-500/20 animate-ping opacity-30" />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/30 animate-pulse" />
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-purple-600/30 blur-md" />

          {/* Central Spinning Glowing Orb */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-950 to-slate-900 border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-cyan-300 relative z-10">
            <Gem className="w-8 h-8 animate-bounce text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
          </div>
        </div>

        {/* Title & Warning Reassurance Banner */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
            Recharging Your Account...
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Direct connection established with official Free Fire servers. Your package is being fulfilled.
          </p>
        </div>

        {/* Urgent Alert Reassurance Box */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-left flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-snug">
            <strong className="block text-amber-200 font-bold uppercase tracking-wider">
              Please Do Not Close Or Refresh
            </strong>
            <span className="text-amber-300/80">
              Leaving this page may delay receipt generation. Your receipt will appear automatically once diamonds are credited.
            </span>
          </div>
        </div>

        {/* Order Details Mini-Card (If details available) */}
        {(packageName || playerUid) && (
          <div className="p-3.5 rounded-2xl bg-[#130f2e] border border-purple-900/40 text-left space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 text-[10px] uppercase">Package:</span>
              <span className="text-cyan-300 font-black truncate max-w-[200px]">{packageName || 'Free Fire Package'}</span>
            </div>
            {playerUid && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[10px] uppercase">Target UID:</span>
                <span className="text-emerald-400 font-bold">{playerUid}</span>
              </div>
            )}
            {playerNickname && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[10px] uppercase">Player Name:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{playerNickname}</span>
              </div>
            )}
            {amount !== undefined && (
              <div className="flex justify-between items-center text-xs border-t border-purple-900/40 pt-1.5">
                <span className="text-slate-400 text-[10px] uppercase">Total:</span>
                <span className="text-white font-black">LKR {Number(amount).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
              Processing: {Math.floor(progress)}%
            </span>
            <span className="text-purple-300 font-mono">
              Elapsed: {elapsedSeconds}s (~15s)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-purple-900/60">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/50"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>
        </div>

        {/* Multi-Step Real-time Status Tracker */}
        <div className="space-y-2 text-left pt-1">
          {STEPS.map((step, idx) => {
            const isCompleted = progress >= step.targetProgress;
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                  isCurrent
                    ? 'bg-purple-900/30 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent
                          ? 'text-cyan-300'
                          : isCompleted
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    {isCurrent && (
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust & Security Indicator */}
        <div className="pt-2 border-t border-purple-950/40 flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <Lock className="w-3 h-3 text-cyan-400" /> 256-Bit SSL Encrypted
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Official Garena API
          </span>
        </div>
      </div>
    </div>
  );
}

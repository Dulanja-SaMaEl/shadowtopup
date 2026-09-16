'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, KeyRound, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Submit Form & Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to send verification code. Please check your details.');
      } else {
        setVerificationToken(data.verificationToken);
        setStep('otp');
        setResendCooldown(60);
        setStatusNotice(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Network error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to resend verification code.');
      } else {
        setVerificationToken(data.verificationToken);
        setResendCooldown(60);
        setStatusNotice('A fresh verification code was sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Activate Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusNotice(null);

    try {
      const res = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: cleanOtp,
          verificationToken,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Verification failed. Please double check the code.');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#110e24] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Neon Laser Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <Image
              src="/logo.png"
              alt="Shadow Top Up and Account Store"
              width={200}
              height={60}
              className="h-12 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {step === 'form' ? 'Create Account' : step === 'otp' ? 'Verify Email Code' : 'Account Ready!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 'form' && 'Get instant Garena top-ups & wholesale reseller tier pricing'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
            {step === 'success' && 'Your account has been verified and registered successfully!'}
          </p>
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080711] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080711] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 bg-[#080711] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs uppercase tracking-wider font-gaming neon-glow-btn cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Continue with Email OTP <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center justify-between">
              <span className="truncate">Sent to: <strong className="text-white font-mono">{email}</strong></span>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-[11px] text-cyan-400 hover:underline font-semibold shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center uppercase tracking-wider font-mono">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full pl-12 pr-4 py-3 bg-[#080711] border border-purple-500/40 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                />
              </div>
            </div>

            {statusNotice && !error && (
              <p className="text-xs text-emerald-400 text-center font-mono">
                {statusNotice}
              </p>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs uppercase tracking-wider font-gaming cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-cyan-200" />
                  <span>Verify Code & Complete Registration</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-xs text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? (
                  <span>Resend code in {resendCooldown}s</span>
                ) : (
                  <span className="text-purple-400 font-semibold underline">Resend Verification Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Email Verified Successfully!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Welcome to <strong className="text-white">Shadow Store</strong>! We sent a welcome confirmation to <strong className="text-cyan-400">{email}</strong>.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider font-gaming transition-colors shadow-sm text-center"
              >
                Sign In to Your Dashboard &rarr;
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.06] pt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

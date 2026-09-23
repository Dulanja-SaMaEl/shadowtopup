'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Loader2, KeyRound, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');

  // Form State
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification & Cooldown State
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

  // Step 1: Submit Email to Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to send password reset code.');
      } else {
        setVerificationToken(data.verificationToken);
        setStep('reset');
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
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to resend code.');
      } else {
        setVerificationToken(data.verificationToken);
        setResendCooldown(60);
        setStatusNotice('A fresh 6-digit reset code was sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);

    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: cleanOtp,
          verificationToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to reset password. Please check the code.');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#110e24] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Neon Laser Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* Logo Header */}
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
            {step === 'email' && 'Reset Password'}
            {step === 'reset' && 'Enter Verification Code'}
            {step === 'success' && 'Password Changed!'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 'email' && 'Enter your registered email to receive a 6-digit reset code'}
            {step === 'reset' && `We sent a security code to ${email}`}
            {step === 'success' && 'Your account security has been updated successfully'}
          </p>
        </div>

        {/* Step Indicators */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'email' ? 'w-8 bg-purple-500' : 'w-3 bg-purple-500/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 'reset' ? 'w-8 bg-purple-500' : 'w-3 bg-white/10'}`} />
          </div>
        )}

        {/* Status Notice */}
        {statusNotice && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Reset Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080711] border border-purple-500/40 focus:border-purple-400 rounded-lg text-white font-mono tracking-widest text-lg placeholder-slate-600 focus:outline-none text-center transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Check your inbox or spam folder for the code.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-12 py-2.5 bg-[#080711] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-12 py-2.5 bg-[#080711] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Set New Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError(null);
                  setStatusNotice(null);
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Email
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <span className="text-purple-400 font-semibold underline">Resend Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Password Reset Successfully!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Your account password has been updated. You can now sign in using your new credentials.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login?reset=success"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm text-center"
              >
                Sign In to Your Account &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Footer Back to Login */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.06] pt-4">
          Remember your password?{' '}
          <Link href="/login" className="text-purple-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

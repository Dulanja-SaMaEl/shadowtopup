'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === 'success') {
        setSuccessNotice('Password reset successfully! Please sign in with your new password.');
      }
      if (params.get('banned') === 'true' || params.get('error') === 'banned') {
        setError('Your account has been banned.');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const targetEmail = email.trim().toLowerCase();

    // Attempt Supabase Auth login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, is_banned, banned_at')
        .eq('id', authData.user.id)
        .single();

      // Check if user account is banned
      if (profile?.is_banned || profile?.banned_at) {
        await supabase.auth.signOut();
        document.cookie = 'active_session_email=; path=/; max-age=0; SameSite=Lax';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('active_session_email');
          localStorage.removeItem('active_session_role');
          localStorage.removeItem('active_session_name');
        }
        setLoading(false);
        setError('Your account has been banned.');
        return;
      }

      // Set cookie for session persistence across server routes
      document.cookie = `active_session_email=${targetEmail}; path=/; max-age=86400; SameSite=Lax`;

      const userRole = profile?.role || 'normal';
      const userName = profile?.name || targetEmail.split('@')[0].toUpperCase();

      if (typeof window !== 'undefined') {
        localStorage.setItem('active_session_email', targetEmail);
        localStorage.setItem('active_session_role', userRole);
        localStorage.setItem('active_session_name', userName);
      }

      window.location.href = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
      return;
    }

    setLoading(false);
    setError(authError?.message || 'Invalid login credentials. Please check your email and password.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#110e24] border border-white/[0.08] rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {successNotice && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
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
            <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-bold">{error}</span>
              </div>
              {error.toLowerCase().includes('banned') && (
                <div className="pt-2 border-t border-red-500/20 text-[11px] text-slate-300 flex flex-col gap-1.5 font-sans">
                  <p>Your platform access has been suspended. If you believe this is an error, you can submit an appeal to support.</p>
                  <a
                    href="https://wa.me/94765604635?text=Hello%20Shadow%20Topup%20Support,%20my%20account%20was%20banned%20and%20I%20would%20like%20to%20submit%20an%20appeal."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold underline font-mono"
                  >
                    Submit Ban Appeal via WhatsApp &rarr;
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-purple-400 hover:underline font-medium">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

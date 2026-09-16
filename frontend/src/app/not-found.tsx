import Link from 'next/link';
import { Gamepad2, ArrowLeft, Zap, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Shadow Store',
  description: 'The requested page could not be found on Shadow Store. Return to our game catalog or instant Free Fire recharge.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-3xl bg-[#141229] border border-purple-950/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            The gaming page or top-up route you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="space-y-3 pt-2 relative z-10">
          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/games"
              className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Games Catalog
            </Link>
            <Link
              href="/contact"
              className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Zap, ShieldCheck, CreditCard, Headset, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-lg text-white">SHADOW<span className="text-cyan-400">STORE</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Independent third-party gaming recharge service and reseller platform for digital gaming credits.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Fast Diamond Processing
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Player UID Verification
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Visa, Mastercard, Ez Cash & Bank Transfer
              </li>
              <li className="flex items-center gap-2">
                <Headset className="w-4 h-4 text-amber-400" /> 24/7 Customer Support
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link href="/games" className="hover:text-cyan-400 transition-colors">Games Catalog</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Platform</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Support & Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal & Resellers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Reseller Tier Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Third-Party Legal Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300/80 text-[11px] leading-relaxed text-center font-mono space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Third-Party Disclaimer & Trademark Notice
          </div>
          <p>
            ShadowTopUp is an independent third-party service provider. ShadowTopUp is NOT affiliated with, endorsed by, sponsored by, or in any way officially connected to Garena, Free Fire, or any of their subsidiaries or affiliates. All game titles, logos, product names, and trademarks belong to their respective copyright holders.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} ShadowStore by Dulanja Abeysinghe. Independent Service Platform.</p>
          <p className="font-mono text-cyan-500/80">Powered by Next.js & Supabase</p>
        </div>
      </div>
    </footer>
  );
}

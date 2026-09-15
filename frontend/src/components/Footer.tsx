import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#07060f] border-t border-purple-950/40 text-slate-400 py-12 relative overflow-hidden">
      {/* Top Neon Laser Accent */}
      <div className="laser-line-cyan w-full absolute top-0 left-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="ShadowTopUp"
                width={160}
                height={48}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Third-party gaming top-up platform and wholesale reseller service in Sri Lanka. Instant Free Fire diamond recharge with verified Player ID dispatch.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-800/40 text-[10px] font-mono text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Garena API Online</span>
            </div>
          </div>

          {/* Quick Recharge */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Top-Up Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Free Fire Diamonds</Link></li>
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Weekly & Monthly Passes</Link></li>
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Level Up Pass</Link></li>
              <li><Link href="/games" className="hover:text-purple-400 transition-colors">Supported Games Catalog</Link></li>
              <li><Link href="/reseller" className="hover:text-purple-400 transition-colors">Wholesale Reseller Program</Link></li>
            </ul>
          </div>

          {/* Help & Guides */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Help & Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/how-it-works" className="hover:text-purple-400 transition-colors">How Top-Up Works</Link></li>
              <li><Link href="/faq" className="hover:text-purple-400 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact & WhatsApp Support</Link></li>
              <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">My Orders & Wallet</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">About ShadowTopUp</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Third-Party Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-[#0e0c1f] border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Trademark & Third-Party Notice</span>
          </div>
          <p>
            ShadowTopUp is an independent third-party recharge platform. We are not affiliated with, endorsed by, or officially associated with Garena, Free Fire, or Sea Limited. All trademarks and game logos belong to their respective copyright holders.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShadowTopUp. All rights reserved.</p>
          <p className="text-slate-400 text-[11px]">Sri Lanka Gaming Recharge Services</p>
        </div>
      </div>
    </footer>
  );
}

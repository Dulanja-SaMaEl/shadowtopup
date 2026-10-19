import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { AcceptedPaymentStrip } from '@/components/PaymentLogos';

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
                alt="Shadow Store"
                width={160}
                height={48}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sri Lanka's leading third-party gaming top-up platform and wholesale reseller service. Instant Free Fire diamond recharge with verified Player ID dispatch.
            </p>
          </div>

          {/* Quick Recharge */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Top-Up Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Free Fire Diamonds</Link></li>
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Weekly & Monthly Memberships</Link></li>
              <li><Link href="/games/free-fire" className="hover:text-purple-400 transition-colors">Level Up Rewards</Link></li>
              <li><Link href="/games" className="hover:text-purple-400 transition-colors">Supported Games Catalog</Link></li>
              <li><Link href="/reseller" className="hover:text-purple-400 transition-colors">Reseller Partner Program</Link></li>
            </ul>
          </div>

          {/* Help & Guides */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Help & Resources</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/how-it-works" className="hover:text-purple-400 transition-colors">How Top-Up Works</Link></li>
              <li><Link href="/faq" className="hover:text-purple-400 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact & WhatsApp Support</Link></li>
              <li><Link href="/dashboard" rel="nofollow" className="hover:text-purple-400 transition-colors">My Orders & Wallet</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-purple-400 transition-colors">About Shadow Store</Link></li>
              <li><Link href="/refund-policy" className="hover:text-purple-400 transition-colors">Refund & Cancellation Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Accepted Payment Methods Bar */}
        <div className="p-4 rounded-xl bg-[#0e0c1f] border border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-bold text-white block">Accepted Payment Methods in Sri Lanka</span>
            <span className="text-[11px] text-slate-400">Automated instant delivery with 3D Secure card processing &amp; mobile wallets</span>
          </div>
          <AcceptedPaymentStrip />
        </div>

        {/* Third-Party Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-[#0e0c1f] border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Trademark & Third-Party Notice</span>
          </div>
          <p>
            Shadow Store is an independent third-party recharge platform. We are not affiliated with, endorsed by, or officially associated with Garena, Free Fire, or Sea Limited. All trademarks and game logos belong to their respective copyright holders.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Shadow Store. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] text-slate-400">
            <span>Sri Lanka Gaming Recharge Services</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex flex-wrap items-center gap-1.5">
              Developer:{' '}
              <a
                href="https://wa.me/94765917189?text=Hello%20Dulanja%2C%20contacting%20regarding%20Shadow%20Store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-emerald-400 font-medium transition-colors inline-flex items-center gap-1.5"
                title="Direct WhatsApp: 076 591 7189"
              >
                <span>Dulanja Abeysinghe</span>
                <span className="text-emerald-400 text-[10px] font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500/20">
                  WhatsApp: 076 591 7189
                </span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

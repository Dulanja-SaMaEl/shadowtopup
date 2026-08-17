import { Zap, ShieldCheck, Award, Server, Cpu } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-4 h-4 fill-cyan-400" /> About ShadowTopUp
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          The Next-Gen Game Top-Up & Reseller Platform
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
          Designed and built by <span className="text-cyan-400 font-semibold">Dulanja Abeysinghe</span>, ShadowTopUp provides high-speed automated Garena Free Fire shell redemptions, instant player UID verification, and structured bulk pricing tiers for commercial resellers.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Automated Garena Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integrated Node.js Puppeteer stealth microservices automate shell balance validation and instant order processing.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Tiered Reseller System</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Commercial top-up vendors unlock exclusive discounts through Silver and Gold reseller tier memberships.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Zero Storage Overhead</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bank transfer receipts are hosted on ImgBB storage API, maintaining 100% free serverless operation on Vercel and Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Phone, Send, CheckCircle2, Loader2, Code } from 'lucide-react';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit message.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error sending inquiry. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Direct Contact Channels (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Email Support Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141229] border border-purple-950/50 hover:border-cyan-500/40 flex items-start gap-4 transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Official Email Support
            </span>
            <a
              href="mailto:adminshadowstorelk.com@gmail.com"
              className="text-xs sm:text-sm font-bold text-white hover:text-cyan-400 transition-colors block break-all mt-0.5"
            >
              adminshadowstorelk.com@gmail.com
            </a>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Replies within 1–2 hours</span>
          </div>
        </div>

        {/* Phone & WhatsApp Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141229] border border-purple-950/50 hover:border-emerald-500/40 flex items-start gap-4 transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Hotline & WhatsApp
            </span>
            <a
              href="https://wa.me/94765604635"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors inline-block mt-0.5"
            >
              076 560 4635
            </a>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">+94 76 560 4635 • Instant Live Chat</span>
          </div>
        </div>

        {/* Telegram Reseller Desk Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141229] border border-purple-950/50 hover:border-amber-500/40 flex items-start gap-4 transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
              Telegram Reseller Desk
            </span>
            <a
              href="https://t.me/ShadowStoreSupport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors inline-block mt-0.5"
            >
              @ShadowStoreSupport
            </a>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Commercial wholesale inquiries</span>
          </div>
        </div>

        {/* Lead Developer Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141229] border border-cyan-500/30 hover:border-cyan-400/50 flex items-start gap-4 transition-all group shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
            <Code className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
              Lead Developer
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">Dulanja Abeysinghe</span>
            <a
              href="mailto:dulanja150abeysinghe@gmail.com"
              className="text-xs sm:text-sm text-cyan-300 hover:text-cyan-200 font-mono transition-colors block break-all mt-1"
            >
              dulanja150abeysinghe@gmail.com
            </a>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Architecture & technical inquiries</span>
          </div>
        </div>
      </div>

      {/* Interactive Contact Form (7 Cols) */}
      <div className="lg:col-span-7 bg-[#141229] border border-purple-950/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Message Sent Successfully!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Our support team will review your inquiry and respond to your email address within 1–2 hours.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-900/40 border border-purple-700/50 hover:bg-purple-800/40 text-xs font-mono font-bold text-purple-300 transition-all cursor-pointer mt-2"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-purple-950/40 pb-4 mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" /> Send Direct Message
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Have an order reference, payment question, or reseller inquiry? Fill out the details below.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kasun Perera"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message / Order Reference
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry, order reference (e.g. #FF-9021), or reseller request..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs sm:text-sm cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Message <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

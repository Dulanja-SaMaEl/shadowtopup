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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-[#141229] border border-purple-950/40 flex items-center gap-4">
          <Mail className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-500 font-mono block">Email Support</span>
            <a href="mailto:adminshadowstorelk.com@gmail.com" className="text-sm font-bold text-white hover:text-cyan-400">
              adminshadowstorelk.com@gmail.com
            </a>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-purple-950/40 flex items-center gap-4">
          <Phone className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-500 font-mono block">Hotline & WhatsApp</span>
            <a
              href="https://wa.me/94765604635"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white hover:text-emerald-400 transition-colors block"
            >
              076 560 4635
            </a>
            <span className="text-[10px] text-slate-400 font-mono">+94 76 560 4635</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-purple-950/40 flex items-center gap-4">
          <MessageSquare className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-500 font-mono block">Telegram Reseller Desk</span>
            <span className="text-sm font-bold text-white">@ShadowStoreSupport</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-cyan-500/30 flex items-center gap-4">
          <Code className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-500 font-mono block">Developer & Technical Inquiries</span>
            <span className="text-sm font-bold text-white block">Dulanja Abeysinghe</span>
            <a
              href="mailto:dulanja150abeysinghe@gmail.com"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors block"
            >
              dulanja150abeysinghe@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 bg-[#141229] border border-purple-950/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
            <p className="text-xs text-slate-400">
              Our support team will respond to your inquiry within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Dulanja Abeysinghe"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
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
                placeholder="your-email@example.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
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
                placeholder="Describe your inquiry, order reference, or reseller request..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-sm cursor-pointer"
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

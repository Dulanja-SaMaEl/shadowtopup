'use client';

import { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlayerId?: string;
  defaultPackageName?: string;
  onSubmitted?: () => void;
}

export default function CustomerReviewModal({
  isOpen,
  onClose,
  defaultPlayerId = '',
  defaultPackageName = 'Free Fire Diamonds',
  onSubmitted,
}: CustomerReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [playerId, setPlayerId] = useState(defaultPlayerId);
  const [packageName, setPackageName] = useState(defaultPackageName);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim() || 'Verified Customer',
          player_id: playerId.trim() || 'Free Fire Player',
          package_name: packageName,
          rating,
          review_text: reviewText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        if (onSubmitted) onSubmitted();
        setTimeout(() => {
          setSuccessMsg(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141229] border border-purple-950/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Leave a Purchase Review</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-white text-base">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-400">Your review has been saved to our verified store database.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Rating Stars */}
            <div className="text-center space-y-2 py-2 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Rate Your Top-Up Experience</span>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Name / Nickname</label>
              <input
                type="text"
                placeholder="e.g. Dulanja A."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Free Fire Player ID</label>
                <input
                  type="text"
                  placeholder="e.g. 8777843685"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-400 font-mono focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Purchased Item</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-slate-300 font-mono focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Review & Feedback</label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience (e.g., Super fast delivery, cheap pricing...)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-sans focus:outline-none focus:border-purple-500 text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold uppercase shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {submitting ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit Review</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

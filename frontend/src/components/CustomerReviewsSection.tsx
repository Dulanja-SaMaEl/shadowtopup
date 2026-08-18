'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, Quote } from 'lucide-react';
import CustomerReviewModal from '@/components/CustomerReviewModal';

interface ReviewItem {
  id: string;
  customer_name: string;
  player_id?: string;
  rating: number;
  package_name?: string;
  review_text: string;
  created_at: string;
}

export default function CustomerReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Error fetching customer reviews:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" /> {avgRating} / 5.0 RATING
            </span>
            <span className="text-xs text-slate-400 font-mono">({reviews.length} Verified Buyer Reviews)</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide mt-2">Customer Feedback & Reviews</h2>
          <p className="text-xs text-slate-400">See what players are saying about our Garena Free Fire top-up speed and prices.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-slate-500 font-mono text-xs">
            Loading buyer reviews...
          </div>
        ) : (
          reviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-purple-500/40 transition-all"
            >
              <Quote className="w-8 h-8 text-purple-900/30 absolute right-4 top-4 pointer-events-none" />

              <div className="space-y-3 relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.review_text}"</p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center relative z-10">
                <div>
                  <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                    {rev.customer_name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </h5>
                  <span className="text-[10px] text-purple-300 font-mono block">
                    {rev.package_name || 'Free Fire Diamonds'}
                  </span>
                </div>
                {rev.player_id && (
                  <span className="text-[9px] font-mono text-slate-500">UID: {rev.player_id.slice(0, 6)}...</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CustomerReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={fetchReviews}
      />
    </section>
  );
}

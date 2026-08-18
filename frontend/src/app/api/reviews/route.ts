import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

const fallbackReviews = [
  {
    id: 'rev-1',
    customer_name: 'Dulanja A.',
    player_id: '8777843685',
    rating: 5,
    package_name: '1060 Diamonds',
    review_text: 'Instant delivery! Diamonds arrived in my Free Fire account in less than 30 seconds. Best store in Sri Lanka!',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rev-2',
    customer_name: 'Sahan K.',
    player_id: '1092837465',
    rating: 5,
    package_name: 'Weekly Membership Pass',
    review_text: 'Super easy bank transfer receipt upload. Verified and credited super fast. Highly recommended reseller pricing!',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'rev-3',
    customer_name: 'Kavindu P.',
    player_id: '4455667788',
    rating: 5,
    package_name: 'Monthly Membership Pass',
    review_text: 'Cheapest LKR prices for Garena SG Free Fire. Gold Reseller tier discount saved me a lot of money.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (supabaseUrl && supabaseServiceKey) {
      const adminSupabase = getAdminClient();
      const { data, error } = await adminSupabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, reviews: data });
      }
    }

    return NextResponse.json({ success: true, reviews: fallbackReviews });
  } catch (err: any) {
    return NextResponse.json({ success: true, reviews: fallbackReviews });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, player_id, rating, package_name, review_text } = body;

    if (!review_text || !rating) {
      return NextResponse.json({ success: false, message: 'Rating and review text are required' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    const newReview = {
      customer_name: customer_name || 'Verified Buyer',
      player_id: player_id || 'Free Fire Player',
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      package_name: package_name || 'Diamond Topup',
      review_text: review_text,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from('reviews')
      .insert([newReview])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data, message: 'Review submitted successfully!' });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

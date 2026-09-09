import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

// GET: List all products (optionally filtered by game_id)
export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    const adminSupabase = getAdminClient();
    let query = adminSupabase
      .from('products')
      .select('*, games(id, title, slug, image_path, category)')
      .order('created_at', { ascending: false });

    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    console.error('Error fetching admin products:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST: Add a new product
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }

    const parsedPrice = parseFloat(body.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ success: false, message: 'A valid positive price is required' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    const newProduct = {
      name: body.name.trim(),
      game_id: body.game_id || null,
      price: parsedPrice,
      silver_price: body.silver_price !== undefined && body.silver_price !== '' && !isNaN(parseFloat(body.silver_price))
        ? parseFloat(body.silver_price)
        : null,
      gold_price: body.gold_price !== undefined && body.gold_price !== '' && !isNaN(parseFloat(body.gold_price))
        ? parseFloat(body.gold_price)
        : null,
      stock: body.stock !== undefined && !isNaN(parseInt(body.stock)) ? parseInt(body.stock) : 0,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
    };

    const { data, error } = await adminSupabase
      .from('products')
      .insert([newProduct])
      .select('*, games(id, title, slug, image_path, category)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data, message: 'Product created successfully' });
  } catch (err: any) {
    console.error('Error adding product:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, message: 'Product name is required' }, { status: 400 });
    }

    const parsedPrice = parseFloat(body.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ success: false, message: 'A valid positive price is required' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    const updatedData: Record<string, any> = {
      name: body.name.trim(),
      price: parsedPrice,
      silver_price: body.silver_price !== undefined && body.silver_price !== '' && !isNaN(parseFloat(body.silver_price))
        ? parseFloat(body.silver_price)
        : null,
      gold_price: body.gold_price !== undefined && body.gold_price !== '' && !isNaN(parseFloat(body.gold_price))
        ? parseFloat(body.gold_price)
        : null,
      stock: body.stock !== undefined && !isNaN(parseInt(body.stock)) ? parseInt(body.stock) : 0,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      updated_at: new Date().toISOString(),
    };

    if (body.game_id !== undefined) {
      updatedData.game_id = body.game_id || null;
    }

    const { data, error } = await adminSupabase
      .from('products')
      .update(updatedData)
      .eq('id', body.id)
      .select('*, games(id, title, slug, image_path, category)')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data, message: 'Product updated successfully' });
  } catch (err: any) {
    console.error('Error updating product:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing product ID' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();
    const { error } = await adminSupabase.from('products').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

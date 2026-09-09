import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    const { data: games, error } = await adminSupabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, games: games || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, category, image_path, description, developer, is_active = true } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Game title is required' }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newGame = {
      title: title.trim(),
      slug: cleanSlug,
      category: (category || 'MOBILE').trim(),
      image_path: image_path || null,
      description: description || null,
      developer: developer || null,
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase
      .from('games')
      .insert([newGame])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, game: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, slug, category, image_path, description, developer, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Game ID is required' }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) {
      updates.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    if (category !== undefined) updates.category = category.trim();
    if (image_path !== undefined) updates.image_path = image_path;
    if (description !== undefined) updates.description = description;
    if (developer !== undefined) updates.developer = developer;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, game: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Game ID is required' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();
    const { error } = await adminSupabase.from('games').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Game removed from catalog successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

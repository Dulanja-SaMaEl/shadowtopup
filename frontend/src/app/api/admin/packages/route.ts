import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/authGuard';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Service Role Key');
  }
  return createAdminClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  try {
    const adminSupabase = getAdminClient();
    const { data, error } = await adminSupabase
      .from('packages')
      .select('*')
      .order('shell_cost', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, packages: data });
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
    const adminSupabase = getAdminClient();

    const diamondAmount = parseInt(body.diamond_amount);
    const shellCost = parseInt(body.shell_cost);
    const normalPrice = parseFloat(body.normal_price);
    const silverPrice = parseFloat(body.silver_price);
    const goldPrice = parseFloat(body.gold_price);

    const newPackage = {
      package_name: body.package_name?.trim() || 'New Package',
      package_type: body.package_type || 'diamond',
      diamond_amount: !isNaN(diamondAmount) ? diamondAmount : 100,
      shell_cost: !isNaN(shellCost) ? shellCost : 100,
      normal_price: !isNaN(normalPrice) ? normalPrice : 350.00,
      silver_price: !isNaN(silverPrice) ? silverPrice : null,
      gold_price: !isNaN(goldPrice) ? goldPrice : null,
      image_url: body.image_url?.trim() || 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
      badge: body.badge?.trim() || null,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    };

    const { data, error } = await adminSupabase
      .from('packages')
      .insert([newPackage])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, package: data });
  } catch (err: any) {
    console.error('Error adding package:', err);
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
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Missing package ID' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    const diamondAmount = parseInt(body.diamond_amount);
    const shellCost = parseInt(body.shell_cost);
    const normalPrice = parseFloat(body.normal_price);
    const silverPrice = parseFloat(body.silver_price);
    const goldPrice = parseFloat(body.gold_price);

    const updatedData: Record<string, any> = {
      package_name: body.package_name?.trim() || 'Package',
      package_type: body.package_type || 'diamond',
      diamond_amount: !isNaN(diamondAmount) ? diamondAmount : 100,
      shell_cost: !isNaN(shellCost) ? shellCost : 100,
      normal_price: !isNaN(normalPrice) ? normalPrice : 350.00,
      silver_price: !isNaN(silverPrice) ? silverPrice : null,
      gold_price: !isNaN(goldPrice) ? goldPrice : null,
      image_url: body.image_url?.trim() || 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
      badge: body.badge?.trim() || null,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from('packages')
      .update(updatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, package: data, message: 'Package updated successfully' });
  } catch (err: any) {
    console.error('Error updating package:', err);
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
      return NextResponse.json({ success: false, message: 'Missing package ID' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();
    const { error } = await adminSupabase.from('packages').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting package:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

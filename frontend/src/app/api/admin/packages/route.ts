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
    const body = await request.json();
    const adminSupabase = getAdminClient();

    const newPackage = {
      package_name: body.package_name,
      package_type: body.package_type || 'diamond',
      diamond_amount: parseInt(body.diamond_amount) || 100,
      shell_cost: parseInt(body.shell_cost) || 100,
      normal_price: parseFloat(body.normal_price) || 350.00,
      silver_price: parseFloat(body.silver_price) || 320.00,
      gold_price: parseFloat(body.gold_price) || 300.00,
      image_url: body.image_url || 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png',
      badge: body.badge || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
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
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Missing package ID' }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    const updatedData: Record<string, any> = {
      package_name: body.package_name,
      package_type: body.package_type,
      diamond_amount: parseInt(body.diamond_amount),
      shell_cost: parseInt(body.shell_cost),
      normal_price: parseFloat(body.normal_price),
      silver_price: parseFloat(body.silver_price),
      gold_price: parseFloat(body.gold_price),
      image_url: body.image_url,
      badge: body.badge || null,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase
      .from('packages')
      .update(updatedData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, package: data });
  } catch (err: any) {
    console.error('Error updating package:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

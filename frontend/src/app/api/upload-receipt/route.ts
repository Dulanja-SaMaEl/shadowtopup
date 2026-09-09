import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/authGuard';
import { validateImageUpload } from '@/lib/fileSecurity';

export async function POST(request: NextRequest) {
  try {
    // 1. Require authenticated session
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Authentication required to upload receipts.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Validate file size and magic bytes (JPEG, PNG, WebP only)
    const validation = validateImageUpload(file.name, buffer);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;

    // Fallback if ImgBB API key not configured
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        url: 'https://images.unsplash.com/photo-1607513746994-51f730a44833?q=80&w=600&auto=format&fit=crop',
        note: 'Fallback receipt image used. Configure IMGBB_API_KEY for live upload storage.',
      });
    }

    const base64Image = buffer.toString('base64');
    const bodyParams = new URLSearchParams();
    bodyParams.append('image', base64Image);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: bodyParams,
    });

    const data = await imgbbRes.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
      });
    }

    return NextResponse.json({ success: false, message: 'ImgBB upload failed' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

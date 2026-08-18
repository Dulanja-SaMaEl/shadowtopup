import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    
    // If no API key is provided, we simulate a successful upload for development
    // Using a base64 data URL often crashes PostgreSQL varchar columns due to length!
    if (!apiKey) {
      console.warn("IMGBB_API_KEY is missing! Simulating receipt upload with a placeholder image to prevent database insertion crashes.");
      return NextResponse.json({
        success: true,
        // We use a high quality placeholder receipt image from Unsplash as fallback so the database column doesn't crash on length constraints
        url: 'https://images.unsplash.com/photo-1607513746994-51f730a44833?q=80&w=600&auto=format&fit=crop',
        note: 'Fallback placeholder used. Set IMGBB_API_KEY for real uploads.',
      });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
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

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      // Fallback: Store compressed base64 data URI if API key is not yet set
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';
      const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

      return NextResponse.json({
        success: true,
        url: dataUri,
        note: 'Fallback base64 uri generated. Set IMGBB_API_KEY for external hosting.',
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

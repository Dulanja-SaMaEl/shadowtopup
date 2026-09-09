import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get('image') || formData.get('file')) as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${Date.now()}_${cleanBase}${ext}`;

    // 1. Save local backup to public/uploads/games/
    try {
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'games');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploadsDir, safeFilename), buffer);
    } catch (localErr) {
      console.warn('Local file write warning:', localErr);
    }

    let publicUrl = `/uploads/games/${safeFilename}`;

    // 2. Upload to Supabase Storage bucket 'game-images'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);
        
        // Ensure bucket exists
        const { data: bucketData } = await adminSupabase.storage.getBucket('game-images');
        if (!bucketData) {
          await adminSupabase.storage.createBucket('game-images', { public: true });
        }

        const { error: uploadErr } = await adminSupabase.storage
          .from('game-images')
          .upload(safeFilename, buffer, {
            contentType: file.type || 'image/png',
            upsert: true,
          });

        if (!uploadErr) {
          const { data: urlObj } = adminSupabase.storage
            .from('game-images')
            .getPublicUrl(safeFilename);
          if (urlObj?.publicUrl) {
            publicUrl = urlObj.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload note:', uploadErr.message);
        }
      } catch (storageErr) {
        console.warn('Supabase storage exception:', storageErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
    });
  } catch (err: any) {
    console.error('Game image upload error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Upload failed' }, { status: 500 });
  }
}

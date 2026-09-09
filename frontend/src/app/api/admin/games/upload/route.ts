import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/authGuard';
import { validateImageUpload, sanitizeFileName } from '@/lib/fileSecurity';

export async function POST(request: NextRequest) {
  try {
    // 1. Require admin privileges
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = (formData.get('image') || formData.get('file')) as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Validate file size, extension, and magic bytes
    const validation = validateImageUpload(file.name, buffer);
    if (!validation.valid) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
    }

    const safeFilename = sanitizeFileName(file.name);

    // 3. Save local backup to public/uploads/games/
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

    // 4. Upload to Supabase Storage bucket 'game-images'
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

        const mimeType = validation.safeExtension === '.png'
          ? 'image/png'
          : validation.safeExtension === '.webp'
          ? 'image/webp'
          : 'image/jpeg';

        const { error: uploadErr } = await adminSupabase.storage
          .from('game-images')
          .upload(safeFilename, buffer, {
            contentType: mimeType,
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

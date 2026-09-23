import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendPasswordChangedNotificationEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp, verificationToken, newPassword } = body;

    const submittedOtp = String(otp || '').trim().replace(/\D/g, '');
    const cleanToken = String(verificationToken || '').trim();
    const cleanPassword = String(newPassword || '');

    if (!submittedOtp || submittedOtp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter the complete 6-digit verification code.' },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!cleanToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset session. Please request a new code.' },
        { status: 400 }
      );
    }

    // 1. Decode and verify HMAC token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const secretKey = supabaseServiceKey || 'shadow-secret-key-2026';

    let tokenData: any = null;
    try {
      const decodedString = Buffer.from(cleanToken, 'base64url').toString('utf8');
      tokenData = JSON.parse(decodedString);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token format. Please request a new code.' },
        { status: 400 }
      );
    }

    const { payload, hmac } = tokenData || {};
    if (!payload || !hmac) {
      return NextResponse.json(
        { success: false, message: 'Corrupted reset session token. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Verify HMAC signature
    const payloadString = JSON.stringify(payload);
    const expectedHmac = crypto.createHmac('sha256', secretKey).update(payloadString).digest('hex');

    if (hmac !== expectedHmac) {
      return NextResponse.json(
        { success: false, message: 'Security signature mismatch. Please request a new code.' },
        { status: 400 }
      );
    }

    // 3. Verify purpose
    if (payload.purpose !== 'password_reset') {
      return NextResponse.json(
        { success: false, message: 'Invalid token purpose. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // 4. Check expiration
    if (Date.now() > Number(payload.expiresAt || 0)) {
      return NextResponse.json(
        { success: false, message: 'Password reset code has expired (10 minutes limit). Please request a fresh code.' },
        { status: 400 }
      );
    }

    // 5. Check OTP match
    if (submittedOtp !== String(payload.otp)) {
      return NextResponse.json(
        { success: false, message: 'Incorrect 6-digit verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // 6. Update user's password in Supabase Auth
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { error: updateErr } = await adminSupabase.auth.admin.updateUserById(payload.userId, {
      password: cleanPassword,
    });

    if (updateErr) {
      console.error('[verify-and-reset] Supabase updateUserById error:', updateErr);
      return NextResponse.json(
        { success: false, message: `Failed to update password: ${updateErr.message || 'Database error'}` },
        { status: 500 }
      );
    }

    // 7. Send Security Confirmation Email asynchronously
    sendPasswordChangedNotificationEmail(payload.email, payload.name || 'Player').catch((err) =>
      console.warn('[verify-and-reset] Notification email note:', err)
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
      email: payload.email,
    });
  } catch (err: any) {
    console.error('[verify-and-reset] Exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Password reset failed' },
      { status: 500 }
    );
  }
}

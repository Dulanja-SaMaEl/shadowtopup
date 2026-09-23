import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendPasswordResetOtpEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error: missing database credentials.' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify user exists in profiles or auth
    const { data: profiles, error: profileErr } = await adminSupabase
      .from('profiles')
      .select('id, email, name')
      .eq('email', cleanEmail)
      .limit(1);

    if (profileErr) {
      console.error('[send-password-reset-otp] Profile query error:', profileErr);
    }

    let targetUserId = profiles && profiles[0] ? profiles[0].id : null;
    let targetName = profiles && profiles[0]?.name ? profiles[0].name : '';

    // Fallback: If not in profiles, search via auth admin list
    if (!targetUserId) {
      const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
      const matched = authUsers?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (matched) {
        targetUserId = matched.id;
        targetName = matched.user_metadata?.name || '';
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: 'No registered account found with this email address. Please check your spelling or register a new account.' },
        { status: 404 }
      );
    }

    // 2. Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Create cryptographically signed verification token
    const secretKey = supabaseServiceKey || 'shadow-secret-key-2026';
    const payload = {
      email: cleanEmail,
      userId: targetUserId,
      name: targetName,
      otp: otpCode,
      purpose: 'password_reset',
      expiresAt,
    };
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secretKey).update(payloadString).digest('hex');
    const verificationToken = Buffer.from(JSON.stringify({ payload, hmac })).toString('base64url');

    // 4. Send the OTP via Resend
    const emailResult = await sendPasswordResetOtpEmail(cleanEmail, targetName || 'Player', otpCode, 10);
    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: `Failed to deliver reset code: ${emailResult.error || 'Email service unavailable'}. Please verify your email or try again later.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}. Please check your inbox!`,
      verificationToken,
      expiresAt,
    });
  } catch (err: any) {
    console.error('[send-password-reset-otp] Exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to send password reset code' },
      { status: 500 }
    );
  }
}

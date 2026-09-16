import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendRegistrationOtpEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const trimmedName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!rawPassword || rawPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { data: existingProfiles } = await adminSupabase
      .from('profiles')
      .select('id, email')
      .eq('email', cleanEmail)
      .limit(1);

    if (existingProfiles && existingProfiles.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create cryptographically signed verification token
    const secretKey = supabaseServiceKey || 'shadow-secret-key-2026';
    const payload = {
      email: cleanEmail,
      name: trimmedName,
      password: rawPassword,
      otp: otpCode,
      expiresAt,
    };
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secretKey).update(payloadString).digest('hex');
    const verificationToken = Buffer.from(JSON.stringify({ payload, hmac })).toString('base64url');

    // Send the OTP via Gmail SMTP
    const emailResult = await sendRegistrationOtpEmail(cleanEmail, trimmedName, otpCode, 10);
    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: `Failed to deliver verification email: ${emailResult.error || 'SMTP delivery issue'}. Please verify your email address.` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox!`,
      verificationToken,
      expiresAt,
    });
  } catch (err: any) {
    console.error('[send-registration-otp] Exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

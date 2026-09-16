import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp, verificationToken } = body;

    const submittedOtp = String(otp || '').trim().replace(/\D/g, '');
    const cleanToken = String(verificationToken || '').trim();

    if (!submittedOtp || submittedOtp.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter the complete 6-digit verification code.' },
        { status: 400 }
      );
    }

    if (!cleanToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing verification session. Please request a new code.' },
        { status: 400 }
      );
    }

    // Decode and verify HMAC token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const secretKey = supabaseServiceKey || 'shadow-secret-key-2026';

    let tokenData: any = null;
    try {
      const decodedString = Buffer.from(cleanToken, 'base64url').toString('utf8');
      tokenData = JSON.parse(decodedString);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token format. Please request a new code.' },
        { status: 400 }
      );
    }

    const { payload, hmac } = tokenData || {};
    if (!payload || !hmac) {
      return NextResponse.json(
        { success: false, message: 'Corrupted verification token. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify HMAC signature
    const payloadString = JSON.stringify(payload);
    const expectedHmac = crypto.createHmac('sha256', secretKey).update(payloadString).digest('hex');

    if (hmac !== expectedHmac) {
      return NextResponse.json(
        { success: false, message: 'Security signature mismatch. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > Number(payload.expiresAt || 0)) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check OTP match
    if (submittedOtp !== String(payload.otp)) {
      return NextResponse.json(
        { success: false, message: 'Incorrect 6-digit verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // Create user in Supabase with verified email
    const adminSupabase = createAdminClient(supabaseUrl, supabaseServiceKey);

    const { data: createdUserData, error: createErr } = await adminSupabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        name: payload.name,
      },
    });

    if (createErr || !createdUserData.user) {
      // If user already exists in auth, try updating password or confirm
      if (createErr?.message?.toLowerCase().includes('already') || createErr?.message?.toLowerCase().includes('registered')) {
        return NextResponse.json(
          { success: false, message: 'This email is already registered. Please sign in.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: `Account creation failed: ${createErr?.message || 'Database error'}` },
        { status: 500 }
      );
    }

    const userId = createdUserData.user.id;

    // Ensure Profile record
    await adminSupabase.from('profiles').upsert({
      id: userId,
      email: payload.email,
      name: payload.name,
      role: 'normal',
      wallet_balance: 0,
      updated_at: new Date().toISOString(),
    });

    // Send Welcome / Thank You Email asynchronously
    try {
      await sendWelcomeEmail(payload.email, payload.name);
    } catch (welcomeErr) {
      console.warn('[verify-registration-otp] Welcome email note:', welcomeErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account verified and created successfully! Welcome to Shadow Store.',
      email: payload.email,
      name: payload.name,
    });
  } catch (err: any) {
    console.error('[verify-registration-otp] Exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

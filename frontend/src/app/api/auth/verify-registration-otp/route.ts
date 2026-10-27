import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/emailService';
import { decryptAuthPayload, hashOtpCode } from '@/lib/authToken';

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const secretKey = supabaseServiceKey;

    // 1. Decrypt AES-256-GCM token
    const payload = decryptAuthPayload<{
      email: string;
      name: string;
      password: string;
      otpHash: string;
      purpose: string;
      expiresAt: number;
    }>(cleanToken, secretKey);

    if (!payload || !payload.email || !payload.otpHash || !payload.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid or corrupted verification token. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Check expiration
    if (Date.now() > Number(payload.expiresAt || 0)) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. Verify OTP using constant-time comparison
    const expectedHash = hashOtpCode(submittedOtp, payload.email, secretKey);
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    const actualBuf = Buffer.from(payload.otpHash, 'hex');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return NextResponse.json(
        { success: false, message: 'Incorrect 6-digit verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // 4. Create user in Supabase with verified email
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
      if (createErr?.message?.toLowerCase().includes('already') || createErr?.message?.toLowerCase().includes('registered')) {
        return NextResponse.json(
          { success: false, message: 'This email is already registered. Please sign in.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: `Account creation failed: ${createErr?.message || 'Database error'}` },
        { status: 400 }
      );
    }

    const newUserId = createdUserData.user.id;

    // 5. Ensure profile row exists in profiles table
    await adminSupabase
      .from('profiles')
      .upsert({
        id: newUserId,
        email: payload.email,
        name: payload.name,
        role: 'normal',
        wallet_balance: 0,
        reseller_status: 'none',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    // 6. Send welcome email asynchronously
    sendWelcomeEmail(payload.email, payload.name).catch((err) =>
      console.warn('[verify-registration-otp] Welcome email note:', err)
    );

    return NextResponse.json({
      success: true,
      message: 'Account verified and registered successfully! You can now log in.',
    });
  } catch (err: any) {
    console.error('[verify-registration-otp] Exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

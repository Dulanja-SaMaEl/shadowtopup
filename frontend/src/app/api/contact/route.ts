import { NextRequest, NextResponse } from 'next/server';
import { sendContactInquiryEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Please provide your name.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Please enter your message or inquiry.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    const result = await sendContactInquiryEmail({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to dispatch inquiry. Please try again or reach us via WhatsApp.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received! Our support team will get back to you shortly.',
    });
  } catch (err: any) {
    console.error('[ContactAPI] Error handling contact form submission:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'An unexpected error occurred while processing your message.',
    }, { status: 500 });
  }
}

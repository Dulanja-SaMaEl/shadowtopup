import { Resend } from 'resend';

// Resend singleton
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set');
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// For Resend free tier, use their verified domain as the from address
// Your custom sender name will still show as "Shadow Store"
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'Shadow Store <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'adminshadowstorelk.com@gmail.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowtopup.com';

/**
 * Base Responsive Cyberpunk / Esports Email Shell
 */
function renderEmailShell({
  title,
  preheader,
  contentHtml,
  badgeText,
  badgeColor = '#a855f7',
}: {
  title: string;
  preheader: string;
  contentHtml: string;
  badgeText?: string;
  badgeColor?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #07060e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 12px !important; }
      .content-cell { padding: 24px 16px !important; }
      .otp-box { font-size: 32px !important; letter-spacing: 6px !important; }
      .stat-box { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07060e; color: #e2e8f0;">
  <!-- Preheader text (invisible preview) -->
  <div style="display: none; font-size: 1px; color: #07060e; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #07060e;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 580px; background-color: #110e24; border: 1px solid #281e4a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Neon Laser Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #06b6d4, #a855f7, #ec4899); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 28px 24px 20px 24px; border-bottom: 1px solid #1e173a; background-color: #0e0b1f;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left">
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: 1.5px; color: #ffffff; text-transform: uppercase;">
                      SHADOW<span style="color: #a855f7;">STORE</span>
                    </span>
                    <span style="display: block; font-size: 10px; font-family: monospace; color: #94a3b8; letter-spacing: 1px; margin-top: 2px;">
                      // GARENA FREE FIRE OFFICIAL DISPATCH
                    </span>
                  </td>
                  ${badgeText ? `
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: ${badgeColor}; border: 1px solid ${badgeColor}55; background-color: ${badgeColor}15;">
                      ${badgeText}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content-cell" style="padding: 32px 28px; background-color: #110e24;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #090714; border-top: 1px solid #1e173a; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                Need help or have questions regarding your order?<br />
                Our Sri Lankan support desk is live 24/7 on WhatsApp &amp; Email.
              </p>
              <div style="margin-bottom: 16px;">
                <a href="https://wa.me/94765604635" style="display: inline-block; padding: 6px 14px; margin: 0 4px; background-color: #191433; border: 1px solid #2d2358; border-radius: 6px; color: #10b981; font-size: 11px; font-family: monospace; text-decoration: none; font-weight: bold;">
                  WHATSAPP: 076 560 4635
                </a>
                <a href="mailto:${ADMIN_EMAIL}" style="display: inline-block; padding: 6px 14px; margin: 0 4px; background-color: #191433; border: 1px solid #2d2358; border-radius: 6px; color: #a855f7; font-size: 11px; font-family: monospace; text-decoration: none; font-weight: bold;">
                  ${ADMIN_EMAIL}
                </a>
              </div>
              <p style="margin: 0; font-size: 10px; font-family: monospace; color: #64748b; letter-spacing: 0.5px;">
                &copy; ${new Date().getFullYear()} SHADOW STORE &bull; ALL RIGHTS RESERVED &bull; SECURE AUTOMATED TOP-UP GATEWAY
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Send Registration OTP Verification Email
 */
export async function sendRegistrationOtpEmail(
  toEmail: string,
  name: string,
  otpCode: string,
  expiresMinutes: number = 10
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();

    const contentHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
        Account Verification Code
      </h2>
      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Hi <strong style="color: #ffffff;">${name || 'Player'}</strong>, welcome to <strong style="color: #a855f7;">Shadow Store</strong>! To complete your registration and activate instant Garena top-up rates, enter the 6-digit verification code below:
      </p>

      <!-- OTP Box -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 28px 0;">
        <tr>
          <td align="center" style="padding: 24px 16px; background-color: #0a0817; border: 1px dashed #a855f7; border-radius: 12px; box-shadow: inset 0 0 20px rgba(168, 85, 247, 0.15);">
            <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #94a3b8; letter-spacing: 2px; display: block; margin-bottom: 8px;">
              YOUR 6-DIGIT VERIFICATION CODE
            </span>
            <div class="otp-box" style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #06b6d4; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 16px rgba(6, 182, 212, 0.5);">
              ${otpCode}
            </div>
            <span style="font-size: 11px; font-family: monospace; color: #f59e0b; display: block; margin-top: 10px;">
              ⏱ Valid for ${expiresMinutes} minutes &bull; Do not share this code
            </span>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        If you did not request this registration, you can safely ignore this message. No account will be created without this verification code.
      </p>
    `;

    const html = renderEmailShell({
      title: `${otpCode} is your Shadow Store Verification Code`,
      preheader: `Your 6-digit verification code is ${otpCode}. Valid for ${expiresMinutes} minutes.`,
      contentHtml,
      badgeText: 'SECURITY VERIFY',
      badgeColor: '#06b6d4',
    });

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toEmail],
      subject: `🔐 ${otpCode} - Shadow Store Account Verification Code`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Error sending Registration OTP email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Welcome & Thank You for Registering Email
 */
export async function sendWelcomeEmail(
  toEmail: string,
  name: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();

    const contentHtml = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 40px; margin-bottom: 8px;">⚡</span>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 900; color: #ffffff;">
          Welcome to Shadow Store!
        </h2>
        <p style="margin: 0; font-size: 14px; color: #a855f7; font-family: monospace; font-weight: bold; letter-spacing: 1px;">
          YOUR ACCOUNT IS ACTIVATED &amp; READY
        </p>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Hi <strong style="color: #ffffff;">${name || 'Player'}</strong>,<br />
        Thank you for creating your account with <strong>Shadow Store</strong>, Sri Lanka's premier automated gaming recharge network.
      </p>

      <!-- Perks Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 28px 0; background-color: #0a0817; border: 1px solid #1f1a3a; border-radius: 12px; padding: 16px;">
        <tr>
          <td style="padding: 12px;">
            <div style="font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
              💎 Instant Free Fire Top-Up
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
              Recharge Free Fire Diamonds, Weekly Passes, and Monthly VIP instantly with in-game UID verification.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-top: 1px solid #1a1633;">
            <div style="font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
              ⚡ Shadow Wallet &amp; Dialog eZ Cash
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
              Preload your wallet or verify payments in seconds using Dialog eZ Cash SMS RN numbers.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-top: 1px solid #1a1633;">
            <div style="font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 4px;">
              🏆 Standard &amp; Elite Wholesale Reseller Tiers
            </div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
              Upgrade to Standard Reseller (8% discount) or Elite Reseller (15% discount) to build your own gaming business.
            </div>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom: 12px;">
            <a href="${SITE_URL}/games/free-fire" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #7c3aed, #a855f7); color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);">
              Explore Packages &amp; Top-Up Now &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = renderEmailShell({
      title: `Welcome to Shadow Store, ${name}!`,
      preheader: `Thank you for registering at Shadow Store. Enjoy instant Garena Free Fire top-ups and wholesale reseller pricing.`,
      contentHtml,
      badgeText: 'WELCOME VIP',
      badgeColor: '#10b981',
    });

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toEmail],
      subject: `⚡ Welcome to Shadow Store, ${name || 'Player'}! Account Activated`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Error sending Welcome email:', err);
    return { success: false, error: err.message };
  }
}

export interface PurchaseReceiptEmailData {
  orderId: string;
  transactionId?: string;
  packageName: string;
  diamonds?: number | string;
  playerUid: string;
  playerNickname?: string;
  amount: number;
  paymentMethod: string;
  status: 'COMPLETED & DELIVERED' | 'PENDING VERIFICATION' | string;
  itemsDelivered?: string;
  resellerRole?: string | null;
  date?: string;
}

/**
 * 3. Send Order Purchase Receipt Email
 */
export async function sendPurchaseReceiptEmail(
  toEmail: string,
  receipt: PurchaseReceiptEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();

    const isCompleted = receipt.status?.toLowerCase().includes('completed') || receipt.status?.toLowerCase().includes('delivered');
    const statusColor = isCompleted ? '#10b981' : '#f59e0b';
    const statusText = isCompleted ? 'COMPLETED & DELIVERED' : 'PENDING VERIFICATION';

    let formattedMethod = 'Shadow Wallet';
    const rawMethod = (receipt.paymentMethod || '').toLowerCase();
    if (rawMethod.includes('ez_cash') || rawMethod.includes('ez cash')) formattedMethod = 'Dialog eZ Cash';
    else if (rawMethod.includes('bank')) formattedMethod = 'Bank Transfer';

    const contentHtml = `
      <div style="margin-bottom: 24px;">
        <span style="font-size: 11px; font-family: monospace; color: #a855f7; text-transform: uppercase; letter-spacing: 1px;">
          OFFICIAL TRANSACTION INVOICE
        </span>
        <h2 style="margin: 4px 0 6px 0; font-size: 22px; font-weight: 900; color: #ffffff;">
          ${isCompleted ? 'Top-Up Delivered Successfully!' : 'Order Placed & Under Review'}
        </h2>
        <p style="margin: 0; font-size: 13px; color: #94a3b8;">
          Order ID: <strong style="color: #ffffff; font-family: monospace;">#${receipt.orderId}</strong> &bull; ${receipt.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <!-- Receipt Summary Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #0a0817; border: 1px solid #241c42; border-radius: 12px; overflow: hidden;">
        
        <!-- Status Row -->
        <tr>
          <td colspan="2" style="padding: 14px 18px; background-color: #0e0b1f; border-bottom: 1px solid #1e173a;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size: 11px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
                  ORDER STATUS:
                </td>
                <td align="right">
                  <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: ${statusColor};">
                    ● ${statusText}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Item & Diamonds -->
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Item / Package</td>
          <td align="right" style="padding: 12px 18px; font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #17132e;">
            ${receipt.itemsDelivered || receipt.packageName}
          </td>
        </tr>

        <!-- Player UID -->
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Player UID</td>
          <td align="right" style="padding: 12px 18px; font-size: 13px; font-family: monospace; font-weight: bold; color: #06b6d4; border-bottom: 1px solid #17132e;">
            ${receipt.playerUid}
          </td>
        </tr>

        ${receipt.playerNickname ? `
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">In-Game Nickname</td>
          <td align="right" style="padding: 12px 18px; font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #17132e;">
            ${receipt.playerNickname}
          </td>
        </tr>` : ''}

        ${receipt.transactionId ? `
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Transaction / RN Ref</td>
          <td align="right" style="padding: 12px 18px; font-size: 12px; font-family: monospace; color: #cbd5e1; border-bottom: 1px solid #17132e;">
            ${receipt.transactionId}
          </td>
        </tr>` : ''}

        <!-- Payment Method -->
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Payment Method</td>
          <td align="right" style="padding: 12px 18px; font-size: 12px; color: #ffffff; border-bottom: 1px solid #17132e;">
            ${formattedMethod}
          </td>
        </tr>

        ${receipt.resellerRole && receipt.resellerRole !== 'normal' ? `
        <tr>
          <td style="padding: 12px 18px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Wholesale Tier</td>
          <td align="right" style="padding: 12px 18px; font-size: 12px; font-weight: bold; color: #f59e0b; font-family: monospace; border-bottom: 1px solid #17132e;">
            ${receipt.resellerRole === 'gold' ? 'ELITE RESELLER' : receipt.resellerRole === 'silver' ? 'STANDARD RESELLER' : String(receipt.resellerRole).toUpperCase()}
          </td>
        </tr>` : ''}

        <!-- Total Paid -->
        <tr style="background-color: #0e0b1f;">
          <td style="padding: 16px 18px; font-size: 13px; font-weight: bold; color: #ffffff;">Total Amount</td>
          <td align="right" style="padding: 16px 18px; font-size: 18px; font-weight: 900; font-family: monospace; color: #10b981;">
            LKR ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      </table>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-top: 8px;">
            <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1a1538; border: 1px solid #a855f7; color: #ffffff; font-size: 12px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; border-radius: 8px;">
              View in Customer Dashboard &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = renderEmailShell({
      title: `Order Receipt #${receipt.orderId} - Shadow Store`,
      preheader: `Receipt for order #${receipt.orderId}: ${receipt.packageName} to UID ${receipt.playerUid}. Status: ${statusText}.`,
      contentHtml,
      badgeText: isCompleted ? 'DELIVERED' : 'PENDING',
      badgeColor: statusColor,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toEmail],
      subject: `💎 Order Receipt #${receipt.orderId} - Free Fire Top-Up (${isCompleted ? 'Delivered' : 'Pending'})`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Error sending Purchase Receipt email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Send Reseller Promotion Email
 */
export async function sendResellerPromotedEmail(
  toEmail: string,
  name: string,
  tier: 'silver' | 'gold' | string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();

    const normalizedTier = tier.toLowerCase();
    const isElite = normalizedTier === 'gold';
    const tierTitle = isElite ? 'Elite Reseller' : 'Standard Reseller';
    const discountRate = isElite ? '15% OFF' : '8% OFF';
    const tierColor = isElite ? '#f59e0b' : '#06b6d4';

    const contentHtml = `
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 40px; margin-bottom: 8px;">🏆</span>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 900; color: #ffffff;">
          Congratulations, ${name || 'Partner'}!
        </h2>
        <p style="margin: 0; font-size: 14px; color: ${tierColor}; font-family: monospace; font-weight: bold; letter-spacing: 1px;">
          YOU ARE NOW AN OFFICIAL ${tierTitle.toUpperCase()}
        </p>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Your partnership application has been approved by the Shadow Store management team! You now have direct wholesale access to automated Garena Free Fire top-ups at exclusive discounted rates.
      </p>

      <!-- Tier Benefits Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 24px 0; background-color: #0a0817; border: 1px solid ${tierColor}44; border-radius: 12px; padding: 18px;">
        <tr>
          <td>
            <div style="font-size: 12px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">
              YOUR ACTIVE WHOLESALE PRIVILEGES:
            </div>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #e2e8f0; line-height: 1.8;">
              <li><strong style="color: ${tierColor};">${discountRate} Wholesale Rate</strong> across all Free Fire Diamond packages &amp; passes.</li>
              <li><strong>High-Speed Automated Queue</strong> with Garena API dispatch under 30 seconds.</li>
              <li><strong>Batch Shopping Cart &amp; Reseller Dashboard</strong> with sales analytics and profit tracking.</li>
              <li><strong>Priority WhatsApp Support Desk</strong> for fast balance reloads and custom requests.</li>
            </ul>
          </td>
        </tr>
      </table>

      <!-- Action Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-top: 8px;">
            <a href="${SITE_URL}/dashboard" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #7c3aed, #a855f7); color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);">
              Access Reseller Dashboard &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = renderEmailShell({
      title: `You've Been Promoted to ${tierTitle}!`,
      preheader: `Congratulations! Your account has been upgraded to ${tierTitle} with ${discountRate} wholesale pricing.`,
      contentHtml,
      badgeText: tierTitle.toUpperCase(),
      badgeColor: tierColor,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [toEmail],
      subject: `🏆 Congratulations! You are now an Official ${tierTitle} on Shadow Store`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Error sending Reseller Promotion email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 5. Send Contact Us Inquiry Email (Admin Forward + Customer Confirmation)
 */
export async function sendContactInquiryEmail(inquiry: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();

    // 1. Email to Admin
    const adminContentHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
        New Customer Support Inquiry
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 13px; color: #94a3b8;">
        Received from the contact desk at ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.
      </p>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0817; border: 1px solid #1f1a3a; border-radius: 12px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px 16px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e; width: 100px;">Customer:</td>
          <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #ffffff; border-bottom: 1px solid #17132e;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 16px; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #17132e;">Email:</td>
          <td style="padding: 12px 16px; font-size: 13px; font-family: monospace; color: #06b6d4; border-bottom: 1px solid #17132e;">${inquiry.email}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 16px; font-size: 13px; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap;">
            <strong>Message Content:</strong><br /><br />
            ${inquiry.message}
          </td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #64748b; margin: 0;">
        Tip: Reply to this email to respond directly to <strong style="color: #cbd5e1;">${inquiry.email}</strong>.
      </p>
    `;

    const adminHtml = renderEmailShell({
      title: `Support Ticket: ${inquiry.name}`,
      preheader: `Customer inquiry from ${inquiry.name} (${inquiry.email}): ${inquiry.message.slice(0, 80)}`,
      contentHtml: adminContentHtml,
      badgeText: 'SUPPORT TICKET',
      badgeColor: '#06b6d4',
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [ADMIN_EMAIL],
      replyTo: inquiry.email,
      subject: `📩 Support Ticket from ${inquiry.name} (${inquiry.email})`,
      html: adminHtml,
    });

    // 2. Confirmation to Customer
    const customerContentHtml = `
      <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff;">
        We Received Your Message!
      </h2>
      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Hi <strong style="color: #ffffff;">${inquiry.name}</strong>,<br />
        Thank you for contacting Shadow Store. Our support desk has received your inquiry and our team is currently reviewing it.
      </p>

      <div style="background-color: #0a0817; border: 1px solid #1f1a3a; border-radius: 12px; padding: 16px; margin: 18px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
        <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #a855f7; display: block; margin-bottom: 6px;">
          COPY OF YOUR MESSAGE:
        </span>
        <div style="color: #cbd5e1; font-style: italic; white-space: pre-wrap;">"${inquiry.message}"</div>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
        For urgent payment verifications or top-up issues, you can also reach our WhatsApp helpline at <strong style="color: #10b981;">076 560 4635</strong>.
      </p>
    `;

    const customerHtml = renderEmailShell({
      title: `We Received Your Message - Shadow Store`,
      preheader: `Thank you for contacting Shadow Store. We have received your inquiry and will reply shortly.`,
      contentHtml: customerContentHtml,
      badgeText: 'TICKET RECEIVED',
      badgeColor: '#10b981',
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [inquiry.email],
      subject: `🛡️ We Received Your Inquiry - Shadow Store Support Desk`,
      html: customerHtml,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[EmailService] Error processing Contact Us email:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. Send Low Garena Shell Stock Alert Email to Admin
 */
export async function sendLowStockAlertEmail(stockData: {
  totalShells: number;
  accounts: Array<{ username: string; balance: number }>;
  enduranceHours?: string | number;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();

    const accountsListHtml = stockData.accounts.map((acc) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 12px; font-family: monospace; color: #ffffff; border-bottom: 1px solid #1e173a;">${acc.username}</td>
        <td align="right" style="padding: 8px 12px; font-size: 12px; font-family: monospace; font-weight: bold; color: ${acc.balance < 500 ? '#ef4444' : '#f59e0b'}; border-bottom: 1px solid #1e173a;">
          ${acc.balance.toLocaleString()} Shells
        </td>
      </tr>
    `).join('');

    const contentHtml = `
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 8px; background-color: #ef444420; border: 1px solid #ef4444; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: bold; color: #ef4444; text-transform: uppercase;">
          ⚠️ CRITICAL STOCK WARNING
        </span>
        <h2 style="margin: 8px 0 6px 0; font-size: 22px; font-weight: 900; color: #ffffff;">
          Low Garena Shell Stock Alert
        </h2>
        <p style="margin: 0; font-size: 13px; color: #94a3b8;">
          Total shell inventory has dropped below the safety threshold. Immediate reload required to prevent automated top-up dispatch downtime.
        </p>
      </div>

      <!-- KPI Box -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 18px 0; background-color: #0e0b1f; border: 1px solid #ef444455; border-radius: 12px;">
        <tr>
          <td align="center" style="padding: 18px 12px; border-right: 1px solid #1e173a;">
            <span style="font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase; display: block;">
              REMAINING STOCK
            </span>
            <span style="font-size: 26px; font-weight: 900; font-family: monospace; color: #ef4444; display: block; margin-top: 4px;">
              ${stockData.totalShells.toLocaleString()}
            </span>
            <span style="font-size: 10px; color: #64748b;">SHELLS TOTAL</span>
          </td>
          <td align="center" style="padding: 18px 12px;">
            <span style="font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase; display: block;">
              EST. ENDURANCE
            </span>
            <span style="font-size: 26px; font-weight: 900; font-family: monospace; color: #f59e0b; display: block; margin-top: 4px;">
              ~${stockData.enduranceHours || '<2'}h
            </span>
            <span style="font-size: 10px; color: #64748b;">AT CURRENT VELOCITY</span>
          </td>
        </tr>
      </table>

      <!-- Accounts Breakdown -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0817; border: 1px solid #1f1a3a; border-radius: 8px; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #141029;">
            <th align="left" style="padding: 8px 12px; font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">Account</th>
            <th align="right" style="padding: 8px 12px; font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${accountsListHtml}
        </tbody>
      </table>

      <!-- Action Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <a href="${SITE_URL}/admin/shell-accounts" style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg, #ef4444, #dc2626); color: #ffffff; font-size: 13px; font-weight: bold; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);">
              Reload Garena Shells in Admin Suite &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = renderEmailShell({
      title: `Low Shell Stock Alert: ${stockData.totalShells} Shells Remaining`,
      preheader: `URGENT: Total Garena Shell balance is at ${stockData.totalShells}. Est. endurance ~${stockData.enduranceHours || '<2'}h.`,
      contentHtml,
      badgeText: 'LOW STOCK ALERT',
      badgeColor: '#ef4444',
    });

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [ADMIN_EMAIL],
      subject: `⚠️ [ALERT] Low Garena Shell Stock Warning: ${stockData.totalShells} Shells Remaining`,
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Error sending Low Stock Alert email:', err);
    return { success: false, error: err.message };
  }
}

import nodemailer from 'nodemailer';
import { recordEmailLog } from '@/app/lib/db';

export interface EmailServiceStatus {
  provider: 'resend' | 'smtp' | 'postmark' | 'development';
  configured: boolean;
  fromAddress: string;
  details: string;
}

export function getEmailServiceStatus(): EmailServiceStatus {
  const fromAddress = process.env.EMAIL_FROM?.trim() || 'Sentinel Security <security@sentinel.security>';

  if (process.env.RESEND_API_KEY?.trim()) {
    return {
      provider: 'resend',
      configured: true,
      fromAddress,
      details: 'Resend Transactional REST API (API key configured)',
    };
  }

  if (process.env.POSTMARK_SERVER_TOKEN?.trim()) {
    return {
      provider: 'postmark',
      configured: true,
      fromAddress,
      details: 'Postmark Transactional API (Server token configured)',
    };
  }

  if (process.env.SMTP_HOST?.trim()) {
    const host = process.env.SMTP_HOST.trim();
    const port = process.env.SMTP_PORT?.trim() || '587';
    return {
      provider: 'smtp',
      configured: true,
      fromAddress,
      details: `SMTP Relay (${host}:${port})`,
    };
  }

  return {
    provider: 'development',
    configured: false,
    fromAddress,
    details: 'Standby / Local Outbox (Set RESEND_API_KEY or SMTP credentials in .env.local for external delivery)',
  };
}

export function generatePasswordResetEmailHtml({
  resetUrl,
  userEmail,
  baseUrl,
}: {
  resetUrl: string;
  userEmail: string;
  baseUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Sentinel password</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1d1d1f;">
  <!-- Preheader text (hidden preview) -->
  <div style="display: none; font-size: 1px; color: #f5f5f7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Use this secure link to choose a new password for your Sentinel account.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e5e5ea; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); overflow: hidden;">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: left; border-bottom: 1px solid #f0f0f2;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <div style="width: 36px; height: 36px; background-color: #000000; border-radius: 10px; text-align: center; line-height: 36px; display: inline-block;">
                      <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">S</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 16px; font-weight: 700; letter-spacing: 0.5px; color: #1d1d1f; text-transform: uppercase;">Sentinel</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.4px; line-height: 1.3;">
                Reset your Sentinel password
              </h1>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #3a3a3c;">
                We received a request to reset the password for your Sentinel account (<strong style="color: #1d1d1f;">${userEmail}</strong>).
              </p>
              <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: #3a3a3c;">
                Use the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
                <tr>
                  <td align="left">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; font-size: 14.5px; font-weight: 600; padding: 13px 32px; border-radius: 9999px; text-align: center; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #86868b;">
                This link expires in <strong>60 minutes</strong> and can only be used once.
              </p>
              <p style="margin: 0 0 28px; font-size: 13px; line-height: 1.5; color: #86868b;">
                If you didn&apos;t request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <!-- Fallback Link -->
              <div style="padding-top: 24px; border-top: 1px solid #f0f0f2; font-size: 12.5px; line-height: 1.6; color: #86868b;">
                <p style="margin: 0 0 6px;">Button not working? Copy and paste this link into your browser:</p>
                <a href="${resetUrl}" style="color: #0071e3; word-break: break-all; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </div>

              <!-- Security Notice -->
              <div style="margin-top: 24px; padding: 14px 18px; background-color: #fbfbfd; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 12px; line-height: 1.5; color: #6e6e73;">
                <strong style="color: #1d1d1f; display: block; margin-bottom: 4px;">Security notice</strong>
                Sentinel will never ask you to send your password, reset token, or authentication codes by email. If you didn&apos;t request this reset, no action is required.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 36px; background-color: #fafafc; border-top: 1px solid #f0f0f2; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #1d1d1f;">
                Sentinel
              </p>
              <p style="margin: 0 0 14px; font-size: 12px; line-height: 1.5; color: #86868b;">
                Secure autonomous agents. Understand risk. Verify evidence. Take safe action.
              </p>
              <p style="margin: 0 0 12px; font-size: 11.5px; color: #86868b;">
                <a href="${baseUrl}/security" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Security</a> •
                <a href="${baseUrl}/privacy" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Privacy</a> •
                <a href="${baseUrl}/support" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Support</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a1a1a6;">
                &copy; 2026 Sentinel Security. All rights reserved.
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

export function generatePasswordResetEmailText({
  resetUrl,
  userEmail,
  baseUrl,
}: {
  resetUrl: string;
  userEmail: string;
  baseUrl: string;
}): string {
  return `SENTINEL — PASSWORD RESET

We received a request to reset the password for your Sentinel account (${userEmail}).

Use the secure link below to choose a new password:
${resetUrl}

This link expires in 60 minutes and can only be used once.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Security Notice:
Sentinel will never ask you to send your password, reset token, or authentication codes by email. If you didn't request this reset, no action is required.

---
Sentinel — Secure autonomous agents. Understand risk. Verify evidence. Take safe action.
Security: ${baseUrl}/security
Privacy: ${baseUrl}/privacy
Support: ${baseUrl}/support
© 2026 Sentinel Security. All rights reserved.
`;
}

export interface SendResetEmailResult {
  success: boolean;
  provider: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  baseUrl = 'http://localhost:3000',
}: {
  to: string;
  resetUrl: string;
  baseUrl?: string;
}): Promise<SendResetEmailResult> {
  const from = process.env.EMAIL_FROM?.trim() || 'Sentinel Security <security@sentinel.security>';
  const subject = 'Reset your Sentinel password';
  const html = generatePasswordResetEmailHtml({ resetUrl, userEmail: to, baseUrl });
  const text = generatePasswordResetEmailText({ resetUrl, userEmail: to, baseUrl });

  // 1. Resend REST API
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      const apiKey = process.env.RESEND_API_KEY.trim();
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!res.ok) {
        console.error('[sendPasswordResetEmail] Resend API error status:', res.status);
        recordEmailLog({
          recipient: to,
          subject,
          provider: 'resend',
          status: 'failed',
          error: `Resend error: ${res.status}`,
        });
        return { success: false, provider: 'resend', error: `Resend status ${res.status}` };
      }

      const data = await res.json();
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'resend',
        status: 'sent',
      });
      return { success: true, provider: 'resend', messageId: data?.id };
    } catch (err: any) {
      console.error('[sendPasswordResetEmail] Resend exception:', err?.message || err);
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'resend',
        status: 'failed',
        error: err?.message || 'Network exception',
      });
      return { success: false, provider: 'resend', error: err?.message };
    }
  }

  // 2. Postmark REST API
  if (process.env.POSTMARK_SERVER_TOKEN?.trim()) {
    try {
      const serverToken = process.env.POSTMARK_SERVER_TOKEN.trim();
      const res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': serverToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: from,
          To: to,
          Subject: subject,
          HtmlBody: html,
          TextBody: text,
        }),
      });

      if (!res.ok) {
        console.error('[sendPasswordResetEmail] Postmark API error status:', res.status);
        recordEmailLog({
          recipient: to,
          subject,
          provider: 'postmark',
          status: 'failed',
          error: `Postmark error: ${res.status}`,
        });
        return { success: false, provider: 'postmark', error: `Postmark status ${res.status}` };
      }

      const data = await res.json();
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'postmark',
        status: 'sent',
      });
      return { success: true, provider: 'postmark', messageId: data?.MessageID };
    } catch (err: any) {
      console.error('[sendPasswordResetEmail] Postmark exception:', err?.message || err);
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'postmark',
        status: 'failed',
        error: err?.message || 'Network exception',
      });
      return { success: false, provider: 'postmark', error: err?.message };
    }
  }

  // 3. SMTP Transport via nodemailer
  if (process.env.SMTP_HOST?.trim()) {
    try {
      const host = process.env.SMTP_HOST.trim();
      const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      recordEmailLog({
        recipient: to,
        subject,
        provider: 'smtp',
        status: 'sent',
      });
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err: any) {
      console.error('[sendPasswordResetEmail] SMTP exception:', err?.message || err);
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'smtp',
        status: 'failed',
        error: err?.message || 'SMTP exception',
      });
      return { success: false, provider: 'smtp', error: err?.message };
    }
  }

  // 4. Fail closed when no delivery provider is configured. Authentication
  // secrets must never be printed or persisted as a development convenience.
  recordEmailLog({
    recipient: to,
    subject,
    provider: 'unconfigured',
    status: 'failed',
    error: 'No transactional email provider configured',
  });

  return {
    success: false,
    provider: 'unconfigured',
    error: 'No transactional email provider configured',
  };
}

// ── Login Verification Code (Email OTP) ──

export function generateLoginOtpEmailHtml({
  otp,
  userEmail,
  baseUrl,
}: {
  otp: string;
  userEmail: string;
  baseUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Sentinel verification code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #1d1d1f;">
  <!-- Preheader text (hidden preview) -->
  <div style="display: none; font-size: 1px; color: #f5f5f7; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Use this code to finish signing in to your Sentinel account.
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e5e5ea; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); overflow: hidden;">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: left; border-bottom: 1px solid #f0f0f2;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <div style="width: 36px; height: 36px; background-color: #000000; border-radius: 10px; text-align: center; line-height: 36px; display: inline-block;">
                      <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">S</span>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 16px; font-weight: 700; letter-spacing: 0.5px; color: #1d1d1f; text-transform: uppercase;">Sentinel</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.4px; line-height: 1.3;">
                Your Sentinel verification code
              </h1>
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #3a3a3c;">
                We received a sign-in attempt for your Sentinel account (<strong style="color: #1d1d1f;">${userEmail}</strong>).
              </p>
              <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #3a3a3c;">
                Enter the code below to continue.
              </p>

              <!-- Prominent OTP Code Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px;">
                <tr>
                  <td align="center" style="padding: 24px 20px; background-color: #f5f5f7; border-radius: 16px; border: 1px solid #e5e5ea;">
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #0071e3; display: inline-block; padding-left: 10px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #86868b;">
                This code expires in <strong>10 minutes</strong> and can only be used once.
              </p>
              <p style="margin: 0 0 28px; font-size: 13px; line-height: 1.5; color: #86868b;">
                If you didn&apos;t try to sign in, you can safely ignore this email.
              </p>

              <!-- Security Notice -->
              <div style="margin-top: 24px; padding: 14px 18px; background-color: #fbfbfd; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 12px; line-height: 1.5; color: #6e6e73;">
                <strong style="color: #1d1d1f; display: block; margin-bottom: 4px;">Security notice</strong>
                Sentinel will never ask you to send your password or verification code by email.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 36px; background-color: #fafafc; border-top: 1px solid #f0f0f2; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #1d1d1f;">
                Sentinel
              </p>
              <p style="margin: 0 0 14px; font-size: 12px; line-height: 1.5; color: #86868b;">
                Secure autonomous agents. Understand risk. Verify evidence. Take safe action.
              </p>
              <p style="margin: 0 0 12px; font-size: 11.5px; color: #86868b;">
                <a href="${baseUrl}/security" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Security</a> •
                <a href="${baseUrl}/privacy" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Privacy</a> •
                <a href="${baseUrl}/support" style="color: #86868b; text-decoration: underline; margin: 0 6px;">Support</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #a1a1a6;">
                &copy; 2026 Sentinel Security. All rights reserved.
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

export function generateLoginOtpEmailText({
  otp,
  userEmail,
  baseUrl,
}: {
  otp: string;
  userEmail: string;
  baseUrl: string;
}): string {
  return `SENTINEL — VERIFICATION CODE

We received a sign-in attempt for your Sentinel account (${userEmail}).

Enter the code below to continue:

${otp}

This code expires in 10 minutes and can only be used once.

If you didn't try to sign in, you can safely ignore this email.

Security notice:
Sentinel will never ask you to send your password or verification code by email.

---
Sentinel — Secure autonomous agents. Understand risk. Verify evidence. Take safe action.
Security: ${baseUrl}/security
Privacy: ${baseUrl}/privacy
Support: ${baseUrl}/support
© 2026 Sentinel Security
`;
}

export async function sendLoginOtpEmail({
  to,
  otp,
  baseUrl = 'http://localhost:3000',
}: {
  to: string;
  otp: string;
  baseUrl?: string;
}): Promise<SendResetEmailResult> {
  const from = process.env.EMAIL_FROM?.trim() || 'Sentinel Security <security@sentinel.security>';
  const subject = 'Your Sentinel verification code';
  const html = generateLoginOtpEmailHtml({ otp, userEmail: to, baseUrl });
  const text = generateLoginOtpEmailText({ otp, userEmail: to, baseUrl });

  // 1. Resend REST API
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      const apiKey = process.env.RESEND_API_KEY.trim();
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[sendLoginOtpEmail] Resend API error:', errText);
        recordEmailLog({
          recipient: to,
          subject,
          provider: 'resend',
          status: 'failed',
          error: `Resend error: ${res.status}`,
        });
        return { success: false, provider: 'resend', error: `Resend status ${res.status}` };
      }

      const data = await res.json();
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'resend',
        status: 'sent',
      });
      return { success: true, provider: 'resend', messageId: data?.id };
    } catch (err: any) {
      console.error('[sendLoginOtpEmail] Resend exception:', err?.message || err);
      if (err?.cause) {
        console.error('[sendLoginOtpEmail] Resend cause:', err.cause);
      }
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'resend',
        status: 'failed',
        error: err?.message || 'Network exception',
      });
      return { success: false, provider: 'resend', error: err?.message };
    }
  }

  // 2. Postmark REST API
  if (process.env.POSTMARK_SERVER_TOKEN?.trim()) {
    try {
      const serverToken = process.env.POSTMARK_SERVER_TOKEN.trim();
      const res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': serverToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: from,
          To: to,
          Subject: subject,
          HtmlBody: html,
          TextBody: text,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[sendLoginOtpEmail] Postmark API error:', errText);
        recordEmailLog({
          recipient: to,
          subject,
          provider: 'postmark',
          status: 'failed',
          error: `Postmark error: ${res.status}`,
        });
        return { success: false, provider: 'postmark', error: `Postmark status ${res.status}` };
      }

      const data = await res.json();
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'postmark',
        status: 'sent',
      });
      return { success: true, provider: 'postmark', messageId: data?.MessageID };
    } catch (err: any) {
      console.error('[sendLoginOtpEmail] Postmark exception:', err?.message || err);
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'postmark',
        status: 'failed',
        error: err?.message || 'Network exception',
      });
      return { success: false, provider: 'postmark', error: err?.message };
    }
  }

  // 3. SMTP Relay
  if (process.env.SMTP_HOST?.trim()) {
    try {
      const host = process.env.SMTP_HOST.trim();
      const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });

      recordEmailLog({
        recipient: to,
        subject,
        provider: 'smtp',
        status: 'sent',
      });
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err: any) {
      console.error('[sendLoginOtpEmail] SMTP exception:', err?.message || err);
      recordEmailLog({
        recipient: to,
        subject,
        provider: 'smtp',
        status: 'failed',
        error: err?.message || 'SMTP exception',
      });
      return { success: false, provider: 'smtp', error: err?.message };
    }
  }

  // 4. Development Standby / Local Outbox Mode
  console.log('────────────────────────────────────────────────────────────');
  console.log('[SENTINEL TRANSACTIONAL EMAIL — LOGIN OTP OUTBOX CAPTURE]');
  console.log('Login OTP delivery is unavailable because no transactional email provider is configured.');
  console.log('────────────────────────────────────────────────────────────');

  recordEmailLog({
    recipient: to,
    subject,
    provider: 'unconfigured',
    status: 'failed',
    error: 'No transactional email provider configured',
  });

  return {
    success: false,
    provider: 'unconfigured',
    error: 'No transactional email provider configured',
  };
}

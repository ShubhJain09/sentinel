import type { Metadata } from 'next';
import Link from 'next/link';
import { validateResetToken } from '@/app/actions/auth';
import { ResetPasswordForm } from './reset-password-form';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon } from '@/app/components/ui-icon';

export const metadata: Metadata = {
  title: 'Reset Password — SENTINEL',
  description: 'Choose a new password for your Sentinel account.',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const rawToken = params.token;
  const validation = await validateResetToken(rawToken);

  // 1. Valid token -> Show Reset Form
  if (validation.valid && rawToken) {
    return <ResetPasswordForm token={rawToken.trim()} />;
  }

  // 2. Expired token
  if (validation.reason === 'expired') {
    return (
      <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--status-warning-subtle)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)] shadow-sm">
            <Icon name="clock" size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-tight">
              This reset link has expired.
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
              For security, Sentinel password reset links expire after 60 minutes. Please request a fresh link.
            </p>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/forgot-password"
            className="btn-primary w-full justify-center h-10.5 rounded-full text-[13.5px] font-medium shadow-sm inline-flex items-center"
          >
            Request a New Link
          </Link>
          <Link
            href="/login"
            className="w-full flex items-center justify-center h-10 rounded-full bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // 3. Invalid or already used token
  return (
    <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10 text-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] flex items-center justify-center text-[var(--status-critical)] shadow-sm">
          <Icon name="finding" size={28} />
        </div>
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-tight">
            This reset link is invalid or has already been used.
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Reset links can only be used once. If you already reset your password, you can sign in with your new credentials.
          </p>
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <Link
          href="/forgot-password"
          className="btn-primary w-full justify-center h-10.5 rounded-full text-[13.5px] font-medium shadow-sm inline-flex items-center"
        >
          Request a New Link
        </Link>
        <Link
          href="/login"
          className="w-full flex items-center justify-center h-10 rounded-full bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium transition-all"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

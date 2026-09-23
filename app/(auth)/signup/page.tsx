'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signup } from '@/app/actions/auth';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { OAuthProviderButtons } from '@/app/components/oauth-provider-buttons';

function getErrorMessage(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case 'google_not_configured':
      return 'Google sign-in is not configured for this enclave.';
    case 'apple_not_configured':
      return 'Apple sign-in is not configured for this enclave.';
    case 'invalid_oauth_state':
      return 'OAuth state verification failed. Please try signing up again.';
    case 'missing_oauth_code':
      return 'OAuth authorization code was missing in callback response.';
    case 'google_token_exchange_failed':
      return 'Failed to exchange authorization code with Google.';
    case 'google_userinfo_failed':
      return 'Failed to retrieve profile information from Google.';
    case 'google_email_missing':
      return 'No email address was provided by Google account.';
    case 'google_email_unverified':
      return 'Your Google email address is unverified. Please verify your email with Google.';
    case 'apple_identity_incomplete':
      return 'Apple ID returned incomplete identity payload.';
    case 'apple_email_unverified':
      return 'Your Apple ID email address could not be verified.';
    case 'apple_auth_failed':
      return 'Authentication with Apple failed. Please try again.';
    default:
      if (code.startsWith('google_access_denied')) return 'Sign in with Google was cancelled.';
      return `Authentication error: ${code}`;
  }
}

function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const oauthErrorCode = searchParams.get('error');
  const oauthErrorMessage = getErrorMessage(oauthErrorCode);

  return (
    <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10 relative">
      {/* Top Ribbon Symbol */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-solid)] flex items-center justify-center shadow-sm border border-[var(--border-hairline)]">
          <SentinelLogo size={38} showWordmark={false} />
        </div>
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Create Sentinel Account
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Provision your secure AI operations workspace.
          </p>
        </div>
      </div>

      {/* Form */}
      <form action={action} className="space-y-4 pt-1">
        {oauthErrorMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade">
            <Icon name="finding" size={15} className="shrink-0" />
            <span>{oauthErrorMessage}</span>
          </div>
        )}

        {state?.error && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade">
            <Icon name="finding" size={15} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Morgan"
            className="input-apple text-[13.5px] h-10 px-3.5 rounded-xl w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            className="input-apple text-[13.5px] h-10 px-3.5 rounded-xl w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            Master password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Minimum 8 characters"
            className="input-apple text-[13.5px] h-10 px-3.5 rounded-xl w-full"
          />
          <span className="text-[11px] text-[var(--text-tertiary)] block">
            Requires at least 8 characters with a letter, number, and symbol.
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Primary Submit */}
          <button
            type="submit"
            disabled={pending}
            onClick={() => triggerHaptic('tap')}
            className="btn-primary w-full justify-center h-10.5 rounded-full text-[13.5px] font-medium cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Creating workspace…</span>
              </span>
            ) : (
              <span>Create account with Email</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-2 text-center select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-hairline)]" />
            </div>
            <span className="relative px-3 bg-[var(--surface-solid)]/70 text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider backdrop-blur-xs rounded-full">
              or continue with
            </span>
          </div>

          {/* Social Provider Buttons */}
          <OAuthProviderButtons className="pt-0.5" />
        </div>
      </form>

      {/* Switcher link */}
      <div className="pt-2 text-center border-t border-[var(--border-hairline)]">
        <span className="text-[12px] text-[var(--text-tertiary)]">
          Already have an account?{' '}
        </span>
        <Link
          href="/login"
          onClick={() => triggerHaptic('selection')}
          className="text-[12px] font-semibold text-[var(--accent-blue)] hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10 animate-pulse text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-solid)] mx-auto flex items-center justify-center">
            <SentinelLogo size={38} showWordmark={false} />
          </div>
          <div className="h-6 w-32 bg-[var(--surface-solid)] mx-auto rounded-full" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

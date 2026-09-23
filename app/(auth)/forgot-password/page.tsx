'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/app/actions/auth';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, undefined);

  return (
    <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10">
      {/* Top Ribbon Symbol */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-solid)] flex items-center justify-center shadow-sm border border-[var(--border-hairline)]">
          <SentinelLogo size={38} showWordmark={false} />
        </div>
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Enter the email associated with your Sentinel account and we&apos;ll send you a secure password reset link.
          </p>
        </div>
      </div>

      {/* Form */}
      <form action={action} className="space-y-4 pt-1">
        {state?.error && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade">
            <Icon name="finding" size={15} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)] text-[12px] animate-fade">
            <Icon name="check" size={15} className="shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            Email address
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            onClick={() => triggerHaptic('tap')}
            className="btn-primary w-full justify-center h-10.5 rounded-full text-[13.5px] font-medium cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Sending…</span>
              </span>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </div>
      </form>

      {/* Switcher link */}
      <div className="pt-2 text-center border-t border-[var(--border-hairline)]">
        <Link
          href="/login"
          onClick={() => triggerHaptic('selection')}
          className="text-[12px] font-medium text-[var(--accent-blue)] hover:underline inline-flex items-center justify-center gap-1.5"
        >
          <Icon name="arrow" size={12} className="rotate-180" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}

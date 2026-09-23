'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/auth';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Policy rules check for real-time feedback
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10">
      {/* Top Ribbon Symbol */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-solid)] flex items-center justify-center shadow-sm border border-[var(--border-hairline)]">
          <SentinelLogo size={38} showWordmark={false} />
        </div>
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Reset your password
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Choose a new password for your Sentinel account.
          </p>
        </div>
      </div>

      {/* Form */}
      <form action={action} className="space-y-4 pt-1">
        <input type="hidden" name="token" value={token} />

        {state?.error && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade">
            <Icon name="finding" size={15} className="shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-apple text-[13.5px] h-10 px-3.5 pr-10 rounded-xl w-full"
            />
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setShowPassword(!showPassword);
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <Icon name={showPassword ? 'close' : 'scan'} size={15} />
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-[12px] font-medium text-[var(--text-secondary)] block">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-apple text-[13.5px] h-10 px-3.5 pr-10 rounded-xl w-full"
            />
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setShowConfirmPassword(!showConfirmPassword);
              }}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <Icon name={showConfirmPassword ? 'close' : 'scan'} size={15} />
            </button>
          </div>
        </div>

        {/* Live Password Requirements Checklist */}
        <div className="p-3 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-1.5 text-[11.5px]">
          <div className="flex items-center gap-2">
            <span className={hasMinLength ? 'text-[var(--status-safe)]' : 'text-[var(--text-tertiary)]'}>
              {hasMinLength ? '✓' : '•'}
            </span>
            <span className={hasMinLength ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={hasLetter ? 'text-[var(--status-safe)]' : 'text-[var(--text-tertiary)]'}>
              {hasLetter ? '✓' : '•'}
            </span>
            <span className={hasLetter ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}>
              At least one letter (a-z, A-Z)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={hasNumber ? 'text-[var(--status-safe)]' : 'text-[var(--text-tertiary)]'}>
              {hasNumber ? '✓' : '•'}
            </span>
            <span className={hasNumber ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}>
              At least one number (0-9)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={hasSpecial ? 'text-[var(--status-safe)]' : 'text-[var(--text-tertiary)]'}>
              {hasSpecial ? '✓' : '•'}
            </span>
            <span className={hasSpecial ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}>
              At least one special character (!@#$%^&*)
            </span>
          </div>
          {confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-hairline)]">
              <span className={passwordsMatch ? 'text-[var(--status-safe)]' : 'text-[var(--status-critical)]'}>
                {passwordsMatch ? '✓' : '✕'}
              </span>
              <span className={passwordsMatch ? 'text-[var(--status-safe)] font-medium' : 'text-[var(--status-critical)]'}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        {/* Primary CTA */}
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
                <span>Updating Password…</span>
              </span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </div>
      </form>

      {/* Back to sign in */}
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

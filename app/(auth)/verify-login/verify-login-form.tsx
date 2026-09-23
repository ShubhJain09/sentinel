'use client';

import { useActionState, useState, useEffect, useRef, useTransition } from 'react';
import { verifyLoginOtp, resendLoginOtp, cancelLoginChallenge } from '@/app/actions/auth';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

interface VerifyLoginFormProps {
  maskedEmail: string;
}

export function VerifyLoginForm({ maskedEmail }: VerifyLoginFormProps) {
  const [state, formAction, pending] = useActionState(verifyLoginOtp, undefined);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Resend countdown state
  const [countdown, setCountdown] = useState<number>(30);
  const [isResending, startResendTransition] = useTransition();
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 30s countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // When digits change and become complete (6 digits), auto-submit
  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // Take the last character typed
    const char = cleaned[cleaned.length - 1];
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    triggerHaptic('tap');

    // Focus next input if available
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If 6th digit entered and all digits present, trigger submit
      if (next.every((d) => d.length === 1)) {
        setTimeout(() => {
          formRef.current?.requestSubmit();
        }, 50);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is already empty, move to previous and clear it
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasteData) return;

    const chars = pasteData.slice(0, 6).split('');
    const next = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      if (i < 6) next[i] = c;
    });
    setDigits(next);
    triggerHaptic('selection');

    if (chars.length === 6) {
      inputRefs.current[5]?.focus();
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
    } else {
      const targetIndex = Math.min(chars.length, 5);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  const handleResend = () => {
    if (countdown > 0 || isResending) return;
    triggerHaptic('tap');
    setResendStatus(null);

    startResendTransition(async () => {
      const res = await resendLoginOtp();
      if (res?.success) {
        setResendStatus({ type: 'success', message: res.message || 'A new verification code has been sent.' });
        setCountdown(30);
      } else {
        setResendStatus({ type: 'error', message: res?.error || 'Failed to resend verification code.' });
      }
    });
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === 6;

  return (
    <div className="liquid-glass-card p-8 sm:p-10 rounded-[32px] shadow-2xl space-y-6 border border-white/80 dark:border-white/10 text-center animate-fade">
      {/* Top Security Shield Icon */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-solid)] flex items-center justify-center shadow-sm border border-[var(--border-hairline)] text-[var(--accent-blue)]">
          <Icon name="shield" size={30} />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Two-Step Verification
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit verification code sent to{' '}
            <span className="font-mono font-medium text-[var(--text-primary)] px-1.5 py-0.5 rounded-md bg-[var(--surface-solid)] border border-[var(--border-hairline)] whitespace-nowrap">
              {maskedEmail}
            </span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12px] animate-fade text-left">
          <Icon name="finding" size={15} className="shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Resend Status Banner */}
      {resendStatus && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-2xl text-[12px] animate-fade text-left ${
            resendStatus.type === 'success'
              ? 'bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)]'
              : 'bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)]'
          }`}
        >
          <Icon name={resendStatus.type === 'success' ? 'check' : 'finding'} size={15} className="shrink-0" />
          <span>{resendStatus.message}</span>
        </div>
      )}

      {/* 6-Box Verification Form */}
      <form ref={formRef} action={formAction} className="space-y-6 pt-2">
        <input type="hidden" name="code" value={fullCode} />

        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={pending}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-[22px] font-semibold font-mono rounded-2xl bg-[var(--surface-solid)] border transition-all shadow-sm text-[var(--text-primary)] focus:outline-none ${
                digit
                  ? 'border-[var(--accent-blue)] bg-[var(--surface-solid)] ring-2 ring-[var(--accent-blue-subtle)]'
                  : 'border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
              } disabled:opacity-50`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={pending || !isComplete}
          className="btn-primary w-full justify-center h-11 rounded-full text-[13.5px] font-medium shadow-sm cursor-pointer disabled:opacity-50"
        >
          {pending ? (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Code…</span>
            </div>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      {/* Resend & Cancel Options */}
      <div className="pt-2 border-t border-[var(--border-hairline)] space-y-3">
        <div className="text-[12.5px] text-[var(--text-secondary)]">
          {countdown > 0 ? (
            <span>
              Resend code in <strong className="font-mono text-[var(--text-primary)]">{countdown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-[var(--accent-blue)] font-medium hover:underline cursor-pointer disabled:opacity-50"
            >
              {isResending ? 'Sending new code…' : 'Resend Code'}
            </button>
          )}
        </div>

        <form action={cancelLoginChallenge}>
          <button
            type="submit"
            className="w-full flex items-center justify-center h-9 rounded-full bg-transparent hover:bg-[var(--surface-solid)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[12px] font-medium transition-all cursor-pointer"
          >
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

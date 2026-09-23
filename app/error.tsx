'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from './components/ui-icon';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error details for operational inspection
    console.error('[Sentinel Error Boundary Captured]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-14 h-14 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] flex items-center justify-center text-[var(--status-critical)] mb-4 shadow-sm">
        <Icon name="finding" size={24} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        Workspace Interrupted
      </h1>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-sm">
        An unexpected condition occurred while rendering this view. Sentinel has contained the event.
      </p>
      {error?.message && (
        <p className="text-[11.5px] font-mono text-[var(--text-tertiary)] max-w-md mt-3 p-2.5 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] truncate">
          {error.message}
        </p>
      )}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="btn-primary text-[13px] h-9.5 px-5 rounded-full cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="btn-secondary text-[13px] h-9.5 px-5 rounded-full"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { triggerHaptic } from '@/app/lib/haptics';

interface ProviderConfig {
  google: { configured: boolean; clientIdMasked: string | null };
  apple: { configured: boolean; clientIdMasked: string | null; teamIdMasked: string | null };
  passkey: { available: boolean; standard: string };
  password: { enabled: boolean; algorithm: string };
}

export function OAuthProviderButtons({ className = '' }: { className?: string }) {
  const [providers, setProviders] = useState<ProviderConfig | null>(null);

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data))
      .catch(() => {
        setProviders({
          google: { configured: false, clientIdMasked: null },
          apple: { configured: false, clientIdMasked: null, teamIdMasked: null },
          passkey: { available: false, standard: 'FIDO2' },
          password: { enabled: true, algorithm: 'bcrypt' },
        });
      });
  }, []);

  const isAppleReady = Boolean(providers?.apple?.configured);
  const isGoogleReady = Boolean(providers?.google?.configured);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Continue with Apple (only shown if configured; disabled button is removed for normal users) */}
      {isAppleReady && (
        <a
          href="/api/auth/apple"
          onClick={() => triggerHaptic('tap')}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.64-2.2.52-3.06-.4C3.79 16.17 4.36 9.51 8.82 9.28c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.3 4.11zM12.03 9.2C11.88 7.16 13.5 5.5 15.4 5.35c.28 2.35-2.15 4.12-3.37 3.85z" />
          </svg>
          <span>Continue with Apple</span>
        </a>
      )}

      {/* Continue with Google */}
      {isGoogleReady ? (
        <a
          href="/api/auth/google"
          onClick={() => triggerHaptic('tap')}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] text-[13px] font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.25C.45 8.15 0 9.97 0 12s.45 3.85 1.25 5.44l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.56l4.03 3.15c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Continue with Google</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Google sign-in is not configured. Setup instructions available in Owner Control Center."
          className="w-full flex items-center justify-between px-4 h-10 rounded-full bg-[var(--surface-solid)]/60 border border-[var(--border-hairline)] text-[var(--text-secondary)]/70 text-[13px] font-medium cursor-not-allowed shadow-xs opacity-75"
        >
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0 opacity-50" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.25C.45 8.15 0 9.97 0 12s.45 3.85 1.25 5.44l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.56l4.03 3.15c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-tertiary)] border border-[var(--border-hairline)]">
            Unavailable
          </span>
        </button>
      )}
    </div>
  );
}

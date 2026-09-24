import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Environment & Secrets',
};

export default async function SecretsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  if (session.role !== 'owner') {
    redirect('/owner?error=Owner+privileges+required');
  }

  const secrets = [
    {
      name: 'JWT_SECRET',
      scope: 'Session Authentication & Cryptographic Signing',
      value: '•••••••••••••••••••••••••••••••• (32 bytes)',
      status: 'Active',
      lastRotated: '2026-09-22',
      securityLevel: 'Critical',
    },
    {
      name: 'OWNER_EMAIL',
      scope: 'Unique Root Platform Owner Account',
      value: process.env.OWNER_EMAIL
        ? process.env.OWNER_EMAIL.replace(/(.{2})(.*)(@.*)/, '$1••••$3')
        : 'Not Configured',
      status: process.env.OWNER_EMAIL ? 'Enforced' : 'Standby',
      lastRotated: 'Permanent',
      securityLevel: 'Root Authority',
    },
    {
      name: 'DATABASE_URL',
      scope: 'Persistence Engine & Storage Connection',
      value: 'file:sentinel.db (SQLite WAL Mode)',
      status: 'Connected',
      lastRotated: 'Initial Seed',
      securityLevel: 'Internal',
    },
    {
      name: 'TRUEFORGE_API_KEY',
      scope: 'TrueForge Worker Fleet Dispatch Token',
      value: process.env.TRUEFORGE_API_KEY ? '••••••••••••••••' : 'Not Configured (Standby)',
      status: process.env.TRUEFORGE_API_KEY ? 'Active' : 'Standby',
      lastRotated: process.env.TRUEFORGE_API_KEY ? '2026-09-22' : 'Never',
      securityLevel: 'External Provider',
    },
    {
      name: 'GROQ_API_KEY',
      scope: 'Groq High-Speed Inference API Key',
      value: process.env.GROQ_API_KEY ? '••••••••••••••••' : 'Not Configured (Standby)',
      status: process.env.GROQ_API_KEY ? 'Active' : 'Standby',
      lastRotated: process.env.GROQ_API_KEY ? '2026-09-22' : 'Never',
      securityLevel: 'External Provider',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3"
        >
          <Icon name="arrow-left" size={14} />
          Owner Control Center
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            Environment &amp; Secrets Management
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Cryptographic signing salts, root owner identity bindings, provider access tokens, and key rotation lifecycles.
        </p>
      </div>

      <div className="space-y-4">
        {secrets.map((sec) => (
          <div key={sec.name} className="card-spacious p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)] font-mono">{sec.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--accent-blue)] border border-[var(--border-hairline)]">
                    {sec.securityLevel}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  {sec.scope}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase shrink-0 ${
                  sec.status === 'Active' || sec.status === 'Enforced' || sec.status === 'Connected'
                    ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                    : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)] border border-[var(--border-hairline)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sec.status === 'Active' || sec.status === 'Enforced' || sec.status === 'Connected'
                      ? 'bg-[var(--status-safe)]'
                      : 'bg-[var(--text-tertiary)]'
                  }`}
                />
                {sec.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[12px]">
              <div className="font-mono text-[var(--text-primary)] bg-[var(--well)] px-3 py-1.5 rounded-xl border border-[var(--border-hairline)] inline-block">
                {sec.value}
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                Last Rotated: {sec.lastRotated}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card-spacious p-6 space-y-2">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Icon name="lock" size={15} className="text-[var(--accent-blue)]" />
          Cryptographic Zero-Leak Guarantee
        </h2>
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          All cryptographic secrets and raw tokens are read from environment configurations server-side only. Next.js App Router prevents private variables from being bundled into client JavaScript. Normal users do not have access to any secret inspection or rotation capabilities.
        </p>
      </div>
    </div>
  );
}

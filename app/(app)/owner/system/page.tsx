import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — System Telemetry',
};

export default async function SystemSettingsPage() {
  const session = await getSession();

  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const systemSpecs = [
    { label: 'Application Version', value: 'Sentinel v2.4.0 (Enterprise Core)' },
    { label: 'Web Architecture', value: 'Next.js 16.3.5 · React 19.2.8' },
    { label: 'Database Storage', value: 'SQLite 3 (WAL mode) · PostgreSQL Driver Configured' },
    { label: 'Session Protocol', value: 'JWT HS256 (Jose) · HttpOnly Cookie' },
    { label: 'Password Encryption', value: 'Bcrypt Salted Hash (Cost factor 10)' },
    { label: 'Design System', value: 'Apple Silicon Spatial Bento · Dual Light/Dark Modes' },
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
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          System Telemetry & Architecture
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Platform runtime specifications, cryptographic standards, and global operating parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Architecture Specs */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 flex items-center justify-center">
              <Icon name="shield" size={16} />
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Architecture Verification
            </h2>
          </div>

          <div className="space-y-3 pt-2 divide-y divide-[var(--border-subtle)] text-[12px]">
            {systemSpecs.map((spec) => (
              <div key={spec.label} className="pt-3 first:pt-0 flex justify-between items-center gap-4">
                <span className="text-[var(--text-secondary)]">{spec.label}</span>
                <span className="font-mono text-[var(--text-primary)] text-right font-medium">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 flex items-center justify-center">
              <Icon name="settings" size={16} />
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Global Guardrail Flags
            </h2>
          </div>

          <div className="space-y-3 pt-2 text-[12px]">
            <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[var(--text-primary)]">
                  Strict Directory Realpath Containment
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Enforces canonical path boundary on all filesystem tool invocations.
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2 py-0.5 rounded-full border border-[var(--status-safe)]/30 shrink-0">
                ENABLED
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[var(--text-primary)]">
                  Mandatory Human In The Loop Gate
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Autonomous patches cannot execute without explicit reviewer signoff.
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2 py-0.5 rounded-full border border-[var(--status-safe)]/30 shrink-0">
                ENFORCED
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[var(--text-primary)]">
                  Tamper-Evident Audit Logging
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Durable SQLite/Postgres audit records recorded on all lifecycle events.
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2 py-0.5 rounded-full border border-[var(--status-safe)]/30 shrink-0">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDb, getAllScans } from '@/app/lib/db';
import { Icon } from '@/app/components/ui-icon';
import type { Scan } from '@/app/lib/types';

export const metadata = {
  title: 'SENTINEL — Retest Verification',
};

export default async function RetestsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const allScans = getAllScans(session.workspaceId);
  const retests = allScans.filter(
    (s) => s.kind.toLowerCase().includes('retest') || s.name.toLowerCase().includes('retest')
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-2 border-b border-[var(--border-hairline)] pb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)]">
          Regression Verification
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
          Retest Verification
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl font-normal leading-relaxed">
          Deterministic validation checks ensuring that boundary patches seal escapes without causing functional regressions.
        </p>
      </div>

      {/* ─── Retests List ─────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Verified Retest Runs
          </h2>
          <Link
            href="/scans/new"
            className="btn-primary text-[12.5px]"
          >
            <Icon name="plus" size={14} />
            <span>Launch New Retest</span>
          </Link>
        </div>

        <div className="space-y-4">
          {retests.length > 0 ? (
            retests.map((retest) => (
              <div
                key={retest.id}
                className="card-spacious p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                      {retest.result === 'passed' ? 'PASSED' : retest.result}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {retest.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {retest.name}
                  </h3>
                  <div className="text-[12.5px] text-[var(--text-secondary)] flex items-center gap-3">
                    <span>Target: <strong>{retest.target}</strong></span>
                    <span>•</span>
                    <span>{retest.checksCompleted} of {retest.checks} invariant checks verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <span className="text-[11.5px] font-mono text-[var(--text-tertiary)] tabular-numbers">
                    {retest.duration ? `${retest.duration}ms` : 'Immediate'}
                  </span>
                  <Link
                    href={`/scans/${retest.id}`}
                    className="btn-secondary text-[12.5px]"
                  >
                    <span>View Report</span>
                    <Icon name="arrow" size={13} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-center space-y-2">
              <p className="text-[13px] text-[var(--text-secondary)]">
                No dedicated retest runs recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

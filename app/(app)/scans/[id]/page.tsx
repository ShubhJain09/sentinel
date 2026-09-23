import { getSession } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getScanById, getDb } from '@/app/lib/db';
import { Icon } from '@/app/components/ui-icon';
import type { Scan, Finding } from '@/app/lib/types';

export const metadata = {
  title: 'SENTINEL — Scan Detail',
};

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const scan = getScanById(id);

  if (!scan) {
    notFound();
  }

  const db = getDb();
  const linkedFindings = db
    .prepare('SELECT * FROM findings WHERE scanId = ?')
    .all(scan.id) as Finding[];

  const isPassed = scan.result === 'passed';

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--accent-blue)] hover:underline active:scale-98 transition-all"
        >
          <Icon name="arrow" size={13} className="rotate-180" />
          <span>All Security Scans</span>
        </Link>
      </div>

      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="space-y-4 border-b border-[var(--border-hairline)] pb-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isPassed
                ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
            }`}
          >
            {isPassed ? 'Passed' : 'Needs Review'}
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
            {scan.kind}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            ID: {scan.id}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.15]">
          {scan.name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-2 text-[13px] text-[var(--text-secondary)] font-normal">
          <div>
            Target Environment:{' '}
            <strong className="text-[var(--text-primary)] font-medium">{scan.target}</strong>
          </div>
          <div>
            Executed:{' '}
            <span className="font-mono tabular-nums text-[var(--text-primary)]">
              {new Date(scan.startedAt).toLocaleString()}
            </span>
          </div>
          <div>
            Duration:{' '}
            <span className="font-mono tabular-nums text-[var(--text-primary)]">
              {scan.duration ? `${scan.duration} ms` : 'Immediate'}
            </span>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <Link
            href="/scans/new"
            className="btn-primary text-[13px] h-10 px-6"
          >
            <Icon name="plus" size={14} />
            <span>Rerun Inspection</span>
          </Link>
          <Link
            href="/evidence"
            className="btn-secondary text-[13px] h-10 px-5"
          >
            <span>View All Evidence</span>
          </Link>
        </div>
      </section>

      {/* ─── Progressive Disclosure Sections ─────────────────────────────── */}
      <div className="space-y-12">
        {/* Section 1: Verification Checks Summary */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Checks &amp; Invariants Evaluated
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Checks
              </span>
              <div className="text-3xl font-light text-[var(--text-primary)] font-mono tabular-numbers">
                {scan.checks}
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">Declared security rules</span>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Completed
              </span>
              <div className="text-3xl font-light text-[var(--status-safe)] font-mono tabular-numbers">
                {scan.checksCompleted}
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">Executed without errors</span>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Findings Produced
              </span>
              <div
                className={`text-3xl font-light font-mono tabular-numbers ${
                  linkedFindings.length > 0 ? 'text-[var(--status-warning)]' : 'text-[var(--status-safe)]'
                }`}
              >
                {linkedFindings.length}
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">Policy violations flagged</span>
            </div>
          </div>
        </section>

        {/* Section 2: Discovered Findings */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[var(--border-hairline)] pb-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
              Findings Flagged in this Scan
            </h2>
            <span className="text-[12px] font-mono text-[var(--text-tertiary)] tabular-numbers">
              {linkedFindings.length} Items
            </span>
          </div>

          {linkedFindings.length > 0 ? (
            <div className="space-y-4">
              {linkedFindings.map((f) => (
                <div
                  key={f.id}
                  className="card-spacious p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)]">
                        {f.severity}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                        {f.id}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                      {f.title}
                    </h3>
                    <p className="text-[12.5px] text-[var(--text-secondary)] line-clamp-1 max-w-xl">
                      {f.detail}
                    </p>
                  </div>

                  <Link
                    href={`/findings/${f.id}`}
                    className="btn-secondary text-[12.5px] shrink-0 self-start sm:self-center"
                  >
                    <span>View Finding</span>
                    <Icon name="arrow" size={13} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] flex items-center justify-center mx-auto mb-2">
                <Icon name="check" size={20} />
              </div>
              <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">
                Zero security findings flagged
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto">
                All {scan.checks} boundary checks passed without invariant violations.
              </p>
            </div>
          )}
        </section>

        {/* Section 3: Execution Telemetry Log */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Execution Log &amp; Audit Trail
          </h2>
          <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
              <span>TARGET: {scan.target}</span>
              <span>ENVIRONMENT: LOCAL SANDBOX</span>
            </div>
            <pre className="p-4 rounded-xl well-inset font-mono text-[11.5px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`[${scan.startedAt}] INFO  scan.init: Initializing ${scan.kind} on target "${scan.target}"
[${scan.startedAt}] INFO  sandbox.bind: Verifying directory containment boundaries
[${scan.startedAt}] TRACE ast.parse: Inspecting tool manifests and permitted capabilities
[${scan.startedAt}] INFO  check.run: Evaluated ${scan.checksCompleted}/${scan.checks} operational invariants
[${scan.completedAt || scan.startedAt}] INFO  scan.complete: Execution finished in ${scan.duration || 0}ms with result: ${scan.result}`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}

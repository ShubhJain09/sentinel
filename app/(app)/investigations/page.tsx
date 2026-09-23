import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllFindings, getAllEvidence } from '@/app/lib/db';
import { Icon } from '@/app/components/ui-icon';

export const metadata = {
  title: 'SENTINEL — Investigations',
};

export default async function InvestigationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const findings = getAllFindings();
  const allEvidence = getAllEvidence();

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-2 border-b border-[var(--border-hairline)] pb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)]">
          Security Intelligence
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
          Investigations
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl font-normal leading-relaxed">
          Deep behavioral telemetry and runtime AST probe analysis for agent execution boundaries.
        </p>
      </div>

      {/* ─── Active Investigations List ──────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Active Investigation Traces
          </h2>
          <span className="text-[12px] font-mono text-[var(--text-tertiary)] tabular-numbers">
            {findings.length} Behavioral Inquiries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((f) => {
            const relatedEvidence = allEvidence.filter((e) => e.findingId === f.id);
            return (
              <div
                key={f.id}
                className="card-spacious p-7 flex flex-col justify-between space-y-6 min-h-[280px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)]">
                      {f.severity}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      {f.id}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[var(--text-primary)] leading-snug">
                    {f.title}
                  </h3>

                  <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {f.detail}
                  </p>

                  <div className="p-3 rounded-xl well-inset font-mono text-[11px] text-[var(--text-secondary)] truncate">
                    Observation: {f.observed}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
                    {relatedEvidence.length} Traces Linked
                  </span>
                  <Link
                    href={`/investigations/${f.id}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-blue)] hover:underline active:scale-95 transition-all"
                  >
                    <span>Inspect Investigation</span>
                    <Icon name="arrow" size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

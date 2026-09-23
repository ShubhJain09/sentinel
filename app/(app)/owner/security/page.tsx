import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Security Policies',
};

export default async function SecurityPoliciesPage() {
  const session = await getSession();

  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

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
          Platform Security Policies
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Configure global guardrails, execution limits, and human-in-the-loop review thresholds.
        </p>
      </div>

      <div className="space-y-6">
        {/* Human in the Loop Policy */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Icon name="approval" size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Human Approval Thresholds
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Enforces mandatory human reviewer judgment before agent remediations are applied.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)]">
              <div className="space-y-0.5">
                <div className="text-[13px] font-medium text-[var(--text-primary)]">
                  Require Approval for All Boundary Modifying Fixes
                </div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  Autonomous patches altering filesystem or instruction boundaries must be approved by Reviewer or Owner.
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2.5 py-1 rounded-full border border-[var(--status-safe)]/30 self-start sm:self-center">
                MANDATORY
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)]">
              <div className="space-y-0.5">
                <div className="text-[13px] font-medium text-[var(--text-primary)]">
                  Dual Authorization on Critical Severity
                </div>
                <div className="text-[12px] text-[var(--text-secondary)]">
                  Requires two distinct reviewer signoffs before executing high blast-radius patches.
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2.5 py-1 rounded-full border border-[var(--status-safe)]/30 self-start sm:self-center">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Sandbox Containment Policy */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 flex items-center justify-center">
              <Icon name="shield" size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Agent Sandbox Containment
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Operating parameters for sandboxed MCP tools and autonomous reasoning loops.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Max Tool Execution Duration
              </span>
              <div className="text-2xl font-mono tabular-nums font-light text-[var(--text-primary)]">30,000 ms</div>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Hard timeout preventing infinite loops in agent sub-processes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Relative Traversal Protection
              </span>
              <div className="text-2xl font-mono font-light text-[var(--status-safe)]">CANONICAL REALPATH</div>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Strict prefix matching against authorized workspace root.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

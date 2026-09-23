import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Sandbox & Runtime Internals',
};

export default async function RuntimeInternalsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const filters = [
    { name: 'Syscall Filtering (Seccomp)', status: 'Active', detail: 'Denies ptrace, process_vm_readv, mount, and raw socket creation' },
    { name: 'Filesystem Directory Canonicalization', status: 'Enforced', detail: 'Evaluates realpath before read/write; rejects any path outside authorized workspace root' },
    { name: 'Resource Quotas & Cgroups', status: 'Active', detail: 'Limits CPU quota to 2.0 cores and resident memory to 512MB per agent process' },
    { name: 'Execution Hard Timeouts', status: 'Active', detail: 'Enforces hard 30,000ms deadline; sends SIGTERM at 28s and SIGKILL at 30s' },
    { name: 'Environment Sanitization', status: 'Enforced', detail: 'Strips ambient host environment variables, tokens, and SSH keys from worker subprocesses' },
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
            Sandbox &amp; Runtime Internals
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Low-level execution isolation parameters, seccomp filters, directory jail containment, and process quotas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Sandbox Engine
          </span>
          <div className="text-2xl font-light text-[var(--status-safe)] font-mono">ISOLATED</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Zero uncontained escapes</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Memory Quota
          </span>
          <div className="text-2xl font-light text-[var(--text-primary)] font-mono">512 MB</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Hard cap per agent</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Execution Limit
          </span>
          <div className="text-2xl font-light text-[var(--accent-blue)] font-mono">30,000ms</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Watchdog killer active</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Path Containment
          </span>
          <div className="text-2xl font-light text-[var(--status-safe)] font-mono">REALPATH</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Canonical prefix match</span>
        </div>
      </div>

      {/* Runtime Invariants */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Active Isolation Filters &amp; Boundaries
        </h2>
        <div className="space-y-3">
          {filters.map((f) => (
            <div key={f.name} className="card-spacious p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)]">{f.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                    {f.status}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  {f.detail}
                </p>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-tertiary)] shrink-0">
                Level 01 Kernel Gate
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

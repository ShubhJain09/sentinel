import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { Icon } from '@/app/components/ui-icon';
import { runNewScan } from '@/app/actions/scans';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SENTINEL — Configure New Scan',
};

export default async function NewScanPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3 active:scale-[0.98] transition-all"
        >
          <Icon name="arrow-left" size={13} />
          Back to Scans
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Configure New Scan
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Declare target boundaries, authorization parameters, and scope for verification.
        </p>
      </div>

      <form action={runNewScan} className="space-y-6">
        {/* Step 1: Select Target */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-wider uppercase text-[var(--accent-blue)]">
            <span className="w-4.5 h-4.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            Select Target Environment
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <label className="border border-[var(--border-hairline)] hover:border-[var(--border-strong)] rounded-2xl p-4 cursor-pointer bg-[var(--surface-solid)] has-[:checked]:border-[var(--accent-blue)] has-[:checked]:bg-[var(--accent-blue-subtle)] active:scale-[0.99] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
                    <Icon name="box" size={15} className="text-[var(--accent-blue)]" />
                    Filesystem Security Check
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    Inspects file permissions, relative path escapes, and directory boundary containment.
                  </p>
                </div>
                <input
                  type="radio"
                  name="target"
                  value="Filesystem Security Check"
                  defaultChecked
                  className="accent-[var(--accent-blue)] mt-1"
                />
              </div>
            </label>

            <label className="border border-[var(--border-hairline)] hover:border-[var(--border-strong)] rounded-2xl p-4 cursor-pointer bg-[var(--surface-solid)] has-[:checked]:border-[var(--accent-blue)] has-[:checked]:bg-[var(--accent-blue-subtle)] active:scale-[0.99] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
                    <Icon name="code" size={15} className="text-[var(--accent-blue)]" />
                    Research Assistant Agent
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    Audits prompt injection resistance, untrusted instruction handling, and task isolation.
                  </p>
                </div>
                <input
                  type="radio"
                  name="target"
                  value="Research Assistant Agent"
                  className="accent-[var(--accent-blue)] mt-1"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Step 2: Environment Mode */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-wider uppercase text-[var(--accent-blue)]">
            <span className="w-4.5 h-4.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            Execution Mode
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <label className="border border-[var(--border-hairline)] hover:border-[var(--border-strong)] rounded-2xl p-4 cursor-pointer bg-[var(--surface-solid)] has-[:checked]:border-[var(--accent-blue)] has-[:checked]:bg-[var(--accent-blue-subtle)] active:scale-[0.99] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-[13px] text-[var(--text-primary)]">
                    Isolated Sentinel Sandbox
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    Deterministic verification replay. No changes reach external or production infrastructure.
                  </p>
                </div>
                <input
                  type="radio"
                  name="environment"
                  value="sandbox"
                  defaultChecked
                  className="accent-[var(--accent-blue)] mt-1"
                />
              </div>
            </label>

            <label className="border border-[var(--border-hairline)] hover:border-[var(--border-strong)] rounded-2xl p-4 cursor-pointer bg-[var(--surface-solid)] has-[:checked]:border-[var(--accent-blue)] has-[:checked]:bg-[var(--accent-blue-subtle)] active:scale-[0.99] transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-[13px] text-[var(--text-primary)]">
                    Live Target Environment
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    Executes non-destructive boundary probes directly against the configured live agent gateway.
                  </p>
                </div>
                <input
                  type="radio"
                  name="environment"
                  value="live"
                  className="accent-[var(--accent-blue)] mt-1"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Step 3: Scope Selection */}
        <div className="bento-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold tracking-wider uppercase text-[var(--accent-blue)]">
            <span className="w-4.5 h-4.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            Inspection Scope &amp; Guardrails
          </div>

          <div className="space-y-2 pt-1">
            {[
              {
                id: 'dir-containment',
                label: 'Directory Boundary Containment',
                desc: 'Checks path normalization, realpath resolution, and traversal escapes.',
              },
              {
                id: 'instruction-isolation',
                label: 'Indirect Prompt Injection Isolation',
                desc: 'Tests whether untrusted external document text can redirect agent intent.',
              },
              {
                id: 'permission-matrix',
                label: 'Tool Permission Matrix Audit',
                desc: 'Ensures tools cannot exceed declared capability schemas.',
              },
              {
                id: 'egress-guard',
                label: 'Data Exfiltration & Egress Boundary',
                desc: 'Monitors unauthorized outbound network traffic from tool handlers.',
              },
            ].map((check) => (
              <label
                key={check.id}
                className="flex items-start gap-3 p-3.5 rounded-xl well-inset hover:border-[var(--border-strong)] cursor-pointer active:scale-[0.995] transition-all"
              >
                <input
                  type="checkbox"
                  name="scope"
                  value={check.id}
                  defaultChecked
                  className="accent-[var(--accent-blue)] mt-0.5 rounded"
                />
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">
                    {check.label}
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                    {check.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-hairline)]">
          <Link
            href="/scans"
            className="btn-ghost text-[12.5px]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-primary"
          >
            <Icon name="scan" size={14} />
            <span>Start Authorized Scan</span>
          </button>
        </div>
      </form>
    </div>
  );
}

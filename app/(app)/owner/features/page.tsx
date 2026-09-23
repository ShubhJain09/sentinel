import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Feature Controls & Kill-Switches',
};

export default async function FeatureControlsPage() {
  const session = await getSession();
  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const features = [
    {
      id: 'feat-hitl',
      name: 'Mandatory Human In The Loop Gate',
      description: 'Enforces explicit reviewer authorization for all agent-proposed boundary patches. Cannot be disabled by policy.',
      enabled: true,
      locked: true,
      category: 'Safety Guardrails',
    },
    {
      id: 'feat-realpath',
      name: 'Strict Directory Realpath Containment',
      description: 'Canonicalizes all filesystem tool parameters and rejects traversals outside declared workspace roots.',
      enabled: true,
      locked: false,
      category: 'Safety Guardrails',
    },
    {
      id: 'feat-patch-synth',
      name: 'Autonomous Patch Synthesis Engine',
      description: 'Allows AI security agents to generate minimal AST diff proposals when boundary escapes are verified.',
      enabled: true,
      locked: false,
      category: 'Autonomous Capabilities',
    },
    {
      id: 'feat-auto-retest',
      name: 'Automated Post-Remediation Retesting',
      description: 'Automatically triggers a deterministic 6-point invariant retest once an approval is authorized.',
      enabled: true,
      locked: false,
      category: 'Autonomous Capabilities',
    },
    {
      id: 'feat-debug-telemetry',
      name: 'Developer Debug & Low-Level Telemetry',
      description: 'Restricted exclusively to Owner Control Center. Stripped from normal analyst and viewer dashboards.',
      enabled: false,
      locked: false,
      category: 'Visibility & Information Architecture',
    },
    {
      id: 'feat-failover',
      name: 'AI Model Fallback Routing',
      description: 'Automatically shifts inference to local deterministic sandbox if upstream providers exceed 2,500ms latency.',
      enabled: true,
      locked: false,
      category: 'Runtime Reliability',
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
            Feature Controls &amp; Emergency Kill-Switches
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Control platform feature rollouts, toggle autonomous reasoning capabilities, and manage emergency kill-switches.
        </p>
      </div>

      <div className="space-y-4">
        {features.map((feat) => (
          <div
            key={feat.id}
            className="card-spacious p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{feat.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                  {feat.category}
                </span>
                {feat.locked && (
                  <span className="text-[9.5px] font-bold text-amber-500 uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Immutable Safety Policy
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                {feat.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${
                  feat.enabled
                    ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                    : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)] border border-[var(--border-hairline)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    feat.enabled ? 'bg-[var(--status-safe)]' : 'bg-[var(--text-tertiary)]'
                  }`}
                />
                {feat.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

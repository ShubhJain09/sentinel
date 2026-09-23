import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import { getRegisteredProviders } from '@/app/lib/ai-provider';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — AI Providers & Wiring',
};

export default async function ProvidersWiringPage() {
  const session = await getSession();
  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const providers = getRegisteredProviders();

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
            AI Provider Infrastructure &amp; Wiring
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Configure model inference providers, API credentials, execution routing matrices, and fallback latency budgets.
        </p>
      </div>

      {/* Provider Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="card-spacious p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)] uppercase">
                  {p.type}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    p.isConfigured
                      ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                      : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      p.isConfigured ? 'bg-[var(--status-safe)]' : 'bg-[var(--status-warning)]'
                    }`}
                  />
                  {p.isConfigured ? 'Configured' : 'Key Required'}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-[16px] text-[var(--text-primary)]">{p.name}</h3>
                <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="well-inset p-3 space-y-1">
                <span className="text-[9.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  Declared Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {p.capabilities.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-[var(--surface-solid)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--text-tertiary)]">Provider ID</span>
              <span className="text-[var(--accent-blue)]">{p.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Model Routing Matrix */}
      <div className="card-spacious p-6 space-y-4">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Icon name="code" size={16} className="text-[var(--accent-blue)]" />
          Autonomous Execution Routing Matrix
        </h2>
        <div className="space-y-3 divide-y divide-[var(--border-hairline)] text-[12.5px]">
          <div className="pt-3 first:pt-0 flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Primary Deterministic Engine</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">Sentinel Core Sandbox (Local)</span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Distributed Agent Cluster</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">TrueForge Fleet Gateway (Remote)</span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">High-Throughput Reasoning</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">Groq Inference Engine</span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Failover Latency Ceiling</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">2,500ms max per inference step</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — TrueForge Gateway',
};

export default async function TrueForgeGatewayPage() {
  const session = await getSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const isConfigured = !!process.env.TRUEFORGE_API_KEY;

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
            TrueForge Autonomous Fleet Gateway
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Configure enterprise TrueForge worker fleet tokens, gateway routing endpoints, tenant isolation, and telemetry interception.
        </p>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Gateway State
          </span>
          <div className="text-2xl font-light font-mono text-[var(--text-primary)]">
            {isConfigured ? 'CONNECTED' : 'STANDBY'}
          </div>
          <span className={`text-[11px] ${isConfigured ? 'text-[var(--status-safe)]' : 'text-[var(--status-warning)]'}`}>
            {isConfigured ? 'Fleet ready for leases' : 'Awaiting worker token'}
          </span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Fleet Capacity
          </span>
          <div className="text-2xl font-light text-[var(--text-primary)] font-mono">16 Workers</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Dedicated sandbox pool</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Interception
          </span>
          <div className="text-2xl font-light text-[var(--status-safe)] font-mono">ENFORCED</div>
          <span className="text-[11px] text-[var(--text-secondary)]">All tool calls mirrored</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Failover Mode
          </span>
          <div className="text-2xl font-light text-[var(--accent-blue)] font-mono">SANDBOX</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Local fallback active</span>
        </div>
      </div>

      {/* Gateway Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-spacious p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Icon name="code" size={16} className="text-[var(--accent-blue)]" />
            Routing Parameters
          </h2>
          <div className="space-y-3 divide-y divide-[var(--border-hairline)] text-[12.5px]">
            <div className="pt-3 first:pt-0 flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Gateway Endpoint</span>
              <span className="font-mono text-[var(--text-primary)]">https://api.trueforge.ai/v1/gateway</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Worker Protocol</span>
              <span className="font-mono text-[var(--text-primary)]">gRPC / TLS v1.3</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Rate Limit</span>
              <span className="font-mono text-[var(--text-primary)]">120 requests / minute</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Lease Timeout</span>
              <span className="font-mono text-[var(--text-primary)]">45,000ms</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Egress Guardrail</span>
              <span className="font-mono text-[var(--status-safe)] font-semibold">Strict Domain Allowlist</span>
            </div>
          </div>
        </div>

        <div className="card-spacious p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Icon name="lock" size={16} className="text-[var(--accent-blue)]" />
            Worker Fleet Token &amp; Credentials
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            Worker tokens authorize the local Sentinel orchestrator to dispatch tasks to remote isolated TrueForge nodes.
          </p>

          <div className="p-3.5 rounded-2xl bg-[var(--well)] border border-[var(--well-border)] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[var(--text-tertiary)]">VARIABLE</span>
              <span className="text-[var(--text-tertiary)]">STATUS</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[12px]">
              <span className="text-[var(--accent-blue)] font-semibold">TRUEFORGE_API_KEY</span>
              <span className={`font-semibold ${isConfigured ? 'text-[var(--status-safe)]' : 'text-[var(--status-warning)]'}`}>
                {isConfigured ? '● CONFIGURED' : '○ UNSET (STANDBY)'}
              </span>
            </div>
          </div>

          <div className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
            To update the token, set <code className="px-1.5 py-0.5 rounded bg-[var(--well)] text-[var(--text-primary)] font-mono">TRUEFORGE_API_KEY</code> in your environment file or update securely via the <Link href="/owner/secrets" className="text-[var(--accent-blue)] underline">Environment Secrets</Link> panel.
          </div>
        </div>
      </div>
    </div>
  );
}

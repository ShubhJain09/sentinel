import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import { getAllUsers, getDb } from '@/app/lib/db';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Owner Control Center',
};

export default async function OwnerDashboard() {
  const session = await getSession();

  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const isOwner = session.role === 'owner';

  const db = getDb();
  const users = getAllUsers(session.role === 'owner' ? undefined : session.workspaceId);
  const workspaceCount = (
    db.prepare('SELECT COUNT(*) as count FROM workspaces').get() as { count: number }
  ).count;
  const auditCount = (
    db.prepare('SELECT COUNT(*) as count FROM audit_events').get() as { count: number }
  ).count;

  const sections = [
    {
      category: 'Governance & Access',
      modules: [
        {
          title: 'Users & Access',
          description: 'Manage platform invitations, credentials, and user lifecycle',
          icon: 'shield',
          href: '/owner/users',
          ownerOnly: false,
        },
        {
          title: 'Roles & Permissions',
          description: 'Inspect RBAC matrix, capability delegations, and boundaries',
          icon: 'lock',
          href: '/owner/roles',
          ownerOnly: false,
        },
        {
          title: 'Tenant Workspaces',
          description: 'Manage logical team partitions and environment boundaries',
          icon: 'box',
          href: '/owner/workspaces',
          ownerOnly: false,
        },
        {
          title: 'Authentication Providers',
          description: 'Inspect SSO, Google OAuth, Apple ID, Passkey FIDO2, and password security',
          icon: 'shield',
          href: '/owner/auth-providers',
          ownerOnly: false,
        },
        {
          title: 'Immutable Audit Logs',
          description: 'Inspect cryptographic audit trail and event records',
          icon: 'clock',
          href: '/owner/audit',
          ownerOnly: false,
        },
      ],
    },
    {
      category: 'AI & Tool Infrastructure',
      modules: [
        {
          title: 'MCP Server Registry',
          description: 'Register Model Context Protocol tools, stdio/sse transports, and manifests',
          icon: 'sliders',
          href: '/owner/mcp',
          ownerOnly: false,
        },
        {
          title: 'TrueForge Gateway',
          description: 'Configure enterprise worker fleet tokens, routing endpoints, and rate limits',
          icon: 'code',
          href: '/owner/trueforge',
          ownerOnly: false,
        },
        {
          title: 'Sandbox / Runtime Internals',
          description: 'Seccomp filters, chroot jail mounts, resource quotas, and timeout parameters',
          icon: 'shield',
          href: '/owner/runtime',
          ownerOnly: false,
        },
        {
          title: 'AI Providers & Wiring',
          description: 'Configure API keys, model routing, latency budgets, and failover fallbacks',
          icon: 'code',
          href: '/owner/providers',
          ownerOnly: false,
        },
        {
          title: 'Agent Configuration',
          description: 'Configure leased AI agent capabilities, reasoning loops, and tool boundaries',
          icon: 'code',
          href: '/owner/agents',
          ownerOnly: false,
        },
      ],
    },
    {
      category: 'Runtime, Policies & Features',
      modules: [
        {
          title: 'Technical Integrations',
          description: 'Full API credential management, webhook secret setup, and mesh connectors',
          icon: 'sliders',
          href: '/owner/integrations',
          ownerOnly: false,
        },
        {
          title: 'Security Policies',
          description: 'Set human-in-the-loop thresholds and boundary containment rules',
          icon: 'scan',
          href: '/owner/security',
          ownerOnly: true,
        },
        {
          title: 'Feature Controls',
          description: 'Granular platform feature toggles, kill-switches, and automated retest policies',
          icon: 'settings',
          href: '/owner/features',
          ownerOnly: false,
        },
      ],
    },
    {
      category: 'Telemetry, Diagnostics & Secrets',
      modules: [
        {
          title: 'System Health',
          description: 'Platform architecture specifications, cryptographic standards, and runtimes',
          icon: 'settings',
          href: '/owner/system',
          ownerOnly: false,
        },
        {
          title: 'System Diagnostics',
          description: 'Live memory heap stats, SQLite WAL checkpoint telemetry, and socket pools',
          icon: 'activity',
          href: '/owner/diagnostics',
          ownerOnly: true,
        },
        {
          title: 'Environment & Secrets',
          description: 'JWT salt inspection, database connection URI configuration, and secret rotation',
          icon: 'lock',
          href: '/owner/secrets',
          ownerOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
              {isOwner ? 'Platform Owner Control Center' : 'Platform Admin Centre'}
            </h1>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                isOwner
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-[var(--status-safe)]/10 text-[var(--status-safe)] border-[var(--status-safe)]/20'
              }`}
            >
              {isOwner ? 'Exclusive Owner Access' : 'Administrator Access'}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-[13px] mt-1">
            Technical infrastructure, runtime sandboxing, model wiring, and governance.
          </p>
        </div>
        <div className="text-[12px] text-[var(--text-secondary)] font-mono">
          Session Operator: <strong className="text-[var(--text-primary)] font-semibold">{session.email}</strong>
        </div>
      </div>

      {/* Stats Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between font-semibold uppercase tracking-wider">
            Total Users
            <Icon name="shield" size={15} className="text-[var(--accent-blue)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tabular-nums">{users.length}</div>
          <div className="text-[11px] text-[var(--status-safe)] font-medium">Platform active</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between font-semibold uppercase tracking-wider">
            Workspaces
            <Icon name="box" size={15} className="text-[var(--accent-blue)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tabular-nums">{workspaceCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)]">Isolated environments</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between font-semibold uppercase tracking-wider">
            Audit Events
            <Icon name="clock" size={15} className="text-[var(--status-warning)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tabular-nums">{auditCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)]">Immutable records</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between font-semibold uppercase tracking-wider">
            Owner Security
            <Icon name="check" size={15} className="text-[var(--status-safe)]" />
          </div>
          <div className="text-3xl font-light text-[var(--status-safe)] font-mono">ENFORCED</div>
          <div className="text-[11px] text-[var(--text-secondary)]">Server-side authorization</div>
        </div>
      </div>

      {/* Grouped Control Center Modules */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.category} className="space-y-4">
            <h2 className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.modules.map((mod) => (
                mod.ownerOnly && !isOwner ? (
                  <div
                    key={mod.title}
                    className="bento-card p-6 flex flex-col justify-between opacity-60 cursor-not-allowed select-none border-dashed"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] flex items-center justify-center">
                          <Icon name="lock" size={18} />
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold uppercase tracking-wider">
                          Owner Only
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{mod.title}</h3>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-tertiary)]">
                      Requires Platform Owner authorization
                    </div>
                  </div>
                ) : (
                  <Link
                    href={mod.href}
                    key={mod.title}
                    className="interactive-card p-6 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--accent-blue)] flex items-center justify-center group-hover:bg-[var(--accent-blue-subtle)] transition-colors">
                          <Icon name={mod.icon as any} size={18} />
                        </div>
                        <Icon
                          name="arrow-right"
                          size={15}
                          className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-blue)] transition-colors"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{mod.title}</h3>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-[var(--accent-blue)] transition-colors">
                      Configure module &rarr;
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

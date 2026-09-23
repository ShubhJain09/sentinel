import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import { ROLE_PERMISSIONS } from '@/app/lib/permissions';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Roles & Permissions',
};

export default async function RolesPage() {
  const session = await getSession();

  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const roleDefinitions = [
    {
      id: 'owner',
      name: 'Platform Owner',
      description: 'Supreme administrator. Exclusive access to the Owner Control Center, security policies, and user provisioning.',
      permissions: ['* (All Capabilities Granted)'],
      color: '#ff9f0a',
    },
    {
      id: 'admin',
      name: 'Security Administrator',
      description: 'Manages workspace configurations, user invitations, and tool integrations without global policy overrides.',
      permissions: [...ROLE_PERMISSIONS.admin],
      color: '#30d158',
    },
    {
      id: 'analyst',
      name: 'Security Analyst',
      description: 'Executes security scans, interrogates findings, inspects evidence traces, and explores behavioral telemetry.',
      permissions: [...ROLE_PERMISSIONS.analyst],
      color: '#2997ff',
    },
    {
      id: 'reviewer',
      name: 'Remediation Reviewer',
      description: 'Human in the loop authority to evaluate, approve, or reject proposed agent changes and patches.',
      permissions: [...ROLE_PERMISSIONS.reviewer],
      color: '#bf5af2',
    },
    {
      id: 'viewer',
      name: 'Audit Viewer',
      description: 'Read-only access to overview dashboards, completed scan reports, and verified findings.',
      permissions: [...ROLE_PERMISSIONS.viewer],
      color: '#86868b',
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
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Roles & Capability Matrix
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Granular role-based access control (RBAC) definitions enforced across all server endpoints.
        </p>
      </div>

      <div className="space-y-4">
        {roleDefinitions.map((role) => (
          <div key={role.id} className="bento-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-[16px] text-[var(--text-primary)]">{role.name}</h3>
                  <span
                    className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: role.color,
                      backgroundColor: `${role.color}15`,
                      borderColor: `${role.color}30`,
                    }}
                  >
                    {role.id}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)]">{role.description}</p>
              </div>

              <div className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] shrink-0 self-start sm:self-center">
                {role.permissions.length} Capabilities
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">
                Declared Capability Grants
              </span>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span
                    key={p}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

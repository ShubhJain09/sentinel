import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getDb } from '@/app/lib/db';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Workspaces',
};

export default async function WorkspacesPage() {
  const session = await getSession();

  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const db = getDb();
  const workspaces = db.prepare(`
    SELECT w.*, COUNT(u.id) as memberCount 
    FROM workspaces w
    LEFT JOIN users u ON u.workspaceId = w.id
    GROUP BY w.id
  `).all() as any[];

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
          Tenant Workspaces
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Manage logical tenant boundaries, isolated permissions, and team allocations.
        </p>
      </div>

      <div className="space-y-4">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center text-[var(--accent-blue)]">
                <Icon name="box" size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{ws.name}</h3>
                <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 font-mono tabular-nums">
                  <span>ID: {ws.id}</span>
                  <span>•</span>
                  <span>Created {new Date(ws.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  Members
                </span>
                <span className="text-[14px] font-mono tabular-nums font-medium text-[var(--text-primary)]">
                  {ws.memberCount}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--status-safe)] bg-[var(--status-safe)]/10 px-2.5 py-1 rounded-full border border-[var(--status-safe)]/30">
                ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

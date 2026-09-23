import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getAllAuditEvents } from '@/app/lib/db';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Owner Audit Logs',
};

export default async function OwnerAuditPage() {
  const session = await getSession();

  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const events = getAllAuditEvents(200);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3"
          >
            <Icon name="arrow-left" size={14} />
            Owner Control Center
          </Link>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            System Audit Logs
          </h1>
          <p className="text-[var(--text-secondary)] text-[13px] mt-1">
            Durable, tamper-evident chronological event trail of all operational actions.
          </p>
        </div>
        <div className="text-[12px] font-mono tabular-nums text-[var(--text-secondary)] bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full self-start sm:self-auto">
          {events.length} Events Logged
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-secondary)]/50 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Operator</th>
                <th className="py-3 px-6">Target</th>
                <th className="py-3 px-6">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-[var(--surface-secondary)]/30 transition-colors">
                  <td className="py-3.5 px-6 font-mono tabular-nums text-[12px] text-[var(--text-tertiary)] whitespace-nowrap" suppressHydrationWarning>
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20">
                      {event.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-[13px] text-[var(--text-primary)] font-medium">
                    {event.userName}
                  </td>
                  <td className="py-3.5 px-6 text-[12px] text-[var(--text-secondary)] font-mono">
                    {event.targetType ? `${event.targetType}:${event.targetId?.slice(0, 8)}` : '—'}
                  </td>
                  <td className="py-3.5 px-6 text-[12px] text-[var(--text-secondary)] max-w-md truncate">
                    {event.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

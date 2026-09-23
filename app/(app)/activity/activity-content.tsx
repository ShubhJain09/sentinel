'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { AuditEvent } from '@/app/lib/types';

export default function ActivityContent({ events }: { events: AuditEvent[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((e) => {
    const matchesFilter =
      filter === 'All'
        ? true
        : filter === 'Auth'
        ? e.action.startsWith('user.')
        : filter === 'Scans'
        ? e.action.startsWith('scan.')
        : filter === 'Findings'
        ? e.action.startsWith('finding.')
        : filter === 'Approvals'
        ? e.action.startsWith('approval.') || e.action.startsWith('remediation.')
        : true;

    const matchesSearch =
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
          Audit Trail
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Activity &amp; Audit History
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Real-time chronicle of scan executions, boundary reviews, and platform configuration changes.
        </p>
      </div>

      <div className="bento-card overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-3.5 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-solid)]">
          <div className="segmented-control max-w-full overflow-x-auto no-scrollbar">
            {['All', 'Scans', 'Approvals', 'Findings', 'Auth'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic('selection');
                  setFilter(tab);
                }}
                className={`segmented-pill ${filter === tab ? 'is-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-apple h-8 w-full sm:w-64 pl-8 text-[12px]"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
              <Icon name="search" size={13} />
            </div>
          </div>
        </div>

        {/* Timeline List */}
        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-[var(--border-hairline)]">
            {filteredEvents.map((e) => {
              const isScan = e.action.startsWith('scan.');
              const isApproval = e.action.startsWith('approval.') || e.action.startsWith('remediation.');
              const isFinding = e.action.startsWith('finding.');

              return (
                <div
                  key={e.id}
                  className="p-4 sm:px-5 flex items-start gap-3.5 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div
                    className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isScan
                        ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border-[var(--accent-blue-border)]'
                        : isApproval
                        ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                        : isFinding
                        ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                        : 'bg-[var(--surface-selected)] text-[var(--text-secondary)] border-[var(--border-hairline)]'
                    }`}
                  >
                    <Icon
                      name={
                        isScan
                          ? 'scan'
                          : isApproval
                          ? 'approval'
                          : isFinding
                          ? 'finding'
                          : 'clock'
                      }
                      size={14}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[13px] font-medium text-[var(--text-primary)]">
                        {e.detail}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-tertiary)] whitespace-nowrap tabular-numbers" suppressHydrationWarning>
                        {new Date(e.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[var(--text-secondary)] flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[var(--text-primary)] font-medium">
                        {e.userName}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10.5px] text-[var(--accent-blue)]">
                        {e.action}
                      </span>
                      {e.targetType && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10.5px] text-[var(--text-tertiary)]">
                            {e.targetType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-[var(--text-secondary)] text-[12.5px]">
            No activity matches the selected filter or search query.
          </div>
        )}
      </div>
    </div>
  );
}

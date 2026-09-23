'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsContent() {
  const [filter, setFilter] = useState('All');

  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Boundary Violation Identified (SNT-001)',
      message: 'Filesystem MCP Sandbox attempted relative path traversal outside declared /workspace boundary.',
      type: 'critical',
      time: 'Just now',
      read: false,
      actionUrl: '/findings',
    },
    {
      id: 'notif-2',
      title: 'Remediation Review Awaiting Action',
      message: 'Human review required for change request APR-001 on Filesystem MCP boundary patch.',
      type: 'warning',
      time: '12 min ago',
      read: false,
      actionUrl: '/approvals',
    },
    {
      id: 'notif-3',
      title: 'Automated Scan Completed (SCAN-003)',
      message: 'Permission boundary retest completed: 6 of 6 security checks verified.',
      type: 'info',
      time: '1 hr ago',
      read: true,
      actionUrl: '/scans',
    },
  ]);

  const filteredItems = items.filter((item) => (filter === 'Unread' ? !item.read : true));

  function markAllRead() {
    triggerHaptic('tap');
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Communications
          </span>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Security Notifications
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Alerts on boundary checks, human oversight requests, and security discoveries.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="btn-ghost text-[12px] self-start sm:self-auto"
        >
          Mark all as read
        </button>
      </div>

      <div className="bento-card overflow-hidden">
        {/* Filter bar */}
        <div className="flex gap-1.5 p-3.5 border-b border-[var(--border-hairline)] bg-[var(--surface-solid)]">
          <div className="segmented-control">
            {['All', 'Unread'].map((f) => {
              const count = f === 'Unread' ? items.filter((i) => !i.read).length : items.length;
              return (
                <button
                  key={f}
                  onClick={() => {
                    triggerHaptic('selection');
                    setFilter(f);
                  }}
                  className={`segmented-pill ${filter === f ? 'is-active' : ''}`}
                >
                  {f} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-[var(--border-hairline)]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  item.read
                    ? 'hover:bg-[var(--surface-hover)]'
                    : 'bg-[var(--accent-blue-subtle)]/25 hover:bg-[var(--accent-blue-subtle)]/40'
                }`}
              >
                <div
                  className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.type === 'critical'
                      ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                      : item.type === 'warning'
                      ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                      : 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border-[var(--accent-blue-border)]'
                  }`}
                >
                  <Icon
                    name={
                      item.type === 'critical'
                        ? 'finding'
                        : item.type === 'warning'
                        ? 'approval'
                        : 'check'
                    }
                    size={14}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] shrink-0" />
                      )}
                      <h3 className="text-[13px] font-medium text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)] tabular-numbers">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    {item.message}
                  </p>
                  {item.actionUrl && (
                    <div className="pt-1">
                      <Link
                        href={item.actionUrl}
                        onClick={() => triggerHaptic('selection')}
                        className="text-[12px] font-medium text-[var(--accent-blue)] hover:underline inline-flex items-center gap-1 active:scale-[0.98]"
                      >
                        Take action &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] text-[var(--status-safe)] flex items-center justify-center mb-3">
              <Icon name="check" size={20} />
            </div>
            <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-1">
              Zero unread notifications
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              All operational security alerts have been addressed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

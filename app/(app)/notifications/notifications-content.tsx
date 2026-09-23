'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import Link from 'next/link';
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/app/actions/notifications';
import type { Notification } from '@/app/lib/types';

interface NotificationsContentProps {
  initialNotifications?: Notification[];
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

export default function NotificationsContent({
  initialNotifications = [],
}: NotificationsContentProps) {
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [items, setItems] = useState<Notification[]>(initialNotifications);

  // Sync if initialNotifications changes
  useEffect(() => {
    if (initialNotifications.length > 0) {
      setItems(initialNotifications);
    }
  }, [initialNotifications]);

  const unreadCount = items.filter((i) => !i.read).length;
  const filteredItems = items.filter((item) => (filter === 'Unread' ? !item.read : true));

  async function markAllRead() {
    triggerHaptic('tap');
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));

    // Emit event immediately to clear header red dot
    window.dispatchEvent(
      new CustomEvent('sentinel:notifications-updated', {
        detail: { unreadCount: 0 },
      })
    );

    try {
      await markAllNotificationsReadAction();
    } catch {
      // Fallback API call
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'markAllRead' }),
        });
      } catch {}
    }
  }

  async function handleItemClick(item: Notification) {
    if (!item.read) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, read: true } : i))
      );
      const remainingUnread = Math.max(0, unreadCount - 1);
      window.dispatchEvent(
        new CustomEvent('sentinel:notifications-updated', {
          detail: { unreadCount: remainingUnread },
        })
      );
      try {
        await markNotificationReadAction(item.id);
      } catch {}
    }
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
          disabled={unreadCount === 0}
          className={`btn-ghost text-[12px] self-start sm:self-auto ${
            unreadCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Mark all as read
        </button>
      </div>

      <div className="bento-card overflow-hidden">
        {/* Filter bar */}
        <div className="flex gap-1.5 p-3.5 border-b border-[var(--border-hairline)] bg-[var(--surface-solid)]">
          <div className="segmented-control">
            {(['All', 'Unread'] as const).map((f) => {
              const count = f === 'Unread' ? unreadCount : items.length;
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
                    item.type.includes('critical')
                      ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                      : item.type.includes('warning') || item.type.includes('approval')
                      ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                      : 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border-[var(--accent-blue-border)]'
                  }`}
                >
                  <Icon
                    name={
                      item.type.includes('critical') || item.type.includes('finding')
                        ? 'finding'
                        : item.type.includes('warning') || item.type.includes('approval')
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
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    {item.message}
                  </p>
                  {item.actionUrl && (
                    <div className="pt-1">
                      <Link
                        href={item.actionUrl}
                        onClick={() => {
                          triggerHaptic('selection');
                          handleItemClick(item);
                        }}
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

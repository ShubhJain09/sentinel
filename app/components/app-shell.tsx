'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalNav } from '@/app/components/global-nav';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Session } from '@/app/lib/types';

interface AppShellProps {
  children: React.ReactNode;
  session: Session;
}

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', href: '/overview', icon: 'overview' },
  { label: 'Agents & Passports', href: '/agents', icon: 'shield' },
  { label: 'Scans', href: '/scans', icon: 'scan' },
  { label: 'Findings', href: '/findings', icon: 'finding' },
  { label: 'Investigations', href: '/investigations', icon: 'search' },
  { label: 'Evidence', href: '/evidence', icon: 'box' },
  { label: 'Approvals', href: '/approvals', icon: 'approval' },
  { label: 'AI Workspace', href: '/ai-workspace', icon: 'code' },
  { label: 'Analytics', href: '/analytics', icon: 'activity' },
  { label: 'Activity', href: '/activity', icon: 'clock' },
];

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname() || '';

  // AI Workspace and specific detail views provide their own dedicated layout
  const isDedicatedCanvas = pathname.startsWith('/ai-workspace');

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      {/* Apple-grade Global Navigation Header */}
      <GlobalNav session={session} />

      {/* Main Work Area */}
      <div className="flex-1 flex w-full">
        {/* Quiet Left Sidebar (Desktop) - As depicted in Image 2 Screen 3 & Image 3 Screen 6 */}
        {!isDedicatedCanvas && (
          <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 border-r border-[var(--border-hairline)] bg-[var(--surface-primary)]/40 p-4 sticky top-12 h-[calc(100vh-48px)] flex-col justify-between select-none">
            <div className="space-y-6">
              {/* Workspace Badge */}
              <div className="px-2 pt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--status-safe)]" />
                  <span className="text-[11px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase truncate">
                    Production Enclave
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--well)] px-1.5 py-0.5 rounded">
                  v2.6
                </span>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {PRIMARY_NAV.map((item) => {
                  const isActive =
                    item.href === '/overview'
                      ? pathname === '/overview'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => triggerHaptic('selection')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[var(--surface-solid)] text-[var(--accent-blue)] shadow-xs border border-[var(--border-hairline)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          name={item.icon}
                          size={15}
                          className={`transition-colors ${
                            isActive
                              ? 'text-[var(--accent-blue)]'
                              : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Enclave Status & Owner Center (if owner) */}
            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2">
              {session.role === 'owner' && (
                <Link
                  href="/owner"
                  onClick={() => triggerHaptic('selection')}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-colors ${
                    pathname.startsWith('/owner')
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                      : 'text-amber-600/90 dark:text-amber-400/90 hover:bg-amber-500/10'
                  }`}
                >
                  <Icon name="shield" size={14} />
                  <span>Owner Control Center</span>
                </Link>
              )}

              <div className="px-3 py-2 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="truncate">{session.email}</span>
                <span className="capitalize font-mono text-[10px] text-[var(--accent-blue)]">
                  {session.role}
                </span>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  onClick={() => triggerHaptic('tap')}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11.5px] text-[var(--text-tertiary)] hover:text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] transition-colors cursor-pointer"
                >
                  <span>Sign Out</span>
                  <Icon name="arrow" size={11} className="opacity-70" />
                </button>
              </form>
            </div>
          </aside>
        )}

        {/* Viewport Canvas */}
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>

      {/* Subtle Pinned Footer */}
      {!isDedicatedCanvas && (
        <footer className="w-full border-t border-[var(--border-hairline)] bg-[var(--surface-solid)]/40 py-6 px-6 text-[12px] text-[var(--text-secondary)] mt-auto select-none">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">SENTINEL</span>
              <span>•</span>
              <span>Cryptographic Security Engine</span>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">
                Support
              </Link>
              <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                Privacy
              </Link>
              <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
                Architecture
              </Link>
              <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

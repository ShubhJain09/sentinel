'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SentinelLogo } from '@/app/components/sentinel-logo';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { useTheme } from '@/app/components/theme-provider';
import { logout } from '@/app/actions/auth';
import type { Session } from '@/app/lib/types';

interface GlobalNavProps {
  session?: Session | null;
}

// In-memory module cache to eliminate session flicker during client-side navigation
let globalCachedSession: Session | null | undefined = undefined;

export function GlobalNav({ session: propSession }: GlobalNavProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Centralized session state: resolves from prop, module cache, or /api/auth/me fallback
  const [session, setSession] = useState<Session | null>(() => {
    if (propSession !== undefined) {
      globalCachedSession = propSession;
      return propSession;
    }
    return globalCachedSession !== undefined ? globalCachedSession : null;
  });

  const [sessionLoading, setSessionLoading] = useState<boolean>(() => {
    if (propSession !== undefined) return false;
    return globalCachedSession === undefined;
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifList, setNotifList] = useState<any[]>([]);

  const [activeMenu, setActiveMenu] = useState<'security' | 'ai' | 'resources' | 'admin' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navDrawerClosing, setNavDrawerClosing] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth exit transition handler for Quick Navigation floating panel
  const closeNavDrawer = useCallback(() => {
    if (navDrawerClosing) return;
    setNavDrawerClosing(true);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setMobileNavOpen(false);
      setNavDrawerClosing(false);
    }, 200);
  }, [navDrawerClosing]);

  const toggleNavDrawer = useCallback(() => {
    if (mobileNavOpen) {
      closeNavDrawer();
    } else {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setNavDrawerClosing(false);
      setMobileNavOpen(true);
    }
  }, [mobileNavOpen, closeNavDrawer]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setProfileOpen(false);
    setNotifOpen(false);
    setMobileNavOpen(false);
    setNavDrawerClosing(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, [pathname]);

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Resolve session client-side if not supplied as a prop
  useEffect(() => {
    if (propSession !== undefined) {
      setSession(propSession);
      globalCachedSession = propSession;
      setSessionLoading(false);
      return;
    }

    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && data.authenticated && data.session) {
          setSession(data.session);
          globalCachedSession = data.session;
        } else {
          setSession(null);
          globalCachedSession = null;
        }
        setSessionLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSessionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propSession]);

  // Fetch notifications and unread count from API, listening for updates
  const fetchNotificationStatus = useCallback(() => {
    if (!session) {
      setUnreadCount(0);
      setNotifList([]);
      return;
    }

    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
          if (Array.isArray(data.notifications)) {
            setNotifList(data.notifications);
          }
        }
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    fetchNotificationStatus();

    const handleNotificationsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ unreadCount?: number }>;
      if (customEvent.detail && typeof customEvent.detail.unreadCount === 'number') {
        setUnreadCount(customEvent.detail.unreadCount);
      }
      fetchNotificationStatus();
    };

    window.addEventListener('sentinel:notifications-updated', handleNotificationsUpdated);
    return () => {
      window.removeEventListener('sentinel:notifications-updated', handleNotificationsUpdated);
    };
  }, [fetchNotificationStatus]);

  // Prevent body scroll when navigation drawer is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const handleMouseEnter = (menu: 'security' | 'ai' | 'resources' | 'admin') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  // Search commands for ⌘K
  const commands = [
    { label: 'Security Overview', href: '/overview', category: 'Product', icon: 'overview' as IconName },
    { label: 'Autonomous Agents & Passports', href: '/agents', category: 'Agents', icon: 'shield' as IconName },
    { label: 'Security Scans', href: '/scans', category: 'Security', icon: 'scan' as IconName },
    { label: 'Launch New Scan', href: '/scans/new', category: 'Security', icon: 'plus' as IconName },
    { label: 'Findings Workbench', href: '/findings', category: 'Security', icon: 'finding' as IconName },
    { label: 'Active Investigations', href: '/investigations', category: 'Security', icon: 'search' as IconName },
    { label: 'Evidence Vault', href: '/evidence', category: 'Security', icon: 'box' as IconName },
    { label: 'Human Approvals', href: '/approvals', category: 'Security', icon: 'approval' as IconName },
    { label: 'Remediation Engine', href: '/remediation', category: 'Security', icon: 'check' as IconName },
    { label: 'Retest Validations', href: '/retests', category: 'Security', icon: 'refresh' as IconName },
    { label: 'AI Workspace', href: '/ai-workspace', category: 'Intelligence', icon: 'code' as IconName },
    { label: 'Activity Trail', href: '/activity', category: 'Intelligence', icon: 'clock' as IconName },
    { label: 'Security Analytics', href: '/analytics', category: 'Intelligence', icon: 'activity' as IconName },
    { label: 'Support Center', href: '/support', category: 'Resources', icon: 'sliders' as IconName },
    { label: 'Keyboard Shortcuts', href: '/support/keyboard-shortcuts', category: 'Resources', icon: 'sliders' as IconName },
    { label: 'Security & AI Glossary', href: '/support/glossary', category: 'Resources', icon: 'sliders' as IconName },
    { label: 'Contact Support & Escalations', href: '/support/contact', category: 'Resources', icon: 'shield' as IconName },
    { label: 'Security Architecture', href: '/security', category: 'Resources', icon: 'shield' as IconName },
    { label: 'Privacy Policy', href: '/privacy', category: 'Legal', icon: 'lock' as IconName },
    { label: 'Terms of Service', href: '/terms', category: 'Legal', icon: 'lock' as IconName },
    ...(session?.role === 'owner' || session?.role === 'admin'
      ? [
          { label: session?.role === 'owner' ? 'Owner Control Center' : 'Admin Centre', href: '/owner', category: 'Administration', icon: 'shield' as IconName },
          { label: 'User Provisioning', href: '/owner/users', category: 'Administration', icon: 'shield' as IconName },
          { label: 'Roles & RBAC', href: '/owner/roles', category: 'Administration', icon: 'lock' as IconName },
          { label: 'Tenant Workspaces', href: '/owner/workspaces', category: 'Administration', icon: 'box' as IconName },
          { label: 'MCP Server Registry', href: '/owner/mcp', category: 'Administration', icon: 'sliders' as IconName },
          { label: 'TrueForge Gateway', href: '/owner/trueforge', category: 'Administration', icon: 'code' as IconName },
          { label: 'Runtime Internals', href: '/owner/runtime', category: 'Administration', icon: 'shield' as IconName },
          { label: 'AI Providers & Wiring', href: '/owner/providers', category: 'Administration', icon: 'code' as IconName },
          { label: 'Technical Integrations', href: '/owner/integrations', category: 'Administration', icon: 'sliders' as IconName },
          ...(session?.role === 'owner'
            ? [{ label: 'System Diagnostics', href: '/owner/diagnostics', category: 'Administration', icon: 'activity' as IconName }]
            : []),
        ]
      : []),
  ];

  const filteredCommands = commands.filter(
    (c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ⌘K hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        triggerHaptic('tap');
        setCmdOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setActiveMenu(null);
        setProfileOpen(false);
        setNotifOpen(false);
        if (mobileNavOpen) {
          closeNavDrawer();
        }
      } else if (cmdOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => (i <= 0 ? Math.max(0, filteredCommands.length - 1) : i - 1));
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          triggerHaptic('selection');
          router.push(filteredCommands[selectedIndex].href);
          setCmdOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cmdOpen, filteredCommands, selectedIndex, router, closeNavDrawer, mobileNavOpen]);

  useEffect(() => {
    if (cmdOpen) {
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 40);
    }
  }, [cmdOpen]);

  return (
    <>
      <header
        ref={navContainerRef}
        className="sticky top-0 z-50 w-full h-[52px] bg-[var(--surface-solid)]/80 backdrop-blur-xl border-b border-[var(--border-hairline)] select-none transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Left Brand Mark */}
          <Link
            href={session ? '/overview' : '/'}
            onClick={() => triggerHaptic('tap')}
            className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            aria-label="Sentinel Home"
          >
            <SentinelLogo size={22} showWordmark={true} wordmarkClassName="text-[14px] font-semibold" />
          </Link>

          {/* Desktop Nav Links with Trigger-Anchored Mega Menus */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[13px] font-normal text-[var(--text-secondary)]">
            <Link
              href={session ? '/overview' : '/'}
              onMouseEnter={() => setActiveMenu(null)}
              className={`hover:text-[var(--text-primary)] transition-colors ${
                pathname === '/' || pathname === '/overview' ? 'text-[var(--text-primary)] font-medium' : ''
              }`}
            >
              Product
            </Link>

            <Link
              href="/agents"
              onMouseEnter={() => setActiveMenu(null)}
              className={`hover:text-[var(--text-primary)] transition-colors ${
                pathname.startsWith('/agents') ? 'text-[var(--text-primary)] font-medium' : ''
              }`}
            >
              Agents
            </Link>

            {/* 1. Security Trigger + Anchored Mega Menu */}
            <div
              className="relative py-3.5"
              onMouseEnter={() => handleMouseEnter('security')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveMenu((prev) => (prev === 'security' ? null : 'security'));
                }}
                className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none ${
                  pathname.startsWith('/scans') ||
                  pathname.startsWith('/findings') ||
                  pathname.startsWith('/approvals') ||
                  pathname.startsWith('/evidence') ||
                  pathname.startsWith('/investigations') ||
                  activeMenu === 'security'
                    ? 'text-[var(--text-primary)] font-medium'
                    : ''
                }`}
              >
                <span>Security</span>
                <Icon name="chevron" size={9} className={`transition-transform duration-200 ${activeMenu === 'security' ? 'rotate-180' : ''}`} />
              </button>

              {/* Anchored Security Dropdown */}
              {activeMenu === 'security' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[460px] p-6 liquid-glass-dropdown shadow-2xl z-50 animate-fade"
                  onMouseEnter={() => handleMouseEnter('security')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Column 1: Explore Security */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                        Explore Security
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link href="/agents" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="shield" size={14} className="text-[var(--accent-blue)]" />
                              Agents &amp; Passports
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Passports, trust graphs &amp; drift
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/scans" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="scan" size={14} className="text-[var(--accent-blue)]" />
                              Scans
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Run and schedule scans
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/findings" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="finding" size={14} className="text-[var(--status-critical)]" />
                              Findings
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Investigate and triage
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/investigations" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="search" size={14} className="text-[var(--accent-blue)]" />
                              Investigations
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Deep dive with evidence
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/evidence" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="box" size={14} className="text-[var(--text-tertiary)]" />
                              Evidence
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              View and manage evidence
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/approvals" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="approval" size={14} className="text-[var(--status-warning)]" />
                              Approvals
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Review and take action
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/remediation" className="group block">
                            <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                              <Icon name="check" size={14} className="text-[var(--status-safe)]" />
                              Remediation
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                              Track fixes and re-test
                            </span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Quick Actions */}
                    <div className="space-y-3 pl-3 border-l border-[var(--border-hairline)]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                        Quick Actions
                      </span>
                      <ul className="space-y-2.5">
                        <li>
                          <Link href="/scans/new" className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                            <Icon name="plus" size={13} className="text-[var(--accent-blue)]" />
                            <span>Start a scan</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/evidence" className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                            <Icon name="arrow" size={13} className="-rotate-90 text-[var(--text-tertiary)]" />
                            <span>Upload evidence</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/approvals" className="flex items-center justify-between text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                            <span className="flex items-center gap-2">
                              <Icon name="bell" size={13} className="text-[var(--status-warning)]" />
                              Pending approvals
                            </span>
                            <span className="w-5 h-5 rounded-full bg-[var(--status-critical)] text-white text-[10px] font-bold flex items-center justify-center">
                              3
                            </span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/activity" className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                            <Icon name="activity" size={13} className="text-[var(--accent-blue)]" />
                            <span>Recent activity</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/settings" className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                            <Icon name="settings" size={13} className="text-[var(--text-tertiary)]" />
                            <span>Security settings</span>
                          </Link>
                        </li>
                      </ul>

                      <div className="pt-3 border-t border-[var(--border-hairline)]">
                        <Link href="/findings" className="text-[11.5px] font-medium text-[var(--accent-blue)] hover:underline inline-flex items-center gap-1">
                          <span>View all security features</span>
                          <Icon name="arrow" size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. AI Trigger + Anchored Dropdown */}
            <div
              className="relative py-3.5"
              onMouseEnter={() => handleMouseEnter('ai')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveMenu((prev) => (prev === 'ai' ? null : 'ai'));
                }}
                className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none ${
                  pathname.startsWith('/ai-workspace') || activeMenu === 'ai'
                    ? 'text-[var(--text-primary)] font-medium'
                    : ''
                }`}
              >
                <span>AI</span>
                <Icon name="chevron" size={9} className={`transition-transform duration-200 ${activeMenu === 'ai' ? 'rotate-180' : ''}`} />
              </button>

              {/* Anchored AI Dropdown */}
              {activeMenu === 'ai' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] p-5 liquid-glass-dropdown shadow-2xl z-50 animate-fade"
                  onMouseEnter={() => handleMouseEnter('ai')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                      AI Security Intelligence
                    </span>
                    <ul className="space-y-2.5">
                      <li>
                        <Link href="/ai-workspace" className="group block">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                            <Icon name="code" size={14} className="text-[var(--accent-blue)]" />
                            Sentinel AI Workspace
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                            Conversational boundary &amp; patch agent
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/activity" className="group block">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors flex items-center gap-2">
                            <Icon name="clock" size={14} className="text-[var(--text-tertiary)]" />
                            Activity Stream
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] block pl-5.5">
                            Chronological reasoning audit
                          </span>
                        </Link>
                      </li>
                    </ul>

                    <div className="p-3 rounded-2xl bg-[var(--well)] border border-[var(--well-border)] flex items-center justify-between text-[11.5px]">
                      <span className="text-[var(--text-secondary)] font-medium">Security Engine</span>
                      <span className="text-[var(--status-safe)] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                        Available
                      </span>
                    </div>

                    <Link href="/ai-workspace" className="btn-primary w-full text-[12px] h-8 justify-center">
                      <span>Open Workspace &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/analytics"
              onMouseEnter={() => setActiveMenu(null)}
              className={`hover:text-[var(--text-primary)] transition-colors ${
                pathname.startsWith('/analytics') ? 'text-[var(--text-primary)] font-medium' : ''
              }`}
            >
              Analytics
            </Link>

            {/* 3. Resources Trigger + Anchored Dropdown */}
            <div
              className="relative py-3.5"
              onMouseEnter={() => handleMouseEnter('resources')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveMenu((prev) => (prev === 'resources' ? null : 'resources'));
                }}
                className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none ${
                  pathname.startsWith('/support') || pathname === '/privacy' || pathname === '/terms' || pathname === '/security' || activeMenu === 'resources'
                    ? 'text-[var(--text-primary)] font-medium'
                    : ''
                }`}
              >
                <span>Resources</span>
                <Icon name="chevron" size={9} className={`transition-transform duration-200 ${activeMenu === 'resources' ? 'rotate-180' : ''}`} />
              </button>

              {/* Anchored Resources Dropdown */}
              {activeMenu === 'resources' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[300px] p-5 liquid-glass-dropdown shadow-2xl z-50 animate-fade"
                  onMouseEnter={() => handleMouseEnter('resources')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                      Documentation &amp; Trust
                    </span>
                    <ul className="space-y-2 text-[13px]">
                      <li>
                        <Link href="/support" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
                          <Icon name="sliders" size={14} className="text-[var(--accent-blue)]" />
                          <span>Support Center</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/scans" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
                          <Icon name="scan" size={14} className="text-[var(--text-tertiary)]" />
                          <span>Scan Documentation</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/security" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
                          <Icon name="shield" size={14} className="text-[var(--status-safe)]" />
                          <span>Security Architecture</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacy" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
                          <Icon name="lock" size={14} className="text-[var(--text-tertiary)]" />
                          <span>Privacy Policy</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
                          <Icon name="box" size={14} className="text-[var(--text-tertiary)]" />
                          <span>About Sentinel</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/support"
              onMouseEnter={() => setActiveMenu(null)}
              className={`hover:text-[var(--text-primary)] transition-colors ${
                pathname.startsWith('/support') ? 'text-[var(--text-primary)] font-medium' : ''
              }`}
            >
              Support
            </Link>

            {/* 4. Admin Trigger (Owner or Admin) */}
            {(session?.role === 'owner' || session?.role === 'admin') && (
              <div
                className="relative py-3.5"
                onMouseEnter={() => handleMouseEnter('admin')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setActiveMenu((prev) => (prev === 'admin' ? null : 'admin'));
                  }}
                  className={`flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:opacity-85 transition-colors cursor-pointer outline-none ${
                    pathname.startsWith('/owner') || activeMenu === 'admin' ? 'underline' : ''
                  }`}
                >
                  <span>Admin</span>
                  <Icon name="chevron" size={9} className={`transition-transform duration-200 ${activeMenu === 'admin' ? 'rotate-180' : ''}`} />
                </button>

                {/* Anchored Admin Dropdown */}
                {activeMenu === 'admin' && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[420px] p-5 liquid-glass-dropdown shadow-2xl z-50 animate-fade"
                    onMouseEnter={() => handleMouseEnter('admin')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                          Governance
                        </span>
                        <ul className="space-y-1.5 text-[12.5px]">
                          <li>
                            <Link href="/owner" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)] font-medium">
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/users" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              Users &amp; Provisioning
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/roles" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              RBAC Matrix
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/workspaces" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              Workspaces
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/audit" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              Audit Logs
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-2 pl-3 border-l border-[var(--border-hairline)]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                          Infrastructure
                        </span>
                        <ul className="space-y-1.5 text-[12.5px]">
                          <li>
                            <Link href="/owner/mcp" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              MCP Server Registry
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/trueforge" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              TrueForge Gateway
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/runtime" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              Runtime &amp; Sandboxes
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/providers" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              AI Providers &amp; Wiring
                            </Link>
                          </li>
                          <li>
                            <Link href="/owner/integrations" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                              Technical Integrations
                            </Link>
                          </li>
                          {session?.role === 'owner' && (
                            <li>
                              <Link href="/owner/secrets" className="block text-[var(--text-primary)] hover:text-[var(--accent-blue)]">
                                Environment Secrets
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Action Icons: Search, Notifications, Account */}
          <div className="flex items-center gap-2">
            {/* Search (⌘K) */}
            <button
              onClick={() => {
                triggerHaptic('tap');
                setCmdOpen(true);
              }}
              className="btn-icon w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Search (⌘K)"
              aria-label="Search Sentinel"
            >
              <Icon name="search" size={15} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                triggerHaptic('tap');
                toggleTheme();
              }}
              className="btn-icon w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Icon name="sun" size={14} /> : <Icon name="moon" size={14} />}
            </button>

            {/* Quick Navigation Drawer Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                toggleNavDrawer();
              }}
              className="btn-icon w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              title={mobileNavOpen && !navDrawerClosing ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-label={mobileNavOpen && !navDrawerClosing ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileNavOpen && !navDrawerClosing}
            >
              <Icon name={mobileNavOpen && !navDrawerClosing ? 'close' : 'menu'} size={15} />
            </button>

            {/* Notifications (with interactive Liquid Glass popover panel) */}
            {session && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setNotifOpen((prev) => !prev);
                  }}
                  className={`btn-icon w-8 h-8 relative transition-colors cursor-pointer ${
                    notifOpen
                      ? 'bg-[var(--surface-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Icon name="bell" size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--status-critical)]" />
                  )}
                </button>

                {/* Liquid Glass Notification Panel Popover */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-3 liquid-glass-dropdown shadow-2xl z-50 animate-fade space-y-2.5">
                    <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[var(--border-hairline)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          Notifications
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                            unreadCount > 0
                              ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)]'
                              : 'bg-[var(--surface-hover)] text-[var(--text-tertiary)]'
                          }`}
                        >
                          {unreadCount > 0 ? `${unreadCount} new` : 'All read'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={async () => {
                              triggerHaptic('tap');
                              setUnreadCount(0);
                              try {
                                await fetch('/api/notifications', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'markAllRead' }),
                                });
                                window.dispatchEvent(
                                  new CustomEvent('sentinel:notifications-updated', {
                                    detail: { unreadCount: 0 },
                                  })
                                );
                              } catch {}
                            }}
                            className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                        <Link
                          href="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="text-[11px] text-[var(--accent-blue)] hover:underline font-medium"
                        >
                          View all
                        </Link>
                      </div>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto space-y-1 divide-y divide-[var(--border-hairline)]">
                      {notifList.length > 0 ? (
                        notifList.slice(0, 6).map((item) => (
                          <Link
                            key={item.id}
                            href={item.actionUrl || '/notifications'}
                            onClick={() => {
                              triggerHaptic('selection');
                              setNotifOpen(false);
                            }}
                            className={`p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block ${
                              !item.read ? 'bg-[var(--accent-blue)]/5' : ''
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                item.type?.includes('critical') || item.type?.includes('finding')
                                  ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)]'
                                  : item.type?.includes('warning') || item.type?.includes('approval')
                                  ? 'bg-amber-500/15 text-amber-500'
                                  : 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)]'
                              }`}
                            >
                              <Icon
                                name={
                                  item.type?.includes('critical') || item.type?.includes('finding')
                                    ? 'finding'
                                    : item.type?.includes('warning') || item.type?.includes('approval')
                                    ? 'approval'
                                    : 'check'
                                }
                                size={12}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                                  {item.title}
                                </div>
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-critical)] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                                {item.message}
                              </p>
                              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-8 text-center space-y-1">
                          <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] text-[var(--status-safe)] flex items-center justify-center mx-auto mb-2">
                            <Icon name="check" size={14} />
                          </div>
                          <div className="text-[12px] font-medium text-[var(--text-primary)]">
                            All caught up
                          </div>
                          <div className="text-[11px] text-[var(--text-tertiary)]">
                            Zero unread notifications
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--border-hairline)] text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-[12px] font-medium text-[var(--accent-blue)] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View all notifications</span>
                        <Icon name="arrow" size={10} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Avatar Trigger */}
            {sessionLoading ? (
              <div
                className="w-7 h-7 rounded-full bg-[var(--surface-hover)] border border-[var(--border-hairline)] animate-pulse shrink-0"
                aria-label="Loading session"
              />
            ) : session ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setProfileOpen((prev) => !prev);
                  }}
                  className="w-7 h-7 rounded-full bg-[var(--accent-blue)] hover:ring-2 hover:ring-[var(--accent-blue)]/30 text-white font-semibold text-[11px] flex items-center justify-center transition-all cursor-pointer select-none active:scale-[0.95] shadow-xs"
                  aria-label="Account menu"
                >
                  {session.avatarInitials || 'OP'}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-2.5 liquid-glass-dropdown shadow-2xl z-50 animate-fade">
                    {/* 3-Line Rich Account Header */}
                    <div className="px-3 py-2.5 border-b border-[var(--border-hairline)] mb-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent-blue)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {session.avatarInitials || 'OP'}
                        </div>
                        <div className="font-semibold text-[13px] text-[var(--text-primary)] truncate">
                          {session.name}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[11px] pl-9">
                        <span className="font-mono text-[var(--accent-blue)] font-medium truncate">
                          {session.username ? `@${session.username}` : '@operator'}
                        </span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                            session.role === 'owner'
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                              : session.role === 'admin'
                              ? 'bg-[var(--status-safe)]/15 text-[var(--status-safe)] border border-[var(--status-safe)]/20'
                              : 'bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]'
                          }`}
                        >
                          {session.role === 'owner' ? '★ Owner' : session.role === 'admin' ? '🛡 Admin' : 'User'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate pl-9">
                        {session.email}
                      </div>
                    </div>

                    <div className="space-y-0.5 text-[12.5px]">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors"
                      >
                        <Icon name="lock" size={13} className="text-[var(--text-tertiary)]" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors"
                      >
                        <Icon name="settings" size={13} className="text-[var(--text-tertiary)]" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors"
                      >
                        <Icon name="bell" size={13} className="text-[var(--text-tertiary)]" />
                        <span>Notifications</span>
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors"
                      >
                        <Icon name="sliders" size={13} className="text-[var(--text-tertiary)]" />
                        <span>Support</span>
                      </Link>
                      <Link
                        href="/support/keyboard-shortcuts"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors"
                      >
                        <Icon name="sliders" size={13} className="text-[var(--text-tertiary)]" />
                        <span>Keyboard Shortcuts</span>
                      </Link>

                      {(session.role === 'owner' || session.role === 'admin') && (
                        <Link
                          href="/owner"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium transition-colors"
                        >
                          <Icon name="shield" size={13} />
                          <span>{session.role === 'owner' ? 'Owner Control Center' : 'Admin Centre'}</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1.5 mt-1.5 border-t border-[var(--border-hairline)]">
                      <form action="/api/auth/logout" method="POST">
                        <button
                          type="submit"
                          onClick={() => triggerHaptic('tap')}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[12px] text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] transition-colors text-left cursor-pointer"
                        >
                          <Icon name="close" size={12} />
                          <span>Sign Out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => triggerHaptic('selection')}
                className="btn-primary text-[12px] h-7.5 px-3.5"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Dimmer behind active mega-menu */}
      {activeMenu && (
        <div
          className="backdrop-dimmer"
          onClick={() => setActiveMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Spotlight Command Palette (⌘K) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl liquid-glass-dropdown shadow-2xl overflow-hidden animate-fade"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-hairline)]">
              <Icon name="search" size={17} className="text-[var(--text-tertiary)]" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans, findings, evidence, support, or agents…"
                className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
              />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                ESC
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--border-hairline)]">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((item, idx) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      triggerHaptic('selection');
                      router.push(item.href);
                      setCmdOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedIndex === idx
                        ? 'bg-[var(--accent-blue)] text-white'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={item.icon}
                        size={15}
                        className={selectedIndex === idx ? 'text-white' : 'text-[var(--accent-blue)]'}
                      />
                      <span className="text-[13px] font-medium">{item.label}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono ${
                        selectedIndex === idx ? 'text-white/80' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">
                  No matching Sentinel surfaces found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Menu - Apple / visionOS Floating Liquid Glass Panel */}
      {mobileNavOpen && (
        <div
          className={`floating-glass-backdrop flex justify-end items-start p-3 sm:p-4 md:p-5 pointer-events-auto ${
            navDrawerClosing ? 'floating-glass-backdrop-exit' : 'floating-glass-backdrop-enter'
          }`}
          onClick={closeNavDrawer}
        >
          <div
            className={`w-full max-w-[360px] sm:max-w-[380px] h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] md:h-[min(calc(100vh-2.5rem),860px)] floating-glass-panel p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xl ${
              navDrawerClosing ? 'floating-glass-panel-exit' : 'floating-glass-panel-enter'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Quick Navigation"
          >
            <div className="flex flex-col min-h-0 space-y-4 sm:space-y-5">
              {/* Header inside floating glass panel */}
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
                <div className="flex items-center gap-2.5">
                  <SentinelLogo size={22} showWordmark={true} wordmarkClassName="text-[14px] font-semibold tracking-tight" />
                  <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[var(--text-tertiary)] border border-black/[0.04] dark:border-white/[0.06]">
                    Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeNavDrawer}
                  className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] active:scale-90 transition-all border border-black/[0.05] dark:border-white/[0.08] cursor-pointer"
                  aria-label="Close menu"
                  title="Close (Esc)"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              {/* Scrollable navigation groups */}
              <div className="space-y-4 overflow-y-auto pr-1 -mr-1 floating-glass-scroll min-h-0 flex-1">
                {/* Core Platform */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2.5 block mb-1.5">
                    Core Platform
                  </span>
                  <div className="space-y-1">
                    {[
                      { href: session ? '/overview' : '/', label: session ? 'Security Overview' : 'Product Home', icon: 'overview' as IconName, active: pathname === '/' || pathname === '/overview' },
                      { href: '/agents', label: 'Agents & Passports', icon: 'shield' as IconName, active: pathname.startsWith('/agents') },
                      { href: '/scans', label: 'Scans & Audits', icon: 'scan' as IconName, active: pathname.startsWith('/scans') },
                      { href: '/findings', label: 'Findings', icon: 'finding' as IconName, active: pathname.startsWith('/findings') },
                      { href: '/investigations', label: 'Investigations', icon: 'search' as IconName, active: pathname.startsWith('/investigations') },
                      { href: '/evidence', label: 'Evidence Vault', icon: 'box' as IconName, active: pathname.startsWith('/evidence') },
                      { href: '/approvals', label: 'Approvals', icon: 'approval' as IconName, active: pathname.startsWith('/approvals') },
                      { href: '/remediation', label: 'Remediation', icon: 'check' as IconName, active: pathname.startsWith('/remediation') },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeNavDrawer}
                        className={`flex items-center justify-between px-3 py-2 rounded-[13px] text-[13px] font-medium transition-all group ${
                          item.active
                            ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] shadow-xs'
                            : 'text-[var(--text-primary)] hover:bg-black/[0.035] dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              item.active
                                ? 'bg-[var(--accent-blue)] text-white'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <Icon name={item.icon} size={13} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Intelligence & Analytics */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2.5 block mb-1.5">
                    Intelligence &amp; Analytics
                  </span>
                  <div className="space-y-1">
                    {[
                      { href: '/ai-workspace', label: 'AI Workspace', icon: 'code' as IconName, active: pathname.startsWith('/ai-workspace') },
                      { href: '/analytics', label: 'Security Analytics', icon: 'activity' as IconName, active: pathname.startsWith('/analytics') },
                      { href: '/activity', label: 'Activity Trail', icon: 'clock' as IconName, active: pathname.startsWith('/activity') },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeNavDrawer}
                        className={`flex items-center justify-between px-3 py-2 rounded-[13px] text-[13px] font-medium transition-all group ${
                          item.active
                            ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] shadow-xs'
                            : 'text-[var(--text-primary)] hover:bg-black/[0.035] dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              item.active
                                ? 'bg-[var(--accent-blue)] text-white'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <Icon name={item.icon} size={13} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Documentation & Support */}
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2.5 block mb-1.5">
                    Documentation &amp; Support
                  </span>
                  <div className="space-y-1">
                    {[
                      { href: '/support', label: 'Support Center', icon: 'sliders' as IconName, active: pathname.startsWith('/support') },
                      { href: '/security', label: 'Security Architecture', icon: 'shield' as IconName, active: pathname === '/security' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeNavDrawer}
                        className={`flex items-center justify-between px-3 py-2 rounded-[13px] text-[13px] font-medium transition-all group ${
                          item.active
                            ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] shadow-xs'
                            : 'text-[var(--text-primary)] hover:bg-black/[0.035] dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              item.active
                                ? 'bg-[var(--accent-blue)] text-white'
                                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                            }`}
                          >
                            <Icon name={item.icon} size={13} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Administration (if owner or admin) */}
                {(session?.role === 'owner' || session?.role === 'admin') && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2.5 block mb-1.5">
                      Administration
                    </span>
                    <Link
                      href="/owner"
                      onClick={closeNavDrawer}
                      className={`flex items-center justify-between px-3 py-2 rounded-[13px] text-[13px] font-medium transition-all group ${
                        pathname.startsWith('/owner')
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <Icon name="shield" size={13} />
                        </span>
                        <span>{session?.role === 'owner' ? 'Owner Control Center' : 'Admin Centre'}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {session?.role}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom session / profile area */}
            <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2 shrink-0">
              {sessionLoading ? (
                <div className="h-10 rounded-[14px] bg-black/[0.04] dark:bg-white/[0.06] animate-pulse" />
              ) : session ? (
                <div className="p-2.5 rounded-[16px] bg-black/[0.025] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] text-white text-[12px] font-semibold flex items-center justify-center shrink-0 shadow-xs">
                        {session.name ? session.name.charAt(0).toUpperCase() : session.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-[var(--text-primary)] truncate">
                          {session.name || session.email}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {session.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[var(--text-secondary)] shrink-0">
                      {session.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Link
                      href="/profile"
                      onClick={closeNavDrawer}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
                    >
                      <Icon name="lock" size={12} />
                      <span>Profile</span>
                    </Link>
                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        onClick={() => triggerHaptic('tap')}
                        className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[12px] font-medium text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] transition-colors cursor-pointer"
                      >
                        <Icon name="close" size={12} />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={closeNavDrawer}
                  className="btn-primary w-full justify-center h-10 text-[13px] rounded-[14px]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export function GlobalNav({ session }: GlobalNavProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [activeMenu, setActiveMenu] = useState<'security' | 'ai' | 'resources' | 'admin' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null);
    setProfileOpen(false);
    setNotifOpen(false);
    setMobileNavOpen(false);
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
        setMobileNavOpen(false);
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
  }, [cmdOpen, filteredCommands, selectedIndex, router]);

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
                        <Link href="/support/scans" className="flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors font-medium">
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

            {/* Mobile Navigation Toggle (lg:hidden) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setMobileNavOpen((prev) => !prev);
              }}
              className="btn-icon w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
              title={mobileNavOpen ? 'Close Navigation' : 'Open Navigation'}
              aria-label={mobileNavOpen ? 'Close Navigation' : 'Open Navigation'}
              aria-expanded={mobileNavOpen}
            >
              <Icon name={mobileNavOpen ? 'close' : 'menu'} size={15} />
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
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--status-critical)]" />
                </button>

                {/* Liquid Glass Notification Panel Popover */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-3 liquid-glass-dropdown shadow-2xl z-50 animate-fade space-y-2.5">
                    <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[var(--border-hairline)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                          Notifications
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)] font-bold">
                          7 new
                        </span>
                      </div>
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-[11px] text-[var(--accent-blue)] hover:underline font-medium"
                      >
                        Settings
                      </Link>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto space-y-1 divide-y divide-[var(--border-hairline)]">
                      {/* Item 1: Critical Finding */}
                      <Link
                        href="/findings/SNT-001"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="finding" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Prompt injection bypass in agt-research-01
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Critical severity • MicroVM enclave triggered boundary alert
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">2m ago</span>
                        </div>
                      </Link>

                      {/* Item 2: Approval Required */}
                      <Link
                        href="/approvals"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--status-warning-subtle)] text-[var(--status-warning)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="approval" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Approval required: bash execution on host
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Autonomous Code Reviewer requested elevated shell permissions
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">14m ago</span>
                        </div>
                      </Link>

                      {/* Item 3: Agent Changed / Drift */}
                      <Link
                        href="/agents/agt-fs-sandbox-02"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="refresh" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Configuration drift in agt-fs-sandbox-02
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Live runtime mounted /etc beyond baseline approved manifest
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">1h ago</span>
                        </div>
                      </Link>

                      {/* Item 4: Remediation Complete */}
                      <Link
                        href="/remediation"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--status-safe-subtle)] text-[var(--status-safe)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="check" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Remediation complete: Path Sanitization Patch
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            AST patch applied to File Read Enclave. Ready for retest.
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">3h ago</span>
                        </div>
                      </Link>

                      {/* Item 5: Retest Failed */}
                      <Link
                        href="/retests"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="refresh" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Retest failed: SNT-003 regression
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Boundary bypass re-occurred under alternate encoding
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">5h ago</span>
                        </div>
                      </Link>

                      {/* Item 6: Integration Disconnected */}
                      <Link
                        href="/integrations"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--well)] text-[var(--text-tertiary)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="sliders" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Integration: MCP filesystem latency spike
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Heartbeat timeout exceeded 1500ms threshold
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">8h ago</span>
                        </div>
                      </Link>

                      {/* Item 7: Scan Completed with Findings */}
                      <Link
                        href="/scans"
                        onClick={() => {
                          triggerHaptic('selection');
                          setNotifOpen(false);
                        }}
                        className="p-2 pt-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors flex items-start gap-2.5 group cursor-pointer block"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon name="scan" size={12} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-[12px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] truncate">
                            Scan completed: 2 findings detected
                          </div>
                          <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-1">
                            Nightly automated AST boundary audit across agent targets
                          </p>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">12h ago</span>
                        </div>
                      </Link>
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
            {session ? (
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

      {/* Mobile Navigation Drawer (lg:hidden) */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md lg:hidden flex justify-end animate-fade"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="w-full max-w-xs sm:max-w-sm h-full bg-[var(--surface-solid)] border-l border-[var(--border-hairline)] p-5 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                <SentinelLogo size={22} showWordmark={true} wordmarkClassName="text-[14px] font-semibold" />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="btn-icon w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Close menu"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              {/* Navigation groups */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2 block mb-1">
                    Core Platform
                  </span>
                  <div className="space-y-0.5">
                    <Link
                      href={session ? '/overview' : '/'}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="overview" size={15} className="text-[var(--accent-blue)]" />
                      <span>{session ? 'Security Overview' : 'Product Home'}</span>
                    </Link>
                    <Link
                      href="/agents"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="shield" size={15} className="text-[var(--accent-blue)]" />
                      <span>Agents &amp; Passports</span>
                    </Link>
                    <Link
                      href="/scans"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="scan" size={15} className="text-[var(--accent-blue)]" />
                      <span>Scans &amp; Audits</span>
                    </Link>
                    <Link
                      href="/findings"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="finding" size={15} className="text-[var(--status-critical)]" />
                      <span>Findings</span>
                    </Link>
                    <Link
                      href="/investigations"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="search" size={15} className="text-[var(--accent-blue)]" />
                      <span>Investigations</span>
                    </Link>
                    <Link
                      href="/evidence"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="box" size={15} className="text-[var(--text-tertiary)]" />
                      <span>Evidence Vault</span>
                    </Link>
                    <Link
                      href="/approvals"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="approval" size={15} className="text-[var(--status-warning)]" />
                      <span>Approvals</span>
                    </Link>
                    <Link
                      href="/remediation"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="check" size={15} className="text-[var(--status-safe)]" />
                      <span>Remediation</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2 block mb-1">
                    Intelligence &amp; Analytics
                  </span>
                  <div className="space-y-0.5">
                    <Link
                      href="/ai-workspace"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="code" size={15} className="text-[var(--accent-blue)]" />
                      <span>AI Workspace</span>
                    </Link>
                    <Link
                      href="/analytics"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="activity" size={15} className="text-[var(--accent-blue)]" />
                      <span>Security Analytics</span>
                    </Link>
                    <Link
                      href="/activity"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="clock" size={15} className="text-[var(--text-tertiary)]" />
                      <span>Activity Trail</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2 block mb-1">
                    Documentation &amp; Support
                  </span>
                  <div className="space-y-0.5">
                    <Link
                      href="/support"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="sliders" size={15} className="text-[var(--accent-blue)]" />
                      <span>Support Center</span>
                    </Link>
                    <Link
                      href="/security"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="shield" size={15} className="text-[var(--status-safe)]" />
                      <span>Security Architecture</span>
                    </Link>
                  </div>
                </div>

                {(session?.role === 'owner' || session?.role === 'admin') && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 block mb-1">
                      Administration
                    </span>
                    <Link
                      href="/owner"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      <Icon name="shield" size={15} />
                      <span>{session?.role === 'owner' ? 'Owner Control Center' : 'Admin Centre'}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom session area */}
            <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2">
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  >
                    <Icon name="lock" size={15} className="text-[var(--text-tertiary)]" />
                    <span>Profile &amp; Security</span>
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      onClick={() => triggerHaptic('tap')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] text-[var(--status-critical)] hover:bg-[var(--status-critical-subtle)] text-left cursor-pointer"
                    >
                      <Icon name="close" size={13} />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="btn-primary w-full justify-center h-9 text-[13px]"
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

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Session, Scan, Finding, Approval, AuditEvent } from '@/app/lib/types';

interface OverviewProps {
  session: Session;
  counts: { scans: number; findings: number; approvals: number };
  recentScans: Scan[];
  openFindings: Finding[];
  pendingApprovals: Approval[];
  recentAudits: AuditEvent[];
}

export function OverviewContent({
  session,
  counts,
  recentScans,
  openFindings,
  pendingApprovals,
  recentAudits,
}: OverviewProps) {
  // Determine greeting based on local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => {
    if (session.name) return session.name.split(' ')[0];
    if (session.email) return session.email.split('@')[0];
    return 'Operator';
  }, [session]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const criticalCount = useMemo(() => {
    return openFindings.filter((f) => f.severity === 'critical').length;
  }, [openFindings]);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 sm:py-10 space-y-8 select-none">
      {/* ─── Top Greeting Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-1">
          <h1 className="page-headline text-[var(--text-primary)]" suppressHydrationWarning>
            {greeting}, {firstName}.
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-normal" suppressHydrationWarning>
            {formattedDate} • Sentinel Security Enclave
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/scans/new"
            onClick={() => triggerHaptic('selection')}
            className="btn-primary text-[13px] h-9.5 px-5 rounded-full shadow-xs"
          >
            <span>Start a scan</span>
            <Icon name="plus" size={13} />
          </Link>
        </div>
      </div>

      {/* ─── 4 Bento Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Open Findings */}
        <Link
          href="/findings"
          onClick={() => triggerHaptic('tap')}
          className="liquid-glass-card p-5 rounded-[24px] space-y-3 hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">Open findings</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center">
              <Icon name="finding" size={14} />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight tabular-nums">
              {openFindings.length}
            </div>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">
              {criticalCount > 0 ? `${criticalCount} critical escaping` : 'All contained within boundaries'}
            </p>
          </div>
        </Link>

        {/* Card 2: Pending Approval */}
        <Link
          href="/approvals"
          onClick={() => triggerHaptic('tap')}
          className="liquid-glass-card p-5 rounded-[24px] space-y-3 hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">Pending approval</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--status-warning-subtle)] text-[var(--status-warning)] flex items-center justify-center">
              <Icon name="approval" size={14} />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight tabular-nums">
              {pendingApprovals.length}
            </div>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">
              {pendingApprovals.length > 0 ? 'Requires human sign-off' : 'Zero unreviewed actions'}
            </p>
          </div>
        </Link>

        {/* Card 3: Scans This Week */}
        <Link
          href="/scans"
          onClick={() => triggerHaptic('tap')}
          className="liquid-glass-card p-5 rounded-[24px] space-y-3 hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">Scans this week</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center">
              <Icon name="scan" size={14} />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-semibold text-[var(--text-primary)] tracking-tight tabular-nums">
              {counts.scans}
            </div>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">
              Continuous runtime verification
            </p>
          </div>
        </Link>

        {/* Card 4: Critical Issues */}
        <Link
          href="/findings?severity=critical"
          onClick={() => triggerHaptic('tap')}
          className="liquid-glass-card p-5 rounded-[24px] space-y-3 hover:border-[var(--status-critical)]/50 transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">Critical issues</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center">
              <Icon name="shield" size={14} />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-semibold text-[var(--status-critical)] tracking-tight tabular-nums">
              {criticalCount}
            </div>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">
              {criticalCount > 0 ? 'Urgent remediation needed' : 'Zero unmitigated criticals'}
            </p>
          </div>
        </Link>
      </div>

      {/* ─── Autonomous Agent Fleet & Passports Showcase ─────────────────── */}
      <div className="liquid-glass-card p-6 rounded-[28px] space-y-4 border border-[var(--border-hairline)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--status-safe)] animate-pulse" />
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Autonomous Agent Fleet &amp; Passports
              </h2>
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Continuous runtime boundary enforcement, capability verification, and trust telemetry
            </p>
          </div>
          <Link
            href="/agents"
            onClick={() => triggerHaptic('selection')}
            className="btn-primary text-[12.5px] h-8.5 px-4 self-start sm:self-auto"
          >
            <span>View All Agent Passports &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <Link
            href="/agents/agt-research-01"
            onClick={() => triggerHaptic('tap')}
            className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-blue)]">Research</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">Trust 92</span>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors truncate">
              Research Assistant Agent
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1">
              Autonomous literature &amp; code analysis
            </p>
            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[var(--border-hairline)] text-[var(--text-tertiary)]">
              <span className="text-purple-600 dark:text-purple-400 font-medium">● Shadow Active</span>
              <span>Passports &rarr;</span>
            </div>
          </Link>

          <Link
            href="/agents/agt-fs-sandbox-02"
            onClick={() => triggerHaptic('tap')}
            className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-600">MCP Host</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600">Drift Alert</span>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors truncate">
              Filesystem MCP Enclave
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1">
              Deterministic file ops sandbox
            </p>
            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[var(--border-hairline)] text-[var(--text-tertiary)]">
              <span className="text-[var(--status-warning)] font-medium">● 1 Drift Item</span>
              <span>Inspect &rarr;</span>
            </div>
          </Link>

          <Link
            href="/agents/agt-code-reviewer-03"
            onClick={() => triggerHaptic('tap')}
            className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-blue)]">DevOps</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">Trust 88</span>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors truncate">
              Autonomous Code Reviewer
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1">
              Automated PR AST boundary review
            </p>
            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[var(--border-hairline)] text-[var(--text-tertiary)]">
              <span className="text-[var(--status-safe)] font-medium">● Enclave Normal</span>
              <span>Passports &rarr;</span>
            </div>
          </Link>

          <Link
            href="/agents/agt-cloud-infra-04"
            onClick={() => triggerHaptic('tap')}
            className="p-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-0.5 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600">Cloud Gate</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--status-safe-subtle)] text-[var(--status-safe)]">Trust 95</span>
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors truncate">
              Cloud Infrastructure Operator
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-1">
              IAM and network egress containment
            </p>
            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[var(--border-hairline)] text-[var(--text-tertiary)]">
              <span className="text-[var(--status-safe)] font-medium">● Zero Escapes</span>
              <span>Passports &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Split Content: Recent Activity (Left) & Explore AI Workspace (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Recent Activity (7 cols) */}
        <div className="lg:col-span-7 liquid-glass-card p-6 rounded-[28px] space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3.5">
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Recent activity
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Immutable audit telemetry captured across agent nodes
              </p>
            </div>
            <Link
              href="/activity"
              onClick={() => triggerHaptic('selection')}
              className="text-[12px] text-[var(--accent-blue)] hover:underline font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <Icon name="arrow" size={11} />
            </Link>
          </div>

          <div className="space-y-3 divide-y divide-[var(--border-hairline)]">
            {recentAudits.length > 0 ? (
              recentAudits.map((audit) => (
                <div key={audit.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--well)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--accent-blue)]">
                      <Icon name="activity" size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[13px] font-medium text-[var(--text-primary)] leading-snug">
                        {audit.action}
                      </div>
                      <div className="text-[11.5px] text-[var(--text-tertiary)] flex items-center gap-2">
                        <span>{audit.userName || 'Security Daemon'}</span>
                        <span>•</span>
                        <span className="font-mono" suppressHydrationWarning>{new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] shrink-0">
                    LOGGED
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-[12.5px] text-[var(--text-tertiary)]">
                No recent activity logged in this session.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explore AI Workspace (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card p-6 rounded-[28px] flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="space-y-4">
            <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-gradient-to-tr from-[var(--well)] to-transparent border border-[var(--border-hairline)]">
              <Image
                src="/sentinel-glass-ring.jpg"
                alt="AI Workspace"
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                  Agent Sandbox
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                Explore AI Workspace
              </h3>
              <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                Generate sandboxed code patches, investigate tool boundary breaks, and conduct agentic audits with full context durability.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)]">
            <Link
              href="/ai-workspace"
              onClick={() => triggerHaptic('selection')}
              className="btn-primary w-full justify-center h-10 rounded-full text-[13px] font-medium shadow-xs"
            >
              <span>Open AI Workspace</span>
              <span className="text-[14px]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

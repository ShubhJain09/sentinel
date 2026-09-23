'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { HelpPopover } from '@/app/components/help-popover';
import type { Finding, Evidence, Approval } from '@/app/lib/types';

interface FindingDetailViewProps {
  finding: Finding;
  evidenceList: Evidence[];
  linkedApprovals: Approval[];
}

export function FindingDetailView({
  finding,
  evidenceList,
  linkedApprovals,
}: FindingDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'analysis' | 'remediation' | 'activity'>('overview');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const cvssScore =
    finding.severity === 'critical'
      ? '9.1'
      : finding.severity === 'high'
      ? '7.8'
      : finding.severity === 'medium'
      ? '5.4'
      : '3.2';

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 sm:py-10 space-y-8 select-none font-sans">
      {/* ─── Top Breadcrumb Matching Image 2 Screen 4 ─────────────────────── */}
      <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)]">
        <Link
          href="/findings"
          onClick={() => triggerHaptic('selection')}
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
        >
          <Icon name="arrow" size={11} className="rotate-180" />
          <span>Findings</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[var(--text-secondary)]">{finding.id}</span>
      </div>

      {/* ─── Hero Title & Action Dropdown ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center">
              <span
                className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  finding.severity === 'critical'
                    ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                    : finding.severity === 'high'
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25'
                    : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                }`}
              >
                {finding.severity}
              </span>
              <HelpPopover
                title={`CVSS Severity: ${finding.severity.toUpperCase()}`}
                description="Common Vulnerability Scoring System severity indicating the exploitability and potential blast radius of this boundary breach."
                articleHref="/support/findings/severity"
                articleLabel="View CVSS Severity Guide"
              />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--well)] text-[var(--text-secondary)]">
              {finding.classification}
            </span>
            <span className="text-[12px] text-[var(--text-tertiary)]" suppressHydrationWarning>
              Detected {new Date(finding.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="page-headline text-[var(--text-primary)]">
            {finding.title}
          </h1>

          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            {finding.detail}
          </p>
        </div>

        {/* Top Right Action Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setActionMenuOpen((p) => !p);
            }}
            className="btn-primary text-[13px] h-10 px-5 rounded-full flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Take action</span>
            <Icon name="arrow" size={12} className={`transition-transform duration-200 ${actionMenuOpen ? 'rotate-180' : 'rotate-90'}`} />
          </button>

          {actionMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 liquid-glass-dropdown p-2 rounded-2xl shadow-xl z-30 animate-fade">
              <Link
                href={`/approvals${linkedApprovals.length > 0 ? `/${linkedApprovals[0].id}` : ''}`}
                onClick={() => setActionMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <Icon name="approval" size={14} className="text-[var(--accent-blue)]" />
                <span>Review &amp; Approve Fix</span>
              </Link>
              <Link
                href="/ai-workspace"
                onClick={() => setActionMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <Icon name="code" size={14} className="text-[var(--accent-blue)]" />
                <span>Request AI Remediation</span>
              </Link>
              <Link
                href="/retests"
                onClick={() => setActionMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <Icon name="refresh" size={14} className="text-[var(--accent-blue)]" />
                <span>Trigger Retest Boundary</span>
              </Link>
              <Link
                href={`/investigations/${finding.id}`}
                onClick={() => {
                  triggerHaptic('tap');
                  setActionMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
              >
                <Icon name="close" size={14} />
                <span>False-Positive Review Assistant</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── 5 Horizontal Tabs Matching Image 2 Screen 4 ──────────────────── */}
      <div className="border-b border-[var(--border-hairline)] flex items-center gap-6 overflow-x-auto no-scrollbar text-[13px]">
        {(['overview', 'evidence', 'analysis', 'remediation', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab(tab);
            }}
            className={`pb-3 font-medium capitalize transition-colors relative cursor-pointer ${
              activeTab === tab
                ? 'text-[var(--accent-blue)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-blue)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content Views ────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Key Details & Recommended Action */}
          <div className="lg:col-span-8 space-y-6">
            {/* Key Details Card */}
            <div className="liquid-glass-card p-6 rounded-[28px] space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Key details
              </h2>

              <div className="grid grid-cols-2 gap-4 text-[12.5px]">
                <div className="p-3.5 rounded-2xl bg-[var(--well)] space-y-1">
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">Target Asset</div>
                  <div className="font-mono font-medium text-[var(--text-primary)] truncate">{finding.target}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--well)] space-y-1">
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">Status</div>
                  <div className="font-medium text-[var(--text-primary)] capitalize">{finding.status.replace(/_/g, ' ')}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--well)] space-y-1">
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">Classification</div>
                  <div className="font-medium text-[var(--text-primary)]">{finding.classification}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--well)] space-y-1">
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">Blast Radius</div>
                  <div className="font-medium text-[var(--text-primary)] line-clamp-1">{finding.impact}</div>
                </div>
              </div>

              {/* Observed Telemetry */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                  Observed Runtime Telemetry
                </span>
                <pre className="p-4 rounded-2xl bg-[var(--well)] text-[12px] font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[var(--border-hairline)]">
                  {finding.observed}
                </pre>
              </div>
            </div>

            {/* Recommended Action Card */}
            <div className="liquid-glass-card p-6 rounded-[28px] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Recommended action
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                  VERIFIED PATTERN
                </span>
              </div>

              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {finding.recommendation}
              </p>

              {linkedApprovals.length > 0 && (
                <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[var(--text-primary)]">
                      Pending Patch: {linkedApprovals[0].title}
                    </span>
                    <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">
                      {linkedApprovals[0].status}
                    </span>
                  </div>
                  <pre className="text-[11.5px] font-mono text-[var(--text-secondary)] overflow-x-auto p-3 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)]">
                    {linkedApprovals[0].proposedChange}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={`/approvals${linkedApprovals.length > 0 ? `/${linkedApprovals[0].id}` : ''}`}
                  onClick={() => triggerHaptic('selection')}
                  className="btn-primary text-[13px] h-9.5 px-5 rounded-full shadow-xs"
                >
                  <span>Apply Remediation</span>
                  <Icon name="arrow" size={13} />
                </Link>
                <Link
                  href="/ai-workspace"
                  onClick={() => triggerHaptic('tap')}
                  className="btn-secondary text-[13px] h-9.5 px-5 rounded-full"
                >
                  <span>Ask AI Agent</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Risk Summary & Liquid Glass Element */}
          <div className="lg:col-span-4 space-y-6">
            {/* Risk Summary Card */}
            <div className="liquid-glass-card p-6 rounded-[28px] space-y-5">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Risk summary
              </h2>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)]">
                <div className="text-4xl font-bold font-mono text-[var(--status-critical)]">
                  {cvssScore}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[var(--text-primary)]">CVSS v3.1 Score</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                    {finding.severity} Severity
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Attack Vector</span>
                  <span className="font-mono text-[var(--text-primary)]">Network / MCP Tool</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Privileges Required</span>
                  <span className="font-mono text-[var(--text-primary)]">None</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Scope</span>
                  <span className="font-mono text-[var(--text-primary)]">Changed (Escape)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Audit Durability</span>
                  <span className="font-mono text-[var(--status-safe)]">Cryptographic</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Assurance Pill */}
            <div className="liquid-glass-card p-5 rounded-[24px] flex items-center gap-3.5 border border-white/60 dark:border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center shrink-0">
                <Icon name="shield" size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">Zero-Tamper Guarantee</div>
                <div className="text-[11px] text-[var(--text-tertiary)]">Evidence preserved in SQLite WAL</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Attached Evidence Traces ({evidenceList.length})
            </h2>
          </div>

          <div className="space-y-4">
            {evidenceList.map((item, idx) => (
              <div key={item.id} className="liquid-glass-card p-6 rounded-[28px] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--accent-blue)] font-bold">TRACE #{idx + 1}</span>
                    <span className="font-semibold text-[13.5px] text-[var(--text-primary)]">{item.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">{item.source}</span>
                </div>
                <pre className="p-4 rounded-2xl bg-[var(--well)] font-mono text-[12px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[var(--border-hairline)]">
                  {item.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="liquid-glass-card p-7 rounded-[28px] space-y-5">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Behavioral Contract Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[var(--well)] space-y-2 border border-[var(--border-hairline)]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--status-critical)]">
                <span className="w-2 h-2 rounded-full bg-[var(--status-critical)]" />
                Observed Execution
              </div>
              <p className="font-mono text-[12px] text-[var(--text-primary)] leading-relaxed">{finding.observed}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--well)] space-y-2 border border-[var(--border-hairline)]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--status-safe)]">
                <span className="w-2 h-2 rounded-full bg-[var(--status-safe)]" />
                Expected Contract
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">{finding.expected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Remediation Tab */}
      {activeTab === 'remediation' && (
        <div className="liquid-glass-card p-7 rounded-[28px] space-y-5">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Automated &amp; Guided Remediation
          </h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {finding.recommendation}
          </p>
          <div className="pt-2">
            <Link
              href="/ai-workspace"
              className="btn-primary text-[13px] h-9.5 px-5 rounded-full inline-flex"
            >
              <span>Dispatch Agent to Fix in Workspace</span>
            </Link>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="liquid-glass-card p-7 rounded-[28px] space-y-4">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Finding Lifecycle Activity
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--well)] flex items-center justify-between text-[12px]">
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Detection event logged</span>
                <span className="text-[var(--text-tertiary)] block text-[11px]">By automated runtime audit daemon</span>
              </div>
              <span className="font-mono text-[var(--text-tertiary)]" suppressHydrationWarning>{new Date(finding.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

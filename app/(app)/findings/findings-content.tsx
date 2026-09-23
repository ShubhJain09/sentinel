'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Finding, Evidence } from '@/app/lib/types';

interface FindingsProps {
  findings: Finding[];
  evidence: Evidence[];
  initialSelectedId?: string;
}

export default function FindingsContent({ findings, evidence, initialSelectedId }: FindingsProps) {
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || findings[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const filteredFindings = findings.filter((f) => {
    const matchesFilter =
      filter === 'All' ? true : f.severity.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.target.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeFinding =
    findings.find((f) => f.id === selectedId) || filteredFindings[0] || findings[0];
  const relatedEvidence = evidence.filter((e) => e.findingId === activeFinding?.id);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pb-20">
      {/* ── Top Section Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Analyst Workbench
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Findings &amp; Investigations
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Audit detected agent boundary violations, inspect tool execution evidence, and verify automated remediations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/approvals"
            onClick={() => triggerHaptic('selection')}
            className="btn-primary"
          >
            <Icon name="approval" size={14} />
            <span>Approval Queue</span>
          </Link>
        </div>
      </div>

      {findings.length > 0 ? (
        /* ── 3-Pane Desktop Split View ─────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bento-card overflow-hidden min-h-[740px] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-hairline)]">
          {/* ── PANE 1 (LEFT 3.5 cols): Master Findings Navigation ──────────── */}
          <div className="lg:col-span-4 flex flex-col bg-[var(--surface-solid)]">
            {/* Filter and Search Bar */}
            <div className="p-3.5 border-b border-[var(--border-hairline)] space-y-2.5 bg-[var(--surface)]">
              {/* Segmented Filter Pills */}
              <div className="segmented-control w-full justify-between">
                {['All', 'Critical', 'High', 'Medium'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      triggerHaptic('selection');
                      setFilter(tab);
                    }}
                    className={`segmented-pill flex-1 ${filter === tab ? 'is-active' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Inset Search */}
              <div className="relative">
                <Icon
                  name="search"
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter findings by ID, target..."
                  className="input-apple h-8 pl-8 text-[12px]"
                />
              </div>
            </div>

            {/* Findings List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-hairline)] p-1.5 space-y-1 custom-scrollbar">
              {filteredFindings.map((f) => {
                const isSelected = f.id === activeFinding?.id;
                const isCritical = f.severity === 'critical';
                const isHigh = f.severity === 'high';

                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedId(f.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer active:scale-[0.985] ${
                      isSelected
                        ? 'bg-[var(--surface-selected)] border border-[var(--border-strong)] shadow-xs'
                        : 'hover:bg-[var(--surface-hover)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10.5px] font-semibold text-[var(--text-tertiary)]">
                        {f.id}
                      </span>
                      <span
                        className={`pill-badge text-[10px] ${
                          isCritical
                            ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]'
                            : isHigh
                            ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                            : 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue-border)]'
                        }`}
                      >
                        {f.severity.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-[12.5px] font-semibold text-[var(--text-primary)] line-clamp-1">
                      {f.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] mt-2">
                      <span className="truncate max-w-[140px] font-mono text-[10px]">{f.target}</span>
                      <span
                        className={`capitalize font-medium ${
                          f.status === 'remediated'
                            ? 'text-[var(--status-safe)]'
                            : 'text-[var(--status-warning)]'
                        }`}
                      >
                        {f.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PANE 2 (CENTER 5 cols): Primary Analysis Workbench ─────────── */}
          <div className="lg:col-span-5 p-6 overflow-y-auto space-y-6 bg-[var(--surface)] custom-scrollbar">
            {activeFinding ? (
              <>
                {/* Header & Badges */}
                <div className="space-y-3 pb-4 border-b border-[var(--border-hairline)]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {activeFinding.id}
                    </span>
                    <span className="pill-badge bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] text-[10px] font-mono">
                      {activeFinding.classification.toUpperCase()}
                    </span>
                    <span
                      className={`pill-badge text-[10px] capitalize ${
                        activeFinding.status === 'remediated'
                          ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                          : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                      }`}
                    >
                      {activeFinding.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h2 className="text-[19px] font-semibold text-[var(--text-primary)] leading-snug">
                    {activeFinding.title}
                  </h2>

                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {activeFinding.detail}
                  </p>
                </div>

                {/* Expected vs Observed Behavior Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="well-inset p-3.5 space-y-1.5 border-[var(--status-safe-border)]">
                    <span className="text-[9.5px] font-semibold tracking-wider text-[var(--status-safe)] uppercase block">
                      Expected Policy Boundary
                    </span>
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                      {activeFinding.expected}
                    </p>
                  </div>

                  <div className="well-inset p-3.5 space-y-1.5 border-[var(--status-critical-border)]">
                    <span className="text-[9.5px] font-semibold tracking-wider text-[var(--status-critical)] uppercase block">
                      Observed Violation Trace
                    </span>
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed font-mono tabular-numbers">
                      {activeFinding.observed}
                    </p>
                  </div>
                </div>

                {/* Impact Assessment */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                    Blast Radius &amp; Impact
                  </span>
                  <p className="text-[12px] text-[var(--text-secondary)] p-3 rounded-xl bg-[var(--well)] border border-[var(--well-border)] leading-relaxed">
                    {activeFinding.impact}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                    Approved Security Mitigation
                  </span>
                  <p className="text-[12px] text-[var(--text-secondary)] p-3 rounded-xl bg-[var(--well)] border border-[var(--well-border)] leading-relaxed">
                    {activeFinding.recommendation}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-[var(--text-tertiary)]">
                Select a finding to inspect analysis details
              </div>
            )}
          </div>

          {/* ── PANE 3 (RIGHT 3 cols): Evidence & Inspector Context ─────────── */}
          <div className="lg:col-span-3 p-5 overflow-y-auto space-y-5 bg-[var(--surface-solid)] custom-scrollbar">
            <div className="border-b border-[var(--border-hairline)] pb-3">
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                Inspector &amp; Proof
              </span>
              <h3 className="text-[14.5px] font-semibold mt-0.5 text-[var(--text-primary)]">Evidence Vault</h3>
            </div>

            {/* Evidence items list */}
            <div className="space-y-3">
              {relatedEvidence.length > 0 ? (
                relatedEvidence.map((evi) => (
                  <div key={evi.id} className="well-inset p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="pill-badge bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
                        {evi.type.toUpperCase()}
                      </span>
                      <span className="font-mono text-[var(--text-tertiary)]">{evi.id}</span>
                    </div>

                    <p className="text-[12px] font-medium text-[var(--text-primary)]">
                      {evi.title}
                    </p>

                    <pre className="p-2.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed tabular-numbers">
                      {evi.content}
                    </pre>

                    <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      source: {evi.source}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[var(--text-tertiary)] text-[12px]">
                  No evidence records linked to this finding.
                </div>
              )}
            </div>

            {/* Direct Action Links */}
            <div className="pt-3 border-t border-[var(--border-hairline)] space-y-2">
              <Link
                href={`/findings/${activeFinding.id}`}
                onClick={() => triggerHaptic('selection')}
                className="btn-primary w-full justify-center text-[12px]"
              >
                <span>Open Dedicated Finding Page</span>
                <Icon name="arrow" size={13} />
              </Link>
              <Link
                href="/approvals"
                onClick={() => triggerHaptic('selection')}
                className="btn-secondary w-full justify-center text-[12px]"
              >
                <Icon name="approval" size={14} />
                <span>Evaluate Remediation Patch</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bento-card p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] text-[var(--status-safe)] flex items-center justify-center mx-auto mb-2">
            <Icon name="check" size={22} />
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Zero Open Findings</h3>
          <p className="text-[12px] text-[var(--text-secondary)] max-w-md mx-auto">
            All agent execution boundaries are clean and conform to declared workspace permissions.
          </p>
        </div>
      )}
    </div>
  );
}

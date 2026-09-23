'use client';

import React, { useState, useTransition } from 'react';
import type { Agent, Finding, Session } from '@/app/lib/types';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { toggleShadowModeAction } from '@/app/actions/agents';
import Link from 'next/link';

interface AgentsContentProps {
  session: Session;
  initialAgents: Agent[];
  findings: Finding[];
}

export default function AgentsContent({ initialAgents, findings }: AgentsContentProps) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [filter, setFilter] = useState<'all' | 'verified' | 'needs_attention' | 'shadow'>('all');
  const [search, setSearch] = useState('');
  const [, startTransition] = useTransition();

  // Metrics
  const totalAgents = agents.length;
  const avgTrustScore = Math.round(
    agents.reduce((acc, a) => acc + a.trustScore, 0) / Math.max(1, totalAgents)
  );
  const needsAttentionCount = agents.filter(
    (a) => a.status === 'needs_attention' || a.status === 'critical' || a.driftStatus === 'drift_detected'
  ).length;
  const shadowModeCount = agents.filter((a) => a.shadowMode).length;

  const handleToggleShadow = (agentId: string, current: boolean) => {
    triggerHaptic('tap');
    const nextVal = !current;

    // Optimistic update
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, shadowMode: nextVal } : a))
    );

    startTransition(async () => {
      const res = await toggleShadowModeAction(agentId, nextVal);
      if (!res.success) {
        // Rollback
        setAgents((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, shadowMode: current } : a))
        );
      }
    });
  };

  const filteredAgents = agents.filter((a) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'verified'
        ? a.status === 'verified'
        : filter === 'needs_attention'
        ? a.status === 'needs_attention' || a.status === 'critical' || a.driftStatus === 'drift_detected'
        : a.shadowMode;

    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-8 select-none font-sans pb-24">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Autonomous Systems &amp; Boundaries
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Agents &amp; Passports
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            First-class inventory of declared AI agents, behavioral execution envelopes, interactive trust graphs, shadow mode interception, and drift detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support/agents"
            className="btn-secondary text-[12.5px] h-9 px-4"
            onClick={() => triggerHaptic('tap')}
          >
            <Icon name="sliders" size={13} />
            <span>Agent Architecture Docs</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
            Managed Agents
          </span>
          <div className="text-2xl font-bold text-[var(--text-primary)] tabular-numbers">
            {totalAgents}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Registered runtime instances</p>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
            Average Trust Index
          </span>
          <div className="text-2xl font-bold text-[var(--accent-blue)] tabular-numbers flex items-center gap-2">
            <span>{avgTrustScore}%</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue-border)] font-medium">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Calculated from least privilege</p>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
            Needs Attention
          </span>
          <div className="text-2xl font-bold text-[var(--status-critical)] tabular-numbers">
            {needsAttentionCount}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Findings or configuration drift</p>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
            Shadow Mode Active
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-numbers flex items-center gap-2">
            <span>{shadowModeCount}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
              Zero Impact
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Observing permissions safely</p>
        </div>
      </div>

      {/* ── Filter Bar & Search ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="segmented-control self-start">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setFilter('all');
            }}
            className={`segmented-pill ${filter === 'all' ? 'is-active' : ''}`}
          >
            All Agents ({totalAgents})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setFilter('verified');
            }}
            className={`segmented-pill ${filter === 'verified' ? 'is-active' : ''}`}
          >
            Verified Clean
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setFilter('needs_attention');
            }}
            className={`segmented-pill ${filter === 'needs_attention' ? 'is-active' : ''}`}
          >
            Needs Attention ({needsAttentionCount})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              setFilter('shadow');
            }}
            className={`segmented-pill ${filter === 'shadow' ? 'is-active' : ''}`}
          >
            Shadow Mode ({shadowModeCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents or scopes…"
            className="w-full pl-8 pr-3.5 py-1.5 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[12.5px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          />
        </div>
      </div>

      {/* ── Agents Grid / Table List ───────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredAgents.length === 0 ? (
          <div className="bento-card p-12 text-center space-y-3">
            <Icon name="shield" size={32} className="mx-auto text-[var(--text-tertiary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No agents match your criteria
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const agentFindings = findings.filter((f) =>
              f.target.toLowerCase().includes(agent.name.toLowerCase()) ||
              f.target.toLowerCase().includes(agent.type.toLowerCase())
            );

            return (
              <div
                key={agent.id}
                className="bento-card p-5 sm:p-6 transition-all hover:shadow-md border border-[var(--border-hairline)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Agent Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        agent.status === 'verified'
                          ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                          : agent.driftStatus === 'drift_detected'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          : 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                      }`}
                    >
                      <Icon name="shield" size={22} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/agents/${agent.id}`}
                          onClick={() => triggerHaptic('selection')}
                          className="text-[16px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                        >
                          {agent.name}
                        </Link>
                        <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                          {agent.id}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--well-border)]">
                          {agent.environment}
                        </span>

                        {agent.driftStatus === 'drift_detected' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Drift Detected
                          </span>
                        )}

                        {agentFindings.length > 0 && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]">
                            {agentFindings.length} Finding{agentFindings.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-[13px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                        {agent.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--text-tertiary)] pt-1">
                        <span>Type: {agent.type}</span>
                        <span>&bull;</span>
                        <span>{agent.capabilities.length} Declared Capabilities</span>
                        <span>&bull;</span>
                        <span>
                          Last Verified:{' '}
                          {new Date(agent.lastVerifiedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Passport Action */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-hairline)] justify-between lg:justify-end">
                    {/* Trust Score Pill */}
                    <div className="text-right">
                      <div className="text-[11px] uppercase font-semibold text-[var(--text-tertiary)]">
                        Trust Index
                      </div>
                      <div className="text-lg font-bold tabular-numbers text-[var(--text-primary)]">
                        {agent.trustScore}%
                      </div>
                    </div>

                    {/* Shadow Mode Toggle */}
                    <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-hairline)]">
                      <div className="text-right">
                        <span className="text-[11px] block font-medium text-[var(--text-primary)]">
                          Shadow Mode
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] block">
                          {agent.shadowMode ? 'Monitoring' : 'Standard'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleShadow(agent.id, agent.shadowMode)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          agent.shadowMode ? 'bg-[var(--accent-blue)]' : 'bg-[var(--well-border)]'
                        }`}
                        title="Toggle Shadow Mode"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            agent.shadowMode ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* View Passport Button */}
                    <Link
                      href={`/agents/${agent.id}`}
                      onClick={() => triggerHaptic('selection')}
                      className="btn-primary text-[12.5px] h-9 px-4 shrink-0 cursor-pointer ml-2"
                    >
                      <span>Agent Passport</span>
                      <Icon name="arrow" size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

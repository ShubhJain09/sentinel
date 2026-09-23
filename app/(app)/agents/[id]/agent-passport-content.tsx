'use client';

import React, { useState, useTransition } from 'react';
import type { Agent, Finding, Approval, Session, TrustNode } from '@/app/lib/types';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { toggleShadowModeAction, acknowledgeDriftAction } from '@/app/actions/agents';
import { HelpPopover } from '@/app/components/help-popover';
import Link from 'next/link';

interface AgentPassportContentProps {
  session: Session;
  initialAgent: Agent;
  linkedFindings: Finding[];
  linkedApprovals: Approval[];
}

export default function AgentPassportContent({
  initialAgent,
  linkedFindings,
  linkedApprovals,
}: AgentPassportContentProps) {
  const [agent, setAgent] = useState<Agent>(initialAgent);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'capabilities' | 'access' | 'findings' | 'activity' | 'configuration' | 'verification'
  >('overview');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TrustNode | null>(null);
  const [graphFilter, setGraphFilter] = useState<'all' | 'high_risk' | 'sensitive'>('all');
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [, startTransition] = useTransition();

  const handleToggleShadow = () => {
    triggerHaptic('tap');
    const nextVal = !agent.shadowMode;
    setAgent((prev) => ({ ...prev, shadowMode: nextVal }));

    startTransition(async () => {
      const res = await toggleShadowModeAction(agent.id, nextVal);
      if (res.success) {
        setToast({
          type: 'success',
          message: `Shadow Mode ${nextVal ? 'enabled' : 'disabled'} for ${agent.name}.`,
        });
      } else {
        setAgent((prev) => ({ ...prev, shadowMode: !nextVal }));
        setToast({ type: 'error', message: res.error || 'Failed to toggle shadow mode' });
      }
    });
  };

  const handleAcknowledgeDrift = () => {
    triggerHaptic('tap');
    startTransition(async () => {
      const res = await acknowledgeDriftAction(agent.id);
      if (res.success) {
        setAgent((prev) => ({ ...prev, driftStatus: 'clean', driftDetails: null }));
        setToast({
          type: 'success',
          message: 'Configuration drift reconciled and synchronized with baseline manifest.',
        });
      } else {
        setToast({ type: 'error', message: res.error || 'Failed to acknowledge drift' });
      }
    });
  };

  const askSentinelAi = (question: string) => {
    triggerHaptic('selection');
    setAiPrompt(question);
    setAiLoading(true);
    setAiAnswer(null);

    setTimeout(() => {
      setAiLoading(false);
      if (question.includes('riskiest')) {
        const riskyCaps = agent.capabilities.filter(
          (c) => c.riskLevel === 'critical' || c.riskLevel === 'elevated'
        );
        if (riskyCaps.length > 0) {
          setAiAnswer(
            `Analysis for ${agent.name}:\n\nThe riskiest capability is "${riskyCaps[0].name}" (${riskyCaps[0].scope}). ${riskyCaps[0].plainEnglish}. Sentinel enforces strict container isolation and boundary checks on this path.`
          );
        } else {
          setAiAnswer(
            `All declared capabilities for ${agent.name} are scoped within safe parameters. No privilege escalation detected.`
          );
        }
      } else if (question.includes('drift')) {
        if (agent.driftStatus === 'drift_detected' && agent.driftDetails) {
          setAiAnswer(
            `Configuration Drift Analysis:\n\n${agent.driftDetails.diffSummary}\n\nRisk Assessment: ${agent.driftDetails.riskAnalysis}\n\nRecommended Action: ${agent.driftDetails.recommendedAction}`
          );
        } else {
          setAiAnswer(
            `No configuration drift detected. Active runtime state matches the signed baseline manifest.`
          );
        }
      } else {
        setAiAnswer(
          `Synthesizing Least-Privilege Policy for ${agent.name}:\n\n- Restrict filesystem access strictly to /workspace/docs\n- Revoke unused network egress to third-party endpoints\n- Require 2-operator sign-off for shell subprocess creation.`
        );
      }
    }, 600);
  };

  // Filter trust graph nodes
  const filteredNodes = agent.trustGraph.nodes.filter((node) => {
    if (graphFilter === 'high_risk') {
      return node.status === 'critical' || node.status === 'warning';
    }
    if (graphFilter === 'sensitive') {
      return node.type === 'data' || node.type === 'service';
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 sm:py-10 space-y-8 select-none font-sans pb-28">
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)]">
        <Link
          href="/agents"
          onClick={() => triggerHaptic('selection')}
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
        >
          <Icon name="arrow" size={11} className="rotate-180" />
          <span>Agents</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[var(--text-secondary)]">{agent.name}</span>
      </div>

      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-all animate-fade ${
            toast.type === 'success'
              ? 'bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)]'
              : 'bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-[13px] font-medium">
            <Icon name={toast.type === 'success' ? 'check' : 'close'} size={16} />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[11px] font-medium opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Hero Passport Banner ────────────────────────────────────────────── */}
      <div className="liquid-glass-card p-6 sm:p-8 rounded-[32px] border border-[var(--border-hairline)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                agent.status === 'verified'
                  ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                  : agent.driftStatus === 'drift_detected'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                  : 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
              }`}
            >
              <Icon name="shield" size={32} />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    agent.status === 'verified'
                      ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                      : 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                  }`}
                >
                  {agent.status === 'verified' ? 'Verified Clean' : 'Needs Attention'}
                </span>

                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)] uppercase">
                  {agent.environment}
                </span>

                <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                  {agent.id}
                </span>

                {agent.driftStatus === 'drift_detected' && (
                  <div className="flex items-center">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Configuration Drift
                    </span>
                    <HelpPopover
                      title="Configuration Drift Detected"
                      description="Runtime agent capabilities or settings differ from the declared baseline manifest."
                      articleHref="/support/agents/shadow-mode"
                      articleLabel="Learn how to reconcile drift"
                    />
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
                {agent.name}
              </h1>

              <p className="text-[14px] text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                {agent.description}
              </p>

              {/* Explicit Owner, Environment, Verification status, Active findings, Last scan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[12px] border-t border-[var(--border-hairline)]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">Owner</span>
                  <span className="text-[var(--text-primary)] font-medium">Shubh Jain (@shubh)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">Environment</span>
                  <span className="text-[var(--text-primary)] font-mono">MicroVM Isolation ({agent.environment})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">Active Findings</span>
                  <span className={linkedFindings.length > 0 ? 'text-[var(--status-critical)] font-semibold' : 'text-[var(--status-safe)] font-semibold'}>
                    {linkedFindings.length > 0 ? `${linkedFindings.length} Open Violation` : '0 Active Violations'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">Last Scan</span>
                  <span className="text-[var(--text-secondary)] font-mono">Today at 02:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Stack: Run Scan, Inspect Capabilities, View Findings */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-[var(--well)] px-4 py-2.5 rounded-2xl border border-[var(--well-border)]">
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">
                  Trust Index
                </span>
                <span className="text-xl font-bold tabular-numbers text-[var(--text-primary)]">
                  {agent.trustScore}%
                </span>
              </div>
              <div className="h-8 w-px bg-[var(--border-hairline)]" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] block">
                  Shadow Mode
                </span>
                <span
                  className={`text-[12px] font-semibold ${
                    agent.shadowMode ? 'text-purple-600 dark:text-purple-400' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {agent.shadowMode ? 'Active (0-Risk)' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* 3 Explicit Primary Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/scans/new?target=${encodeURIComponent(agent.name)}`}
                onClick={() => triggerHaptic('selection')}
                className="btn-primary text-[12px] h-8.5 px-3.5 cursor-pointer"
              >
                <Icon name="scan" size={13} />
                <span>Run Scan</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveTab('capabilities');
                }}
                className="btn-secondary text-[12px] h-8.5 px-3 cursor-pointer"
              >
                <Icon name="shield" size={13} />
                <span>Inspect Capabilities</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveTab('findings');
                }}
                className="btn-secondary text-[12px] h-8.5 px-3 cursor-pointer"
              >
                <Icon name="finding" size={13} />
                <span>View Findings ({linkedFindings.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 7 Explicit Tabs Navigation ────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-[var(--border-hairline)] overflow-x-auto pt-2 scrollbar-none text-[13px]">
          {[
            { id: 'overview', label: 'Overview', icon: 'overview' as const },
            { id: 'capabilities', label: `Capabilities (${agent.capabilities.length})`, icon: 'shield' as const },
            { id: 'access', label: 'Access (Trust Graph)', icon: 'activity' as const },
            {
              id: 'findings',
              label: `Findings (${linkedFindings.length})`,
              icon: 'finding' as const,
              highlight: linkedFindings.length > 0,
            },
            { id: 'activity', label: 'Activity', icon: 'clock' as const },
            {
              id: 'configuration',
              label: agent.driftStatus === 'drift_detected' ? 'Configuration (Drift !)' : 'Configuration',
              icon: 'refresh' as const,
              highlight: agent.driftStatus === 'drift_detected',
            },
            { id: 'verification', label: 'Verification (Shadow)', icon: 'check' as const },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--accent-blue)] text-[var(--accent-blue)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              } ${tab.highlight ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}`}
            >
              <Icon name={tab.icon} size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade">
          <div className="lg:col-span-8 space-y-6">
            <div className="bento-card p-6 space-y-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Declared Agent Purpose &amp; Operational Scope
              </h3>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                {agent.description}
              </p>

              <div className="p-4 rounded-xl well-inset space-y-2 text-[12.5px]">
                <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                  Execution Envelope Summary
                </span>
                <p className="text-[var(--text-primary)]">
                  This agent is provisioned in the <strong className="capitalize">{agent.environment}</strong> environment with micro-containment isolation. It is continuously monitored for unauthorized tool declarations, path traversal escapes, and external exfiltration attempts.
                </p>
              </div>
            </div>

            {/* Contextual Sentinel AI Assistant Box */}
            <div className="bento-card p-6 space-y-4 border border-[var(--accent-blue-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="code" size={16} className="text-[var(--accent-blue)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Contextual Sentinel AI
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--accent-blue)] uppercase px-2 py-0.5 rounded-full bg-[var(--accent-blue-subtle)]">
                  Enclave Copilot
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => askSentinelAi("What is this agent's riskiest capability?")}
                  className="text-[11.5px] px-3 py-1.5 rounded-full well-inset hover:border-[var(--accent-blue)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                >
                  ⚡ What is this agent&apos;s riskiest capability?
                </button>
                <button
                  type="button"
                  onClick={() => askSentinelAi('Explain recent configuration drift')}
                  className="text-[11.5px] px-3 py-1.5 rounded-full well-inset hover:border-[var(--accent-blue)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                >
                  🔍 Explain configuration drift
                </button>
                <button
                  type="button"
                  onClick={() => askSentinelAi('Generate minimal least-privilege policy')}
                  className="text-[11.5px] px-3 py-1.5 rounded-full well-inset hover:border-[var(--accent-blue)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                >
                  🛡️ Synthesize least-privilege boundary
                </button>
              </div>

              {aiLoading && (
                <div className="p-4 rounded-xl well-inset text-[12.5px] text-[var(--text-secondary)] flex items-center gap-2">
                  <Icon name="refresh" size={14} className="animate-spin text-[var(--accent-blue)]" />
                  <span>Sentinel Security Engine evaluating agent policies…</span>
                </div>
              )}

              {aiAnswer && (
                <div className="p-4 rounded-xl well-inset text-[12.5px] text-[var(--text-primary)] whitespace-pre-line leading-relaxed border-l-2 border-[var(--accent-blue)]">
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Runtime Host Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bento-card p-6 space-y-4">
              <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
                Runtime Specifications
              </span>

              <div className="space-y-3 text-[12.5px]">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Agent Type</span>
                  <span className="font-medium text-[var(--text-primary)] text-right">{agent.type}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Isolation Host</span>
                  <span className="font-mono text-[var(--text-primary)]">MicroVM / gVisor</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Memory Ceiling</span>
                  <span className="font-mono text-[var(--text-primary)]">512 MB</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Audit Durability</span>
                  <span className="text-[var(--status-safe)] font-medium">Cryptographic WAL</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <span className="text-[var(--text-secondary)]">Last Verification</span>
                  <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                    {new Date(agent.lastVerifiedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 2: CAPABILITIES (Human Readable with Technical Details Toggle) ─ */}
      <div className={activeTab === 'capabilities' ? 'block' : 'hidden'}>
        <div className="space-y-4 animate-fade">
          <div className="border-b border-[var(--border-hairline)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Human-Readable Capabilities
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Plain-language breakdown of what this agent can do, cannot do, and which actions require human authorization.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setShowTechnicalDetails((prev) => !prev);
              }}
              className="btn-secondary text-[12px] h-8 px-3.5 self-start sm:self-auto cursor-pointer"
            >
              <span>{showTechnicalDetails ? 'Hide technical details' : 'View technical details'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {agent.capabilities.map((cap) => (
              <div
                key={cap.id}
                className="bento-card p-5 space-y-2.5 border border-[var(--border-hairline)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[9.5px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        cap.riskLevel === 'critical'
                          ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                          : cap.riskLevel === 'elevated'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                          : 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                      }`}
                    >
                      {cap.riskLevel} risk
                    </span>
                    <h4 className="text-[14.5px] font-semibold text-[var(--text-primary)]">
                      {cap.name}
                    </h4>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {cap.category}
                    </span>
                  </div>

                  {cap.requiresApproval && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)] self-start sm:self-auto">
                      ★ Requires approval for destructive actions
                    </span>
                  )}
                </div>

                <div className="text-[13.5px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                  <Icon name="check" size={14} className="text-[var(--status-safe)] shrink-0" />
                  <span>{cap.plainEnglish}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--text-tertiary)] pt-1 font-mono">
                  <span>Scope: {cap.scope}</span>
                  <span>&bull;</span>
                  <span>Observed in Telemetry: {cap.isObserved ? 'Yes' : 'No'}</span>
                  <span>&bull;</span>
                  <span>Invocation State: {cap.isUsed ? 'Actively Invoked' : 'Unused'}</span>
                </div>

                {/* Technical details view (hidden behind toggle by default) */}
                {showTechnicalDetails && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-hairline)] bg-[var(--well)] p-3.5 rounded-xl space-y-1.5 font-mono text-[11.5px] animate-fade">
                    <span className="text-[10px] font-sans font-bold uppercase text-[var(--text-tertiary)] block">
                      Raw MCP Tool Schema &amp; Method Signature
                    </span>
                    <div className="text-[var(--accent-blue)]">
                      mcp://{agent.id}/{cap.name.toLowerCase().replace(/\s+/g, '_')}
                    </div>
                    <pre className="text-[var(--text-secondary)] whitespace-pre-wrap overflow-x-auto text-[11px]">
                      {JSON.stringify(
                        {
                          method: cap.name.toLowerCase().replace(/\s+/g, '_'),
                          scope: cap.scope,
                          risk_level: cap.riskLevel,
                          requires_approval: cap.requiresApproval,
                          enclave_isolation: 'MicroVM sandbox mount',
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB 3: ACCESS (Trust Graph) ─────────────────────────────────────── */}
      <div className={activeTab === 'access' ? 'block' : 'hidden'}>
        <div className="bento-card p-6 space-y-6 animate-fade">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Permission &amp; Trust Graph
                </h3>
                <HelpPopover
                  title="Permission Trust Graph"
                  description="Maps relationships from Agent to Tool to Resource to Data Class to External Service."
                  articleHref="/support/agents/trust-graph"
                />
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Deterministic access chain: Agent &rarr; Tool &rarr; Resource &rarr; Data / External Service.
              </p>
            </div>

            {/* Graph Filter */}
            <div className="segmented-control">
              <button
                type="button"
                onClick={() => setGraphFilter('all')}
                className={`segmented-pill ${graphFilter === 'all' ? 'is-active' : ''}`}
              >
                All Paths
              </button>
              <button
                type="button"
                onClick={() => setGraphFilter('high_risk')}
                className={`segmented-pill ${graphFilter === 'high_risk' ? 'is-active' : ''}`}
              >
                High Risk Only
              </button>
              <button
                type="button"
                onClick={() => setGraphFilter('sensitive')}
                className={`segmented-pill ${graphFilter === 'sensitive' ? 'is-active' : ''}`}
              >
                Sensitive Data
              </button>
            </div>
          </div>

          {/* SVG Relationship Graph */}
          <div className="p-6 rounded-2xl well-inset relative min-h-[280px] flex flex-wrap items-center justify-around gap-6">
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedNode(node);
                }}
                className={`p-4 rounded-2xl bg-[var(--surface-solid)] border transition-all text-left space-y-1 shadow-sm hover:scale-102 cursor-pointer w-48 ${
                  selectedNode?.id === node.id
                    ? 'border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20'
                    : node.status === 'critical'
                    ? 'border-[var(--status-critical-border)]'
                    : node.status === 'warning'
                    ? 'border-amber-500/30'
                    : 'border-[var(--border-hairline)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                    {node.type}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.status === 'critical'
                        ? 'bg-[var(--status-critical)]'
                        : node.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-[var(--status-safe)]'
                    }`}
                  />
                </div>
                <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {node.label}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate">
                  {node.details || 'Inspect node'}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Node Details Drawer */}
          {selectedNode && (
            <div className="p-4 rounded-xl well-inset space-y-2 text-[12.5px] animate-fade">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  Node Inspector: {selectedNode.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-[var(--text-secondary)]">{selectedNode.details}</p>
              <div className="text-[11px] text-[var(--text-tertiary)] font-mono">
                Security Classification: {selectedNode.status.toUpperCase()} &bull; Node Category: {selectedNode.type}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 4: FINDINGS ─────────────────────────────────────────────────── */}
      <div className={activeTab === 'findings' ? 'block' : 'hidden'}>
        <div className="space-y-6 animate-fade">
          <div className="border-b border-[var(--border-hairline)] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Active Findings &amp; Violations
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Security incidents and policy breaks detected for {agent.name}.
              </p>
            </div>
          </div>

          {linkedFindings.length === 0 ? (
            <div className="bento-card p-10 text-center space-y-2">
              <Icon name="check" size={28} className="mx-auto text-[var(--status-safe)]" />
              <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Zero Active Findings
              </h4>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto">
                No open boundary violations or prompt injection vulnerabilities detected on this agent passport.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="bento-card p-5 space-y-3 border border-[var(--border-hairline)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          finding.severity === 'critical'
                            ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)]'
                            : 'bg-amber-500/15 text-amber-600'
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {finding.title}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {finding.id}
                    </span>
                  </div>

                  <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                    {finding.detail}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)] text-[12px]">
                    <span className="text-[var(--text-tertiary)] font-mono">
                      Target: {finding.target || 'Agent Tool Handler'}
                    </span>
                    <Link
                      href={`/findings/${finding.id}`}
                      className="text-[var(--accent-blue)] hover:underline font-medium"
                    >
                      Investigate &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 5: ACTIVITY (Chronological Log) ──────────────────────────────── */}
      <div className={activeTab === 'activity' ? 'block' : 'hidden'}>
        <div className="bento-card p-6 space-y-5 animate-fade">
          <div className="border-b border-[var(--border-hairline)] pb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Chronological Execution Activity
            </h3>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Auditable event trail detailing what happened, when, who performed it, and policy decisions.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[var(--border-hairline)]">
            <div className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-[12.5px]">
              <div className="space-y-1">
                <div className="font-medium text-[var(--text-primary)]">
                  AST Boundary Check Passed
                </div>
                <p className="text-[var(--text-secondary)] text-[12px]">
                  Tool call <code className="font-mono text-[11px]">read_file(/workspace/docs/spec.md)</code> inspected and permitted within baseline envelope.
                </p>
                <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">Today at 02:24 AM • Operator: Shubh Jain</span>
              </div>
              <span className="pill-badge text-[10px] bg-[var(--status-safe-subtle)] text-[var(--status-safe)] shrink-0">
                ALLOWED
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4 text-[12.5px]">
              <div className="space-y-1">
                <div className="font-medium text-[var(--text-primary)]">
                  Shadow Mode Execution Logged
                </div>
                <p className="text-[var(--text-secondary)] text-[12px]">
                  Dry-run telemetry captured tool invocation parameters without blocking runtime process.
                </p>
                <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">Yesterday at 11:45 PM • Sentinel Daemon</span>
              </div>
              <span className="pill-badge text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                SHADOW
              </span>
            </div>

            <div className="pt-3 flex items-start justify-between gap-4 text-[12.5px]">
              <div className="space-y-1">
                <div className="font-medium text-[var(--text-primary)]">
                  Agent Passport Manifest Re-verified
                </div>
                <p className="text-[var(--text-secondary)] text-[12px]">
                  Signed sha256 digest checked against SQLite WAL audit database.
                </p>
                <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">Yesterday at 09:12 PM • Security Engine</span>
              </div>
              <span className="pill-badge text-[10px] bg-[var(--well)] text-[var(--text-secondary)] shrink-0">
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 6: CONFIGURATION (Drift Detection) ───────────────────────────── */}
      <div className={activeTab === 'configuration' ? 'block' : 'hidden'}>
        <div className="bento-card p-6 space-y-6 animate-fade">
          <div className="border-b border-[var(--border-hairline)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Configuration Drift Detection
                </h3>
                <HelpPopover
                  title="Configuration Drift"
                  description="Detects mutations between the declared baseline manifest and actual runtime state."
                  articleHref="/support/agents/capabilities"
                />
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Side-by-side comparison between approved baseline manifest and live runtime execution state.
              </p>
            </div>

            {agent.driftStatus === 'drift_detected' && (
              <button
                type="button"
                onClick={handleAcknowledgeDrift}
                className="btn-primary text-[12.5px] h-8 px-4 cursor-pointer"
              >
                <Icon name="check" size={13} />
                <span>Acknowledge &amp; Reconcile Drift</span>
              </button>
            )}
          </div>

          {agent.driftStatus === 'drift_detected' && agent.driftDetails ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-[13px]">
                  <Icon name="refresh" size={15} />
                  <span>Unauthorized Runtime Mutation Detected</span>
                </div>
                <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed">
                  {agent.driftDetails.diffSummary}
                </p>
                <p className="text-[11.5px] text-[var(--text-secondary)]">
                  Detected at: {new Date(agent.driftDetails.detectedAt).toLocaleString()}
                </p>
              </div>

              {/* Side-by-Side Configuration Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] font-mono">
                <div className="p-4 rounded-xl well-inset space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--status-safe)] block font-sans">
                    Baseline Manifest (Declared)
                  </span>
                  <pre className="text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(agent.driftDetails.baselineConfig, null, 2)}
                  </pre>
                </div>

                <div className="p-4 rounded-xl well-inset space-y-2 border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block font-sans">
                    Active Runtime State (Observed)
                  </span>
                  <pre className="text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(agent.driftDetails.activeConfig, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-xl well-inset space-y-1.5 text-[12.5px]">
                <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                  Security Risk Analysis
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  {agent.driftDetails.riskAnalysis}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 rounded-xl well-inset">
              <Icon name="check" size={28} className="mx-auto text-[var(--status-safe)]" />
              <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Configuration In Perfect Sync
              </h4>
              <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto">
                The active agent runtime matches the signed baseline manifest. Zero unauthorized mutations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 7: VERIFICATION (Shadow Mode) ───────────────────────────────── */}
      <div className={activeTab === 'verification' ? 'block' : 'hidden'}>
        <div className="bento-card p-6 space-y-6 animate-fade">
          <div className="border-b border-[var(--border-hairline)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Shadow Mode Verification &amp; Telemetry
                </h3>
                <HelpPopover
                  title="Shadow Mode"
                  description="Non-blocking passive monitoring to detect over-privileged tools with zero operational risk."
                  articleHref="/support/agents/shadow-mode"
                />
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Zero-risk dry-run: observe live tool executions and synthesize optimal least-privilege profiles.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleShadow}
              className="btn-primary text-[12.5px] h-8 px-4 cursor-pointer"
            >
              <span>{agent.shadowMode ? 'Disable Shadow Mode' : 'Enable Shadow Mode'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="well-inset p-4 rounded-xl space-y-1">
              <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                Observed Invocations
              </span>
              <div className="text-2xl font-bold text-[var(--text-primary)] tabular-numbers">
                {agent.shadowTelemetry.observedCallsCount}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">Simulated &amp; live tool calls</p>
            </div>

            <div className="well-inset p-4 rounded-xl space-y-1">
              <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                Requested vs Unused Tools
              </span>
              <div className="text-2xl font-bold text-[var(--accent-blue)] tabular-numbers">
                {agent.shadowTelemetry.requestedTools.length} / {agent.shadowTelemetry.unusedTools.length}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {agent.shadowTelemetry.unusedTools.length} unused permissions can be safely revoked
              </p>
            </div>

            <div className="well-inset p-4 rounded-xl space-y-1">
              <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                Overprivileged Scopes
              </span>
              <div className="text-2xl font-bold text-[var(--status-critical)] tabular-numbers">
                {agent.shadowTelemetry.overprivilegedScopes.length}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">Exceeding task requirements</p>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
              Synthesized Least-Privilege Policy
            </span>
            <ul className="space-y-2">
              {agent.shadowTelemetry.recommendedMinPermissions.map((rec, i) => (
                <li
                  key={i}
                  className="p-3.5 rounded-xl well-inset flex items-center justify-between text-[12.5px]"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="check" size={14} className="text-[var(--status-safe)]" />
                    <span className="text-[var(--text-primary)] font-medium">{rec}</span>
                  </div>
                  <span className="pill-badge text-[10px] bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                    Optimal
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

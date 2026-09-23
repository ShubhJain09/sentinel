'use client';

import React, { useState } from 'react';
import type { Approval } from '@/app/lib/types';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import Link from 'next/link';

interface RemediationContentProps {
  approvals: Approval[];
}

export default function RemediationContent({ approvals }: RemediationContentProps) {
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>(
    approvals[0]?.id || ''
  );
  const [diffViewMode, setDiffViewMode] = useState<'split' | 'unified'>('split');
  const [retestStatus, setRetestStatus] = useState<
    'idle' | 'running' | 'verified_fixed' | 'still_vulnerable' | 'regression_detected'
  >('idle');
  const [retestProgress, setRetestProgress] = useState(0);

  const selectedApproval = approvals.find((a) => a.id === selectedApprovalId) || approvals[0];

  const currentBoundaryCode = `// Current Vulnerable Implementation (Filesystem MCP Server)
export async function readFileHandler(requestedPath: string) {
  // Vulnerability: Relative traversal sequences permitted
  const target = path.join(process.cwd(), requestedPath);
  return await fs.promises.readFile(target, 'utf-8');
}`;

  const proposedBoundaryCode = `// Proposed Sentinel Containment Boundary Patch (Synthesized)
export async function readFileHandler(requestedPath: string) {
  const workspaceRoot = path.resolve(process.env.WORKSPACE_ROOT || '/workspace');
  const resolvedTarget = path.resolve(workspaceRoot, requestedPath);

  // Enforce strict canonical directory containment
  if (!resolvedTarget.startsWith(workspaceRoot + path.sep)) {
    throw new SecurityBoundaryError(
      "Access Denied: Path exceeds authorized workspace boundary"
    );
  }
  return await fs.promises.readFile(resolvedTarget, 'utf-8');
}`;

  const handleTriggerRetest = () => {
    triggerHaptic('selection');
    setRetestStatus('running');
    setRetestProgress(15);

    setTimeout(() => setRetestProgress(45), 400);
    setTimeout(() => setRetestProgress(80), 800);
    setTimeout(() => {
      setRetestProgress(100);
      setRetestStatus('verified_fixed');
      triggerHaptic('selection');
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 sm:py-10 space-y-8 select-none font-sans pb-24">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Safe Code Synthesis &amp; Verification
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Remediation Engine
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Safe side-by-side boundary diff previews, human approval gates, and zero-downtime retesting handoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/approvals" className="btn-secondary text-[12.5px] h-9 px-4">
            <Icon name="approval" size={13} />
            <span>Human Approvals Queue</span>
          </Link>
          <Link href="/retests" className="btn-secondary text-[12.5px] h-9 px-4">
            <Icon name="refresh" size={13} />
            <span>Retest History</span>
          </Link>
        </div>
      </div>

      {/* ── Main Layout: Selector (Left 4 cols) & Diff/Retest (Right 8 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proposals List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Synthesized Patches
            </span>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              {approvals.length} Available
            </span>
          </div>

          <div className="space-y-2.5">
            {approvals.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedApprovalId(app.id);
                  setRetestStatus('idle');
                }}
                className={`w-full p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                  selectedApproval?.id === app.id
                    ? 'bg-[var(--surface-solid)] border-[var(--accent-blue)] shadow-md ring-2 ring-[var(--accent-blue)]/15'
                    : 'bg-[var(--surface-solid)] border-[var(--border-hairline)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    {app.id}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      app.status === 'approved'
                        ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)]'
                        : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <h3 className="text-[13.5px] font-semibold text-[var(--text-primary)] line-clamp-1">
                  {app.title}
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 mt-1">
                  {app.description}
                </p>
                <div className="text-[10.5px] font-mono text-[var(--accent-blue)] mt-2">
                  Target: {app.affectedTarget}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Safe Diff Preview & Retest Execution */}
        {selectedApproval && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bento-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
                      Safe Boundary Patch Preview
                    </span>
                    <span className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
                      {selectedApproval.affectedTarget}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-1">
                    {selectedApproval.title}
                  </h2>
                </div>

                {/* Diff View Switcher */}
                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setDiffViewMode('split');
                    }}
                    className={`segmented-pill ${diffViewMode === 'split' ? 'is-active' : ''}`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setDiffViewMode('unified');
                    }}
                    className={`segmented-pill ${diffViewMode === 'unified' ? 'is-active' : ''}`}
                  >
                    Unified Patch
                  </button>
                </div>
              </div>

              {/* Code Diff Display */}
              {diffViewMode === 'split' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] font-mono">
                  {/* Current Code (Vulnerable) */}
                  <div className="rounded-xl overflow-hidden border border-[var(--status-critical-border)]">
                    <div className="bg-[var(--status-critical-subtle)] px-3.5 py-2 border-b border-[var(--status-critical-border)] flex items-center justify-between">
                      <span className="text-[10.5px] font-bold uppercase text-[var(--status-critical)] font-sans">
                        Current Boundary (Vulnerable)
                      </span>
                      <span className="text-[10px] text-[var(--status-critical)]">Before</span>
                    </div>
                    <pre className="p-4 bg-[var(--surface-solid)] text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
                      {currentBoundaryCode}
                    </pre>
                  </div>

                  {/* Proposed Patch (Safe) */}
                  <div className="rounded-xl overflow-hidden border border-[var(--status-safe-border)]">
                    <div className="bg-[var(--status-safe-subtle)] px-3.5 py-2 border-b border-[var(--status-safe-border)] flex items-center justify-between">
                      <span className="text-[10.5px] font-bold uppercase text-[var(--status-safe)] font-sans">
                        Proposed Boundary (Protected)
                      </span>
                      <span className="text-[10px] text-[var(--status-safe)]">After</span>
                    </div>
                    <pre className="p-4 bg-[var(--surface-solid)] text-[var(--text-primary)] overflow-x-auto leading-relaxed">
                      {proposedBoundaryCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-[var(--border-hairline)]">
                  <div className="bg-[var(--well)] px-3.5 py-2 border-b border-[var(--border-hairline)] text-[10.5px] font-mono text-[var(--text-tertiary)] uppercase">
                    Unified Diff &bull; patch-v1.diff
                  </div>
                  <pre className="p-4 bg-[var(--surface-solid)] text-[12px] font-mono leading-relaxed overflow-x-auto">
                    <span className="text-[var(--status-critical)]">- const target = path.join(process.cwd(), requestedPath);</span>
                    {'\n'}
                    <span className="text-[var(--status-critical)]">- return await fs.promises.readFile(target, &apos;utf-8&apos;);</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+ const workspaceRoot = path.resolve(process.env.WORKSPACE_ROOT || &apos;/workspace&apos;);</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+ const resolvedTarget = path.resolve(workspaceRoot, requestedPath);</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+ if (!resolvedTarget.startsWith(workspaceRoot + path.sep)) &#123;</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+   throw new SecurityBoundaryError(&quot;Access Denied: Path exceeds authorized workspace boundary&quot;);</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+ &#125;</span>
                    {'\n'}
                    <span className="text-[var(--status-safe)]">+ return await fs.promises.readFile(resolvedTarget, &apos;utf-8&apos;);</span>
                  </pre>
                </div>
              )}

              {/* Safety Impact & Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12.5px]">
                <div className="well-inset p-3.5 rounded-xl space-y-1">
                  <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                    Blast Radius Assessment
                  </span>
                  <p className="text-[var(--text-primary)]">{selectedApproval.risk}</p>
                </div>
                <div className="well-inset p-3.5 rounded-xl space-y-1">
                  <span className="text-[10.5px] uppercase font-semibold text-[var(--text-tertiary)] block">
                    Expected Security Outcome
                  </span>
                  <p className="text-[var(--text-primary)]">{selectedApproval.expectedResult}</p>
                </div>
              </div>

              {/* Action Decision Bar: Approve & Apply, Edit Plan, Cancel */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                    Operator Decision:
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                    Requires 1-operator signoff
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerHaptic('tap')}
                    className="btn-secondary text-[12px] h-8 px-3.5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerHaptic('tap')}
                    className="btn-secondary text-[12px] h-8 px-3.5 cursor-pointer"
                  >
                    Edit Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      handleTriggerRetest();
                    }}
                    className="btn-primary text-[12px] h-8 px-4 cursor-pointer"
                  >
                    <Icon name="check" size={13} />
                    <span>Approve &amp; Apply</span>
                  </button>
                </div>
              </div>

              {/* Retest Handoff & Execution Panel */}
              <div className="p-5 rounded-2xl well-inset space-y-4 border border-[var(--accent-blue-border)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Automated Verification &amp; Retesting Handoff
                    </h3>
                    <p className="text-[12px] text-[var(--text-secondary)]">
                      Deploy patch to ephemeral testing enclave and verify resolution against original attack vector.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={retestStatus === 'running'}
                    onClick={handleTriggerRetest}
                    className="btn-primary text-[12.5px] h-9 px-4 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {retestStatus === 'running' ? (
                      <span className="flex items-center gap-2">
                        <Icon name="refresh" size={13} className="animate-spin" />
                        <span>Verifying ({retestProgress}%)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Icon name="refresh" size={13} />
                        <span>Deploy &amp; Retest Boundary</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Retest Progress Bar */}
                {retestStatus === 'running' && (
                  <div className="space-y-1.5 animate-fade">
                    <div className="h-1.5 w-full bg-[var(--well-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-blue)] transition-all duration-300"
                        style={{ width: `${retestProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      Spawning isolated microVM sandbox &bull; Executing path containment test…
                    </span>
                  </div>
                )}

                {/* Retest Result Badge */}
                {retestStatus === 'verified_fixed' && (
                  <div className="p-4 rounded-xl bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] flex items-center justify-between animate-fade">
                    <div className="flex items-center gap-2.5">
                      <Icon name="check" size={18} className="text-[var(--status-safe)]" />
                      <div>
                        <span className="text-[13px] font-semibold text-[var(--status-safe)] block">
                          Verified Fixed: Zero Regressions Detected
                        </span>
                        <span className="text-[11.5px] text-[var(--text-secondary)]">
                          Relative path traversal blocked with EACCES. All 6 sandbox tests passed cleanly.
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/retests"
                      className="text-[12px] font-medium text-[var(--status-safe)] underline shrink-0 ml-4"
                    >
                      View Retest Log &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import type { Finding, Evidence } from '@/app/lib/types';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import Link from 'next/link';

interface ReplayStep {
  id: string;
  timestamp: string;
  timeOffset: string;
  actor: string;
  action: string;
  target: string;
  status: 'passed' | 'warning' | 'blocked' | 'alert';
  detail: string;
  payload: Record<string, unknown>;
  boundaryRule: string;
}

interface InvestigationReplayViewProps {
  finding: Finding;
  evidenceList: Evidence[];
}

export function InvestigationReplayView({
  finding,
  evidenceList,
}: InvestigationReplayViewProps) {
  // Generate chronological steps based on the finding and evidence
  const steps: ReplayStep[] = [
    {
      id: 'step-1',
      timestamp: '2026-09-22T18:30:00.100Z',
      timeOffset: '+00:00.000',
      actor: finding.target,
      action: 'runtime.init',
      target: 'Execution Sandbox',
      status: 'passed',
      detail: 'Agent process spawned inside isolated container with declared tool whitelist.',
      payload: { environment: 'production', memoryLimit: '512MB', sandbox: 'gVisor' },
      boundaryRule: 'RULE-001: Ephemeral container lifecycle verification',
    },
    {
      id: 'step-2',
      timestamp: '2026-09-22T18:30:01.420Z',
      timeOffset: '+00:01.320',
      actor: finding.target,
      action: 'tool.invoke',
      target: 'mcp::list_directory',
      status: 'passed',
      detail: 'Agent queried authorized workspace directory listing.',
      payload: { path: '/workspace', filesFound: 8, permission: 'read' },
      boundaryRule: 'RULE-004: Workspace directory traversal boundary',
    },
    {
      id: 'step-3',
      timestamp: '2026-09-22T18:30:02.114Z',
      timeOffset: '+00:02.014',
      actor: finding.target,
      action: 'boundary.violation_attempt',
      target: finding.observed,
      status: 'blocked',
      detail: finding.observed,
      payload: {
        rawInput: finding.observed,
        targetPath: '/Users/sentinel/fixtures/private-note.txt',
        resolvedPath: 'outside_workspace_boundary',
      },
      boundaryRule: 'RULE-012: Strict canonical path boundary check',
    },
    {
      id: 'step-4',
      timestamp: '2026-09-22T18:30:02.180Z',
      timeOffset: '+00:02.080',
      actor: 'Sentinel Kernel Interceptor',
      action: 'interceptor.block',
      target: finding.target,
      status: 'alert',
      detail: 'Sentinel intercepted call and raised immediate high-severity security alert.',
      payload: {
        verdict: 'EACCES_SECURITY_BOUNDARY_EXCEEDED',
        findingCreated: finding.id,
        severity: finding.severity,
      },
      boundaryRule: 'RULE-012: Enforce strict containment',
    },
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [reviewState, setReviewState] = useState<'idle' | 'false_positive' | 'confirmed'>('idle');
  const [checklist, setChecklist] = useState({
    intentionalTest: false,
    preAuthorized: false,
    nonSensitive: false,
  });

  const activeStep = steps[activeStepIndex];

  // Auto-play scrubber effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (activeStepIndex < steps.length - 1) {
          setActiveStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500 / playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, activeStepIndex, steps.length, playbackSpeed]);

  const handleStepChange = (index: number) => {
    triggerHaptic('tap');
    setActiveStepIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 sm:py-10 space-y-8 select-none font-sans pb-24">
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)]">
        <Link
          href="/investigations"
          onClick={() => triggerHaptic('selection')}
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
        >
          <Icon name="arrow" size={11} className="rotate-180" />
          <span>Investigations</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[var(--text-secondary)]">{finding.id} Replay</span>
      </div>

      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]">
              Chronological Replay
            </span>
            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
              Target: {finding.target}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {finding.title}
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
            {finding.detail}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/findings/${finding.id}`}
            className="btn-secondary text-[12.5px] h-9 px-4"
          >
            <span>Finding Details</span>
          </Link>
          <Link
            href="/remediation"
            className="btn-primary text-[12.5px] h-9 px-4"
          >
            <span>Remediation Engine</span>
            <Icon name="arrow" size={12} />
          </Link>
        </div>
      </div>

      {/* ── Interactive Replay Console ────────────────────────────────────── */}
      <div className="bento-card p-6 sm:p-8 space-y-6">
        {/* Scrubber Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsPlaying(!isPlaying);
              }}
              className="btn-primary text-[12.5px] h-9 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Icon name={isPlaying ? 'close' : 'arrow'} size={12} className={isPlaying ? '' : 'rotate-90'} />
              <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
            </button>

            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => handleStepChange(Math.max(0, activeStepIndex - 1))}
              className="btn-secondary text-[12.5px] h-9 px-3 disabled:opacity-40 cursor-pointer"
              title="Previous Step"
            >
              <Icon name="arrow" size={12} className="rotate-180" />
            </button>

            <button
              type="button"
              disabled={activeStepIndex === steps.length - 1}
              onClick={() => handleStepChange(Math.min(steps.length - 1, activeStepIndex + 1))}
              className="btn-secondary text-[12.5px] h-9 px-3 disabled:opacity-40 cursor-pointer"
              title="Next Step"
            >
              <Icon name="arrow" size={12} />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1);
              }}
              className="segmented-pill is-active text-[11px] h-7 px-2.5 font-mono cursor-pointer"
            >
              {playbackSpeed}x Speed
            </button>
          </div>

          <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--text-tertiary)]">
            <span>
              Step {activeStepIndex + 1} of {steps.length}
            </span>
            <span>&bull;</span>
            <span className="text-[var(--accent-blue)] font-medium">
              Offset: {activeStep.timeOffset}
            </span>
          </div>
        </div>

        {/* Timeline Track Scrubber */}
        <div className="relative pt-2 pb-6">
          <div className="h-1.5 w-full bg-[var(--well-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-blue)] transition-all duration-300"
              style={{
                width: `${((activeStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Stepper Nodes */}
          <div className="flex justify-between items-center mt-3">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepChange(idx)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer group text-left ${
                  idx === activeStepIndex ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx === activeStepIndex
                      ? 'bg-[var(--accent-blue)] border-white ring-2 ring-[var(--accent-blue)]/30'
                      : s.status === 'blocked' || s.status === 'alert'
                      ? 'bg-[var(--status-critical)] border-[var(--surface-solid)]'
                      : 'bg-[var(--status-safe)] border-[var(--surface-solid)]'
                  }`}
                />
                <span className="text-[10.5px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
                  {s.timeOffset}
                </span>
                <span className="text-[11px] font-medium text-[var(--text-primary)] max-w-[120px] truncate hidden sm:block">
                  {s.action}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Step Telemetry Snapshot Card */}
        <div className="p-6 rounded-2xl well-inset space-y-4 animate-fade">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  activeStep.status === 'blocked' || activeStep.status === 'alert'
                    ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)]'
                    : 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)]'
                }`}
              >
                {activeStep.status.toUpperCase()}
              </span>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {activeStep.action}
              </h3>
            </div>
            <div className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
              {activeStep.boundaryRule}
            </div>
          </div>

          <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">
            {activeStep.detail}
          </p>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider block">
              Execution Trace Payload &amp; Memory Snapshot
            </span>
            <pre className="p-4 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] font-mono text-[11.5px] text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
              {JSON.stringify(activeStep.payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Root Cause Analysis & False Positive Assistant ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Root Cause Analysis */}
        <div className="lg:col-span-7 bento-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3">
            <Icon name="search" size={16} className="text-[var(--accent-blue)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Root-Cause Summarization
            </h3>
          </div>

          <div className="space-y-3 text-[13px] text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">Primary Breach Vector:</strong>{' '}
              {finding.impact}
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Mechanism:</strong>{' '}
              The runtime agent sandbox failed to canonicalize the requested path using <code className="font-mono text-[12px] px-1 py-0.5 rounded bg-[var(--well)]">realpath()</code> prior to file system reads, allowing relative traversal sequences (<code className="font-mono text-[12px] px-1 py-0.5 rounded bg-[var(--well)]">../</code>) to escape the allocated workspace root.
            </p>
            <div className="p-3.5 rounded-xl well-inset text-[12px] text-[var(--text-primary)] space-y-1">
              <strong className="block font-semibold">Recommended Fix:</strong>
              <span>{finding.recommendation}</span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): False-Positive Review Assistant */}
        <div className="lg:col-span-5 bento-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] pb-3">
            <Icon name="check" size={16} className="text-[var(--accent-blue)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              False-Positive Review Assistant
            </h3>
          </div>

          {reviewState === 'idle' ? (
            <div className="space-y-4 text-[12.5px]">
              <p className="text-[var(--text-secondary)]">
                Verify whether this execution trace represents legitimate testing activity or an unauthorized boundary violation.
              </p>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.intentionalTest}
                    onChange={(e) =>
                      setChecklist({ ...checklist, intentionalTest: e.target.checked })
                    }
                    className="mt-0.5 rounded accent-[var(--accent-blue)]"
                  />
                  <span className="text-[var(--text-primary)]">
                    Was this part of an authorized penetration or red-team drill?
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.preAuthorized}
                    onChange={(e) =>
                      setChecklist({ ...checklist, preAuthorized: e.target.checked })
                    }
                    className="mt-0.5 rounded accent-[var(--accent-blue)]"
                  />
                  <span className="text-[var(--text-primary)]">
                    Was this target path explicitly whitelisted out-of-band?
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.nonSensitive}
                    onChange={(e) =>
                      setChecklist({ ...checklist, nonSensitive: e.target.checked })
                    }
                    className="mt-0.5 rounded accent-[var(--accent-blue)]"
                  />
                  <span className="text-[var(--text-primary)]">
                    Is the affected destination confirmed non-sensitive?
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setReviewState('false_positive');
                  }}
                  className="btn-secondary text-[12px] h-8 px-3.5 flex-1 justify-center"
                >
                  Mark as False Positive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setReviewState('confirmed');
                  }}
                  className="btn-primary text-[12px] h-8 px-3.5 flex-1 justify-center"
                >
                  Confirm Violation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl well-inset space-y-3 text-[12.5px] animate-fade">
              <div className="flex items-center gap-2 font-semibold">
                <Icon
                  name={reviewState === 'false_positive' ? 'check' : 'close'}
                  size={15}
                  className={
                    reviewState === 'false_positive'
                      ? 'text-[var(--status-safe)]'
                      : 'text-[var(--status-critical)]'
                  }
                />
                <span className="text-[var(--text-primary)]">
                  {reviewState === 'false_positive'
                    ? 'Classified as False Positive'
                    : 'Confirmed True Boundary Violation'}
                </span>
              </div>
              <p className="text-[var(--text-secondary)]">
                {reviewState === 'false_positive'
                  ? 'Audit log updated: Finding flagged for review and suppressed from high-priority security alerting.'
                  : 'Violation confirmed: Boundary patch synthesized and queued for human approval.'}
              </p>
              <button
                type="button"
                onClick={() => setReviewState('idle')}
                className="text-[11.5px] text-[var(--accent-blue)] font-medium underline"
              >
                Reset review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

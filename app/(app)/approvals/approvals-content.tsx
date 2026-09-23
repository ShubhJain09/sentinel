'use client';

import { useState } from 'react';
import { Icon } from '@/app/components/ui-icon';
import { decideApproval, executeAndRetestRemediation } from '@/app/actions/approvals';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Approval, Finding, Session } from '@/app/lib/types';
import Link from 'next/link';

interface ApprovalsProps {
  approvals: Approval[];
  findings: Finding[];
  session: Session;
}

export default function ApprovalsContent({ approvals, findings, session }: ApprovalsProps) {
  const [filter, setFilter] = useState('All');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredApprovals = approvals.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return a.status === 'pending';
    if (filter === 'Approved') return a.status === 'approved';
    if (filter === 'Rejected') return a.status === 'rejected';
    return true;
  });

  async function handleDecide(id: string, decision: 'approved' | 'rejected', comment?: string) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (decision === 'approved') {
        triggerHaptic('success');
      } else {
        triggerHaptic('warning');
      }
      await decideApproval(id, decision, comment);
      setRejectingId(null);
      setRejectReason('');
      setActionSuccess(decision === 'approved' ? 'Patch authorized and staged for execution' : 'Proposal rejected');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (e: any) {
      setActionError(e.message || 'Action failed');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecuteAndRetest(id: string) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      triggerHaptic('success');
      await executeAndRetestRemediation(id);
      setActionSuccess('Remediation deployed and automated retest passed');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (e: any) {
      setActionError(e.message || 'Execution failed');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1300px] mx-auto space-y-6 pb-20">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
            Human Oversight &amp; Governance
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Approval &amp; Decision Center
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Review proposed agent boundary modifications. Sensitive code and policy changes execute only with operator authorization.
          </p>
        </div>

        {/* Filter segmented control */}
        <div className="segmented-control self-start sm:self-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('selection');
                setFilter(tab);
              }}
              className={`segmented-pill ${filter === tab ? 'is-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-safe-subtle)] border border-[var(--status-safe-border)] text-[var(--status-safe)] text-[12.5px] font-medium animate-fade shadow-xs">
          <Icon name="check" size={15} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {actionError && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--status-critical-subtle)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-[12.5px] font-medium animate-fade shadow-xs">
          <Icon name="close" size={15} />
          <span>{actionError}</span>
        </div>
      )}

      {/* ── Approvals List ─────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {filteredApprovals.length > 0 ? (
          filteredApprovals.map((approval) => {
            const isPending = approval.status === 'pending';
            const isApproved = approval.status === 'approved';
            const isRejected = approval.status === 'rejected';

            return (
              <div
                key={approval.id}
                className="bento-card p-6 md:p-8 space-y-6 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                        {approval.id}
                      </span>
                      <span
                        className={`pill-badge text-[10.5px] uppercase ${
                          isPending
                            ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                            : isApproved
                            ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]'
                            : 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]'
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>

                    <Link
                      href={`/approvals/${approval.id}`}
                      className="text-[17px] font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{approval.title}</span>
                      <Icon name="arrow" size={13} />
                    </Link>
                  </div>

                  <div className="text-[11.5px] text-[var(--text-tertiary)] font-mono sm:text-right shrink-0">
                    <div>Target: <strong className="text-[var(--text-primary)] font-medium">{approval.affectedTarget}</strong></div>
                    <div className="tabular-numbers">Requested: {new Date(approval.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Description & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px]">
                  <div className="well-inset p-3.5 space-y-1">
                    <span className="text-[9.5px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                      Reason for Modification
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {approval.description}
                    </p>
                  </div>

                  <div className="well-inset p-3.5 space-y-1">
                    <span className="text-[9.5px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                      Risk Assessment &amp; Blast Radius
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {approval.risk}
                    </p>
                  </div>
                </div>

                {/* Proposed Code Diff Well */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase block">
                    Proposed Remediation Patch (AST Diff)
                  </span>
                  <div className="well-inset p-4 font-mono text-[11.5px] overflow-x-auto whitespace-pre-wrap leading-relaxed tabular-numbers">
                    <div className="text-[var(--status-critical)]">
                      - // Unvalidated direct read from tool parameter
                      <br />
                      - return fs.readFileSync(userPath, &apos;utf8&apos;);
                    </div>
                    <div className="text-[var(--status-safe)] mt-2">
                      + // Enforce canonical path containment against workspace root
                      <br />
                      + const canonicalPath = path.resolve(WORKSPACE_ROOT, userPath);
                      <br />
                      + if (!canonicalPath.startsWith(path.resolve(WORKSPACE_ROOT) + path.sep)) &#123;
                      <br />
                      +   throw new SecurityBoundaryViolation(&apos;Path escape detected&apos;);
                      <br />
                      + &#125;
                      <br />
                      + return fs.readFileSync(canonicalPath, &apos;utf8&apos;);
                    </div>
                  </div>
                </div>

                {/* Operator Decision Actions */}
                <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left review metadata */}
                  {approval.reviewComment ? (
                    <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="text-[var(--text-tertiary)]">Review note:</span>
                      <span className="font-medium text-[var(--text-primary)] italic">&quot;{approval.reviewComment}&quot;</span>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[var(--text-tertiary)]">
                      Authorized operator: <strong className="text-[var(--text-secondary)] font-medium">{session.name}</strong>
                    </div>
                  )}

                  {/* Right actions */}
                  <div className="flex items-center gap-3 self-end">
                    {isPending && (
                      <>
                        {rejectingId === approval.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection..."
                              className="input-apple h-8.5 text-[12px] w-56"
                              autoFocus
                            />
                            <button
                              disabled={isSubmitting}
                              onClick={() => handleDecide(approval.id, 'rejected', rejectReason)}
                              className="btn-destructive text-[12px] h-8.5 px-3.5"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                triggerHaptic('tap');
                                setRejectingId(null);
                              }}
                              className="btn-ghost text-[12px] h-8.5 px-2.5"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              triggerHaptic('tap');
                              setRejectingId(approval.id);
                            }}
                            className="btn-ghost text-[12px] text-[var(--text-tertiary)] hover:text-[var(--status-critical)]"
                          >
                            Reject Request
                          </button>
                        )}

                        {rejectingId !== approval.id && (
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleDecide(approval.id, 'approved', 'Authorized canonical path containment check')}
                            className="btn-primary"
                          >
                            <Icon name="check" size={14} />
                            <span>Authorize &amp; Deploy Patch</span>
                          </button>
                        )}
                      </>
                    )}

                    {isApproved && (
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleExecuteAndRetest(approval.id)}
                        className="btn-primary"
                      >
                        <Icon name="scan" size={14} />
                        <span>Execute &amp; Run Automated Retest</span>
                      </button>
                    )}

                    {isRejected && (
                      <span className="text-[12px] text-[var(--status-critical)] font-medium">
                        Request Rejected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bento-card p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] text-[var(--status-safe)] flex items-center justify-center mx-auto mb-2">
              <Icon name="check" size={22} />
            </div>
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">All Approvals Resolved</h3>
            <p className="text-[12px] text-[var(--text-secondary)] max-w-md mx-auto">
              No pending change requests or agent modification proposals awaiting human authorization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

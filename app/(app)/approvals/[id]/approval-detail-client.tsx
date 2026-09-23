'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { decideApproval, executeAndRetestRemediation } from '@/app/actions/approvals';
import type { Approval, Session } from '@/app/lib/types';

interface ApprovalDetailClientProps {
  approval: Approval;
  session: Session;
  hasReviewCapability: boolean;
}

export function ApprovalDetailClient({
  approval,
  session,
  hasReviewCapability,
}: ApprovalDetailClientProps) {
  const router = useRouter();
  const [comment, setComment] = useState(approval.reviewComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      triggerHaptic(decision === 'approved' ? 'success' : 'warning');
      const res = await decideApproval(approval.id, decision, comment);
      if (res.success) {
        setActionNotice(`Change request marked as ${decision}.`);
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || 'Error processing approval decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetest = async () => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      triggerHaptic('success');
      const res = await executeAndRetestRemediation(approval.id);
      if (res.success) {
        setActionNotice('Patch executed and regression boundary verified!');
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || 'Error executing remediation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = approval.status === 'pending';
  const isApproved = approval.status === 'approved';
  const isRejected = approval.status === 'rejected';

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--accent-blue)] hover:underline active:scale-98 transition-all"
        >
          <Icon name="arrow" size={13} className="rotate-180" />
          <span>All Change Approvals</span>
        </Link>
      </div>

      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <section className="space-y-4 border-b border-[var(--border-hairline)] pb-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isPending
                ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                : isApproved
                ? 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                : 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
            }`}
          >
            {approval.status === 'pending' ? 'Awaiting Review' : approval.status}
          </span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
            Risk: {approval.risk}
          </span>
          <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
            CR: {approval.id}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.15]">
          {approval.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-2 text-[13px] text-[var(--text-secondary)] font-normal">
          <div>
            Affected Target:{' '}
            <strong className="text-[var(--text-primary)] font-medium">
              {approval.affectedTarget}
            </strong>
          </div>
          <div>
            Requested:{' '}
            <span className="font-mono tabular-nums text-[var(--text-primary)]">
              {new Date(approval.createdAt).toLocaleDateString()}
            </span>
          </div>
          {approval.reviewedAt && (
            <div>
              Reviewed:{' '}
              <span className="font-mono tabular-nums text-[var(--text-primary)]">
                {new Date(approval.reviewedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {actionNotice && (
          <div className="p-4 rounded-2xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] text-[13px] font-medium flex items-center gap-2">
            <Icon name="check" size={16} />
            <span>{actionNotice}</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] text-[13px] font-medium flex items-center gap-2">
            <Icon name="close" size={16} />
            <span>{actionError}</span>
          </div>
        )}
      </section>

      {/* ─── Progressive Disclosure Sections ─────────────────────────────── */}
      <div className="space-y-12">
        {/* Section 1: Proposal Description */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Remediation Description
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            {approval.description}
          </p>
        </section>

        {/* Section 2: AST Code Diff Preview */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Proposed Logic Patch
          </h2>
          <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
              <span>PATCH SPECIFICATION</span>
              <span>SYNTHESIZED SAFE AST DIFF</span>
            </div>
            <pre className="p-4 rounded-xl well-inset font-mono text-[12px] text-[var(--text-primary)] overflow-x-auto whitespace-pre leading-relaxed select-all">
              {approval.proposedChange}
            </pre>
          </div>
        </section>

        {/* Section 3: Expected Outcome & Safety Invariant */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Expected Behavioral Result
          </h2>
          <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-2">
            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
              {approval.expectedResult}
            </p>
          </div>
        </section>

        {/* Section 4: Human Reviewer Action Station */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-hairline)]">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
              Human Reviewer Judgment
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1">
              {isPending
                ? 'Evaluate the synthesized patch logic and record your binding authorization decision.'
                : `Decision recorded: This change request has been ${approval.status}.`}
            </p>
          </div>

          {isPending && hasReviewCapability && (
            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Reviewer Notes (Optional)
                </label>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Verified canonical path prefix; approved for local execution."
                  className="input-apple"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleDecision('approved')}
                  disabled={isSubmitting}
                  className="btn-primary text-[13px] h-10 px-6"
                >
                  <Icon name="check" size={14} />
                  <span>Authorize &amp; Approve Fix</span>
                </button>
                <button
                  onClick={() => handleDecision('rejected')}
                  disabled={isSubmitting}
                  className="btn-destructive text-[13px] h-10 px-5"
                >
                  <span>Decline Proposal</span>
                </button>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-4">
              <div className="flex items-center gap-2 text-[var(--status-safe)] font-semibold text-[14px]">
                <Icon name="check" size={16} />
                <span>Authorized by Platform Operator</span>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)]">
                The patch has been authorized. You can now execute and retest the target sandbox boundary.
              </p>
              <button
                onClick={handleRetest}
                disabled={isSubmitting}
                className="btn-primary text-[13px] h-10 px-6"
              >
                <Icon name="refresh" size={14} />
                <span>Apply Patch &amp; Retest Boundary</span>
              </button>
            </div>
          )}

          {isRejected && (
            <div className="p-6 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--status-critical)] font-semibold text-[14px]">
                <Icon name="close" size={16} />
                <span>Proposal Declined</span>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)]">
                This patch will not be applied to the target runtime.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

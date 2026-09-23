'use client';

import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Scan, Finding, Approval } from '@/app/lib/types';
import Link from 'next/link';

interface AnalyticsProps {
  scans: Scan[];
  findings: Finding[];
  approvals: Approval[];
}

export default function AnalyticsContent({ scans, findings, approvals }: AnalyticsProps) {
  const totalScans = scans.length;
  const openFindings = findings.filter((f) => f.status === 'open').length;
  const remediatedFindings = findings.filter((f) => f.status === 'remediated').length;
  const approvedApprovals = approvals.filter((a) => a.status === 'approved').length;
  const totalDecisions = approvals.filter((a) => a.status !== 'pending').length;
  const approvalRate = totalDecisions > 0 ? Math.round((approvedApprovals / totalDecisions) * 100) : 100;

  const highSeverity = findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;
  const mediumSeverity = findings.filter((f) => f.severity === 'medium').length;
  const lowSeverity = findings.filter((f) => f.severity === 'low' || f.severity === 'info').length;

  const totalDuration = scans.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgDuration = totalScans > 0 ? (totalDuration / totalScans / 1000).toFixed(1) : '0';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
          Metrics &amp; Posture
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Security Analytics
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Quantitative evaluation of boundary investigations, remediation velocities, and exposure risks.
        </p>
      </div>

      {/* Top 4 KPI Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Scans</span>
            <Icon name="scan" size={14} className="text-[var(--accent-blue)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tracking-tight tabular-numbers">{totalScans}</div>
          <div className="text-[11px] text-[var(--status-safe)] font-medium">100% completed</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Open Findings</span>
            <Icon name="finding" size={14} className="text-[var(--status-critical)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tracking-tight tabular-numbers">{openFindings}</div>
          <div className="text-[11px] text-[var(--status-critical)] font-medium">Requires review</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Approval Rate</span>
            <Icon name="approval" size={14} className="text-[var(--status-warning)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tracking-tight tabular-numbers">{approvalRate}%</div>
          <div className="text-[11px] text-[var(--text-secondary)] tabular-numbers">{approvedApprovals} approved fixes</div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Avg Scan Time</span>
            <Icon name="clock" size={14} className="text-[var(--accent-blue)]" />
          </div>
          <div className="text-3xl font-light text-[var(--text-primary)] font-mono tracking-tight tabular-numbers">{avgDuration}s</div>
          <div className="text-[11px] text-[var(--text-secondary)]">Sub-second AST probes</div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              Findings by Severity
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-secondary)] tabular-numbers">
              {findings.length} total findings
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[var(--status-critical)] font-medium">Critical &amp; High Severity</span>
                <span className="font-mono text-[var(--text-primary)] font-medium tabular-numbers">{highSeverity}</span>
              </div>
              <div className="w-full bg-[var(--well)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--status-critical)] h-full rounded-full transition-all duration-400"
                  style={{ width: `${findings.length > 0 ? (highSeverity / findings.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[var(--status-warning)] font-medium">Medium Severity</span>
                <span className="font-mono text-[var(--text-primary)] font-medium tabular-numbers">{mediumSeverity}</span>
              </div>
              <div className="w-full bg-[var(--well)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--status-warning)] h-full rounded-full transition-all duration-400"
                  style={{ width: `${findings.length > 0 ? (mediumSeverity / findings.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[var(--accent-blue)] font-medium">Low &amp; Informational</span>
                <span className="font-mono text-[var(--text-primary)] font-medium tabular-numbers">{lowSeverity}</span>
              </div>
              <div className="w-full bg-[var(--well)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent-blue)] h-full rounded-full transition-all duration-400"
                  style={{ width: `${findings.length > 0 ? (lowSeverity / findings.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remediation Health */}
        <div className="bento-card p-6 space-y-5">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Remediation Posture
          </h2>

          <div className="well-inset p-4 space-y-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">Resolved vs Total Findings</span>
              <span className="font-mono text-[var(--status-safe)] font-semibold tabular-numbers">
                {remediatedFindings} / {findings.length} Resolved
              </span>
            </div>
            <div className="w-full bg-[var(--surface-selected)] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[var(--status-safe)] h-full rounded-full transition-all duration-400"
                style={{ width: `${findings.length > 0 ? (remediatedFindings / findings.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              Approved patches verify boundary containment. The human reviewer retains final authority to authorize remediation patches before production execution.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/findings"
              onClick={() => triggerHaptic('selection')}
              className="text-[12px] text-[var(--accent-blue)] hover:underline font-medium inline-flex items-center gap-1 active:scale-[0.98]"
            >
              Explore all findings &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

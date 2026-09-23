'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Scan } from '@/app/lib/types';

export default function ScansContent({ scans }: { scans: Scan[] }) {
  const [tab, setTab] = useState<'all' | 'scheduled' | 'history'>('all');
  const [search, setSearch] = useState('');

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      // Tab filter
      if (tab === 'scheduled') {
        return false;
      }
      if (tab === 'history' && scan.status === 'running') {
        return false;
      }

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          scan.name.toLowerCase().includes(query) ||
          scan.target.toLowerCase().includes(query) ||
          scan.id.toLowerCase().includes(query) ||
          scan.kind.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [scans, tab, search]);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 sm:py-10 space-y-6 select-none">
      {/* ─── Top Header Matching Image 3 Screen 6 ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-1">
          <h1 className="page-headline text-[var(--text-primary)]">
            Scans
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] font-normal">
            Continuous runtime verification and boundary checks across all agent targets.
          </p>
        </div>

        <Link
          href="/scans/new"
          onClick={() => triggerHaptic('selection')}
          className="btn-primary text-[13px] h-9.5 px-5 rounded-full shadow-xs"
        >
          <span>Run a scan</span>
          <Icon name="plus" size={13} />
        </Link>
      </div>

      {/* ─── Tabs & Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Segmented Tabs: All scans, Scheduled, History */}
        <div className="inline-flex p-1 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setTab('all');
            }}
            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-[var(--surface-solid)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All scans ({scans.length})
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setTab('scheduled');
            }}
            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              tab === 'scheduled'
                ? 'bg-[var(--surface-solid)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              setTab('history');
            }}
            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
              tab === 'history'
                ? 'bg-[var(--surface-solid)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            History
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Icon
            name="search"
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans or targets…"
            className="input-apple h-9 pl-9 pr-4 text-[13px] rounded-full w-full"
          />
        </div>
      </div>

      {/* ─── Scans List Container (Liquid Glass Card) ────────────────────── */}
      <div className="liquid-glass-card rounded-[28px] overflow-hidden shadow-sm border border-[var(--border-subtle)] divide-y divide-[var(--border-hairline)]">
        {filteredScans.length > 0 ? (
          filteredScans.map((scan) => {
            const isRunning = scan.status === 'running';
            const hasFindings = scan.result === 'needs_review' || scan.result === 'failed';
            const isPassed = scan.result === 'passed';

            return (
              <Link
                key={scan.id}
                href={`/scans/${scan.id}`}
                onClick={() => triggerHaptic('selection')}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] transition-colors group cursor-pointer"
              >
                {/* Left: Squircle Icon & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                      isRunning
                        ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border-[var(--accent-blue)]/30 animate-pulse'
                        : hasFindings
                        ? 'bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border-[var(--status-critical-border)]'
                        : 'bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border-[var(--status-safe-border)]'
                    }`}
                  >
                    <Icon name={isRunning ? 'refresh' : hasFindings ? 'shield' : 'scan'} size={18} className={isRunning ? 'animate-spin' : ''} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-blue)] transition-colors">
                        {scan.target}
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase px-1.5 py-0.2 rounded bg-[var(--well)]">
                        {scan.kind}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[12px] text-[var(--text-tertiary)] font-mono">
                      <span>{scan.id}</span>
                      <span>•</span>
                      <span>{scan.checksCompleted}/{scan.checks} checks</span>
                      {scan.duration && (
                        <>
                          <span>•</span>
                          <span>{scan.duration}ms</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Arrow */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Finding count */}
                  {hasFindings ? (
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]">
                      Issues Detected
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                      0 findings
                    </span>
                  )}

                  {/* Status pill */}
                  <span
                    className={`text-[11.5px] font-medium px-3 py-1 rounded-full ${
                      isRunning
                        ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]'
                        : isPassed
                        ? 'bg-[var(--well)] text-[var(--text-primary)]'
                        : 'bg-[var(--status-warning-subtle)] text-[var(--status-warning)]'
                    }`}
                  >
                    {isRunning ? 'Running' : isPassed ? 'Passed' : 'Needs Review'}
                  </span>

                  {/* Chevron arrow */}
                  <div className="w-7 h-7 rounded-full bg-[var(--well)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--accent-blue)] group-hover:bg-[var(--accent-blue-subtle)] transition-colors">
                    <Icon name="arrow" size={12} />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--well)] text-[var(--text-tertiary)] flex items-center justify-center mx-auto">
              <Icon name="scan" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {tab === 'scheduled' ? 'No scheduled scans pending' : 'No matching scans found'}
              </h4>
              <p className="text-[12.5px] text-[var(--text-secondary)] max-w-sm mx-auto">
                {tab === 'scheduled'
                  ? 'Configure automated recurring scan policies in Security Settings.'
                  : 'Try adjusting your search criteria or launch a new manual scan.'}
              </p>
            </div>
            {tab !== 'scheduled' && (
              <Link
                href="/scans/new"
                className="btn-primary text-[12.5px] h-8.5 px-4 rounded-full inline-flex mt-2"
              >
                <span>Launch New Scan</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import type { Evidence, Finding } from '@/app/lib/types';

interface EvidenceProps {
  evidence: Evidence[];
  findings: Finding[];
}

export default function EvidenceContent({ evidence, findings }: EvidenceProps) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredEvidence = evidence.filter((e) => {
    const matchesFilter =
      filter === 'All' ? true : e.type.toLowerCase() === filter.toLowerCase();

    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <span className="text-[10px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase block mb-1">
          Verifiable Telemetry
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Evidence Vault
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Traceable, unaltered execution logs, observation traces, and tool outputs gathered during security investigations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bento-card p-3">
        <div className="segmented-control">
          {['All', 'Observation', 'Log', 'Tool Result'].map((tab) => {
            const key = tab.toLowerCase().replace(' ', '_');
            const isActive = (tab === 'All' && filter === 'All') || filter === key;
            return (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic('selection');
                  setFilter(tab === 'All' ? 'All' : key);
                }}
                className={`segmented-pill ${isActive ? 'is-active' : ''}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search evidence traces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-apple h-8 w-full sm:w-64 pl-8 text-[12px]"
          />
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
            <Icon name="search" size={13} />
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      {filteredEvidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvidence.map((item) => {
            const finding = findings.find((f) => f.id === item.findingId);
            return (
              <div
                key={item.id}
                className="bento-card p-5 space-y-4 hover:border-[var(--border-strong)] transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="pill-badge bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue-border)] font-mono text-[10px]">
                      {item.type}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-tertiary)] tabular-numbers">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)] leading-snug">
                    {item.title}
                  </h3>

                  <div className="well-inset p-3.5 font-mono text-[11px] text-[var(--text-secondary)] break-words whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto custom-scrollbar tabular-numbers">
                    {item.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11.5px] text-[var(--text-secondary)]">
                  <span className="truncate max-w-[220px]" title={item.source}>
                    Source: <strong className="text-[var(--text-primary)] font-medium">{item.source}</strong>
                  </span>
                  {finding && (
                    <Link
                      href={`/findings?selected=${finding.id}`}
                      onClick={() => triggerHaptic('selection')}
                      className="text-[var(--accent-blue)] hover:underline font-medium inline-flex items-center gap-1 active:scale-[0.98]"
                    >
                      Finding {finding.id} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bento-card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-tertiary)] mb-3">
            <Icon name="box" size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            No Evidence Traces Found
          </h3>
          <p className="text-[12px] text-[var(--text-secondary)] max-w-sm">
            No evidence records match your current search and filter parameters.
          </p>
        </div>
      )}
    </div>
  );
}

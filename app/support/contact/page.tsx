'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

export default function SupportContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [severity, setSeverity] = useState('high');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [ticketId] = useState(
    () => `SEC-${Math.floor(100000 + Math.random() * 900000)}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('selection');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 sm:py-16 space-y-10 select-none pb-32">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)]">
          <Link
            href="/support"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
          >
            <Icon name="arrow" size={11} className="rotate-180" />
            <span>Support Center</span>
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">Security Escalation</span>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="space-y-3 border-b border-[var(--border-hairline)] pb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
            Core Engineering &amp; Operations Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Security Escalation Request
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
            Need urgent containment assistance, discovered a potential zero-day boundary escape, or require enclave debugging? Submit an escalation directly to the Sentinel core security team.
          </p>
        </div>

        {/* ── Content / Form ──────────────────────────────────────────────── */}
        {submitted ? (
          <div className="bento-card p-8 sm:p-10 text-center space-y-4 animate-fade">
            <div className="w-14 h-14 rounded-2xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)] flex items-center justify-center mx-auto">
              <Icon name="check" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Escalation Dispatched Successfully
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Ticket <strong className="font-mono text-[var(--accent-blue)]">{ticketId}</strong> has been logged to the immutable audit vault and routed to our on-call security architects.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link href="/overview" className="btn-primary text-[12.5px] h-9 px-5">
                <span>Return to Overview</span>
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-secondary text-[12.5px] h-9 px-4"
              >
                <span>Submit Another Request</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bento-card p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Operator Name <span className="text-[var(--status-critical)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shubh Jain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Operator Email <span className="text-[var(--status-critical)]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Incident Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                >
                  <option value="critical">Critical — Active boundary breach</option>
                  <option value="high">High — Prompt injection detected</option>
                  <option value="medium">Medium — Configuration drift warning</option>
                  <option value="low">Low — General inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                  Affected Target or Agent
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. Filesystem MCP Sandbox"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                Incident Description &amp; Behavioral Details <span className="text-[var(--status-critical)]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide observed tool calls, unexpected outputs, or error stack traces…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--well)] border border-[var(--well-border)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border-hairline)]">
              <button
                type="submit"
                className="btn-primary text-[13px] h-10 px-6 cursor-pointer"
              >
                <Icon name="shield" size={14} />
                <span>Dispatch Escalation Request</span>
              </button>
            </div>
          </form>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

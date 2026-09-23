'use client';

import React, { useState } from 'react';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

interface PrincipleCard {
  title: string;
  description: string;
  icon: IconName;
  tag: string;
}

const PRINCIPLES: PrincipleCard[] = [
  {
    title: 'Zero Model Training',
    description: 'Your codebase, tool telemetry, and AST structures are strictly excluded from public AI training pipelines.',
    icon: 'lock',
    tag: 'Strict Boundary',
  },
  {
    title: 'Enclave Locality',
    description: 'All inspection sandboxes and SQLite WAL logs run strictly within your designated operational boundary.',
    icon: 'shield',
    tag: 'Zero Leakage',
  },
  {
    title: 'Cryptographic Audit',
    description: 'Every scan execution, evidence capture, and human approval is immutably hashed and tamper-evident.',
    icon: 'box',
    tag: 'Verifiable',
  },
  {
    title: 'Explicit Human Sign-Off',
    description: 'No autonomous agent can apply modifications, commit patches, or alter permissions without human review.',
    icon: 'approval',
    tag: 'Deterministic',
  },
];

const SECTIONS = [
  {
    id: 'principles',
    title: '1. Foundational Privacy Invariants',
    content: `Sentinel was architected on a fundamental premise: security tools must never become attack vectors or conduits for data exfiltration. We do not operate advertising networks, sell behavioral telemetry, or lease access to customer datasets under any circumstance. All operations within Sentinel are scoped strictly to security enforcement and audit durability.`,
  },
  {
    id: 'collection',
    title: '2. Data Collection Boundaries',
    content: `Sentinel processes only the telemetry strictly required to conduct vulnerability inspections and maintain cryptographic audit ledgers. This includes repository commit hashes, AST analysis traces, container configuration manifests, and raw tool output captured during sandboxed execution. We do not inspect personal employee communications or unrelated cloud workloads.`,
  },
  {
    id: 'ai-training',
    title: '3. Zero Model Training Guarantee',
    content: `We enforce a legally binding and cryptographically verified isolation barrier between customer workspaces and frontier model providers. Whether you utilize Anthropic Claude, Google Gemini, OpenAI, or locally deployed Ollama weights, customer inputs and tool execution logs are processed under zero-data-retention (ZDR) agreements and never persisted for base model fine-tuning.`,
  },
  {
    id: 'persistence',
    title: '4. Cryptographic Storage & Encryption',
    content: `All session tokens, credentials, and evidence traces stored within Sentinel are protected by AES-256-GCM encryption at rest and TLS 1.3 in transit. Authentication secrets are hashed with bcrypt (cost factor 10). Cryptographic hash chains in our WAL log guarantee that historical audit events cannot be altered or retroactively erased by any operator, including the OWNER account.`,
  },
  {
    id: 'retention',
    title: '5. Data Retention & Tenant Deletion',
    content: `Customers maintain absolute sovereignty over their data. When a workspace is deleted by the verified OWNER account, all corresponding database records, evidence blobs, AST caches, and session entries are purged immediately and unrecoverably from storage media.`,
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('principles');

  const scrollTo = (id: string) => {
    triggerHaptic('tap');
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      <GlobalNav />

      <main className="flex-1 py-12 sm:py-16 px-6 max-w-7xl mx-auto w-full space-y-16">
        {/* ─── Hero Header Matching Image 3 Screen 8 ────────────────────────── */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
            Sentinel Privacy &amp; Trust
          </span>
          <h1 className="hero-headline text-[var(--text-primary)]">
            Privacy that is proven, not promised.
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Our architectural guarantees ensure your intellectual property and agent telemetry remain strictly yours.
          </p>
        </section>

        {/* ─── 4 Key Principles Cards ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPLES.map((item, idx) => (
            <div
              key={idx}
              className="liquid-glass-card p-6 rounded-[28px] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center shadow-xs">
                    <Icon name={item.icon} size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-[var(--status-safe)]">
                <Icon name="check" size={12} />
                <span>Enforced by design</span>
              </div>
            </div>
          ))}
        </section>

        {/* ─── Structured Body with Sidebar Navigation ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Left Table of Contents (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="liquid-glass-card p-6 rounded-[28px] sticky top-20 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Policy Sections
              </span>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[12.5px] transition-colors cursor-pointer truncate ${
                      activeSection === sec.id
                        ? 'bg-[var(--surface-solid)] text-[var(--accent-blue)] font-medium shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-tertiary)]">
                Effective Date: September 2026 • Version 2.6
              </div>
            </div>
          </aside>

          {/* Right Detailed Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {SECTIONS.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="liquid-glass-card p-8 rounded-[32px] space-y-4 scroll-mt-24"
              >
                <h2 className="text-[19px] font-semibold text-[var(--text-primary)]">
                  {sec.title}
                </h2>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                  {sec.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

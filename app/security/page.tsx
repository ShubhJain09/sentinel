'use client';

import React from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';

export default function SecurityArchitecturePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      <GlobalNav />

      <main className="flex-1 py-12 sm:py-16 px-6 max-w-5xl mx-auto w-full space-y-16">
        <header className="space-y-4 border-b border-[var(--border-hairline)] pb-8 text-center max-w-3xl mx-auto">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
            Sentinel Architecture Whitepaper
          </span>
          <h1 className="hero-headline text-[var(--text-primary)]">
            Security Architecture &amp; Trust
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            A comprehensive overview of cryptographic guarantees, sandbox containment boundaries, and server-side authorization in Sentinel.
          </p>
        </header>

        {/* 4 Pillar Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="liquid-glass-card p-7 rounded-[32px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center">
              <Icon name="shield" size={18} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Server-Enforced RBAC &amp; OWNER Authorization
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Every route and API invocation executes rigorous server-side identity validation. Privileged operations—such as MCP server registration, secret injection, and tenant user provisioning—require the cryptographically verified OWNER role matching <code className="text-[11px] font-mono text-[var(--accent-blue)]">OWNER_EMAIL</code>.
            </p>
          </div>

          <div className="liquid-glass-card p-7 rounded-[32px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] flex items-center justify-center">
              <Icon name="box" size={18} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Cryptographic Session Durability
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Authentication relies on HMAC-SHA256 signed session tokens stored inside HttpOnly, SameSite=Lax, Secure cookies. Passwords are salted and hashed using bcrypt (cost factor 10). Session revocation takes effect immediately across all worker nodes.
            </p>
          </div>

          <div className="liquid-glass-card p-7 rounded-[32px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--status-warning-subtle)] text-[var(--status-warning)] flex items-center justify-center">
              <Icon name="scan" size={18} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Deterministic Runtime Sandboxing
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              All agent tool handlers and code evaluation sandboxes are executed in process-isolated containers with strict chroot and read-only filesystem root enforcement. Relative path traversal attempts (<code className="text-[11px] font-mono">../</code>) trigger immediate boundary fault alarms.
            </p>
          </div>

          <div className="liquid-glass-card p-7 rounded-[32px] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Icon name="code" size={18} />
            </div>
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Zero Model Training Guarantee
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Customer source code, tool execution parameters, and vulnerability findings are protected by zero-data-retention (ZDR) infrastructure agreements. External frontier model inference is purely ephemeral and never recorded into public model training datasets.
            </p>
          </div>
        </section>

        {/* Vulnerability Disclosure */}
        <section className="liquid-glass-card p-8 sm:p-10 rounded-[36px] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center">
              <Icon name="finding" size={16} />
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Responsible Vulnerability Disclosure
            </h2>
          </div>
          <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
            We welcome coordinated security research on Sentinel infrastructure. If you believe you have discovered a security vulnerability in our enclave runtime or authorization layer, please submit a PGP-encrypted report directly to our security engineering team.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <a
              href="mailto:security@sentinel-security.internal"
              className="btn-primary text-[12.5px] h-9 px-5 rounded-full"
            >
              <span>Submit Security Report</span>
            </a>
            <span className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
              PGP Key ID: 0x9B4E7A21D5C8F3
            </span>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

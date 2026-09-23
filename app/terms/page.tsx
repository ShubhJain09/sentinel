'use client';

import React from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      <GlobalNav />

      <main className="flex-1 py-12 sm:py-16 px-6 max-w-4xl mx-auto w-full space-y-12">
        <header className="space-y-3 border-b border-[var(--border-hairline)] pb-8">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
            Legal Terms &amp; Conditions
          </span>
          <h1 className="page-headline text-[var(--text-primary)]">
            Terms of Service
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)]">
            Last Updated: September 2026 • Governing Sentinel Enterprise Platform Usage
          </p>
        </header>

        <div className="space-y-8 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              1. Acceptance of Terms
            </h2>
            <p>
              By initializing, deploying, or accessing a Sentinel enclave, workspace, or application node, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise or other legal entity, you represent that you possess the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              2. Authorized Security Operations Scopes
            </h2>
            <p>
              Sentinel provides automated vulnerability inspection, sandboxed agent evaluation, and cryptographic audit durability. You agree to execute Sentinel scans, tool audits, and boundary checks solely on infrastructure, codebases, and MCP endpoints that you own, operate, or are explicitly authorized in writing to test.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              3. Autonomous Agent Actions &amp; Human Responsibility
            </h2>
            <p>
              Sentinel provides automated AI agents capable of synthesizing code remediation patches and analyzing threat telemetry. The final review, approval, and production merge of any patch remains the sole responsibility of the customer&apos;s authorized human operators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              4. Intellectual Property &amp; Telemetry Confidentiality
            </h2>
            <p>
              Customers retain all right, title, and interest in and to their proprietary code, configuration files, and AST artifacts. Sentinel acquires no ownership rights over customer telemetry. We never utilize customer telemetry or prompt payloads to train public or shared generative models.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              5. Service Availability &amp; Cryptographic Durability
            </h2>
            <p>
              Sentinel maintains cryptographic hash chains and durable WAL persistence to ensure all audit logs are tamper-evident. While we design for continuous uptime, access may be momentarily suspended during critical security patch migrations or disaster recovery drills.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

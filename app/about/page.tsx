'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      <GlobalNav />

      <main className="flex-1 py-12 sm:py-20 px-6 max-w-7xl mx-auto w-full space-y-20">
        {/* ─── Hero Section Matching Image 3 Screen 9 ────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
              Our Mission
            </span>
            <h1 className="hero-headline text-[var(--text-primary)]">
              A more secure tomorrow.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Sentinel was created to solve the defining trust challenge of our era: how to empower autonomous AI agents with real tools without relinquishing security, compliance, and human control.
            </p>
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">
              <Link
                href="/signup"
                onClick={() => triggerHaptic('selection')}
                className="btn-primary text-[14px] h-11 px-7 rounded-full shadow-md"
              >
                <span>Join the Sentinel Enclave</span>
                <span className="text-[15px]">→</span>
              </Link>
              <Link
                href="/security"
                onClick={() => triggerHaptic('tap')}
                className="btn-secondary text-[14px] h-11 px-6 rounded-full"
              >
                <span>Read Architecture</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] aspect-square rounded-[36px] overflow-hidden liquid-glass border border-white/80 dark:border-white/10 shadow-2xl p-3 flex items-center justify-center group">
              <div className="relative w-full h-full rounded-[28px] overflow-hidden">
                <Image
                  src="/sentinel-glass-ring.jpg"
                  alt="Sentinel Architecture"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Three Engineering Pillars ───────────────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
              Architectural Values
            </span>
            <h2 className="section-headline text-[var(--text-primary)]">
              Built on First Principles
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)]">
              We reject the illusion of security through prompt whispering. Real trust requires deterministic isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="liquid-glass-card p-7 rounded-[32px] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center">
                <Icon name="shield" size={22} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                Deterministic Enclaves
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                We wrap tool handlers, network sockets, and filesystem accesses in hardware-enforced boundaries. If an agent attempts path traversal or unauthorized network egress, execution terminates instantaneously.
              </p>
            </div>

            <div className="liquid-glass-card p-7 rounded-[32px] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--status-safe-subtle)] text-[var(--status-safe)] flex items-center justify-center">
                <Icon name="box" size={22} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                Immutable Telemetry
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Every prompt, tool invocation, AST parse, and finding is hashed into a write-ahead append-only log. Even administrative accounts cannot alter past security evidence.
              </p>
            </div>

            <div className="liquid-glass-card p-7 rounded-[32px] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--status-warning-subtle)] text-[var(--status-warning)] flex items-center justify-center">
                <Icon name="approval" size={22} />
              </div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                Human Supremacy
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Autonomous systems synthesize fixes, audit configurations, and recommend patches; but human operators hold the keys to commit, approve, and deploy changes to live production.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Trust Certifications & Standards ────────────────────────────── */}
        <section className="liquid-glass-card p-8 sm:p-12 rounded-[36px] text-center space-y-6">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">
            Validated Enterprise Compliance
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-1">
              <div className="text-[16px] font-bold text-[var(--text-primary)]">SOC-2 Type II</div>
              <div className="text-[11px] text-[var(--status-safe)] font-medium">Certified Audited</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-1">
              <div className="text-[16px] font-bold text-[var(--text-primary)]">ISO 27001</div>
              <div className="text-[11px] text-[var(--status-safe)] font-medium">ISMS Compliant</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-1">
              <div className="text-[16px] font-bold text-[var(--text-primary)]">FedRAMP High</div>
              <div className="text-[11px] text-[var(--status-safe)] font-medium">Enclave Ready</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--well)] border border-[var(--border-hairline)] space-y-1">
              <div className="text-[16px] font-bold text-[var(--text-primary)]">NIST SP 800-53</div>
              <div className="text-[11px] text-[var(--status-safe)] font-medium">Aligned Controls</div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

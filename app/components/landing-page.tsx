'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

interface CapabilityCard {
  id: string;
  title: string;
  tag: string;
  description: string;
  href: string;
  icon: IconName;
}

const CAPABILITIES: CapabilityCard[] = [
  {
    id: 'agents',
    title: 'Agents & Passports',
    tag: 'First-Class',
    description: 'Human-readable capabilities, interactive permission trust graphs, shadow mode, and configuration drift detection.',
    href: '/agents',
    icon: 'shield',
  },
  {
    id: 'scans',
    title: 'Scans',
    tag: 'Continuous',
    description: 'Automated vulnerability audits across your codebase, containers, and agent tool handlers.',
    href: '/scans',
    icon: 'scan',
  },
  {
    id: 'findings',
    title: 'Findings',
    tag: 'Zero-Noise',
    description: 'Deterministic boundary break triage with cryptographic trace evidence and risk scoring.',
    href: '/findings',
    icon: 'finding',
  },
  {
    id: 'ai-workspace',
    title: 'AI Workspace',
    tag: 'Agentic',
    description: 'Interactive agentic reasoning, sandboxed analysis, and automated pull-request remediation.',
    href: '/ai-workspace',
    icon: 'code',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    tag: 'Posture',
    description: 'Comprehensive compliance posture metrics, mean-time-to-remediate, and audit durability.',
    href: '/analytics',
    icon: 'activity',
  },
];

export function LandingPage() {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    triggerHaptic('tap');
    const scrollAmount = 340;
    railRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToCapabilities = () => {
    triggerHaptic('tap');
    const el = document.getElementById('capabilities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      {/* Apple-calibrated Global Navigation */}
      <GlobalNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 px-6 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-b from-[var(--accent-blue)]/8 to-transparent rounded-full blur-[140px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Typography & CTAs */}
            <div className="lg:col-span-7 space-y-7 z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-blue-subtle)] border border-[var(--accent-blue)]/20 text-[11px] font-semibold tracking-wide text-[var(--accent-blue)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse" />
                <span>CYBERSECURITY FOR AUTONOMOUS AGENTS</span>
              </div>

              <h1 className="hero-headline text-[var(--text-primary)] max-w-2xl">
                Security that moves with you.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Sentinel delivers precision guardrails, continuous vulnerability auditing, and verifiable evidence for autonomous AI agents and cloud workloads.
              </p>

              {/* Action Buttons: Get Started & Explore Sentinel */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/signup"
                  onClick={() => triggerHaptic('selection')}
                  className="btn-primary text-[14px] h-11 px-7 rounded-full shadow-md font-medium"
                >
                  <span>Get started</span>
                  <span className="text-[15px] leading-none">→</span>
                </Link>

                <button
                  type="button"
                  onClick={scrollToCapabilities}
                  className="inline-flex items-center gap-2 text-[14px] text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)] font-medium px-4 py-2.5 rounded-full hover:bg-[var(--accent-blue-subtle)] transition-colors cursor-pointer"
                >
                  <span>Explore Sentinel</span>
                  <Icon name="arrow" size={13} />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[12px] text-[var(--text-tertiary)]">
                <div className="flex items-center gap-2">
                  <Icon name="check" size={13} className="text-[var(--status-safe)]" />
                  <span>Deterministic Zero-Noise</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="shield" size={13} className="text-[var(--accent-blue)]" />
                  <span>Server-Enforced RBAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="box" size={13} className="text-[var(--text-secondary)]" />
                  <span>Verifiable Evidence Vault</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Crystal Glass Ring Visual */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end z-10">
              <div className="relative w-full max-w-[460px] aspect-square rounded-[36px] overflow-hidden liquid-glass border border-white/80 dark:border-white/10 shadow-2xl p-3 flex items-center justify-center group transition-transform duration-500 hover:scale-[1.01]">
                <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-gradient-to-tr from-[var(--well)] to-transparent">
                  <Image
                    src="/sentinel-glass-ring.jpg"
                    alt="Sentinel Liquid Glass Security Ring"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 460px"
                    className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle inner reflection badge */}
                  <div className="absolute bottom-4 left-4 right-4 liquid-glass-dropdown p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-sm">
                        <Icon name="shield" size={16} />
                      </div>
                      <div>
                        <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">Sentinel Runtime Engine</div>
                        <div className="text-[10.5px] text-[var(--text-tertiary)]">Cryptographically Verified</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Rail Section */}
        <section id="capabilities" className="py-20 border-t border-[var(--border-hairline)] bg-[var(--surface-primary)]">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            {/* Section Header with Carousel Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
                  Precision Architecture
                </span>
                <h2 className="section-headline text-[var(--text-primary)] mt-1">
                  Engineered for Technical Trust
                </h2>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-xl">
                  Every scan, finding, and approval in Sentinel is backed by durable persistence, human-in-the-loop oversight, and cryptographic sessions.
                </p>
              </div>

              {/* Circular Carousel Arrow Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => scrollRail('left')}
                  className="btn-icon w-9 h-9 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-solid)] shadow-xs hover:border-[var(--accent-blue)]"
                  aria-label="Previous capabilities"
                >
                  <Icon name="arrow" size={13} className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail('right')}
                  className="btn-icon w-9 h-9 rounded-full border border-[var(--border-hairline)] bg-[var(--surface-solid)] shadow-xs hover:border-[var(--accent-blue)]"
                  aria-label="Next capabilities"
                >
                  <Icon name="arrow" size={13} />
                </button>
              </div>
            </div>

            {/* Horizontal Capability Rail */}
            <div
              ref={railRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1"
            >
              {CAPABILITIES.map((cap) => (
                <Link
                  key={cap.id}
                  href={cap.href}
                  onClick={() => triggerHaptic('selection')}
                  className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-1 liquid-glass-card p-6 rounded-[28px] flex flex-col justify-between group hover:border-[var(--accent-blue)]/50 transition-all hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors shadow-xs">
                        <Icon name={cap.icon} size={22} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                        {cap.tag}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="card-title text-[17px] text-[var(--text-primary)]">
                        {cap.title}
                      </h3>
                      <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12.5px] font-medium text-[var(--accent-blue)]">
                    <span>Explore {cap.title}</span>
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-blue-subtle)] group-hover:bg-[var(--accent-blue)] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon name="arrow" size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary Section: A more secure tomorrow */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="section-headline text-[var(--text-primary)]">
                A more secure tomorrow.
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                Sentinel watches autonomous agents in execution, intercepts hazardous MCP tool invocations, and gives security engineers absolute control.
              </p>
              <div className="pt-1">
                <Link
                  href="/about"
                  onClick={() => triggerHaptic('selection')}
                  className="inline-flex items-center gap-1.5 text-[14px] text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)] font-medium hover:underline"
                >
                  <span>Learn more</span>
                  <Icon name="arrow" size={12} />
                </Link>
              </div>
            </div>

            {/* Two Floating Glass Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Card 1: Scan in Progress */}
              <div className="liquid-glass-card rounded-[32px] p-7 space-y-6 relative overflow-hidden shadow-lg border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] flex items-center justify-center">
                      <Icon name="scan" size={18} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">Scan in progress</h4>
                      <p className="text-[11.5px] text-[var(--text-secondary)] font-mono">github.com/sentinel-org/core-agent</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20 animate-pulse">
                    RUNNING
                  </span>
                </div>

                {/* Progress bar at 68% */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-mono">
                    <span className="text-[var(--text-secondary)]">Analyzing AST & Tool Handlers</span>
                    <span className="text-[var(--accent-blue)] font-semibold">68%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--well)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-1000"
                      style={{ width: '68%' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-hairline)] text-center">
                  <div className="p-2 rounded-xl bg-[var(--well)]">
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Elapsed</div>
                    <div className="text-[12.5px] font-mono font-medium text-[var(--text-primary)] mt-0.5">01:42</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--well)]">
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Checks</div>
                    <div className="text-[12.5px] font-mono font-medium text-[var(--text-primary)] mt-0.5">142/208</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--well)]">
                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Detected</div>
                    <div className="text-[12.5px] font-mono font-medium text-[var(--status-critical)] mt-0.5">1 issue</div>
                  </div>
                </div>
              </div>

              {/* Card 2: S3 Bucket Exposed */}
              <div className="liquid-glass-card rounded-[32px] p-7 space-y-6 relative overflow-hidden shadow-lg border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--status-critical-subtle)] text-[var(--status-critical)] flex items-center justify-center">
                      <Icon name="shield" size={18} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">S3 bucket exposed</h4>
                      <p className="text-[11.5px] text-[var(--text-secondary)] font-mono">arn:aws:s3:::prod-customer-vault-eu</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--status-critical-subtle)] text-[var(--status-critical)] border border-[var(--status-critical-border)]">
                    CRITICAL
                  </span>
                </div>

                <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                  Public read access detected on production artifact repository without token authentication or origin IP boundary enforcement.
                </p>

                <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">Finding ID: SNT-001</span>
                  <Link
                    href="/findings"
                    onClick={() => triggerHaptic('selection')}
                    className="btn-primary text-[12px] h-8 px-4"
                  >
                    <span>Investigate</span>
                    <span className="text-[13px]">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Complete Public Sitemap Footer */}
      <PublicFooter />
    </div>
  );
}

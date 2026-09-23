'use client';

import React from 'react';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent-blue-subtle)] flex flex-col font-sans">
      <GlobalNav />

      <main className="flex-1 py-12 sm:py-16 px-6 max-w-4xl mx-auto w-full space-y-12">
        <header className="space-y-3 border-b border-[var(--border-hairline)] pb-8">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-blue)] uppercase">
            Universal Usability
          </span>
          <h1 className="page-headline text-[var(--text-primary)]">
            Accessibility Statement
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)]">
            Our commitment to inclusive, universally accessible cybersecurity operations.
          </p>
        </header>

        <div className="space-y-8 text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              WCAG 2.1 Level AA Conformance
            </h2>
            <p>
              Sentinel is engineered to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Every interface surface—from vulnerability inspection trees to approving sensitive code modifications—is evaluated for perceivability, operability, understandability, and robustness.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Keyboard Operability &amp; Focus Trapping
            </h2>
            <p>
              All interactive controls in Sentinel are 100% accessible via keyboard alone. The global Spotlight palette can be invoked anywhere using <kbd className="px-2 py-0.5 rounded bg-[var(--well)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--text-primary)]">⌘K</kbd> or <kbd className="px-2 py-0.5 rounded bg-[var(--well)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--text-primary)]">Ctrl+K</kbd>, navigated with arrow keys, and dismissed with <kbd className="px-2 py-0.5 rounded bg-[var(--well)] border border-[var(--border-hairline)] font-mono text-[11px] text-[var(--text-primary)]">Escape</kbd>. Modal dialogs enforce strict focus trapping to prevent loss of context.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              Reduced Motion Support
            </h2>
            <p>
              Sentinel honors the system-level <code className="text-[11px] font-mono text-[var(--accent-blue)]">prefers-reduced-motion</code> setting. When enabled, all spring transitions, scale bounces, backdrop blurs, and animated radar pulses are instantly replaced with immediate zero-duration state updates to prevent motion sensitivity issues.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
              High Contrast &amp; Semantic Color Usage
            </h2>
            <p>
              Our color system maintains a strict 4.5:1 contrast ratio for all body text and 3:1 for large display headlines against both light (<code className="text-[11px] font-mono">#f5f5f7</code>) and dark (<code className="text-[11px] font-mono">#000000</code>) canvases. Critical security states (e.g. Critical, High, Safe) never rely solely on color; they are always accompanied by textual badges and distinct vector icons.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

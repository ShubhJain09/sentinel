'use client';

import React from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { KEYBOARD_SHORTCUTS } from '@/app/lib/support-content';

export default function KeyboardShortcutsPage() {
  const categories = Array.from(
    new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10 select-none pb-32">
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
          <span className="text-[var(--text-secondary)]">Keyboard Shortcuts</span>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="space-y-3 border-b border-[var(--border-hairline)] pb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
            Productivity &amp; Navigation
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Sentinel Keyboard Shortcuts
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Accelerate your security operations, forensic replays, and investigations with global keyboard hotkeys.
          </p>
        </div>

        {/* ── Shortcuts Grouped Cards ─────────────────────────────────────── */}
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                {cat} Shortcuts
              </h2>

              <div className="bento-card overflow-hidden divide-y divide-[var(--border-hairline)]">
                {KEYBOARD_SHORTCUTS.filter((s) => s.category === cat).map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4 text-[13px]"
                  >
                    <span className="text-[var(--text-primary)] font-medium">
                      {s.description}
                    </span>

                    <div className="flex items-center gap-1 shrink-0 font-mono">
                      {s.keyCombo.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2.5 py-1 rounded-lg bg-[var(--well)] border border-[var(--well-border)] text-[12px] text-[var(--text-primary)] font-semibold shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

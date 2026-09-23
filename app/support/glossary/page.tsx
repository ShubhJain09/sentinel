'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import { GLOSSARY_ITEMS } from '@/app/lib/support-content';

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  const alphabet = Array.from(
    new Set(GLOSSARY_ITEMS.map((item) => item.term[0].toUpperCase()))
  ).sort();

  const filteredItems = GLOSSARY_ITEMS.filter((item) => {
    const matchesLetter =
      selectedLetter === 'ALL' || item.term[0].toUpperCase() === selectedLetter;
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesLetter && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-10 select-none pb-32">
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
          <span className="text-[var(--text-secondary)]">A–Z Security Glossary</span>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="space-y-3 border-b border-[var(--border-hairline)] pb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
            Terminology &amp; Concepts
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            Sentinel Security &amp; AI Glossary
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Standardized definitions for autonomous systems, Model Context Protocol boundaries, prompt injection vectors, and cryptographic audit proofs.
          </p>
        </div>

        {/* ── Search & Alphabet Scrubber ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter terms or concepts…"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setSelectedLetter('ALL');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                selectedLetter === 'ALL'
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              ALL
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedLetter(letter);
                }}
                className={`w-6 h-6 rounded-lg text-[11px] font-mono flex items-center justify-center transition-colors ${
                  selectedLetter === letter
                    ? 'bg-[var(--accent-blue)] text-white'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* ── Terms Grid ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.term}
              className="bento-card p-6 space-y-2 border border-[var(--border-hairline)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {item.term}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)] self-start sm:self-auto">
                  {item.category}
                </span>
              </div>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
                {item.definition}
              </p>
              {item.relatedCategorySlug && (
                <div className="pt-1">
                  <Link
                    href={`/support/${item.relatedCategorySlug}`}
                    className="text-[11.5px] text-[var(--accent-blue)] hover:underline font-medium"
                  >
                    View documentation for {item.category} &rarr;
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

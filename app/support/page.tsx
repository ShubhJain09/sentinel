'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';
import {
  SUPPORT_CATEGORIES,
  WORKFLOW_STAGES,
  searchSupport,
} from '@/app/lib/support-content';

export default function SupportCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);

  const searchResults = searchSupport(searchQuery);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 sm:py-16 space-y-16 select-none pb-32">
        {/* ── Hero Search Section ─────────────────────────────────────────── */}
        <section className="text-center space-y-5 max-w-3xl mx-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] block">
            Sentinel Knowledge Base &amp; Documentation
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            How can we help protect your agents?
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            Comprehensive guides, architectural deep dives, and security specifications for the Sentinel agent containment platform.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Icon
              name="search"
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 16 categories, guides, or error codes…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--surface-solid)] border border-[var(--border-hairline)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-lg focus:outline-none focus:border-[var(--accent-blue)] transition-all"
            />
          </div>

          {/* Quick Filter Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[12px]">
            <span className="text-[var(--text-tertiary)]">Popular:</span>
            {['Agent Passports', 'MCP Traversal', 'Shadow Mode', 'AST Patching'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setSearchQuery(tag);
                }}
                className="px-2.5 py-1 rounded-full well-inset hover:border-[var(--accent-blue)] transition-colors text-[var(--text-secondary)]"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* ── Search Results Dropdown/View (if active) ────────────────────── */}
        {searchQuery.trim() && (
          <section className="bento-card p-6 space-y-4 animate-fade">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Search Results for &ldquo;{searchQuery}&rdquo;
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                {searchResults.length} Articles Found
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-[var(--text-secondary)]">
                No articles matched your search. Try searching by keyword or browse the categories below.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-hairline)]">
                {searchResults.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/support/${article.categoryId}/${article.slug}`}
                    onClick={() => triggerHaptic('selection')}
                    className="block py-3.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-[14px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                        {article.title}
                      </h4>
                      <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                        {article.readTime}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {article.summary}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Visual Core Workflow Guide: How Sentinel Protects an AI Agent ── */}
        <section className="bento-card p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--accent-blue)]">
              Architecture &amp; Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              How Sentinel Protects an AI Agent
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)]">
              An interactive 5-stage lifecycle ensuring least privilege, containment, and verified remediation.
            </p>
          </div>

          {/* Workflow Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {WORKFLOW_STAGES.map((stg, idx) => (
              <button
                key={stg.step}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedWorkflowStep(idx);
                }}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                  selectedWorkflowStep === idx
                    ? 'bg-[var(--surface-solid)] border-[var(--accent-blue)] shadow-md ring-2 ring-[var(--accent-blue)]/15'
                    : 'bg-[var(--surface-solid)] border-[var(--border-hairline)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[var(--accent-blue)]">
                    {stg.step}
                  </span>
                  <Icon name={stg.icon} size={15} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1">
                  {stg.title}
                </div>
              </button>
            ))}
          </div>

          {/* Active Stage Detailed Explainer */}
          <div className="p-6 rounded-2xl well-inset space-y-2 animate-fade">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] font-bold">
                Stage {WORKFLOW_STAGES[selectedWorkflowStep].step}
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {WORKFLOW_STAGES[selectedWorkflowStep].subtitle}
              </h3>
            </div>
            <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">
              {WORKFLOW_STAGES[selectedWorkflowStep].description}
            </p>
          </div>
        </section>

        {/* ── 16 Knowledge Base Categories Grid ───────────────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Browse by Category
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                Explore deep technical specifications and guides across all 16 platform modules.
              </p>
            </div>
            <span className="font-mono text-[12px] text-[var(--text-tertiary)]">
              16 Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPORT_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/support/${cat.id}`}
                onClick={() => triggerHaptic('selection')}
                className="bento-card p-5 space-y-3 hover:shadow-md transition-all group border border-[var(--border-hairline)]"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color}`}
                >
                  <Icon name={cat.icon} size={18} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11.5px] text-[var(--text-tertiary)] font-medium">
                  <span>View Guides &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick Resource Links: Glossary, Shortcuts, Contact ───────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/support/glossary"
            onClick={() => triggerHaptic('selection')}
            className="bento-card p-6 space-y-2 hover:shadow-md transition-all group border border-[var(--border-hairline)]"
          >
            <div className="flex items-center gap-2 text-[var(--accent-blue)] font-semibold text-sm">
              <Icon name="sliders" size={16} />
              <span>A–Z Security Glossary</span>
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Clear definitions for agent containment, prompt injection, AST patches, and Model Context Protocol terms.
            </p>
          </Link>

          <Link
            href="/support/keyboard-shortcuts"
            onClick={() => triggerHaptic('selection')}
            className="bento-card p-6 space-y-2 hover:shadow-md transition-all group border border-[var(--border-hairline)]"
          >
            <div className="flex items-center gap-2 text-[var(--accent-blue)] font-semibold text-sm">
              <Icon name="sliders" size={16} />
              <span>Keyboard Shortcuts</span>
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Speed up investigations and triage with keyboard hotkeys for navigation, scanning, and replay scrubbers.
            </p>
          </Link>

          <Link
            href="/support/contact"
            onClick={() => triggerHaptic('selection')}
            className="bento-card p-6 space-y-2 hover:shadow-md transition-all group border border-[var(--border-hairline)]"
          >
            <div className="flex items-center gap-2 text-[var(--accent-blue)] font-semibold text-sm">
              <Icon name="shield" size={16} />
              <span>Security Escalation &amp; Support</span>
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
              Submit an urgent containment assistance request or contact the Sentinel core engineering team.
            </p>
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

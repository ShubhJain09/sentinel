import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { getSession } from '@/app/lib/auth';
import {
  SUPPORT_CATEGORIES,
  getCategoryById,
  getArticlesForCategory,
} from '@/app/lib/support-content';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryById(category);
  return {
    title: cat ? `SENTINEL — ${cat.title} Guides` : 'SENTINEL — Support Category',
    description: cat ? cat.description : 'Technical support documentation.',
  };
}

export default async function SupportCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const session = await getSession();

  // Normalization for common aliases
  const categoryId =
    rawCategory === 'security-scans'
      ? 'scans'
      : rawCategory === 'findings-alerts'
      ? 'findings'
      : rawCategory === 'approvals-governance'
      ? 'approvals'
      : rawCategory === 'integrations-mcp'
      ? 'integrations'
      : rawCategory === 'evidence-vault'
      ? 'evidence'
      : rawCategory;

  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const articles = getArticlesForCategory(categoryId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav session={session} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-12 select-none pb-32">
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
          <span className="text-[var(--text-secondary)]">{category.title}</span>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="space-y-3 border-b border-[var(--border-hairline)] pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
              Category
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {category.title}
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* ── Articles List ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Available Guides &amp; Specifications
            </h2>
            <span className="text-[11.5px] font-mono text-[var(--text-tertiary)]">
              {articles.length} Article{articles.length === 1 ? '' : 's'}
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="bento-card p-10 text-center space-y-2">
              <Icon name="sliders" size={24} className="mx-auto text-[var(--text-tertiary)]" />
              <p className="text-[13px] text-[var(--text-secondary)]">
                Documentation articles for this category are being indexed. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/support/${category.id}/${art.slug}`}
                  className="bento-card p-6 block hover:shadow-md transition-all group border border-[var(--border-hairline)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                      {art.title}
                    </h3>
                    <span className="text-[11.5px] font-mono text-[var(--text-tertiary)] shrink-0">
                      {art.readTime}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {art.summary}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)]">
                    <span>Read Article</span>
                    <Icon name="arrow" size={12} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Other Categories ────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-[var(--border-hairline)] space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            Explore Other Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_CATEGORIES.filter((c) => c.id !== category.id).map((other) => (
              <Link
                key={other.id}
                href={`/support/${other.id}`}
                className="px-3 py-1.5 rounded-full well-inset text-[12px] hover:border-[var(--accent-blue)] transition-colors text-[var(--text-secondary)]"
              >
                {other.title}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

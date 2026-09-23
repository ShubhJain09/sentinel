import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GlobalNav } from '@/app/components/global-nav';
import { PublicFooter } from '@/app/components/public-footer';
import { Icon } from '@/app/components/ui-icon';
import { getSession } from '@/app/lib/auth';
import {
  getCategoryById,
  getArticle,
  getArticlesForCategory,
} from '@/app/lib/support-content';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; article: string }>;
}): Promise<Metadata> {
  const { category: catId, article: slug } = await params;
  const article = getArticle(catId, slug);
  return {
    title: article ? `SENTINEL — ${article.title}` : 'SENTINEL Documentation',
    description: article ? article.summary : 'Technical support documentation.',
  };
}

export default async function SupportArticlePage({
  params,
}: {
  params: Promise<{ category: string; article: string }>;
}) {
  const { category: catId, article: slug } = await params;
  const session = await getSession();

  const category = getCategoryById(catId);
  const article = getArticle(catId, slug);

  if (!category || !article) {
    notFound();
  }

  const relatedArticles = getArticlesForCategory(catId).filter(
    (a) => a.slug !== article.slug
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent-blue)] selection:text-white">
      <GlobalNav session={session} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10 select-none pb-32">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-[12.5px] text-[var(--text-tertiary)] flex-wrap">
          <Link
            href="/support"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 font-medium"
          >
            <Icon name="arrow" size={11} className="rotate-180" />
            <span>Support</span>
          </Link>
          <span>/</span>
          <Link
            href={`/support/${category.id}`}
            className="hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            {category.title}
          </Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)] truncate max-w-xs">{article.title}</span>
        </div>

        {/* ── Article Header ──────────────────────────────────────────────── */}
        <header className="space-y-4 border-b border-[var(--border-hairline)] pb-8">
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-tertiary)]">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] font-bold uppercase">
              {category.title}
            </span>
            <span>&bull;</span>
            <span>{article.readTime}</span>
            <span>&bull;</span>
            <span>Updated {article.lastUpdated}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.15]">
            {article.title}
          </h1>

          <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed font-normal">
            {article.summary}
          </p>
        </header>

        {/* ── Article Body (Clean Typography) ─────────────────────────────── */}
        <article className="prose prose-zinc dark:prose-invert max-w-none text-[14.5px] leading-relaxed space-y-6">
          <div className="p-6 rounded-2xl well-inset space-y-4 font-sans">
            <div className="space-y-3 whitespace-pre-line text-[14px] text-[var(--text-primary)] leading-relaxed">
              {article.content.trim()}
            </div>
          </div>
        </article>

        {/* ── Helpful Feedback Box ────────────────────────────────────────── */}
        <div className="bento-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Was this documentation helpful?
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Your feedback directly shapes Sentinel security tooling and developer docs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary text-[12px] h-8 px-3.5 cursor-pointer"
            >
              <span>Yes, helpful</span>
            </button>
            <button
              type="button"
              className="btn-secondary text-[12px] h-8 px-3.5 cursor-pointer"
            >
              <span>Needs clarification</span>
            </button>
          </div>
        </div>

        {/* ── Related Articles in this Category ────────────────────────────── */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[var(--border-hairline)]">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Related Articles in {category.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/support/${category.id}/${rel.slug}`}
                  className="bento-card p-4 space-y-1 block hover:border-[var(--accent-blue)] transition-all"
                >
                  <h4 className="text-[13.5px] font-semibold text-[var(--text-primary)]">
                    {rel.title}
                  </h4>
                  <p className="text-[11.5px] text-[var(--text-secondary)] line-clamp-2">
                    {rel.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

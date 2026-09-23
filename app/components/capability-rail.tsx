'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/app/components/ui-icon';
import { triggerHaptic } from '@/app/lib/haptics';

export interface CapabilityItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: IconName;
  badge?: string;
}

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    subtitle: 'Security Posture',
    href: '/overview',
    icon: 'overview',
  },
  {
    id: 'scans',
    title: 'Scans',
    subtitle: 'Runtime Audits',
    href: '/scans',
    icon: 'scan',
  },
  {
    id: 'findings',
    title: 'Findings',
    subtitle: 'Boundary Breaks',
    href: '/findings',
    icon: 'finding',
    badge: 'Active',
  },
  {
    id: 'investigations',
    title: 'Investigations',
    subtitle: 'Behavioral Traces',
    href: '/investigations',
    icon: 'search',
  },
  {
    id: 'evidence',
    title: 'Evidence',
    subtitle: 'Verifiable Vault',
    href: '/evidence',
    icon: 'box',
  },
  {
    id: 'approvals',
    title: 'Approvals',
    subtitle: 'Human in the Loop',
    href: '/approvals',
    icon: 'approval',
    badge: 'Oversight',
  },
  {
    id: 'remediation',
    title: 'Remediation',
    subtitle: 'Safe Code Patches',
    href: '/remediation',
    icon: 'check',
  },
  {
    id: 'retests',
    title: 'Retests',
    subtitle: 'Deterministic Checks',
    href: '/retests',
    icon: 'refresh',
  },
  {
    id: 'ai-workspace',
    title: 'AI Workspace',
    subtitle: 'Leased Agents & Tools',
    href: '/ai-workspace',
    icon: 'code',
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Exposure Metrics',
    href: '/analytics',
    icon: 'activity',
  },
  {
    id: 'activity',
    title: 'Activity',
    subtitle: 'Audit Trail',
    href: '/activity',
    icon: 'clock',
  },
];

export function CapabilityRail() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    triggerHaptic('tap');
    const scrollAmount = 320;
    railRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group w-full py-4">
      {/* Left Circular Arrow */}
      {canScrollLeft && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scroll('left')}
            className="btn-carousel"
            aria-label="Scroll left"
          >
            <Icon name="arrow" size={14} className="rotate-180" />
          </button>
        </div>
      )}

      {/* Right Circular Arrow */}
      {canScrollRight && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={() => scroll('right')}
            className="btn-carousel"
            aria-label="Scroll right"
          >
            <Icon name="arrow" size={14} />
          </button>
        </div>
      )}

      {/* Horizontal Rail Container */}
      <div
        ref={railRef}
        onScroll={checkScroll}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth px-6 sm:px-8 py-2"
      >
        {CAPABILITIES.map((cap) => {
          const isActive = pathname === cap.href || pathname.startsWith(`${cap.href}/`);
          return (
            <Link
              key={cap.id}
              href={cap.href}
              onClick={() => triggerHaptic('selection')}
              className={`shrink-0 flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl w-[124px] sm:w-[136px] h-[132px] sm:h-[142px] transition-all text-center relative select-none ${
                isActive
                  ? 'bg-[var(--surface-solid)] shadow-md border-b-2 border-b-[var(--accent-blue)] scale-[1.02]'
                  : 'bg-[var(--surface-solid)]/70 hover:bg-[var(--surface-solid)] hover:shadow-sm hover:-translate-y-1 active:scale-[0.98]'
              }`}
            >
              {cap.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)]">
                  {cap.badge}
                </span>
              )}

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                    : 'bg-[var(--well)] text-[var(--accent-blue)] group-hover:bg-[var(--accent-blue-subtle)]'
                }`}
              >
                <Icon name={cap.icon} size={20} />
              </div>

              <div className="space-y-0.5 mt-1">
                <span className="block text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
                  {cap.title}
                </span>
                <span className="block text-[10.5px] text-[var(--text-secondary)] line-clamp-1">
                  {cap.subtitle}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

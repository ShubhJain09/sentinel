'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { triggerHaptic } from '@/app/lib/haptics';

interface HelpPopoverProps {
  title: string;
  description: string;
  articleHref: string;
  articleLabel?: string;
}

export function HelpPopover({
  title,
  description,
  articleHref,
  articleLabel = 'Learn more in documentation',
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('tap');
          setOpen(!open);
        }}
        className="w-4 h-4 rounded-full bg-[var(--well)] hover:bg-[var(--surface-selected)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-hairline)] text-[10px] font-mono flex items-center justify-center transition-colors cursor-pointer ml-1 select-none"
        title="Contextual Help"
        aria-label={`Help: ${title}`}
      >
        ?
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3.5 liquid-glass-dropdown shadow-xl z-50 animate-fade text-left space-y-2 select-none"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-1.5">
            <span className="text-[12px] font-semibold text-[var(--text-primary)]">
              {title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              &times;
            </button>
          </div>

          <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          <Link
            href={articleHref}
            onClick={() => {
              triggerHaptic('tap');
              setOpen(false);
            }}
            className="text-[11px] text-[var(--accent-blue)] hover:underline font-medium block pt-1 border-t border-[var(--border-hairline)]"
          >
            {articleLabel} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

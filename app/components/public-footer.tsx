import React from 'react';
import Link from 'next/link';
import { SentinelLogo } from '@/app/components/sentinel-logo';

export function PublicFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`w-full border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] text-[12px] select-none ${className}`}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 space-y-12">
        {/* Sitemap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Product */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
              Product
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/overview" className="hover:text-[var(--text-primary)] transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/scans" className="hover:text-[var(--text-primary)] transition-colors">
                  Scans
                </Link>
              </li>
              <li>
                <Link href="/findings" className="hover:text-[var(--text-primary)] transition-colors">
                  Findings
                </Link>
              </li>
              <li>
                <Link href="/investigations" className="hover:text-[var(--text-primary)] transition-colors">
                  Investigations
                </Link>
              </li>
              <li>
                <Link href="/evidence" className="hover:text-[var(--text-primary)] transition-colors">
                  Evidence
                </Link>
              </li>
              <li>
                <Link href="/approvals" className="hover:text-[var(--text-primary)] transition-colors">
                  Approvals
                </Link>
              </li>
              <li>
                <Link href="/ai-workspace" className="hover:text-[var(--text-primary)] transition-colors">
                  AI Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Account */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
              Account
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="hover:text-[var(--text-primary)] transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[var(--text-primary)] transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-[var(--text-primary)] transition-colors">
                  Notifications
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
              Resources
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/support/scans" className="hover:text-[var(--text-primary)] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support/getting-started" className="hover:text-[var(--text-primary)] transition-colors">
                  Getting Started
                </Link>
              </li>
              <li>
                <Link href="/activity" className="hover:text-[var(--text-primary)] transition-colors">
                  What&apos;s New
                </Link>
              </li>
              <li>
                <Link href="/support/system-status" className="hover:text-[var(--text-primary)] transition-colors">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Security */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
              Security
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/security#trust" className="hover:text-[var(--text-primary)] transition-colors">
                  Trust &amp; Invariants
                </Link>
              </li>
              <li>
                <Link href="/security#disclosure" className="hover:text-[var(--text-primary)] transition-colors">
                  Responsible Disclosure
                </Link>
              </li>
              <li>
                <Link href="/security#audit" className="hover:text-[var(--text-primary)] transition-colors">
                  Audit &amp; Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
              Company
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  About Sentinel
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-[var(--text-primary)] transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11.5px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-3">
            <SentinelLogo size={18} showWordmark={true} wordmarkClassName="text-[13px] font-semibold" />
            <span>&copy; {new Date().getFullYear()} Sentinel. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/security" className="hover:text-[var(--text-primary)] transition-colors">
              Security
            </Link>
            <Link href="/accessibility" className="hover:text-[var(--text-primary)] transition-colors">
              Accessibility
            </Link>
            <span className="text-[var(--text-tertiary)]">India (English)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

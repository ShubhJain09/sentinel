import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SentinelLogo } from "@/app/components/sentinel-logo";

export const metadata: Metadata = {
  title: "Sentinel — Secure Workspace Access",
  description: "Sign in to your Sentinel AI agent security workspace.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[var(--bg-canvas)] p-6 md:p-12 overflow-hidden selection:bg-[var(--accent-blue-subtle)] font-sans">
      {/* Ambient 3D Glass Wave Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image
          src="/sentinel-glass-wave.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 dark:opacity-20 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-canvas)]/60 via-transparent to-[var(--bg-canvas)]" />
      </div>

      {/* Top Brand Mark */}
      <header className="pt-4 z-10">
        <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <SentinelLogo size={36} showWordmark={true} />
        </Link>
      </header>

      {/* Centered Auth Card Container */}
      <main className="w-full max-w-[440px] my-auto py-8 z-10">
        {children}
      </main>

      {/* Pinned Bottom Legal / Compliance Footer */}
      <footer className="pt-8 pb-4 text-center border-t border-[var(--border-hairline)] w-full max-w-xl flex flex-col sm:flex-row items-center justify-between text-[11.5px] text-[var(--text-tertiary)] gap-3 z-10">
        <span>© 2026 Sentinel Security Inc. All rights reserved.</span>
        <div className="flex items-center gap-3 font-medium">
          <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
            Terms
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link href="/security" className="hover:text-[var(--text-secondary)] transition-colors">
            Security
          </Link>
          <span>·</span>
          <Link href="/support" className="hover:text-[var(--text-secondary)] transition-colors">
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}

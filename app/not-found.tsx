import Link from 'next/link';
import { Icon } from './components/ui-icon';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-blue)] mb-4 shadow-sm">
        <Icon name="search" size={24} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        Page Not Found
      </h1>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-sm">
        The requested route or resource does not exist within this Sentinel security boundary.
      </p>
      <div className="mt-6">
        <Link
          href="/overview"
          className="btn-primary"
        >
          Return to Overview
        </Link>
      </div>
    </div>
  );
}

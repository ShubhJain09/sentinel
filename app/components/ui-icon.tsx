import type { ReactNode } from "react";

export type IconName = "shield" | "overview" | "scan" | "finding" | "approval" | "settings" | "arrow" | "plus" | "check" | "chevron" | "box" | "clock" | "close" | "download" | "search" | "lock" | "code";
export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.5c0 4.2 3.1 7.5 7.5 9.5 4.4-2 7.5-5.3 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.3 2.3 4.7-5"/></>,
    overview: <><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.8"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.8"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.8"/><rect x="14" y="14" width="6.5" height="6.5" rx="1.8"/></>,
    scan: <><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M3 12h18"/><path d="M8 8h8v8H8z" opacity=".35"/></>,
    finding: <><path d="M12 3 2.8 19a1 1 0 0 0 .9 1.5h16.6a1 1 0 0 0 .9-1.5L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
    approval: <><rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4V2h6v2m-6 9 2 2 4-4"/></>,
    settings: <><path d="m9 3-.7 2.3-2 .9L4 5.8l-2 3.4 1.6 1.8v2L2 14.8l2 3.4 2.3-.4 2 .9L9 21h6l.7-2.3 2-.9 2.3.4 2-3.4-1.6-1.8v-2L22 9.2l-2-3.4-2.3.4-2-.9L15 3Z"/><circle cx="12" cy="12" r="3"/></>,
    arrow: <path d="M4 12h15m-5-5 5 5-5 5"/>, plus: <path d="M12 5v14M5 12h14"/>, check: <path d="m5 12 4 4L19 6"/>, chevron: <path d="m9 5 7 7-7 7"/>,
    box: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10v9M3 8l9 5 9-5M8 5l9 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, close: <path d="m6 6 12 12M6 18 18 6"/>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></>, search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
    code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>;
}


import type { ReactNode } from "react";

export type IconName =
  | "shield"
  | "overview"
  | "scan"
  | "finding"
  | "approval"
  | "settings"
  | "arrow"
  | "arrow-left"
  | "arrow-right"
  | "plus"
  | "check"
  | "chevron"
  | "box"
  | "clock"
  | "close"
  | "download"
  | "search"
  | "lock"
  | "code"
  | "sun"
  | "moon"
  | "bell"
  | "user"
  | "sparkles"
  | "terminal"
  | "activity"
  | "cpu"
  | "sliders"
  | "refresh"
  | "menu"
  | "globe";

export function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number | string;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    shield: (
      <>
        <path d="M12 2.5 4.5 5.5v6c0 4.8 3.2 8.5 7.5 10 4.3-1.5 7.5-5.2 7.5-10v-6L12 2.5Z" />
        <path d="m9 12 2 2 4.5-4.5" />
      </>
    ),
    overview: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" />
      </>
    ),
    scan: (
      <>
        <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v2.5m0 13V21m-9-9h2.5m13 0H21" opacity=".4" />
      </>
    ),
    finding: (
      <>
        <path d="M10.3 3.8a2 2 0 0 1 3.4 0l8.1 14.2a2 2 0 0 1-1.7 3H3.9a2 2 0 0 1-1.7-3L10.3 3.8Z" />
        <path d="M12 9v4.5m0 3.5h.01" />
      </>
    ),
    approval: (
      <>
        <rect x="4.5" y="3.5" width="15" height="17" rx="3.5" />
        <path d="m8.5 12 2.3 2.3 4.7-4.6" />
        <path d="M9 3.5V2h6v1.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    "arrow-left": <path d="M19 12H5m6 6-6-6 6-6" />,
    "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    check: <path d="m4.5 12.5 5 5 10-10" />,
    chevron: <path d="m9 6 6 6-6 6" />,
    box: (
      <>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 12v10" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    download: (
      <>
        <path d="M12 3v13m-5-5 5 5 5-5" />
        <path d="M4 17v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 20v-3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    code: (
      <>
        <path d="m16 18 6-6-6-6M8 6l-6 6 6 6m6-14-4 16" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41" />
      </>
    ),
    moon: <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z" />,
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a2 2 0 0 0 3.4 0" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8L5.3 9.7l4.8-1.9Z" />
        <path d="m19 16 .9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9Z" opacity=".6" />
      </>
    ),
    terminal: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3.5" />
        <path d="m7 9 3 3-3 3m5 0h4" />
      </>
    ),
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    cpu: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
        <path d="M9 1v3m6-3v3m-6 17v3m6-3v3M1 9h3m-3 6h3m17-6h3m-3 6h3" />
      </>
    ),
    sliders: (
      <>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="12" cy="10" r="2" />
        <circle cx="20" cy="14" r="2" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </>
    ),
    menu: (
      <>
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./ui-icon";
import type { Finding, Scan } from "./demo-data";

export function Mark({ small = false }: { small?: boolean }) {
  return <svg className={small ? "brand-mark small" : "brand-mark"} viewBox="0 0 40 44" fill="none" aria-hidden="true"><path d="m20 2 17 6.5V21c0 9-8 16-17 21C11 37 3 30 3 21V8.5Z" stroke="currentColor" strokeWidth="1.4"/><path d="m16 11 12 7v5l-12-7v5l-4-2v-6l4-2Zm8 21-12-7v-5l12 7v-5l4 2v6l-4 2Z" fill="currentColor"/></svg>;
}

export function Status({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "mint" | "amber" | "red" | "blue" }) {
  return <span className={`status ${tone}`}><span className="status-dot"/>{children}</span>;
}

export function Modal({ title, eyebrow = "SENTINEL / DEMO ENVIRONMENT", children, onClose, wide = false }: { title: string; eyebrow?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previousFocus?.focus(); };
  }, []);
  return <dialog ref={ref} aria-label={title} className={`dialog ${wide ? "dialog-wide" : ""}`} onCancel={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}><div className="dialog-chrome"><span className="eyebrow">{eyebrow}</span><button autoFocus className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" size={18}/></button></div><h2>{title}</h2>{children}</dialog>;
}

export function ScanList({ scans, compact, onSelect, brief = false }: { scans: Scan[]; compact: boolean; onSelect: (scan: Scan) => void; brief?: boolean }) {
  return <div className={`scan-list ${compact ? "is-compact" : ""} ${brief ? "brief" : ""}`}>
    {!brief && <div className="table-labels" aria-hidden="true"><span>ENVIRONMENT</span><span>REPLAY</span><span>RESULT</span><span/></div>}
    {scans.map(scan => <button className="scan-row" key={scan.id} onClick={() => onSelect(scan)}>
      <span className="scan-identity"><span className={`environment-icon ${scan.icon}`}><Icon name={scan.icon} size={20}/></span><span><strong>{scan.name}</strong><small>{scan.kind}<span className="separator">/</span>{scan.checks} checks</small></span></span>
      {!brief && <span className="scan-date"><span className="mono">{scan.id}</span><small>{scan.time}</small></span>}
      <Status tone={scan.status === "Passed" ? "mint" : "amber"}>{scan.status}</Status><Icon name="arrow" className="row-arrow" size={16}/>
    </button>)}
  </div>;
}

export function Evidence({ finding, onReview, onExport }: { finding: Finding; onReview: () => void; onExport: () => void }) {
  return <article className="evidence" key={finding.id}>
    <div className="evidence-topline"><span className="mono">{finding.id}</span><Status tone={finding.severity === "High" ? "red" : "amber"}>{finding.severity} priority</Status></div>
    <h2>{finding.title}</h2><p className="body-copy">{finding.detail}</p>
    <div className="evidence-terminal"><div className="terminal-top"><span><Icon name="code" size={15}/>Observation</span><span className="mono">SAMPLE TRACE</span></div><div className="terminal-line"><span className="line-number">01</span><code>{finding.observed}</code></div><div className="terminal-result"><span className="status-dot"/>{finding.id === "SNT-001" ? "File boundary crossed in sample" : "Instruction boundary crossed in sample"}</div></div>
    <div className="evidence-notes"><div><span className="note-number">01</span><div><h3>Expected behavior</h3><p>{finding.expected}</p></div></div><div><span className="note-number">02</span><div><h3>Proposed improvement</h3><p>{finding.fix}</p></div></div></div>
    <div className="evidence-footer"><span><Icon name="box" size={14}/>Illustrative evidence</span><div><button className="text-button" onClick={onExport}><Icon name="download" size={15}/>Export</button>{finding.id === "SNT-001" && <button className="button button-primary" onClick={onReview}>Review fix<Icon name="arrow" size={15}/></button>}</div></div>
  </article>;
}

export function ChangePreview() {
  return <div className="change-preview"><div className="terminal-top"><span><Icon name="code" size={16}/>filesystem / read_file</span><span className="mono">PROPOSED LOGIC</span></div><div className="diff-lines"><div className="diff-removed"><span>01</span><b>−</b><code>Open the requested file directly.</code></div><div className="diff-added"><span>01</span><b>+</b><code>Resolve the file’s full path.</code></div><div className="diff-added"><span>02</span><b>+</b><code>Confirm it stays inside the workspace.</code></div><div className="diff-added"><span>03</span><b>+</b><code>Reject access beyond that boundary.</code></div></div><div className="diff-foot"><span className="mint-text">+ 3 additions</span><span className="red-text">− 1 removal</span><span>Illustrative change</span></div></div>;
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="empty-state"><span className="empty-symbol"><Icon name="search" size={25}/></span><h3>No matching investigations.</h3><p>Try a different environment name or clear your filters.</p><button className="button button-secondary" onClick={onReset}>Clear filters<Icon name="arrow" size={15}/></button></div>;
}

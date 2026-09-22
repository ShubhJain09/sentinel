"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "./ui-icon";
import { Shield } from "./shield";
import { ChangePreview, EmptyState, Evidence, Mark, Modal, ScanList, Status } from "./primitives";
import { findings, initialScans, steps, type Finding, type Scan, type Section } from "./demo-data";

const navigation: { name: Section; icon: IconName; caption: string }[] = [
  { name: "Overview", icon: "overview", caption: "Command center" },
  { name: "Scans", icon: "scan", caption: "Investigations" },
  { name: "Findings", icon: "finding", caption: "Evidence & insights" },
  { name: "Approvals", icon: "approval", caption: "Human oversight" },
  { name: "Settings", icon: "settings", caption: "Workspace controls" },
];
const pageCopy: Record<Section, { title: string; description: string }> = {
  Overview: { title: "See beyond the surface.", description: "Know what your agents can do. And what they actually do." },
  Scans: { title: "Every investigation. In focus.", description: "Launch, inspect, and revisit your security investigations." },
  Findings: { title: "Evidence over assumptions.", description: "Follow the trace. Understand the boundary. Decide what comes next." },
  Approvals: { title: "Intelligence meets judgment.", description: "Understand the change before you give it the green light." },
  Settings: { title: "Your workspace. Your parameters.", description: "Fine-tune your environment and see what’s connected." },
};

export default function Sentinel() {
  const [section, setSection] = useState<Section>("Overview");
  const [scans, setScans] = useState<Scan[]>(initialScans);
  const [query, setQuery] = useState("");
  const [scanFilter, setScanFilter] = useState("All scans");
  const [filter, setFilter] = useState("All findings");
  const [activeFinding, setActiveFinding] = useState(findings[0]);
  const [newScan, setNewScan] = useState(false);
  const [target, setTarget] = useState("Filesystem sandbox");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Finding | null>(null);
  const [passedScan, setPassedScan] = useState<Scan | null>(null);
  const [review, setReview] = useState(false);
  const [decision, setDecision] = useState<"pending" | "approved" | "declined">("pending");
  const [toast, setToast] = useState("");
  const [compact, setCompact] = useState(false);
  const [motion, setMotion] = useState(true);
  const [guide, setGuide] = useState(false);
  const [exportError, setExportError] = useState(false);
  const approvalCount = decision === "pending" ? 1 : 0;
  const visibleScans = scans.filter(scan => scan.name.toLowerCase().includes(query.toLowerCase()) && (scanFilter === "All scans" || scan.status === scanFilter));
  const visibleFindings = findings.filter(finding => filter === "All findings" || finding.severity === filter);

  useEffect(() => {
    if (!running || step >= steps.length) return;
    const timer = window.setTimeout(() => setStep(current => current + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, step]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(next: Section) { setSection(next); setQuery(""); }
  function openScan(sampleTarget?: string) {
    if (sampleTarget) setTarget(sampleTarget);
    setStep(0); setRunning(false); setNewScan(true);
  }
  function finishScan() {
    setScans(previous => [{ id: `SCAN-${String(previous.length + 1).padStart(3, "0")}`, name: target, kind: "Demo replay", icon: "scan", time: "Sample · just now", status: "Needs review", checks: target === "Filesystem sandbox" ? 12 : 8 }, ...previous]);
    setRunning(false); setNewScan(false); setSection("Scans"); setQuery(""); setScanFilter("All scans");
    setToast("Demo complete. Your sample investigation is ready.");
  }
  function selectScan(scan: Scan) {
    if (scan.status === "Passed") setPassedScan(scan);
    else setSelected(findings[scan.name === "Research assistant" ? 1 : 0]);
  }
  function exportReport() {
    let url: string | undefined;
    try {
      const blob = new Blob([JSON.stringify({ product: "Sentinel", demo: true, note: "Illustrative sample data. No real security scan was performed.", scans, findings, approval: decision }, null, 2)], { type: "application/json" });
      url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "sentinel-demo-report.json"; link.click();
      setExportError(false); setToast("Sample report exported.");
    } catch { setExportError(true); }
    finally { if (url) { const completedUrl = url; window.setTimeout(() => URL.revokeObjectURL(completedUrl), 1000); } }
  }
  function decide(value: "approved" | "declined") {
    setDecision(value); setReview(false); setToast(`Demo fix ${value}. No real files were changed.`);
  }

  return <div className={`sentinel-shell ${!motion ? "motion-off" : ""}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="ambient-field" aria-hidden="true"/>
    <aside className="navigation-rail" aria-label="Workspace navigation">
      <button className="brand" aria-label="Sentinel home" onClick={() => navigate("Overview")}><Mark/><span><strong>SENTINEL</strong><small>AGENT SECURITY</small></span></button>
      <div className="rail-divider"/>
      <div className="workspace-selector"><span className="workspace-avatar">S</span><span><strong>Personal workspace</strong><small>Shubh Mohta</small></span><span className="workspace-indicator"/></div>
      <span className="rail-label">WORKSPACE</span>
      <nav aria-label="Main navigation">{navigation.map(item => <button key={item.name} className={`nav-button ${section === item.name ? "is-active" : ""} ${item.name === "Settings" ? "settings-nav" : ""}`} aria-label={item.name} title={item.name} aria-current={section === item.name ? "page" : undefined} onClick={() => navigate(item.name)}><Icon name={item.icon} size={19}/><span>{item.name}</span>{item.name === "Findings" && <b>2</b>}{item.name === "Approvals" && approvalCount > 0 && <b>{approvalCount}</b>}</button>)}</nav>
      <div className="rail-bottom"><div className="connection-mini"><span className="connection-ring"/><div><strong>Local environment</strong><span>Agent not connected</span></div></div><button className="rail-guide" onClick={() => setGuide(true)}><Icon name="code" size={16}/><span>Explore the workflow</span><Icon name="arrow" size={14}/></button><div className="rail-profile"><span>SM</span><div><strong>Shubh Mohta</strong><small>Personal workspace</small></div><Icon name="lock" size={13}/></div></div>
    </aside>

    <div className="main-window">
      <header className="window-toolbar"><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{section}</strong></div><div className="toolbar-end"><span className="preview-pill"><span className="status-dot"/>DEMO ENVIRONMENT</span><span className="toolbar-divider"/><span className="version">LOCAL <span className="mono">01</span></span></div></header>
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="screen" key={section}>
          <div className={`screen-heading ${section === "Overview" ? "overview-heading" : ""}`}><div><span className="eyebrow">{navigation.find(item => item.name === section)?.caption}</span><h1>{section}</h1></div><div className="heading-actions">{section === "Scans" && <button className="button button-secondary" onClick={exportReport}><Icon name="download" size={16}/><span>Export report</span></button>}{section !== "Settings" && <button className="button button-primary" onClick={() => openScan()}><Icon name="plus" size={17}/>New scan</button>}</div></div>

          {section === "Overview" && <>
            <section className="overview-stage" aria-labelledby="hero-title"><div className="hero-copy"><span className="hero-kicker"><span className="signal-dot"/>CLARITY AT EVERY BOUNDARY</span><h2 id="hero-title">See beyond<br/><span>the surface.</span></h2><p>{pageCopy.Overview.description}</p><div className="hero-actions"><button className="button button-silver" onClick={() => openScan()}>Launch demo scan<Icon name="arrow" size={17}/></button><button className="hero-guide" onClick={() => setGuide(true)}>How it works<Icon name="chevron" size={13}/></button></div><span className="hero-disclosure"><Icon name="box" size={13}/>Isolated sample targets. No live systems.</span></div><div className="hero-visual"><div className="visual-coordinate top"><span className="mono">S / 01</span><span>PERMISSION BOUNDARY</span></div><Shield/><div className="visual-coordinate bottom"><span><span className="signal-dot"/>DEMO CORE READY</span><span className="mono">SANDBOXED</span></div></div></section>
            <section className="telemetry-strip" aria-label="Demo security status"><div className="telemetry-status"><span className="status-emblem"><Icon name="scan" size={23}/></span><div><strong>Ready to investigate</strong><span>Sample workspace · live agent disconnected</span></div></div><button onClick={() => navigate("Scans")}><strong className="mono">{String(scans.length).padStart(2,"0")}</strong><span>Demo scans</span><Icon name="arrow" size={13}/></button><button onClick={() => navigate("Findings")}><strong className="mono">02</strong><span>Open findings</span><Icon name="arrow" size={13}/></button><button onClick={() => navigate("Approvals")}><strong className={`mono ${approvalCount ? "amber-text" : "mint-text"}`}>{String(approvalCount).padStart(2,"0")}</strong><span>Pending review</span><Icon name="arrow" size={13}/></button></section>
            <div className="overview-lower"><section className="activity-section"><div className="section-heading"><div><span className="eyebrow">INVESTIGATION LOG</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => navigate("Scans")}>All scans<Icon name="arrow" size={15}/></button></div><ScanList scans={scans.slice(0,3)} compact={compact} onSelect={selectScan} brief/></section><section className="attention-panel"><div className="attention-top"><Icon name="approval" size={20}/><Status tone={decision === "pending" ? "amber" : decision === "approved" ? "mint" : "neutral"}>{decision === "pending" ? "Your attention" : "Decision recorded"}</Status></div><span className="eyebrow">HUMAN IN THE LOOP</span><h2>{decision === "pending" ? "One change.\nYour call." : "Oversight.\nOn your terms."}</h2><p>{decision === "pending" ? "A tighter file boundary is ready for review. See exactly what changes." : `You ${decision} the sample fix. Review your decision at any time.`}</p><button onClick={() => setReview(true)} className="attention-action">{decision === "pending" ? "Review proposed fix" : "View decision"}<Icon name="arrow" size={17}/></button></section></div>
          </>}

          {section === "Scans" && <>
            <div className="screen-intro"><h2>{pageCopy.Scans.title}</h2><p>{pageCopy.Scans.description}</p></div>
            <div className="scans-workspace"><section className="investigation-panel glass-panel"><div className="scan-controls"><label className="search-field"><Icon name="search" size={18}/><input aria-label="Search scans" placeholder="Search environments…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button aria-label="Clear search" onClick={() => setQuery("")}><Icon name="close" size={14}/></button>}</label><span className="small-label">{visibleScans.length} INVESTIGATIONS</span></div><div className="filter-row"><div className="segmented" aria-label="Scan status filter">{["All scans", "Needs review", "Passed"].map(value => <button key={value} aria-pressed={scanFilter === value} className={scanFilter === value ? "selected" : ""} onClick={() => setScanFilter(value)}>{value}</button>)}</div><span className="sample-label">Sample history</span></div>{visibleScans.length ? <ScanList scans={visibleScans} compact={compact} onSelect={selectScan}/> : <EmptyState onReset={() => { setQuery(""); setScanFilter("All scans"); }}/>}<div className="panel-footnote"><Icon name="box" size={14}/>Every result in this workspace is illustrative.</div></section><aside className="scan-side"><span className="eyebrow">AVAILABLE ENVIRONMENTS</span><h3>Choose your next<br/>point of view.</h3><button className="target-shortcut" onClick={() => openScan("Filesystem sandbox")}><Icon name="box" size={22}/><strong>Filesystem sandbox</strong><span>MCP server · 12 checks</span><Icon name="arrow" size={16}/></button><button className="target-shortcut" onClick={() => openScan("Research assistant")}><Icon name="code" size={22}/><strong>Research assistant</strong><span>AI agent · 8 checks</span><Icon name="arrow" size={16}/></button><div className="side-note"><Icon name="lock" size={17}/><p>Demo scans replay a controlled investigation. Connect an agent later to run live tests.</p></div></aside></div>
          </>}

          {section === "Findings" && <>
            <div className="screen-intro"><h2>{pageCopy.Findings.title}</h2><p>{pageCopy.Findings.description}</p></div><div className="findings-summary"><span><b>02</b> open findings</span><span className="red-text"><span className="status-dot"/>1 high priority</span><span className="amber-text"><span className="status-dot"/>1 medium priority</span><span className="sample-label">SAMPLE EVIDENCE</span></div>
            <div className="findings-workspace glass-panel"><section className="findings-master" aria-label="Findings list"><div className="findings-filters segmented">{["All findings", "High", "Medium"].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? "selected" : ""} onClick={() => { setFilter(value); const first = findings.find(finding => value === "All findings" || finding.severity === value); if(first) setActiveFinding(first); }}>{value === "All findings" ? "All" : value}</button>)}</div>{visibleFindings.map(finding => <button className={`finding-choice ${activeFinding.id === finding.id ? "selected" : ""}`} key={finding.id} onClick={() => setActiveFinding(finding)} aria-pressed={activeFinding.id === finding.id}><span className="finding-choice-top"><span className="mono">{finding.id}</span><span className={`severity-line ${finding.severity.toLowerCase()}`}/></span><strong>{finding.title}</strong><small>{finding.target}</small><span className="finding-choice-bottom">{finding.severity} priority<Icon name="arrow" size={15}/></span></button>)}<div className="master-note"><Icon name="finding" size={15}/><span>Sample findings illustrate the evidence review workflow.</span></div></section><Evidence finding={activeFinding} onReview={() => setReview(true)} onExport={exportReport}/></div>
          </>}

          {section === "Approvals" && <>
            <div className="screen-intro"><h2>{pageCopy.Approvals.title}</h2><p>{pageCopy.Approvals.description}</p></div><div className="approval-workspace"><section className="proposal-document glass-panel"><div className="proposal-heading"><span className="mono">CHANGE REQUEST / 001</span><Status tone={decision === "pending" ? "amber" : decision === "approved" ? "mint" : "neutral"}>{decision === "pending" ? "Awaiting review" : `Demo fix ${decision}`}</Status></div><div className="proposal-title"><span className="proposal-icon"><Icon name="lock" size={25}/></span><div><h2>A stronger file boundary.</h2><p>Filesystem sandbox <span className="separator">/</span> SNT-001</p></div></div><p className="body-copy">Restrict file access to the approved workspace. The proposed change validates the resolved path before the agent can open a file.</p><ChangePreview/><div className="change-impact"><div><Icon name="box" size={17}/><span><strong>Scope</strong><small>One file access boundary</small></span></div><div><Icon name="scan" size={17}/><span><strong>Next step</strong><small>Retest after a real integration</small></span></div></div></section><aside className="authorization-panel"><span className="authorization-icon"><Icon name="approval" size={28}/></span><span className="eyebrow">DECISION CONTROL</span><h2>{decision === "pending" ? "You have the\nfinal say." : "Your decision,\nrecorded."}</h2><p>{decision === "pending" ? "Review the proposed logic, then approve or decline this sample change." : `The sample change was ${decision}. No actual files were modified.`}</p><div className="authorization-detail"><span>Requested by</span><strong>Sentinel demo</strong></div><div className="authorization-detail"><span>Environment</span><strong>Sample sandbox</strong></div><button className="button button-primary" onClick={() => setReview(true)}>{decision === "pending" ? "Review change" : "View decision"}<Icon name="arrow" size={16}/></button><span className="authorization-note"><Icon name="lock" size={13}/>No change without your review.</span></aside></div>
          </>}

          {section === "Settings" && <>
            <div className="screen-intro"><h2>{pageCopy.Settings.title}</h2><p>{pageCopy.Settings.description}</p></div><div className="settings-workspace"><section className="settings-main"><div className="settings-group glass-panel"><div className="settings-group-head"><Icon name="overview" size={18}/><h2>Workspace</h2></div><div className="setting-row"><div><strong>Personal workspace</strong><p>Shubh’s AI security environment</p></div><span className="account-chip">SM</span></div><div className="setting-row"><div><strong>Compact scan rows</strong><p>Fit more investigations in your scan history.</p></div><button className={`toggle ${compact ? "enabled" : ""}`} role="switch" aria-checked={compact} aria-label="Compact scan rows" onClick={() => setCompact(!compact)}><span/></button></div><div className="setting-row"><div><strong>Ambient motion</strong><p>Subtle shield movement and interface transitions.</p></div><button className={`toggle ${motion ? "enabled" : ""}`} role="switch" aria-checked={motion} aria-label="Ambient motion" onClick={() => setMotion(!motion)}><span/></button></div><div className="settings-note">System reduced-motion preferences always take priority.</div></div><div className="settings-group glass-panel"><div className="settings-group-head"><Icon name="download" size={18}/><h2>Reports & session</h2></div><div className="setting-row"><div><strong>Export sample report</strong><p>Scans, findings, and your current approval decision.</p></div><button className="button button-secondary" onClick={exportReport}><Icon name="download" size={15}/>Export JSON</button></div><div className="settings-note"><Icon name="clock" size={14}/>This demo resets when you reload. No personal credentials are stored.</div></div></section><aside className="integration-panel"><div className="integration-orbit"><Mark/></div><span className="eyebrow">AGENT CONNECTION</span><h2>Ready for the<br/>next connection.</h2><p>Your TrueForge agent will power real investigations when connected.</p><div className="integration-state"><span className="connection-ring"/><div><strong>TrueForge</strong><span>Not connected</span></div><Icon name="lock" size={17}/></div><div className="integration-note"><span className="status-dot"/>Frontend demo active</div></aside></div>
          </>}

          <footer className="workspace-footer"><span><Mark small/>OBSERVE. VERIFY. PROTECT.</span><span>Sample data<span className="separator">/</span>No live scans</span></footer>
        </div>
      </main>
    </div>

    {newScan && <Modal title={running ? step < steps.length ? "Investigation in progress." : "Investigation complete." : "Where should we look?"} onClose={() => { setNewScan(false); setRunning(false); }}>
      {!running ? <><p className="dialog-description">Choose an isolated sample environment. This demo replays an investigation without contacting external systems.</p><div className="sample-targets" role="group" aria-label="Choose a sample target">{["Filesystem sandbox", "Research assistant"].map((name, index) => <button key={name} className={`sample-target ${target === name ? "selected" : ""}`} aria-pressed={target === name} onClick={() => setTarget(name)}><span className="environment-icon"><Icon name={index ? "code" : "box"} size={23}/></span><span><strong>{name}</strong><small>{index ? "AI agent · instruction boundaries" : "MCP server · file permissions"}</small></span><span className="selection-radio">{target === name && <span/>}</span></button>)}</div><div className="dialog-notice"><Icon name="lock" size={17}/><p>Live scanning is unavailable until an agent is connected. All results here are sample data.</p></div><button className="button button-silver full-width" onClick={() => { setRunning(true); setStep(0); }}>Run demo scan<Icon name="arrow" size={17}/></button></> : <><div className={`scan-visual ${step === steps.length ? "complete" : ""}`} aria-hidden="true"><div className="scan-ring"/><div className="scan-ring inner"/><div className="scan-radar"/>{step === steps.length ? <Icon name="check" size={38}/> : <Mark/>}</div><div className="progress-heading"><strong>{target}</strong><span className="mono">{Math.round(step / steps.length * 100)}%</span></div><div className="progress-track" role="progressbar" aria-label="Demo scan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={step / steps.length * 100}><span style={{width:`${step / steps.length * 100}%`}}/></div><ol className="scan-steps" aria-live="polite">{steps.map((label, index) => <li key={label} className={index < step ? "done" : index === step ? "current" : ""}><span>{index < step ? <Icon name="check" size={13}/> : <span className="mono">0{index+1}</span>}</span>{label}{index === step && <span className="step-pulse"/>}</li>)}</ol>{step === steps.length ? <button className="button button-silver full-width" onClick={finishScan}>View sample report<Icon name="arrow" size={17}/></button> : <button className="button button-secondary full-width" onClick={() => { setRunning(false); setStep(0); }}>Cancel demo</button>}<p className="scan-disclosure">Simulated investigation · no real scan performed</p></>}
    </Modal>}
    {selected && <Modal wide title="Finding inspection" eyebrow="EVIDENCE / SAMPLE TRACE" onClose={() => setSelected(null)}><Evidence finding={selected} onReview={() => { setSelected(null); setReview(true); }} onExport={exportReport}/></Modal>}
    {passedScan && <Modal title="Boundary checks passed." onClose={() => setPassedScan(null)}><div className="passed-illustration"><Icon name="shield" size={42}/></div><Status tone="mint">Sample retest complete</Status><p className="dialog-description">{passedScan.name} passed all {passedScan.checks} checks in this illustrative retest. This is a sample result, not a live security assessment.</p><div className="passed-checks">{["Workspace boundary enforced", "Out-of-scope requests rejected", "Allowed operations preserved"].map(label => <span key={label}><Icon name="check" size={16}/>{label}</span>)}</div><button className="button button-secondary full-width" onClick={exportReport}><Icon name="download" size={16}/>Export sample report</button></Modal>}
    {review && <Modal wide title="Review the boundary change." eyebrow="APPROVAL / CHANGE REQUEST 001" onClose={() => setReview(false)}><p className="dialog-description">Only allow file access inside the approved workspace. Review the sample logic before recording your decision.</p><ChangePreview/><div className="dialog-notice"><Icon name="approval" size={18}/><p>Your choice applies to this demo session. No real files will change and no real retest will run.</p></div>{decision === "pending" ? <div className="dialog-actions"><button className="button button-secondary" onClick={() => decide("declined")}>Decline change</button><button className="button button-primary" onClick={() => decide("approved")}><Icon name="check" size={16}/>Approve demo fix</button></div> : <div className="recorded-decision"><Status tone={decision === "approved" ? "mint" : "neutral"}>Demo fix {decision}</Status><button className="text-button" onClick={() => setDecision("pending")}>Reset demo<Icon name="arrow" size={15}/></button></div>}</Modal>}
    {guide && <Modal title="From uncertainty to evidence." onClose={() => setGuide(false)}><p className="dialog-description">Three steps. One clear line of oversight. Explore the complete workflow with sample data.</p><div className="workflow-guide">{[["scan","Investigate","Replay a scan of an isolated agent or MCP server."],["finding","Understand","Inspect the observed behavior and its evidence."],["approval","Decide","Review a proposed improvement. Make the final call."]].map(([icon,title,description],index) => <div key={title}><span className="workflow-number">0{index+1}</span><span><Icon name={icon as IconName} size={18}/><h3>{title}</h3><p>{description}</p></span></div>)}</div><button className="button button-silver full-width" onClick={() => { setGuide(false); openScan(); }}>Explore a demo scan<Icon name="arrow" size={16}/></button></Modal>}
    {exportError && <Modal title="The report couldn’t be exported." eyebrow="REPORT / EXPORT ERROR" onClose={() => setExportError(false)}><p className="dialog-description">Your sample data is still here. Try the export again, or close this message to continue reviewing.</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setExportError(false)}>Close</button><button className="button button-primary" onClick={exportReport}>Try again<Icon name="arrow" size={16}/></button></div></Modal>}
    {toast && <div className="toast" role="status"><span className="toast-symbol"><Icon name="check" size={15}/></span><span>{toast}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => setToast("")}><Icon name="close" size={15}/></button></div>}
  </div>;
}

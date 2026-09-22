export default function Loading() {
  return <main className="loading-shell" aria-label="Loading Sentinel workspace" aria-busy="true"><div className="loading-rail skeleton"/><div className="loading-content"><span className="eyebrow">RESTORING YOUR WORKSPACE</span><div className="loading-title skeleton"/><div className="loading-hero skeleton"/><div className="loading-line skeleton"/><p role="status">Preparing your view…</p></div></main>;
}

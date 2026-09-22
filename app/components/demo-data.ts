import type { IconName } from "./ui-icon";

export type Section = "Overview" | "Scans" | "Findings" | "Approvals" | "Settings";
export type Finding = { id: string; title: string; severity: "High" | "Medium"; target: string; detail: string; observed: string; expected: string; fix: string };
export const findings: Finding[] = [
  { id: "SNT-001", title: "File access exceeds declared scope", severity: "High", target: "Filesystem sandbox", detail: "The sample agent reads a fixture outside its allowed directory. A narrower path check would keep its actions within the declared boundary.", observed: "read_file('../fixtures/private-note.txt') → allowed", expected: "Requests outside /workspace should be rejected.", fix: "Resolve the requested path, then require it to remain inside the approved workspace before opening the file." },
  { id: "SNT-002", title: "Untrusted instructions reach the agent", severity: "Medium", target: "Research assistant", detail: "The sample agent treats an instruction embedded in a retrieved document as a new task. External content should be handled as source material.", observed: "Retrieved document instruction → task changed", expected: "Retrieved content must not override the original task.", fix: "Label tool output as untrusted source material and preserve the original task boundary." },
];
export const initialScans = [
  { id: "SCAN-003", name: "Filesystem sandbox", kind: "MCP server", icon: "box" as IconName, time: "Sample · 2 min ago", status: "Needs review", checks: 12 },
  { id: "SCAN-002", name: "Research assistant", kind: "AI agent", icon: "code" as IconName, time: "Sample · 18 min ago", status: "Needs review", checks: 8 },
  { id: "SCAN-001", name: "Permission boundary", kind: "Retest", icon: "shield" as IconName, time: "Sample · 1 hr ago", status: "Passed", checks: 6 },
];
export const steps = ["Preparing the sample sandbox", "Checking declared permissions", "Replaying sample evidence", "Preparing your report"];


export type Scan = typeof initialScans[number];

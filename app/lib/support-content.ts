import type { IconName } from '@/app/components/ui-icon';

export interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  articleCount?: number;
}

export interface SupportArticle {
  slug: string;
  categoryId: string;
  title: string;
  summary: string;
  readTime: string;
  lastUpdated: string;
  content: string;
  keywords: string[];
  relatedSlugs?: string[];
}

export interface GlossaryItem {
  term: string;
  category: string;
  definition: string;
  relatedCategorySlug?: string;
}

export interface ShortcutItem {
  category: string;
  keyCombo: string[];
  description: string;
}

// Exactly 16 requested categories
export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Platform orientation, architecture philosophy, and executing your first security check.',
    icon: 'sliders',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'account',
    title: 'Account & Profile',
    description: 'Operator identity, secure sign-in methods, unique @username handles, and 18+ verification.',
    icon: 'lock',
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'agents',
    title: 'Agents',
    description: 'Agent Passports, human-readable capabilities, Trust Graphs, and Shadow Mode.',
    icon: 'shield',
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'scans',
    title: 'Scans',
    description: 'Running AST checks, scheduling automated audits, and inspecting tool handlers.',
    icon: 'scan',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'findings',
    title: 'Findings',
    description: 'CVSS classifications, risk severity tiers, and false-positive triage procedures.',
    icon: 'finding',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'investigations',
    title: 'Investigations',
    description: 'Chronological replay scrubber, telemetry snapshots, and forensic root-cause analysis.',
    icon: 'search',
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'evidence',
    title: 'Evidence',
    description: 'Cryptographic execution logs, tool traces, and tamper-evident audit receipts.',
    icon: 'box',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'approvals',
    title: 'Approvals',
    description: 'Mandatory human-in-the-loop authorization gates, blast radius reviews, and signing.',
    icon: 'approval',
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'remediation',
    title: 'Remediation',
    description: 'Safe side-by-side patch previews, minimal AST diffs, and containment execution.',
    icon: 'check',
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
  },
  {
    id: 'retesting',
    title: 'Retesting',
    description: 'Automated post-patch verification scans, regression prevention, and pass criteria.',
    icon: 'refresh',
    color: 'text-green-500 bg-green-500/10 border-green-500/20',
  },
  {
    id: 'ai',
    title: 'AI Workspace',
    description: 'Interactive agentic reasoning, conversational policy tuning, and automated code review.',
    icon: 'code',
    color: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Model Context Protocol hosts, TrueForge gateway connections, and API credentials.',
    icon: 'sliders',
    color: 'text-yellow-600 bg-yellow-600/10 border-yellow-600/20',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'High-signal security alerts, approval requests, and drift detection notifications.',
    icon: 'bell',
    color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Cryptographic JWT session security, MicroVM sandbox boundaries, and private DOB policies.',
    icon: 'lock',
    color: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20',
  },
  {
    id: 'owner',
    title: 'Owner & Admin',
    description: 'Tenant workspace provisioning, RBAC role hierarchy, MCP server routing, and diagnostics.',
    icon: 'shield',
    color: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Diagnosing failed scans, sign-in issues, and SSO identity resolving.',
    icon: 'refresh',
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
];

export const WORKFLOW_STAGES = [
  {
    step: '01',
    title: 'Inspect & Register',
    subtitle: 'Agent Passport Declaration',
    description: 'Every autonomous agent declares its intended purpose, tool whitelist, and allowed resource paths in an immutable Agent Passport.',
    icon: 'shield' as IconName,
  },
  {
    step: '02',
    title: 'Sandbox Containment',
    subtitle: 'Zero-Trust Execution Envelope',
    description: 'Agents run in isolated MicroVM or gVisor execution envelopes with strict filesystem, subprocess, and network boundaries.',
    icon: 'box' as IconName,
  },
  {
    step: '03',
    title: 'Runtime Interception',
    subtitle: 'Shadow Mode & Policy Guards',
    description: 'Sentinel monitors every tool call in real-time. Unauthorized path traversals, prompt injections, or unregistered tools are intercepted.',
    icon: 'clock' as IconName,
  },
  {
    step: '04',
    title: 'Verify & Replay',
    subtitle: 'Traceable Investigation Replay',
    description: 'Security operators review chronological execution replays step-by-step with raw memory and tool argument snapshots.',
    icon: 'search' as IconName,
  },
  {
    step: '05',
    title: 'Remediate & Retest',
    subtitle: 'Safe AST Patching & Retest Gate',
    description: 'Synthesizes minimal code patches with side-by-side diff previews. Retests automatically to verify resolution without regressions.',
    icon: 'check' as IconName,
  },
];

// Rich, structured articles matching all requested routes
export const SUPPORT_ARTICLES: SupportArticle[] = [
  // 1. Getting Started
  {
    slug: 'what-is-sentinel',
    categoryId: 'getting-started',
    title: 'What is Sentinel? Architecture & Mission',
    summary: 'An introductory guide to how Sentinel protects enterprise autonomous systems from boundary escapes and prompt injection.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['what is sentinel', 'overview', 'getting started', 'intro', 'architecture', 'mission'],
    content: `
# What is Sentinel?

Sentinel is a next-generation security and runtime containment platform purpose-built for autonomous AI agents, Model Context Protocol (MCP) servers, and enterprise automation pipelines.

## The Problem Sentinel Solves
As agents transition from passive chatbots into autonomous systems capable of executing bash commands, reading local codebases, and dispatching API requests, traditional endpoint firewalls fail. Agents are vulnerable to:

- **Indirect Prompt Injections**: Malicious instructions embedded in scraped web data or customer documents.
- **Tool Escalation**: Unsafe execution of host processes or unrestricted filesystem mutations.
- **Configuration Drift**: Stealth modifications to tool manifests or runtime environments.

## The Sentinel Defense Model
1. **Agent Passports**: Plain-language, cryptographically signed manifests of what each agent is permitted to do.
2. **Permission Trust Graphs**: Visual relationship chains mapping Agent &rarr; Tool &rarr; Resource &rarr; Data.
3. **Shadow Mode**: Zero-risk passive observation to evaluate over-privileged tools before enforcing hard blocks.
4. **Investigation Replay**: Forensic millisecond-accurate timeline scrubbers to trace policy violations.
5. **Safe Remediation Preview**: AST patch previews with immediate automated retesting.
    `,
  },
  {
    slug: 'how-sentinel-works',
    categoryId: 'getting-started',
    title: 'How Sentinel Works: Runtime Containment Lifecycle',
    summary: 'A deep dive into how Sentinel intercepts agent tool calls, enforces boundaries, and captures cryptographic audit evidence.',
    readTime: '5 min read',
    lastUpdated: 'September 2026',
    keywords: ['how sentinel works', 'lifecycle', 'containment', 'microvm', 'runtime'],
    content: `
# How Sentinel Works

Sentinel wraps autonomous agent tool handlers inside isolated execution envelopes using lightweight MicroVM sandboxes and gVisor kernels.

### 1. Interception Layer
When an agent calls an MCP tool (such as \`read_file\` or \`execute_command\`), the call passes through the Sentinel Boundary Interceptor before touching host resources.

### 2. Behavioral Policy Evaluation
Sentinel evaluates:
- Is the tool declared in the agent's approved **Agent Passport**?
- Is the target path within the allowed workspace boundary?
- Does the action require human sign-off via an **Approval Gate**?

### 3. Execution & Telemetry
If permitted, the tool executes inside an isolated container mount. A cryptographic receipt of the parameters, memory delta, and response is written to the immutable SQLite WAL audit log.
    `,
  },

  // 2. Agents
  {
    slug: 'agent-passport',
    categoryId: 'agents',
    title: 'Understanding Agent Passports & Fleet Identity',
    summary: 'Learn how Sentinel declares and verifies autonomous agent identities, execution scopes, and trust indices.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['agent passport', 'identity', 'trust index', 'manifest', 'fleet'],
    content: `
# Agent Passports

An **Agent Passport** is the primary identity artifact for every autonomous AI entity operating inside Sentinel.

## Key Passport Attributes
- **Agent Name & Purpose**: Declares what the agent was designed to do in clear language.
- **Trust Index**: A dynamic composite score (0–100%) reflecting boundary adherence and least-privilege compliance.
- **Enclave Environment**: Host isolation level (Production Enclave, Development Sandbox, Staging MicroVM).
- **Owner**: The verified human operator accountable for the agent.

## Verification Status
- **Verified Clean**: The agent's active runtime matches its declared baseline manifest with zero open critical findings.
- **Needs Attention**: Configuration drift detected, or open boundary violations require operator triage.
    `,
  },
  {
    slug: 'capabilities',
    categoryId: 'agents',
    title: 'Human-Readable Capabilities vs Raw MCP Schemas',
    summary: 'How Sentinel translates cryptic JSON schemas and model parameters into human-understandable security permissions.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['capabilities', 'human readable', 'mcp', 'tools', 'permissions'],
    content: `
# Human-Readable Capabilities

Security operators should never have to reverse-engineer complex JSON schemas to understand what an AI agent is allowed to do.

## Plain-Language Translations
Sentinel translates raw MCP tool definitions into human-readable capability cards:
- *"Can read workspace files within /workspace/docs"*
- *"Can modify workspace files in scratch directory"*
- *"Can execute approved CLI commands (git, grep, npm test)"*
- *"Can access external APIs via TrueForge Gateway"*
- *"Requires human approval for destructive actions (rm, git push)"*

## Technical Details Toggle
For engineers who need raw technical details, every capability card contains a *"View technical details"* toggle disclosing raw method signatures, parameter types, and sandbox mount paths.
    `,
  },
  {
    slug: 'trust-graph',
    categoryId: 'agents',
    title: 'Navigating the Permission & Trust Graph',
    summary: 'Visualizing deterministic relationship chains from agents to tools to sensitive enterprise data.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['trust graph', 'permissions', 'access graph', 'relationships', 'data flow'],
    content: `
# The Permission & Trust Graph

The **Trust Graph** visualizes the complete authorization chain connecting an agent to enterprise resources:

\`\`\`
Agent ──> MCP Tool ──> Local Resource ──> Data Class ──> External Service
\`\`\`

## Graph Nodes
- **Agent Node**: The AI model or autonomous workflow.
- **Tool Node**: Registered MCP functions or CLI capabilities.
- **Resource Node**: File directories, databases, or memory buffers.
- **Data Class**: Sensitivity classification (Public, Internal, Confidential, Restricted).
- **External Service**: Outbound network endpoints or third-party APIs.

Clicking any node in the graph reveals its security classification, active callers, and recent audit logs.
    `,
  },
  {
    slug: 'shadow-mode',
    categoryId: 'agents',
    title: 'Shadow Mode: Zero-Risk Passive Profiling',
    summary: 'Evaluate agent behavior and identify over-privileged scopes in dry-run mode without disrupting live execution.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['shadow mode', 'dry run', 'profiling', 'least privilege', 'telemetry'],
    content: `
# Shadow Mode

**Shadow Mode** allows security teams to monitor agents passively without interrupting operational workflows.

## How Shadow Mode Operates
- **Dry-Run Enforcement**: Policy violations that would normally terminate an agent are recorded as simulated blocks.
- **Scope Profiling**: Telemetry compares requested tools against actually invoked tools.
- **Least-Privilege Synthesis**: Sentinel calculates unused permissions and generates a tightened boundary manifest automatically.
    `,
  },

  // 3. Scans
  {
    slug: 'run-a-scan',
    categoryId: 'scans',
    title: 'How to Run and Schedule a Security Scan',
    summary: 'Step-by-step instructions for launching targeted AST boundary audits against agents and MCP servers.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['run a scan', 'scans', 'audit', 'schedule', 'ast'],
    content: `
# Running a Security Scan

Sentinel provides automated vulnerability scanners specifically engineered for autonomous AI agents and MCP tool servers.

## Scan Types
1. **Agent Behavior Scan**: Tests for indirect prompt injection, tool hijacking, and jailbreak vectors.
2. **MCP Server Check**: Analyzes tool parameter sanitization and path traversal vulnerabilities.
3. **Retest Scan**: Runs focused validation replays to confirm that previously patched findings remain fixed.

## How to Launch
1. Click **Scans** in the primary navigation or press \`⌘K\` &rarr; *Launch New Scan*.
2. Select your target agent or MCP server enclave.
3. Click **Start Scan** to begin live boundary probing.
    `,
  },

  // 4. Findings
  {
    slug: 'understanding-findings',
    categoryId: 'findings',
    title: 'Understanding Findings & Triage Procedures',
    summary: 'A guide to interpreting security alerts, CVSS risk scores, and evidence artifacts.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['findings', 'triage', 'cvss', 'severity', 'security alerts'],
    content: `
# Understanding Findings

When Sentinel detects an unauthorized tool invocation or policy violation, it creates a structured **Finding**.

## Key Finding Components
- **Finding ID**: Cryptographically unique reference (e.g. \`SNT-001\`).
- **Severity Tier**: Critical, High, Medium, or Low.
- **Affected Target**: The specific agent or MCP server enclave.
- **Trace Evidence**: Raw inputs, tool parameters, and system call deltas.
    `,
  },
  {
    slug: 'severity',
    categoryId: 'findings',
    title: 'CVSS Severity Rating & Risk Tiers Explained',
    summary: 'How Sentinel calculates risk severity and prioritizes urgent containment actions.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['severity', 'cvss', 'critical', 'high risk', 'scoring'],
    content: `
# Severity Tiers

Sentinel maps all detected vulnerabilities to standardized CVSS v3.1 impact matrices:

- **Critical (9.0–10.0)**: Remote code execution, arbitrary file writes, or prompt injections bypassing human approval gates.
- **High (7.0–8.9)**: Unauthorized file read access to sensitive config files or internal database connections.
- **Medium (4.0–6.9)**: Over-privileged tool access or unregistered environment variable reads.
- **Low (0.1–3.9)**: Informational telemetry or minor manifest formatting discrepancies.
    `,
  },
  {
    slug: 'false-positive',
    categoryId: 'findings',
    title: 'False-Positive Review & Tuning Wizard',
    summary: 'How to safely review, dismiss, and calibrate boundary policies when benign agent behavior is flagged.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['false positive', 'review', 'tuning', 'calibration', 'dismiss'],
    content: `
# False-Positive Review Assistant

Occasionally, legitimate multi-step agent reasoning may appear anomalous to automated security policies.

## Guided Review Flow
1. Open the Finding in the **Findings Workbench**.
2. Click **Review as False Positive**.
3. The wizard presents:
   - Observed payload vs approved operational pattern.
   - Recommended policy tuning to allow the specific parameter format without opening global bypasses.
4. Submit the adjusted rule to prevent future false alerts.
    `,
  },

  // 5. Investigations
  {
    slug: 'timeline',
    categoryId: 'investigations',
    title: 'Investigation Replay: Scrubber & Telemetry',
    summary: 'Using the chronological event timeline scrubber to replay security incidents millisecond by millisecond.',
    readTime: '5 min read',
    lastUpdated: 'September 2026',
    keywords: ['investigations', 'timeline', 'scrubber', 'replay', 'forensics'],
    content: `
# Investigation Replay Timeline

The **Investigation Replay** scrubber transforms security triage from guessing into objective forensic analysis.

## Key Capabilities
- **Chronological Playback**: Scrub forward or backward, pause, or play at 1x or 2x speed.
- **Event Telemetry Snapshot**: Inspect CPU, memory, prompt tokens, and active system calls at each exact moment.
- **Root Cause Summary**: Plain-English explanation detailing how the incident unfolded and why the boundary was enforced.
    `,
  },

  // 6. Evidence
  {
    slug: 'understanding-evidence',
    categoryId: 'evidence',
    title: 'Understanding Evidence: Cryptographic Audit Receipts',
    summary: 'How Sentinel captures tamper-evident tool traces, file diffs, and cryptographic hash proofs.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['evidence', 'audit receipts', 'cryptographic', 'hash', 'wal'],
    content: `
# Evidence Vault

Sentinel captures immutable cryptographic evidence for every intercepted tool call, file write, and network packet.

## Tamper-Evident Receipts
Each receipt includes:
- **Timestamp**: High-precision UTC timestamp.
- **Sha256 Hash**: Cryptographic digest of tool input parameters and output buffers.
- **Enclave Signature**: Signed by the local MicroVM kernel prior to storage in the WAL database.
    `,
  },

  // 7. Approvals
  {
    slug: 'review-an-approval',
    categoryId: 'approvals',
    title: 'Reviewing and Acting on Human Approvals',
    summary: 'Best practices for evaluating human-in-the-loop requests, blast radius, and granting time-bound permissions.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['approvals', 'human in the loop', 'sign off', 'blast radius', 'gate'],
    content: `
# Reviewing Human Approvals

Sentinel enforces mandatory human-in-the-loop sign-offs for high-risk operations such as:
- Modifying production database records.
- Spawning host subprocesses or shell scripts.
- Modifying security boundary manifests.

## The Review Process
1. Inspect the **Blast Radius**: review affected files, dependencies, and external network services.
2. Verify the **Agent Context**: read the agent's recent reasoning steps leading up to the request.
3. Click **Approve** or **Reject** with an optional comment.
    `,
  },

  // 8. Remediation
  {
    slug: 'remediation-preview',
    categoryId: 'remediation',
    title: 'Safe Remediation: Side-by-Side Patch Previews',
    summary: 'Previewing minimal AST patches and boundary adjustments before applying fixes to agent code.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['remediation', 'patch preview', 'ast diff', 'side by side', 'fixes'],
    content: `
# Safe Remediation Preview

Before Sentinel applies any security remediation to your agent's codebase or configuration, it generates a **Safe Boundary Patch Preview**.

## Features
- **Side-by-Side Diff**: Compare Current Vulnerable State against Proposed Hardened Policy.
- **Blast Radius Assessment**: Visual indicators for affected services and runtime containers.
- **Direct Retest Handoff**: Immediately trigger an automated retest after applying the patch.
    `,
  },

  // 9. Retesting
  {
    slug: 'retest-results',
    categoryId: 'retesting',
    title: 'Interpreting Retest Results & Verification States',
    summary: 'Understanding the four automated retesting states: Verified Fixed, Still Vulnerable, Regression, and Unable to Verify.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['retesting', 'retest results', 'verified fixed', 'regression', 'verification states'],
    content: `
# Retest Results & Verification States

After applying a patch, Sentinel validates the fix by replaying the exact probe that triggered the initial finding.

## The 4 Verification States
1. **Verified Fixed (Green)**: The boundary held, and the exploit payload was safely intercepted.
2. **Still Vulnerable (Red)**: The exploit payload was able to bypass the updated policy.
3. **Regression Detected (Amber)**: The patch resolved the vulnerability but broke legitimate agent functionality.
4. **Unable to Verify (Gray)**: Target sandbox was unreachable or timed out during test execution.
    `,
  },

  // 10. Account & Profile
  {
    slug: 'passkeys',
    categoryId: 'account',
    title: 'Passkey Availability',
    summary: 'Current passkey availability and the safeguards required before enablement.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['passkeys', 'webauthn', 'touch id', 'face id', 'biometrics', 'fido2', 'passwordless'],
    content: `
# Passkeys in Sentinel

Passkey authentication is not currently enabled. Use password or a configured OAuth provider to sign in.

Sentinel will only enable WebAuthn after server-issued challenges, credential persistence, origin and relying-party validation, signature-counter handling, and assertion verification are implemented. A browser prompt by itself is not an authentication mechanism.
    `,
  },
  {
    slug: 'profile',
    categoryId: 'account',
    title: 'Managing Your Operator Profile & 18+ Verification',
    summary: 'Configure your display name, unique @username handle, bio, social links, and private date-of-birth verification.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['profile', 'username', 'dob', '18+ verification', 'operator profile', 'social links'],
    content: `
# Operator Profile Management

Sentinel maintains verified operator profiles for audit accountability across autonomous fleet operations.

## Profile Fields
- **Display Name**: Your full human operator identity.
- **Unique @username**: Your handle for mentions in approval chains and activity audits.
- **Date of Birth**: Enforces cryptographic server-side age verification (operators must be &ge; 18 years old). Kept strictly private.
- **Social Endpoints**: Links to your GitHub, LinkedIn, Website, and X profiles.
    `,
  },
  {
    slug: 'google-sign-in',
    categoryId: 'account',
    title: 'Configuring Google Workspace Single Sign-On',
    summary: 'Enterprise SSO setup instructions for Google Workspace OAuth 2.0 integration.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['google sign in', 'google workspace', 'sso', 'oauth', 'enterprise'],
    content: `
# Google Workspace SSO

Sentinel supports Google Workspace Single Sign-On for enterprise teams.

## Environment Variables
To enable Google login for your enclave, declare the following environment variables:
\`\`\`bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
\`\`\`
When unconfigured, Sentinel gracefully falls back to local cryptographic credentials.
    `,
  },
  {
    slug: 'apple-sign-in',
    categoryId: 'account',
    title: 'Configuring Sign in with Apple in Enclave Mode',
    summary: 'Setup guide for Apple Developer credentials, team identifiers, and private key verification.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['apple sign in', 'sign in with apple', 'apple id', 'oauth', 'team id'],
    content: `
# Sign in with Apple

Sentinel integrates with Apple ID Single Sign-On for Cupertino-grade authentication.

## Required Configuration
\`\`\`bash
APPLE_CLIENT_ID=com.sentinel.service
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
\`\`\`
Ensure your registered redirect URI matches \`https://<your-domain>/api/auth/callback/apple\`.
    `,
  },

  // 11. AI Workspace
  {
    slug: 'sentinel-ai',
    categoryId: 'ai',
    title: 'Using Sentinel AI as your Security Co-Pilot',
    summary: 'Conversational security triage, automatic boundary generation, and code review in the AI Workspace.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['sentinel ai', 'ai workspace', 'copilot', 'assistant', 'policy generation'],
    content: `
# Sentinel AI Co-Pilot

The **Sentinel AI Workspace** is an interactive analysis environment where operators can query fleet security posture in natural language.

## Common Prompts
- *"What is the blast radius if agt-research-01 is compromised?"*
- *"Generate an AST policy restricting filesystem writes to /tmp only."*
- *"Review finding SNT-001 and propose a minimal boundary patch."*
    `,
  },

  // 12. Troubleshooting
  {
    slug: 'passkeys',
    categoryId: 'troubleshooting',
    title: 'Passkey Sign-In Is Unavailable',
    summary: 'Why passkey controls are disabled and which sign-in methods to use instead.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['passkey troubleshooting', 'touch id error', 'webauthn failed', 'not allowed'],
    content: `
# Passkey Sign-In Is Unavailable

Sentinel does not currently expose passkey enrollment or sign-in. Use password or a configured OAuth provider. Administrators can confirm provider status under **Owner &rarr; Authentication Providers**.

Passkeys must remain disabled until the complete server-side WebAuthn registration and authentication ceremonies are implemented and independently tested.
    `,
  },
  {
    slug: 'sign-in',
    categoryId: 'troubleshooting',
    title: 'Troubleshooting Sign-In & Session Persistence',
    summary: 'Resolving cookie expiration, invalid session signatures, and redirect loops.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['sign in troubleshooting', 'session expired', 'cookie', 'login issue'],
    content: `
# Sign-In Troubleshooting

### Session Expired or Redirecting to /login
- Sentinel issues cryptographic HMAC-SHA256 session cookies valid for 7 days.
- If your system clock is significantly out of sync, JWT verification may fail.
- Clear browser cookies for \`localhost:3000\` and sign in again to receive a fresh token.
    `,
  },
  {
    slug: 'scan-failed',
    categoryId: 'troubleshooting',
    title: 'Troubleshooting Failed Scans & Sandbox Timeouts',
    summary: 'What to do when an agent container fails to launch or tool timeouts occur during an automated scan.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['scan failed', 'timeout', 'sandbox timeout', 'troubleshooting'],
    content: `
# Troubleshooting Failed Scans

If an automated security scan returns an error:
1. Check that the target agent's container mount exists.
2. Verify that the MCP server executable has valid execute permissions.
3. Inspect the audit log in **Activity** for raw container exit codes.
    `,
  },

  // 12. Integrations
  {
    slug: 'trueforge-ai-gateway',
    categoryId: 'integrations',
    title: 'Connecting TrueForge AI Gateway & Multi-Model Routing',
    summary: 'How Sentinel connects to TrueForge AI Gateway for high-throughput model dispatch, fallback failovers, and latency monitoring.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['trueforge', 'ai gateway', 'provider routing', 'fallback', 'llm proxy', 'latency'],
    content: `
# TrueForge AI Gateway Integration

Sentinel integrates natively with **TrueForge AI Gateway** to route autonomous agent prompts and tool executions across heterogeneous large language model backends.

## Architectural Role of TrueForge
Rather than coupling autonomous agents directly to individual provider APIs, Sentinel routes intelligence requests through TrueForge:
1. **Multi-Provider Failover**: Automatically cascades from primary providers (OpenAI, Anthropic) to secondary fallbacks (Groq, Gemini, Ollama) if rate limits or 5xx errors occur.
2. **Deterministic Sandbox Mode**: When external providers are offline, Sentinel's built-in sandbox engine provides deterministic, zero-dependency policy analysis.
3. **Latency & Token Governance**: Tracks per-call input/output token counts, execution duration, and p95 latency directly in SQLite audit logs.

## Configuring TrueForge Gateway
To connect TrueForge, set the following environment variables in your deployment:

\`\`\`bash
# TrueForge Gateway Base URL
AI_GATEWAY_URL="https://gateway.trueforge.ai/v1"

# TrueForge Gateway Bearer Secret
AI_GATEWAY_KEY="tf_sec_live_example"

# Default Model Dispatch
DEFAULT_AI_MODEL="claude-3-5-sonnet-20241022"
\`\`\`

## Health & Status Monitoring
Navigate to **Integrations** in the primary navigation to inspect connection uptime, recent token usage, and roundtrip telemetry for connected model endpoints.
    `,
  },
  {
    slug: 'mcp-security-containment',
    categoryId: 'integrations',
    title: 'Model Context Protocol (MCP) Tool Containment & Boundary Enclaves',
    summary: 'Learn how Sentinel intercepts and sandboxes Model Context Protocol tool execution over stdio and SSE transports.',
    readTime: '5 min read',
    lastUpdated: 'September 2026',
    keywords: ['mcp', 'model context protocol', 'stdio', 'sse', 'containment', 'sandbox', 'tool boundaries'],
    content: `
# Model Context Protocol (MCP) Security Containment

The **Model Context Protocol (MCP)** provides open standardization for AI models to interact with local tools, filesystems, and databases. Sentinel wraps MCP servers in strict runtime containment enclaves.

## Threat Model for MCP Servers
Because MCP servers execute arbitrary code and system commands on behalf of an LLM, rogue instructions or prompt injections can weaponize tools:
- **Filesystem Traversal**: An agent attempting to access sensitive host paths outside its assigned workspace (e.g. \`../../etc/passwd\`).
- **Command Injection**: Appending unescaped shell commands into parameter inputs.
- **Unauthorized Tool Escalation**: Invoking tools not declared in the approved **Agent Passport**.

## Sentinel's Containment Envelopes
1. **Transport Interception**: Sentinel proxies stdio and SSE MCP transports, inspecting JSON-RPC payloads before dispatching to tool binaries.
2. **Canonical Workspace Boundary**: All file operations are checked with path resolution. Any path resolving outside the declared \`/workspace\` root triggers an immediate **SNT-001** Boundary Violation finding.
3. **Tamper-Evident Evidence Vault**: Tool arguments, environment state, and stdout/stderr are hashed and stored in the immutable evidence ledger.
    `,
  },
  {
    slug: 'ai-model-provider-config',
    categoryId: 'integrations',
    title: 'Configuring AI Model Providers & Local Inference Endpoints',
    summary: 'A comprehensive setup guide for OpenAI, Anthropic Claude, Google Gemini, Groq, and local Ollama inference in Sentinel.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['model providers', 'openai', 'anthropic', 'gemini', 'groq', 'ollama', 'local ai'],
    content: `
# Configuring AI Model Providers

Sentinel includes an extensible multi-provider abstraction layer (\`ai-provider.ts\`) that supports commercial cloud providers alongside private on-premises inference endpoints.

## Supported Providers
Sentinel automatically activates providers based on available environment credentials:

- **Anthropic Claude**: \`ANTHROPIC_API_KEY\` (Recommended for deep AST analysis and code patches).
- **OpenAI**: \`OPENAI_API_KEY\` (GPT-4o, GPT-4o-mini).
- **Google Gemini**: \`GEMINI_API_KEY\` (Gemini 1.5 Pro, Flash).
- **Groq**: \`GROQ_API_KEY\` (Ultra-low latency inference for real-time investigation replay).
- **Local Ollama**: \`OLLAMA_BASE_URL\` (e.g. \`http://localhost:11434\` for air-gapped on-premise deployments).

## Zero-Dependency Sandbox Fallback
If no external provider keys are configured, Sentinel runs seamlessly using its built-in **SentinelSandboxEngine**. This deterministic engine performs comprehensive rule-based boundary checks, CVE mapping, and AST validations without external API dependencies.
    `,
  },
  {
    slug: 'external-webhook-integrations',
    categoryId: 'integrations',
    title: 'Security Event Webhooks, SIEM Ingestion & Incident Alerting',
    summary: 'Stream real-time Sentinel boundary violations, scan verdicts, and approval alerts to external enterprise SIEM systems.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['webhooks', 'siem', 'incident alerts', 'slack', 'pagerduty', 'security events'],
    content: `
# Security Event Webhooks & SIEM Ingestion

Enterprise security teams can pipe Sentinel alerts into centralized Security Information and Event Management (SIEM) systems such as Splunk, Datadog, or Slack incident channels.

## Event Dispatch Types
Sentinel triggers automated webhooks upon the following events:
- **Critical Boundary Violations**: Immediate alert when an agent attempts unauthorized filesystem escape.
- **Pending Human Approvals**: Notification dispatched when high-blast-radius remediation code requires sign-off.
- **Scan Verdicts**: Summary reports delivered upon completion of automated AST security scans.

## Cryptographic Payload Signatures
Webhook dispatches include an \`X-Sentinel-Signature\` HTTP header containing an HMAC-SHA256 signature generated with your workspace webhook secret. Receivers verify this signature to guarantee authenticity and prevent spoofed alerts.
    `,
  },

  // 13. Notifications
  {
    slug: 'configuring-alert-rules',
    categoryId: 'notifications',
    title: 'Configuring Security Alert Rules, Severity Thresholds & Triage',
    summary: 'Set up real-time notification routing for critical boundary violations, drift detection, and automated scan verdicts.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['alert rules', 'severity', 'critical', 'warning', 'triage', 'notifications'],
    content: `
# Configuring Security Alert Rules

Sentinel provides high-signal notification management designed to keep security teams informed without alert fatigue.

## Alert Severity Tiers
1. **Critical (Red)**: High-risk events requiring immediate containment, such as prompt injection bypasses or unauthorized filesystem traversal attempts.
2. **Warning (Amber)**: Operational anomalies such as agent configuration drift or pending human approval gates awaiting review.
3. **Info (Blue)**: Routine operational confirmations, including successful automated scan completions and baseline retest passes.

## Managing Unread State
- When new alerts are logged, a high-visibility badge indicator appears on the global notification bell.
- Clicking **Mark all as read** on the **Security Notifications** page immediately synchronizes your account status in SQLite, dismissing the header badge across all open sessions.
    `,
  },
  {
    slug: 'managing-approval-notifications',
    categoryId: 'notifications',
    title: 'Actionable Notifications: Triaging Approvals & Remediation Requests',
    summary: 'How security operators receive, review, and act on pending remediation requests directly from notification streams.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['actionable notifications', 'approvals', 'remediation review', 'workflow', 'one-click'],
    content: `
# Actionable Notifications & Approval Triage

Sentinel notifications are fully interactive and actionable, enabling operators to move from alert to resolution in seconds.

## One-Click Triage Workflow
Every notification item includes deep-link references to the underlying platform surface:
- Clicking **Take action &rarr;** on a boundary check takes you directly to the **Findings** forensic workbench.
- Clicking an approval alert routes directly to the **Approvals Gate**, where side-by-side AST code diffs can be evaluated.
- Reviewing an item automatically marks that specific alert as resolved while preserving historical audit logs.
    `,
  },

  // 14. Security & Privacy
  {
    slug: 'authorized-testing-boundary',
    categoryId: 'security',
    title: 'Authorized Testing Boundaries & MicroVM Enclave Isolation',
    summary: 'Deep dive into Sentinel defense-in-depth isolation model, gVisor MicroVM envelopes, and read-only host mounts.',
    readTime: '6 min read',
    lastUpdated: 'September 2026',
    keywords: ['authorized boundary', 'sandbox', 'microvm', 'gvisor', 'isolation', 'defense in depth'],
    content: `
# Authorized Testing Boundaries & MicroVM Isolation

Sentinel operates under the core principle of **Guaranteed Containment**: autonomous AI agents are never granted untrusted execution access to bare-metal host operating systems.

## Isolation Architecture
1. **MicroVM Sandboxes**: Each agent tool handler executes inside an ephemeral MicroVM envelope powered by gVisor user-space kernels.
2. **Read-Only System Mounts**: Root operating system directories (\`/etc\`, \`/bin\`, \`/usr\`) are mounted strictly read-only with \`noexec\` flags.
3. **Restricted Ephemeral Workspaces**: Tool file generation and data scraping are restricted to temporary sandbox paths that are wiped after scan completion.
4. **Syscall Interception**: Any process attempting low-level socket creation, ptrace inspection, or unauthorized process spawning is aborted by the kernel monitor.
    `,
  },
  {
    slug: 'rbac-role-hierarchy',
    categoryId: 'security',
    title: '3-Tier Role-Based Access Control: OWNER, ADMIN, and USER',
    summary: 'Understanding the authorization matrix, permission boundaries, and immutable protection invariants for Sentinel accounts.',
    readTime: '5 min read',
    lastUpdated: 'September 2026',
    keywords: ['rbac', 'roles', 'owner', 'admin', 'user', 'permissions', 'least privilege'],
    content: `
# 3-Tier Role-Based Access Control (RBAC)

Sentinel implements a rigorous 3-tier hierarchical permission model (\`OWNER\` > \`ADMIN\` > \`USER\`) to ensure the principle of least privilege across enterprise teams.

## Role Capabilities & Hierarchy

### 1. OWNER (Super Administrator)
- The highest authority in the platform tenant.
- Has unrestricted access to the entire **Admin Centre** and all configuration consoles.
- Can promote regular \`USER\` accounts to \`ADMIN\`.
- Can demote \`ADMIN\` accounts back to \`USER\`.
- Can suspend or terminate both \`USER\` and \`ADMIN\` accounts.
- **Immutable Protection Invariant**: The \`OWNER\` account can never be demoted, suspended, or terminated by any other user or admin.

### 2. ADMIN (Operations Administrator)
- Has full access to the **Admin Centre** and platform telemetry.
- Can manage normal \`USER\` accounts (provisioning, reviewing, suspending).
- Can execute security scans, trigger remediation, and inspect audit logs.
- **Privilege Boundary**: An \`ADMIN\` cannot demote or terminate the \`OWNER\`, nor can they modify another \`ADMIN\`'s role.

### 3. USER (Operator / Developer)
- Access to the security dashboard, findings explorer, scans, and AI assistant.
- Can submit remediation requests and review assigned agent targets.
- Cannot access the **Admin Centre** or manage user permissions.
    `,
  },
  {
    slug: 'human-in-the-loop-approvals',
    categoryId: 'security',
    title: 'Human-in-the-Loop Governance & Mandatory Approval Gates',
    summary: 'How Sentinel prevents rogue agent actions by requiring cryptographic human sign-off on sensitive operations.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['human in the loop', 'hitl', 'approvals', 'governance', 'blast radius', 'signing'],
    content: `
# Human-in-the-Loop Governance

Autonomous agents should never have unilateral authority to modify production codebases or firewall rules without human oversight. Sentinel enforces strict **Approval Gates**.

## Mandatory Approval Policies
Operations requiring mandatory human sign-off:
- Applying automated AST patches to agent tool handlers.
- Modifying declared resource permissions in an active **Agent Passport**.
- Deleting security findings or changing baseline risk tolerances.

## Blast Radius Previews
Before approving an action, operators are presented with a calculated **Blast Radius Assessment**:
- Number of affected agents and downstream microservices.
- Visual side-by-side AST code diffs highlighting exact additions and deletions.
- Estimated rollback complexity.
    `,
  },
  {
    slug: 'data-privacy-dob-policy',
    categoryId: 'security',
    title: 'Operator Privacy, DOB Protection & Tamper-Evident Audit Logs',
    summary: 'How Sentinel protects sensitive operator information, enforces 18+ age verification privately, and secures session tokens.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['privacy', 'dob', 'date of birth', 'jwt', 'bcrypt', 'audit logs', 'wal'],
    content: `
# Operator Privacy & Data Protection

Sentinel is built from the ground up with defense-in-depth data privacy and cryptographic credential protection.

## Session Security & Cookie Protection
- Authentication tokens are signed with HMAC-SHA256 using server-only secrets.
- Cookies are issued with \`HttpOnly\`, \`SameSite=Lax\`, and \`Secure\` attributes, making them completely immune to client-side XSS token theft.

## Private Age Verification (DOB)
- Operator Date of Birth is collected solely to satisfy legal 18+ regulatory compliance for autonomous system operation.
- Raw birthdates are strictly confined to administrative security verification and are never exposed publicly, displayed on public profile cards, or included in client search responses.

## Tamper-Evident SQLite WAL Audit Logs
All security actions—including login attempts, scans, role promotions, and patch executions—are recorded in SQLite Write-Ahead Logging (WAL) audit journals with microsecond timestamps and operator cryptographic fingerprints.
    `,
  },

  // 15. Owner & Admin
  {
    slug: 'tenant-workspace-management',
    categoryId: 'owner',
    title: 'Tenant Workspace Administration, Fleet Quotas & Isolation Domains',
    summary: 'Platform Owner guide to managing multi-tenant workspaces, agent quotas, default policies, and security baselines.',
    readTime: '5 min read',
    lastUpdated: 'September 2026',
    keywords: ['workspace', 'tenant', 'fleet quotas', 'isolation', 'owner guide'],
    content: `
# Tenant Workspace Administration

As a Sentinel **Platform Owner**, you have full control over organization workspaces, isolation policies, and global agent fleet configurations.

## Workspace Isolation Domains
Every workspace in Sentinel acts as a hard security boundary:
- Agents, scans, findings, and evidence vaults are strictly segmented by \`workspaceId\`.
- Cross-tenant data leakage is prevented through foreign-key schema constraints and automated server-action authorization checks.

## Fleet Governance & Quotas
Platform Owners can configure:
- Maximum concurrent agent scanning tasks.
- Storage limits for raw tool telemetry and forensic investigation replays.
- Default security postures (Strict MicroVM containment vs. Permissive Shadow Mode).
    `,
  },
  {
    slug: 'admin-governance-audit',
    categoryId: 'owner',
    title: 'Admin Governance, Operator Delegation & Privileged Audit Logging',
    summary: 'How Platform Owners promote operators to Admins, enforce least-privilege delegation, and review privileged activity.',
    readTime: '4 min read',
    lastUpdated: 'September 2026',
    keywords: ['admin governance', 'delegation', 'promotion', 'demotion', 'audit logs', 'privilege'],
    content: `
# Admin Governance & Privileged Audit Logging

Platform Owners maintain exclusive authority over administrative delegation and governance auditing within Sentinel.

## Promoting & Demoting Administrators
1. Navigate to the **Admin Centre** (\`/owner\` or \`/admin\`).
2. In the **Operators & Roles** directory, locate the target user.
3. Select **Promote to Admin** to grant administrative privileges.
4. If an administrator role is no longer needed, select **Demote to User** to instantly revoke Admin Centre access.

## Reviewing Privileged Audit Logs
Every privileged event—including role changes, account suspensions, and policy overrides—generates an immutable audit log entry in the system ledger. The Platform Owner can filter and inspect these events at any time to verify compliance with corporate security standards.
    `,
  },
];

export const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    term: 'Agent Passport',
    category: 'Agents',
    definition: 'An immutable, cryptographically signed manifest declaring an AI agent’s operational scope, allowed tools, and trust index.',
    relatedCategorySlug: 'agents',
  },
  {
    term: 'AST Patch',
    category: 'Remediation',
    definition: 'An Abstract Syntax Tree code diff applied to tool handlers to mathematically enforce security boundaries without altering program logic.',
    relatedCategorySlug: 'remediation',
  },
  {
    term: 'Boundary Policy',
    category: 'Security',
    definition: 'A deterministic rule defining which filesystem paths, system calls, and network addresses an agent is permitted to touch.',
    relatedCategorySlug: 'security',
  },
  {
    term: 'Configuration Drift',
    category: 'Agents',
    definition: 'Discrepancies detected between an agent’s declared baseline manifest and its actual active runtime configuration.',
    relatedCategorySlug: 'agents',
  },
  {
    term: 'Execution Envelope',
    category: 'Security',
    definition: 'A sandboxed MicroVM or gVisor container isolating agent tool execution from the host operating system.',
    relatedCategorySlug: 'security',
  },
  {
    term: 'False-Positive Assistant',
    category: 'Findings',
    definition: 'An interactive review wizard allowing operators to evaluate benign anomalies and calibrate detection rules safely.',
    relatedCategorySlug: 'findings',
  },
  {
    term: 'Model Context Protocol (MCP)',
    category: 'Integrations',
    definition: 'An open standard by Anthropic enabling AI models to safely access external data repositories, tools, and execution contexts.',
    relatedCategorySlug: 'integrations',
  },
  {
    term: 'Passkey',
    category: 'Account',
    definition: 'A cryptographic FIDO2/WebAuthn credential stored on an operator’s device providing passwordless, phishing-resistant authentication.',
    relatedCategorySlug: 'account',
  },
  {
    term: 'Prompt Injection',
    category: 'Findings',
    definition: 'An attack technique where adversarial instructions embedded in untrusted data subvert the AI model’s original operating system prompt.',
    relatedCategorySlug: 'findings',
  },
  {
    term: 'Retest Gate',
    category: 'Retesting',
    definition: 'An automated security probe replaying verified attack payloads to mathematically validate whether a vulnerability is fixed.',
    relatedCategorySlug: 'retesting',
  },
  {
    term: 'Shadow Mode',
    category: 'Agents',
    definition: 'A non-blocking observation mode where Sentinel logs simulated policy decisions to calculate least-privilege permissions with zero risk.',
    relatedCategorySlug: 'agents',
  },
  {
    term: 'Trust Graph',
    category: 'Agents',
    definition: 'A visual relationship diagram tracing permissions and data flow from Agent to Tool to Resource to Sensitive Enterprise Data.',
    relatedCategorySlug: 'agents',
  },
];

export const GLOSSARY_ITEMS = GLOSSARY_TERMS;

export const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  { category: 'Navigation', keyCombo: ['⌘', 'K'], description: 'Open Spotlight Command Palette & Search' },
  { category: 'Navigation', keyCombo: ['ESC'], description: 'Close modals, drawers, and command palette' },
  { category: 'Navigation', keyCombo: ['G', 'O'], description: 'Navigate to Security Overview' },
  { category: 'Navigation', keyCombo: ['G', 'A'], description: 'Navigate to Agents & Passports' },
  { category: 'Navigation', keyCombo: ['G', 'S'], description: 'Navigate to Security Scans' },
  { category: 'Navigation', keyCombo: ['G', 'F'], description: 'Navigate to Findings Workbench' },
  { category: 'Navigation', keyCombo: ['G', 'R'], description: 'Navigate to Remediation Engine' },
  { category: 'Navigation', keyCombo: ['G', 'P'], description: 'Navigate to Operator Profile' },
  { category: 'Actions', keyCombo: ['⌘', 'N'], description: 'Launch a New Security Scan' },
  { category: 'Actions', keyCombo: ['SPACE'], description: 'Play / Pause Investigation Replay scrubber' },
  { category: 'Actions', keyCombo: ['←'], description: 'Step backward in Investigation Replay' },
  { category: 'Actions', keyCombo: ['→'], description: 'Step forward in Investigation Replay' },
];

export function getAllCategories(): SupportCategory[] {
  return SUPPORT_CATEGORIES.map((cat) => ({
    ...cat,
    articleCount: SUPPORT_ARTICLES.filter((a) => a.categoryId === cat.id).length,
  }));
}

export function getCategoryById(id: string): SupportCategory | undefined {
  return SUPPORT_CATEGORIES.find((c) => c.id === id);
}

export function getArticlesForCategory(catId: string): SupportArticle[] {
  return SUPPORT_ARTICLES.filter((a) => a.categoryId === catId);
}

export function getArticle(catId: string, slug: string): SupportArticle | undefined {
  return SUPPORT_ARTICLES.find((a) => a.categoryId === catId && a.slug === slug);
}

export function searchSupport(query: string): SupportArticle[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return SUPPORT_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.keywords.some((k) => k.toLowerCase().includes(q)) ||
      a.content.toLowerCase().includes(q)
  );
}

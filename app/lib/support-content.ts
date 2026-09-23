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
    description: 'Operator identity, biometric passkeys, unique @username handles, and 18+ verification.',
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
    description: 'Diagnosing failed scans, biometric passkey pairing issues, and SSO identity resolving.',
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
    title: 'Setting Up & Authenticating with Biometric Passkeys',
    summary: 'Enroll Touch ID, Face ID, or hardware FIDO2 security keys for instant passwordless sign-in.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['passkeys', 'webauthn', 'touch id', 'face id', 'biometrics', 'fido2', 'passwordless'],
    content: `
# Biometric Passkeys in Sentinel

Sentinel supports the W3C Web Authentication standard (WebAuthn) for secure, phishing-resistant, passwordless authentication.

## How to Set Up a Passkey
1. Sign in with your operator credentials.
2. Navigate to **Profile &rarr; Security** in the account menu.
3. Under *Biometric Passkeys & FIDO2*, click **Register New Passkey**.
4. When prompted by your operating system, verify your Touch ID, Face ID, or touch your YubiKey.
5. Your passkey is now active and ready for one-touch login on the **Sign In with Passkey** screen.
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
    title: 'Troubleshooting Passkey & Biometric Sign-In',
    summary: 'Diagnosing platform authenticator errors, browser permission blocks, and timeout issues.',
    readTime: '3 min read',
    lastUpdated: 'September 2026',
    keywords: ['passkey troubleshooting', 'touch id error', 'webauthn failed', 'not allowed'],
    content: `
# Troubleshooting Passkeys

If you encounter issues signing in with a Passkey:

### 1. Browser Support
Ensure you are using a modern browser engine (Safari 16+, Chrome 108+, Edge 108+, Firefox 122+) on a device with biometric sensors or a FIDO2 hardware key.

### 2. HTTPS or Localhost Requirement
WebAuthn is strictly restricted to secure contexts (\`https://\` or \`http://localhost\`).

### 3. User Cancelled Prompt
If you accidentally dismissed the OS biometric prompt, click **Sign in with Passkey** again to re-trigger the challenge.
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

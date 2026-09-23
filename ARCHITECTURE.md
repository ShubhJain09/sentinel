# Sentinel — System Architecture & Design Philosophy

**Sentinel** is an enterprise-grade AI Security & Autonomous Agent Governance platform designed to audit, monitor, and enforce strict execution boundaries on autonomous AI agents, tool runtimes (MCP), and code execution sandboxes.

---

## 1. High-Level Architecture Diagram

```
                              ┌────────────────────────────────────────────────────────┐
                              │                    Client Browser                      │
                              │   - Next.js 15 React Server Components (RSC)           │
                              │   - Interactive Client Islands ("use client")          │
                              │   - Liquid Glass HUD Design System                     │
                              └───────────────────────────┬────────────────────────────┘
                                                          │
                                     HTTPS / SameSite=Lax Session Cookie
                                                          │
                                                          ▼
                              ┌────────────────────────────────────────────────────────┐
                              │             Edge Middleware (`middleware.ts`)          │
                              │   - Decodes `sentinel-session` JWT via Jose            │
                              │   - Enforces public vs authenticated route boundaries  │
                              │   - Enforces `/owner` & `/owner/*` RBAC policies       │
                              │   - Blocks unauthenticated access -> `/login`          │
                              │   - Sanitizes & validates open redirect URLs           │
                              └───────────────────────────┬────────────────────────────┘
                                                          │
                                ┌─────────────────────────┴─────────────────────────┐
                                │                                                   │
                                ▼                                                   ▼
┌───────────────────────────────────────────────────────┐   ┌───────────────────────────────────────────────────┐
│              Next.js Route Handlers                   │   │               Server Actions                      │
│            (`app/api/*`)                              │   │          (`app/actions/*`)                        │
│ - OAuth Callback Handlers (Google, Apple)             │   │ - Scan Execution (`scans.ts`)                     │
│ - Session Refresh Handler (`/api/auth/refresh`)       │   │ - Remediation Approvals (`approvals.ts`)          │
│ - Avatar Upload with Magic Bytes (`/api/upload/...`)  │   │ - Autonomous Agent Drift (`agents.ts`)            │
│ - Auth Providers Discovery (`/api/auth/providers`)    │   │ - Admin Role Provisioning (`owner.ts`)            │
│ - Username Uniqueness Check                           │   │ - AI Workspace Sessions (`ai-workspace.ts`)       │
└───────────────────────────────┬───────────────────────┘   └───────────────────────────┬───────────────────────┘
                                │                                                       │
                                └─────────────────────────┬─────────────────────────────┘
                                                          │
                                                          ▼
                              ┌────────────────────────────────────────────────────────┐
                              │            Core Security & Auth Subsystem              │
                              │ - `app/lib/auth.ts`: Live DB state check + JWT verify  │
                              │ - `app/lib/permissions.ts`: 3-tier RBAC engine         │
                              │ - `app/lib/email.ts`: Multi-provider transactional bus │
                              └───────────────────────────┬────────────────────────────┘
                                                          │
                                ┌─────────────────────────┴─────────────────────────┐
                                │                                                   │
                                ▼                                                   ▼
┌───────────────────────────────────────────────────────┐   ┌───────────────────────────────────────────────────┐
│                  Database Layer                       │   │             AI Security Runtime                   │
│             (`app/lib/db.ts`)                         │   │          (`app/lib/ai-provider.ts`)               │
│ - SQLite 3 with Better-SQLite3 (In-process C++)       │   │ - Provider Abstraction (`AiProvider` interface)   │
│ - WAL Mode (Write-Ahead Logging for high concurrency) │   │ - Sentinel Deterministic Sandbox Engine (Built-in)│
│ - Foreign Key Enforcement                             │   │ - TrueForge / TrueFoundry Live Interception       │
│ - Parameterized Queries (Anti-SQLi)                   │   │ - Groq LPU High-Throughput Inference Engine       │
│ - Automated Idempotent Migrations                     │   │ - Sandbox Containment & Path Traversal Verifier   │
└───────────────────────────────────────────────────────┘   └───────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Layers

### Layer 1: Frontend & Presentation Layer
- **Framework**: Next.js 15 with React Server Components (RSC) and the App Router (`app/`).
- **Rendering Strategy**:
  - **Server Components by default**: All layout shells (`app/(app)/layout.tsx`), overview dashboards, and data fetchers execute on the server. Data flows directly from SQLite into HTML without client-side waterfall API roundtrips.
  - **Targeted Client Islands (`"use client"`)**: Interactive elements (modals, search drawers, filters, live charts, tab switches) are isolated into client components (e.g., `scans-client.tsx`, `users-client.tsx`, `workspace-content.tsx`).
- **Styling**: Tailwind CSS combined with custom CSS custom properties defined in `app/globals.css`.
- **Design System**: Sentinel's custom **Liquid Glass HUD** aesthetic:
  - Dark theme by default with atmospheric backdrops (`--bg-primary: #0a0d12`).
  - High-contrast typography and semantic status indicators (`--status-safe`, `--status-warning`, `--status-critical`).
  - Tactile glassmorphism surfaces (`glass-panel`, subtle borders, and smooth transitions).

---

### Layer 2: Edge Middleware & Routing Security
- **File**: `middleware.ts`
- **Execution Environment**: Next.js Edge Runtime.
- **Responsibilities**:
  1. **Public vs Private Route Partitioning**:
     - Public routes: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-login`, `/about`, `/security`, `/privacy`, `/terms`, `/support`, `/api/auth/*`.
     - Protected routes: All routes under `app/(app)/*` (`/overview`, `/agents`, `/scans`, `/findings`, `/investigations`, `/evidence`, `/approvals`, `/remediation`, `/retests`, `/ai-workspace`, `/profile`, `/owner`).
  2. **Fast Token Verification**:
     - Uses `jose` (`jwtVerify`) with `HS256` to decode `sentinel-session`.
     - Rejects expired or tampered session tokens instantly with zero database overhead.
  3. **Role-Based Edge Gatekeeping**:
     - Routes starting with `/owner` require `role: 'owner'` or `role: 'admin'`.
     - Owner-only surfaces (`/owner/secrets`, `/owner/diagnostics`, `/owner/security`) are strictly reserved for `role: 'owner'`.
     - If a normal user attempts to access `/owner`, Edge Middleware transparently bounces them through `/api/auth/refresh` to check if they were recently promoted. If still a standard user, they are redirected to `/overview?error=Unauthorized+access`.
  4. **Open Redirect Defense**:
     - All `redirect` query parameters are strictly checked: they must begin with `/` and must NOT begin with `//` or `/\`, preventing off-site phishing redirects.

---

### Layer 3: Server Actions & Backend Mutations
- **Directory**: `app/actions/`
- **Modular Structure**: Actions are partitioned into single-responsibility domains (`auth.ts` for core auth, `profile.ts` for operator profiles, `password-reset.ts` for account recovery, `scans.ts`, `approvals.ts`, `agents.ts`, `owner.ts`, `ai-workspace.ts`), with `auth.ts` maintaining backwards-compatible re-exports.
- **Security Invariants**:
  - Every server action starts with `'use server'`.
  - **Session Validation**: Every action begins by calling `const session = await getSession(); if (!session) throw new Error('Unauthorized');`.
  - **Capability Authorization**: Actions call `requirePermission(session.role, 'capability')` or `hasPermission(...)` from `app/lib/permissions.ts`.
  - **CSRF Protection**: Next.js Server Actions automatically validate the `Host` and `Origin` headers against the incoming request, providing built-in protection against cross-site request forgery.
  - **Audit Logging**: All state-changing mutations (`scan.create`, `approval.approved`, `user.suspended`, `agent.shadow_mode_toggled`) append immutable records to the `audit_events` table in SQLite.

---

### Layer 4: Authentication & Session Subsystem
- **Files**: `app/lib/auth.ts`, `app/lib/permissions.ts`, `app/api/auth/*`
- **Three-Level Role Hierarchy**:
  1. **`OWNER`**: Super-admin privileges (`'*'`). Manages platform secrets, assigns/promotes/demotes user roles, manages administrators, and configures third-party integrations.
  2. **`ADMIN`**: Operational administrator. Can access the Admin Centre (`/owner`), provision users, review scans, trigger remediations, and configure agents. Cannot modify roles or terminate other admins.
  3. **`USER`**: Standard analyst. Can create/view scans, inspect findings/evidence, view assigned agents, and collaborate in the AI Workspace.
- **Session Cookie Security**:
  - Cookie Name: `sentinel-session`
  - Flags: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (in production), `path: '/'`.
  - Expiration: 7 days sliding window.
- **Live State Cross-Check Pattern**:
  - `getSession()` extracts the JWT payload, then **immediately cross-checks** the live record in SQLite via `getUserById(userId)`.
  - If the user account has been deactivated (`isActive === 0`), `getSession()` returns `null` instantly, revoking active browser sessions without waiting for JWT expiration.
  - If the user was promoted in SQLite, `session.role` is updated dynamically in memory.
- **Password Security**:
  - Passwords hashed using `bcryptjs` with 10 salt rounds.
  - Enforces minimum 8 characters, uppercase, lowercase, numbers, and special characters.
- **Multi-Factor Authentication (MFA / OTP)**:
  - 6-digit numeric OTP with 10-minute expiry window stored in `login_challenges`.
  - Delivered via transactional email (Resend, Postmark, SMTP) with fallback to local outbox.

---

### Layer 5: Database Layer (SQLite + Better-SQLite3)
- **File**: `app/lib/db.ts`
- **Engine**: SQLite 3 using the high-performance synchronous C++ wrapper `better-sqlite3`.
- **Concurrency & Integrity**:
  - `journal_mode = WAL`: Write-Ahead Logging allows readers to execute concurrently with writers, preventing lock contention.
  - `foreign_keys = ON`: Enforces relational integrity across workspaces, users, scans, findings, and evidence.
- **Zero-Downtime Migrations**:
  - Schema tables are created with `CREATE TABLE IF NOT EXISTS`.
  - Column schema migrations are applied idempotently using `ALTER TABLE ... ADD COLUMN` inside safe exception guards.
- **SQL Injection Prevention**:
  - 100% of queries use prepared statements with parameter binding:
    ```typescript
    db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    ```

---

### Layer 6: AI Security Runtime & Sandbox Containment
- **File**: `app/lib/ai-provider.ts`
- **Purpose**: Provides a unified interface (`AiProvider`) to analyze security findings, propose minimal-blast-radius code remediations, and run sandbox boundary inspections.
- **Providers**:
  1. **`SentinelSandboxEngine` (Default)**:
     - Built-in, deterministic security verification engine.
     - Operates out of the box with zero third-party dependencies or external API keys.
     - Tests directory traversal containment (`../fixtures/private-note.txt`), prompt injection barriers, and MCP tool permissions.
  2. **`TrueForgeProvider`**:
     - Enterprise agent platform gateway for live agent interception and telemetry.
     - Activated via `TRUEFORGE_API_KEY`.
  3. **`GroqProvider`**:
     - Sub-second LPU inference engine for AST reasoning and taint tracking.
     - Activated via `GROQ_API_KEY`.
- **Remediation Lifecycle**:
  1. Automated scan flags boundary violation -> finding generated.
  2. AI Provider drafts unified diff patch (`codeDiff`).
  3. Human reviewer inspects proposed patch in `/approvals`.
  4. Upon approval, patch is applied to sandbox boundary fixtures and automatically retested (`/retests`).

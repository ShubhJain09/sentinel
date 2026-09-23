# Sentinel — Security Model & Engineering Guidelines

Security is foundational to Sentinel. This document outlines the platform's security architecture, threat model, defense-in-depth layers, and secure coding practices for contributors.

---

## 1. Security Architecture & Threat Model

Sentinel operates under the assumption that agents, external tools (MCP servers), and network inputs are untrusted until proven otherwise.

```
┌────────────────────────────────────────────────────────┐
│                   Threat Vectors                       │
├────────────────────────────────────────────────────────┤
│ 1. Malicious Agent Instruction Injection               │
│ 2. MCP Server Path Traversal / File System Escape      │
│ 3. Unauthorized API Access / Privilege Escalation       │
│ 4. Cross-Site Scripting (XSS) & Token Exfiltration     │
│ 5. Cross-Site Request Forgery (CSRF)                   │
│ 6. Open Redirect & Phishing Vulnerabilities            │
│ 7. Parameter Tampering & SQL Injection                 │
└────────────────────────────────────────────────────────┘
```

---

## 2. Defense-in-Depth Implementation

Sentinel enforces security across multiple independent boundaries:

### Layer A: Edge Network & Middleware Layer
- **Token Cryptography**: Session tokens are signed using HMAC-SHA256 with an edge-compatible `jose` runtime.
- **Fail-Closed Default**: Any unrecognized route or tampered cookie is rejected immediately.
- **Open Redirect Sanitization**: Any target URL in a `redirect=` query parameter is validated against strict origin containment (`/` prefix, blocking `//` protocol-relative and `/\` backslash bypasses).

### Layer B: Server Action & API Layer
- **Mandatory Session Validation**: Every server action validates `getSession()` before executing any query or mutation.
- **Capability Authorization Matrix**: Role checks use fine-grained permission tokens (e.g. `remediation.manage`, `scan.create`, `agent.manage`) rather than coarse-grained checks.
- **Strict Role Boundaries**:
  - `OWNER`: Wildcard capabilities (`'*'`). Only role allowed to promote/demote admins or access secrets.
  - `ADMIN`: Operational management. Cannot demote/terminate other admins or access owner secrets.
  - `USER`: Workspace viewer/analyst. Cannot modify configurations or approve patches.
- **CSRF Defense**: Next.js Server Actions automatically verify the incoming `Host` and `Origin` headers against the application domain, preventing cross-origin invocation.

### Layer C: Database & Data Integrity Layer
- **SQL Injection Elimination**: 100% of SQL statements in `app/lib/db.ts` use parameterized queries (`db.prepare('... WHERE id = ?').run(id)`). String interpolation is strictly prohibited.
- **Live User State Verification**: `getSession()` queries SQLite on every request to confirm `isActive = 1`. A suspended or terminated user's access is revoked instantaneously.
- **Relational Integrity**: SQLite foreign key constraints (`PRAGMA foreign_keys = ON`) enforce referential integrity.

### Layer D: Upload & Sandbox Boundary Layer
- **Avatar Upload Security**:
  - Max file size: 5MB.
  - MIME type restriction: JPEG, PNG, WebP, GIF.
  - **Magic Byte Verification**: File contents are inspected for binary format headers (`0xFF 0xD8`, `0x89 0x50 0x4E 0x47`, etc.) to prevent polyglot file uploads.
  - **Extension Derivation**: Extension is derived from verified magic bytes rather than client-supplied filename.
  - **Path Containment**: File deletions and writes use canonical `path.join` and `path.basename` to prevent directory traversal.
- **AI Sandbox Boundary**:
  - MCP and agent tools operate inside sandboxed workspace directories.
  - Boundary violations (e.g. `../fixtures/private-note.txt`) are flagged, logged with evidence, and routed for human approval before patches are committed.

---

## 3. Safe Development Guidelines for Contributors

1. **Always Use Parameterized Queries**:
   ```typescript
   // CORRECT:
   db.prepare('SELECT * FROM scans WHERE id = ?').get(scanId);

   // FORBIDDEN:
   db.prepare(`SELECT * FROM scans WHERE id = '${scanId}'`).get();
   ```

2. **Always Enforce Authorization in Server Actions**:
   ```typescript
   export async function myAction() {
     const session = await getSession();
     if (!session) throw new Error('Unauthorized');
     requirePermission(session.role, 'my.action');
     // ...
   }
   ```

3. **Never Log Sensitive Information**:
   - Passwords, OTP codes, reset tokens, and raw API keys must NEVER appear in server logs or audit events.
   - Use token masking utilities where logging is necessary.

4. **Preserve HTTP-Only Cookie Flags**:
   - Never allow cookies to be read by client-side scripts. Keep `httpOnly: true` on `sentinel-session`.

5. **Run the CI Check Suite Before Committing**:
   ```bash
   npm test
   ```
   All 50 automated tests must pass with zero failures.

---

## 4. Reporting Security Vulnerabilities

If you discover a security vulnerability in Sentinel, please do not file a public issue. Contact the security team directly at `security@sentinel.security`. We take all vulnerability reports seriously and will acknowledge receipt within 24 hours.

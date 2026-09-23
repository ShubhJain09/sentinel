# Sentinel — Autonomous AI Agent Security & Governance Platform

<div align="center">
  <h3>Runtime boundary enforcement, telemetry interception, and automated remediation for autonomous AI agents and tool-calling execution sandboxes.</h3>
</div>

---

## Overview

**Sentinel** is an enterprise-grade security and governance platform built to solve the hardest problems in agentic AI deployments:
- **Sandbox Boundary Violations**: Detecting and preventing directory traversal and unauthorized filesystem access in tool runtimes (MCP).
- **Prompt Injection & Instruction Drift**: Continuous monitoring of agent directives and task containment.
- **Human-in-the-Loop Remediation**: Automated unified-diff patch generation, security approval workflows, and automated verification retests.
- **Enterprise Access Governance**: Robust 3-level role hierarchy (`OWNER` > `ADMIN` > `USER`), multi-factor authentication (email OTP), and immutable audit logs.

---

## Architecture & Documentation Suite

For comprehensive documentation, explore the specialized guides:

| Document | Purpose |
|---|---|
| [**MENTOR_WALKTHROUGH.md**](./MENTOR_WALKTHROUGH.md) | 15 core concepts explained for beginners and a 5-minute technical walkthrough script. |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | High-level system architecture, ASCII component diagram, and layer breakdown. |
| [**CODEBASE_GUIDE.md**](./CODEBASE_GUIDE.md) | Directory structure walkthrough, module boundaries, and developer how-to recipes. |
| [**REQUEST_FLOW.md**](./REQUEST_FLOW.md) | Step-by-step traces with exact file references for 10 core application flows. |
| [**ENVIRONMENT.md**](./ENVIRONMENT.md) | Complete reference of environment variables across Core, Auth, Email, and AI providers. |
| [**SECURITY.md**](./SECURITY.md) | Threat model, defense-in-depth architecture, and safe coding practices. |

---

## Key Features

- **Liquid Glass HUD Design System**: Responsive, high-contrast dark theme optimized for SOC analysts and security operators.
- **3-Level Role-Based Access Control**:
  - `OWNER`: Platform super-admin with wildcard capabilities (`'*'`), secret management, and admin provisioning.
  - `ADMIN`: Operational administrator managing scans, findings, users, and remediations.
  - `USER`: Standard security analyst with scan creation and investigation review capabilities.
- **Defense-in-Depth Authentication**:
  - Email + Password with bcrypt (10 rounds) and password complexity policy.
  - 6-digit Email OTP challenge verification.
  - Google OAuth 2.0 & Passkeys (WebAuthn).
  - Profile password change with current password verification.
- **Multi-Provider Transactional Email Bus**:
  - Resend REST API (priority).
  - Postmark REST API.
  - Custom SMTP Relay.
  - Local Outbox fallback for zero-dependency local development.
- **AI Security Runtime**:
  - Built-in deterministic security verification engine (`SentinelSandboxEngine`).
  - TrueForge / TrueFoundry live agent telemetry interception.
  - Groq LPU high-throughput inference engine.
- **Zero-External-Dependency Local Database**:
  - SQLite 3 powered by `better-sqlite3` running in WAL (Write-Ahead Logging) mode.

---

## Quickstart

### 1. Prerequisites
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm**: v9 or later

### 2. Installation
```bash
git clone https://github.com/your-org/sentinel.git
cd sentinel
npm install
```

### 3. Environment Configuration
Copy the annotated template to `.env.local`:
```bash
cp .env.example .env.local
```
*(Sentinel works out of the box with the default fallback settings for local development. Configure `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, or `GROQ_API_KEY` in `.env.local` to enable external services).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Assurance

Sentinel includes a comprehensive automated quality and security audit suite:

```bash
# Run the 50-point automated CI/CT verification suite
npm test

# Run TypeScript static type checking
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Compile production build
npm run build
```

---

## Default Administrative Credentials (Local Development)

| Role | Email | Notes |
|---|---|---|
| **OWNER** | `owner@sentinel.security` | Designated in `OWNER_EMAIL`. Full platform authority. |
| **ADMIN** | `admin@sentinel.security` | Admin Centre access. Operational management. |
| **USER** | `user@sentinel.security` | Standard analyst access. |

---

## License

Proprietary and confidential. Developed for Sentinel Security Systems.

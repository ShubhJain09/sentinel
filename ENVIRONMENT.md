# Sentinel — Environment Variables Reference Guide

This document provides a comprehensive reference for all environment variables supported by Sentinel.

> [!IMPORTANT]
> **Security Rules**:
> 1. Never commit `.env`, `.env.local`, or any file containing real API keys to version control.
> 2. Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser. All other variables are strictly server-only.
> 3. For local development, copy `.env.example` to `.env.local` and populate your credentials.

---

## Variable Reference Matrix

| Variable Name | Scope | Required / Optional | Default Value | Description |
|---|:---:|:---:|---|---|
| `JWT_SECRET` | Server-only | **Required** | *No default* | HMAC-SHA256 secret key for signing session tokens (min 32 chars). The application fails closed when it is absent or too short. |
| `DATABASE_PATH` | Server-only | Optional | `./sentinel.db` | Filesystem path for the primary SQLite database file. |
| `APP_URL` | Server-only | Optional | `http://localhost:3000` | Canonical public origin URL used for email links and OAuth callbacks. |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Optional | `http://localhost:3000` | Public URL exposed to client components for shareable links. |
| `OWNER_EMAIL` | Server-only | Optional | *Unset* | Comma-separated list of email addresses granted permanent platform OWNER privileges. |
| `EMAIL_FROM` | Server-only | Optional | `Sentinel Security <security@sentinel.security>` | The display name and email address appearing in the `From:` header of outgoing emails. |
| `RESEND_API_KEY` | Server-only | Optional | *Unset* | API key for the Resend transactional email service (priority provider). |
| `POSTMARK_SERVER_TOKEN` | Server-only | Optional | *Unset* | Server token for Postmark transactional email delivery. |
| `SMTP_HOST` | Server-only | Optional | *Unset* | Hostname for custom SMTP relay (e.g. `smtp.mailgun.org`). |
| `SMTP_PORT` | Server-only | Optional | `587` | Port number for custom SMTP relay. |
| `SMTP_USER` | Server-only | Optional | *Unset* | Username for authenticating with the SMTP relay. |
| `SMTP_PASS` | Server-only | Optional | *Unset* | Password for authenticating with the SMTP relay. |
| `SMTP_SECURE` | Server-only | Optional | `false` | Set to `true` for TLS on port 465, or `false` for STARTTLS. |
| `GOOGLE_CLIENT_ID` | Server-only | Optional | *Unset* | Google OAuth 2.0 Client ID for federated login. |
| `GOOGLE_CLIENT_SECRET` | Server-only | Optional | *Unset* | Google OAuth 2.0 Client Secret for exchanging authorization codes. |
| `APPLE_CLIENT_ID` | Server-only | Optional | *Unset* | Apple Services ID for Sign in with Apple. |
| `APPLE_TEAM_ID` | Server-only | Optional | *Unset* | Apple Developer Team ID. |
| `APPLE_KEY_ID` | Server-only | Optional | *Unset* | Apple Private Key Identifier. |
| `APPLE_PRIVATE_KEY` | Server-only | Optional | *Unset* | Apple Private Key PEM string. |
| `TRUEFORGE_API_KEY` | Server-only | Optional | *Unset* | API Key for TrueForge/TrueFoundry live agent runtime telemetry. |
| `GROQ_API_KEY` | Server-only | Optional | *Unset* | API Key for Groq ultra-low-latency LPU inference. |
| `OPENAI_API_KEY` | Server-only | Optional | *Unset* | API Key for OpenAI GPT reasoning models. |
| `ANTHROPIC_API_KEY` | Server-only | Optional | *Unset* | API Key for Anthropic Claude reasoning models. |
| `GEMINI_API_KEY` | Server-only | Optional | *Unset* | API Key for Google Gemini reasoning models. |

---

## Detailed Category Breakdown

### 1. Core Application & Security
- **`JWT_SECRET`**:
  - Used by `app/lib/auth.ts` to sign and verify HMAC-SHA256 session tokens.
  - In production, ensure this is a high-entropy cryptographically random string (e.g., generated with `openssl rand -base64 32`).
- **`OWNER_EMAIL`**:
  - Whenever `getSession()` validates a user session, it checks whether the user's email is included in this comma-separated list.
  - Any matching account is dynamically elevated to `role: 'owner'`, ensuring that platform recovery and initial owner bootstrap is always guaranteed.
- **`APP_URL` / `NEXT_PUBLIC_APP_URL`**:
  - Configures the base URL for password-reset hyperlinks and OAuth redirect validation.
  - In local development: `http://localhost:3000`.
  - In production: Set to your custom HTTPS domain (e.g., `https://sentinel.yourdomain.com`).

---

### 2. Transactional Email Provider Priority
Sentinel features an automated multi-provider transactional email bus in `app/lib/email.ts`. Provider selection follows a strict waterfall priority:

1. **Resend** (Checked first):
   - If `RESEND_API_KEY` is present, emails are dispatched via the Resend REST API (`https://api.resend.com/emails`).
   - Requires a verified domain in Resend corresponding to `EMAIL_FROM`.
2. **Postmark** (Checked second):
   - If `POSTMARK_SERVER_TOKEN` is present, emails are dispatched via Postmark's REST API.
3. **SMTP Relay** (Checked third):
   - If `SMTP_HOST` is present, emails are dispatched through Nodemailer over the configured SMTP server.
4. **Local Standby Outbox** (Fallback):
   - If no external email credentials are set, Sentinel does not crash.
   - Outgoing emails (OTP verification codes, password reset links) are recorded directly into the `audit_events` and database logs and printed to the server console for immediate developer access.

---

### 3. AI Security & Inference Engines
The AI engine abstraction in `app/lib/ai-provider.ts` routes telemetry analysis and inspection requests:

- **Built-in Deterministic Engine (`SentinelSandboxEngine`)**:
  - Always available. No API keys required.
  - Perfect for offline development, local unit tests, and air-gapped security demonstrations.
- **`TRUEFORGE_API_KEY`**:
  - Activates the `TrueForgeProvider`, enabling live agent telemetry interception, permission guardrail verification, and real-time proxy analysis.
- **`GROQ_API_KEY`**:
  - Activates the `GroqProvider`, enabling sub-second AST reasoning, taint tracking, and code boundary analysis on Groq LPUs.

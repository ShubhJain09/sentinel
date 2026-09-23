# Sentinel — Developer Codebase Guide

Welcome to the Sentinel codebase! This document is designed to help engineers, contributors, and beginners navigate the project structure, understand where specific functionality lives, and follow best practices when adding new features.

---

## 1. Directory Structure Tour

```
sentinel/
├── app/                          # Next.js 15 App Router source code
│   ├── (app)/                    # Authenticated application shell & pages
│   │   ├── layout.tsx            # Main application layout (header, sidebar, command palette)
│   │   ├── overview/             # Security overview dashboard
│   │   ├── agents/               # Autonomous agent inventory & passports
│   │   ├── scans/                # Security scans & inspections
│   │   ├── findings/             # Vulnerability & boundary violation findings
│   │   ├── investigations/       # Deep forensic investigation traces
│   │   ├── evidence/             # Raw evidence logs & telemetry records
│   │   ├── approvals/            # Human-in-the-loop remediation approvals
│   │   ├── remediation/          # Patch application & boundary fixes
│   │   ├── retests/              # Automated verification & retest results
│   │   ├── ai-workspace/         # Interactive security analyst AI workspace
│   │   ├── profile/              # User profile & credentials management
│   │   ├── settings/             # Workspace & appearance preferences
│   │   ├── owner/                # Admin Centre & Platform Owner Control Room
│   │   │   ├── layout.tsx        # RBAC gatekeeper for Admin Centre
│   │   │   ├── page.tsx          # Admin Centre dashboard
│   │   │   ├── users/            # User account provisioning & role management
│   │   │   ├── secrets/          # Owner-only credential & secret vault
│   │   │   ├── diagnostics/      # Owner-only system health & connectivity tests
│   │   │   └── security/         # Owner-only security policy controls
│   ├── (auth)/                   # Authentication flows (unauthenticated)
│   │   ├── layout.tsx            # Minimal auth card layout
│   │   ├── login/                # Email + Password, Google OAuth, Passkey login
│   │   ├── verify-login/         # 6-digit Email OTP challenge verification
│   │   ├── signup/               # New user registration
│   │   ├── forgot-password/      # Request password reset link
│   │   ├── reset-password/       # Validate token & submit new password
│   │   └── onboarding/           # First-time operator profile setup
│   ├── actions/                  # Next.js Server Actions ("use server" mutations)
│   │   ├── auth.ts               # Core auth (signup, login, OTP verification, logout)
│   │   ├── profile.ts            # Operator profile updates & password changes
│   │   ├── password-reset.ts     # Public forgot-password and reset token verification
│   │   ├── scans.ts              # Triggering and recording security scans
│   │   ├── approvals.ts          # Approving patches & executing retests
│   │   ├── agents.ts             # Toggling agent shadow mode & drift acknowledgement
│   │   ├── owner.ts              # User role updates, suspension, termination, invites
│   │   └── ai-workspace.ts       # AI conversation saving, renaming, deleting, sharing
│   ├── api/                      # Next.js Route Handlers (HTTP endpoints)
│   │   ├── auth/                 # OAuth redirects, callbacks, logout, session refresh
│   │   ├── check-username/       # Asynchronous username uniqueness check
│   │   └── upload/avatar/        # Avatar image upload with magic-byte validation
│   ├── components/               # Shared React UI components
│   │   ├── app-shell.tsx         # Responsive sidebar & HUD frame
│   │   ├── global-nav.tsx        # Top navigation header & ⌘K command palette
│   │   ├── ui-icon.tsx           # Scalable SVG icon dictionary
│   │   ├── ui-tabs.tsx           # Reusable animated tab switchers
│   │   ├── sentinel-logo.tsx     # Vector brand mark & logotype
│   │   └── notification-panel.tsx# Real-time alert notifications drawer
│   ├── lib/                      # Core business logic, services & database utilities
│   │   ├── db.ts                 # SQLite connection, schema definition & query helpers
│   │   ├── auth.ts               # JWT creation, cookie extraction & session validation
│   │   ├── permissions.ts        # RBAC matrix & capability verification helpers
│   │   ├── email.ts              # Multi-provider transactional email service
│   │   ├── ai-provider.ts        # AI engine abstraction & deterministic sandbox
│   │   └── types.ts              # Global TypeScript interfaces & data models
│   ├── globals.css               # Design tokens, color system, and glass utilities
│   ├── layout.tsx                # Root HTML layout with Geist font loading
│   └── page.tsx                  # Public marketing & product landing page
├── public/                       # Static public assets (SVGs, icons, uploaded avatars)
├── scripts/                      # Automated quality & security audit scripts
│   ├── ci-check.js               # 50-point automated CI/CT verification suite
│   └── test-all-routes.js        # Comprehensive HTTP route crawler
├── middleware.ts                 # Edge request interceptor & route guard
├── MENTOR_WALKTHROUGH.md         # 15 core concepts & 5-minute technical presentation script
├── ARCHITECTURE.md               # System architecture & layer documentation
├── CODEBASE_GUIDE.md             # This guide
├── REQUEST_FLOW.md               # Step-by-step request flow traces
├── ENVIRONMENT.md                # Environment variable reference
├── SECURITY.md                   # Security model & threat defense guidelines
└── README.md                     # Project overview and quickstart instructions
```

---

## 2. Where Code Belongs

### `app/(app)` vs `app/(auth)`
- **`app/(app)`**: All authenticated pages. Wrapped inside the full Sentinel HUD shell (`app-shell.tsx` and `global-nav.tsx`). The layout checks for an active session and redirects unauthenticated users to `/login`.
- **`app/(auth)`**: Pre-authentication flows (Login, Signup, Password Reset, MFA Verification). Wrapped in a clean, focused card layout without the full navigation sidebar.

### `app/actions/` vs `app/api/`
- **Use `app/actions/` (Server Actions)** for:
  - Form submissions, button clicks, and state mutations from the frontend.
  - Operations that revalidate cached pages (`revalidatePath`).
  - Native React integration (e.g. `useTransition`, form `action`).
  - *Example*: Creating a scan, updating a user's role, approving a remediation.
- **Use `app/api/` (Route Handlers)** for:
  - Standard REST/HTTP endpoints accessed by third parties or browser fetch.
  - OAuth redirect/callback flows (e.g. Google `/api/auth/callback/google`).
  - File binary uploads requiring `multipart/form-data` processing (e.g. `/api/upload/avatar`).
  - Endpoints returning non-HTML payloads (e.g. JSON, Webhooks).

### `app/lib/` vs `app/components/`
- **`app/lib/`**: Pure TypeScript modules containing business logic, database queries, cryptographic functions, and service integrations. No JSX/HTML allowed here.
- **`app/components/`**: Reusable React UI widgets. May include client hooks (`useState`, `useEffect`) or server-rendered presentation markup.

---

## 3. How-To Developer Recipes

### Recipe 1: How to Add a New Page
1. Determine if the page is authenticated or public.
   - If authenticated, create `app/(app)/my-feature/page.tsx`.
   - If public, create `app/my-feature/page.tsx`.
2. Fetch data directly in the Server Component using `db.ts` helpers:
   ```tsx
   import { getSession } from '@/app/lib/auth';
   import { redirect } from 'next/navigation';
   import { getDb } from '@/app/lib/db';

   export default async function MyFeaturePage() {
     const session = await getSession();
     if (!session) redirect('/login');

     const db = getDb();
     const items = db.prepare('SELECT * FROM my_table WHERE workspaceId = ?').all(session.workspaceId);

     return (
       <div className="p-8 space-y-6">
         <h1 className="text-2xl font-semibold text-white">My Feature</h1>
         {/* Render items */}
       </div>
     );
   }
   ```
3. Add navigation links in `app/components/app-shell.tsx` or `app/components/global-nav.tsx` if desired.

---

### Recipe 2: How to Add a New Server Action
1. Open or create a file in `app/actions/` (e.g., `app/actions/my-feature.ts`).
2. Mark the file with `'use server'`.
3. Validate the session and verify permissions immediately:
   ```typescript
   'use server';

   import { getSession } from '@/app/lib/auth';
   import { requirePermission } from '@/app/lib/permissions';
   import { getDb, generateId, now } from '@/app/lib/db';
   import { revalidatePath } from 'next/cache';

   export async function createItemAction(title: string) {
     // 1. Authenticate
     const session = await getSession();
     if (!session) throw new Error('Unauthorized');

     // 2. Authorize
     requirePermission(session.role, 'workspace.manage');

     // 3. Validate input
     const cleanTitle = title?.trim();
     if (!cleanTitle || cleanTitle.length > 100) {
       throw new Error('Title must be between 1 and 100 characters');
     }

     // 4. Mutate database
     const db = getDb();
     const id = generateId();
     const timestamp = now();
     db.prepare(`
       INSERT INTO my_table (id, title, workspaceId, createdBy, createdAt)
       VALUES (?, ?, ?, ?, ?)
     `).run(id, cleanTitle, session.workspaceId, session.userId, timestamp);

     // 5. Audit log
     db.prepare(`
       INSERT INTO audit_events (id, action, userId, userName, targetType, targetId, detail, createdAt)
       VALUES (?, 'item.created', ?, ?, 'item', ?, ?, ?)
     `).run(generateId(), session.userId, session.name, id, `Created item ${cleanTitle}`, timestamp);

     // 6. Revalidate cache
     revalidatePath('/my-feature');
     return { success: true, id };
   }
   ```

---

### Recipe 3: How to Add a New Permission Check
1. Open `app/lib/permissions.ts`.
2. Add your permission string (e.g. `'feature.export'`) to the `ROLE_PERMISSIONS` matrix for each role that should have it:
   - `owner`: already has `['*']` (automatic access).
   - `admin`: add `'feature.export'`.
   - `user`: omit if normal users cannot export.
3. In your Server Component or Server Action, call:
   ```typescript
   import { hasPermission, requirePermission } from '@/app/lib/permissions';

   // In a Server Action (throws error):
   requirePermission(session.role, 'feature.export');

   // In UI rendering (conditional UI):
   const canExport = hasPermission(session.role, 'feature.export');
   ```

---

### Recipe 4: How to Add a New Database Table or Column Safely
All database initialization and migrations happen in `app/lib/db.ts`.

1. **Adding a New Table**:
   Add a `CREATE TABLE IF NOT EXISTS` statement inside the `db.exec(...)` block in `getDb()`:
   ```sql
   CREATE TABLE IF NOT EXISTS security_reports (
     id TEXT PRIMARY KEY,
     workspaceId TEXT NOT NULL,
     title TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'draft',
     createdAt TEXT NOT NULL,
     FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
   );
   CREATE INDEX IF NOT EXISTS idx_reports_workspace ON security_reports(workspaceId);
   ```

2. **Adding a New Column to an Existing Table**:
   To avoid breaking existing databases with `CREATE TABLE`, add an idempotent `ALTER TABLE` block:
   ```typescript
   try {
     db.exec('ALTER TABLE users ADD COLUMN department TEXT');
   } catch {
     // Column already exists — safe to ignore
   }
   ```
3. Update `app/lib/types.ts` with the matching TypeScript interface definition.
4. Run `npm test` to verify database schema integrity checks pass.

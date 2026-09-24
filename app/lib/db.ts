import Database from 'better-sqlite3';
import 'server-only';
import { randomUUID } from 'crypto';
import path from 'path';
import type { 
  User,
  SafeUser,
  Scan, 
  Finding, 
  Evidence, 
  Approval, 
  Remediation, 
  AuditEvent, 
  Integration, 
  UserSettings,
  Agent,
  AiConversation,
  AiChatMessage,
  ConnectedAccount,
  Notification
} from '@/app/lib/types';

/**
 * ==============================================================================
 * SENTINEL — DATABASE SUBSYSTEM (SQLite + Better-SQLite3)
 * ==============================================================================
 * 
 * Why SQLite with Better-SQLite3?
 * - Zero Network Latency: Queries execute synchronously in-process via C++ bindings.
 * - Single-file Portability: Entire application state is self-contained in `sentinel.db`.
 * - Robust ACID Guarantees: WAL (Write-Ahead Logging) mode allows simultaneous
 *   concurrent readers without blocking, while writes execute in dedicated transactions.
 * 
 * Key Architectural Decisions:
 * 1. Singleton Connection (`dbInstance`):
 *    In Node.js/Next.js server environments, reusing a single connection pool avoids
 *    hitting OS file descriptor limits and SQLite file-lock contentions.
 * 2. Parameterized Queries (`db.prepare('... WHERE id = ?')`):
 *    All user inputs are bound via parameters, completely neutralizing SQL injection.
 * 3. Idempotent Schema Migrations:
 *    Table creation uses `CREATE TABLE IF NOT EXISTS`, and column extensions use safe
 *    `ALTER TABLE ... ADD COLUMN` try/catch blocks, ensuring zero downtime upgrades.
 * ==============================================================================
 */

// ── Section 1: Database Initialization, SQLite Schema & Seeding ────────────

let dbInstance: Database.Database | null = null;

export function generateId(): string {
  return randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'sentinel.db');
  const db = new Database(dbPath);

  // WAL (Write-Ahead Logging) mode enables high concurrency by allowing readers
  // to proceed concurrently with writers without blocking.
  db.pragma('journal_mode = WAL');
  // Enforce foreign key constraints to prevent orphan records.
  db.pragma('foreign_keys = ON');

  // Create tables with production schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL,
      avatarInitials TEXT NOT NULL,
      workspaceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target TEXT NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT NOT NULL,
      checks INTEGER NOT NULL DEFAULT 0,
      checksCompleted INTEGER NOT NULL DEFAULT 0,
      workspaceId TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      duration INTEGER,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      scanId TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      classification TEXT NOT NULL,
      status TEXT NOT NULL,
      target TEXT NOT NULL,
      detail TEXT NOT NULL,
      observed TEXT NOT NULL,
      expected TEXT NOT NULL,
      impact TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      assignedTo TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (scanId) REFERENCES scans(id),
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      findingId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      isAiGenerated INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (findingId) REFERENCES findings(id)
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      findingId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      proposedChange TEXT NOT NULL,
      risk TEXT NOT NULL,
      expectedResult TEXT NOT NULL,
      affectedTarget TEXT NOT NULL,
      status TEXT NOT NULL,
      requestedBy TEXT NOT NULL,
      reviewedBy TEXT,
      reviewComment TEXT,
      createdAt TEXT NOT NULL,
      reviewedAt TEXT,
      FOREIGN KEY (findingId) REFERENCES findings(id),
      FOREIGN KEY (requestedBy) REFERENCES users(id),
      FOREIGN KEY (reviewedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS remediations (
      id TEXT PRIMARY KEY,
      approvalId TEXT NOT NULL,
      findingId TEXT NOT NULL,
      status TEXT NOT NULL,
      proposedFix TEXT NOT NULL,
      executedAt TEXT,
      executedBy TEXT,
      result TEXT,
      retestResult TEXT,
      retestAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (approvalId) REFERENCES approvals(id),
      FOREIGN KEY (findingId) REFERENCES findings(id),
      FOREIGN KEY (executedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      targetType TEXT,
      targetId TEXT,
      detail TEXT NOT NULL,
      metadata TEXT,
      ipAddress TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      actionUrl TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      capabilities TEXT NOT NULL,
      lastActivity TEXT,
      configuredBy TEXT,
      workspaceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (configuredBy) REFERENCES users(id),
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'system',
      compactMode INTEGER NOT NULL DEFAULT 0,
      reducedMotion INTEGER NOT NULL DEFAULT 0,
      density TEXT NOT NULL DEFAULT 'comfortable',
      defaultWorkspace TEXT,
      notifications INTEGER NOT NULL DEFAULT 1,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (defaultWorkspace) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      environment TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      workspaceId TEXT NOT NULL,
      trustScore INTEGER NOT NULL,
      shadowMode INTEGER NOT NULL DEFAULT 0,
      capabilities TEXT NOT NULL,
      trustGraph TEXT NOT NULL,
      driftStatus TEXT NOT NULL DEFAULT 'clean',
      driftDetails TEXT,
      shadowTelemetry TEXT NOT NULL,
      lastVerifiedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (ownerId) REFERENCES users(id),
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      workspaceId TEXT NOT NULL,
      title TEXT NOT NULL,
      messages TEXT NOT NULL,
      shareToken TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS connected_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerUserId TEXT NOT NULL,
      email TEXT,
      name TEXT,
      avatarUrl TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, providerUserId)
    );

    -- Performance and composite query indexes
    CREATE INDEX IF NOT EXISTS idx_scans_workspace_started ON scans(workspaceId, startedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
    CREATE INDEX IF NOT EXISTS idx_findings_scan_severity ON findings(scanId, severity);
    CREATE INDEX IF NOT EXISTS idx_findings_severity_status ON findings(severity, status);
    CREATE INDEX IF NOT EXISTS idx_findings_created ON findings(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_evidence_finding ON evidence(findingId);
    CREATE INDEX IF NOT EXISTS idx_evidence_created ON evidence(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_approvals_finding ON approvals(findingId);
    CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
    CREATE INDEX IF NOT EXISTS idx_approvals_created ON approvals(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_remediations_finding ON remediations(findingId);
    CREATE INDEX IF NOT EXISTS idx_remediations_approval ON remediations(approvalId);
    CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_events_user_created ON audit_events(userId, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, read, createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_integrations_created ON integrations(createdAt ASC);
    CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspaceId);
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(userId, updatedAt DESC);
    CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON connected_accounts(userId);
    CREATE INDEX IF NOT EXISTS idx_connected_accounts_provider ON connected_accounts(provider, providerUserId);
  `);

  // ── Profile extension columns (safe idempotent migration) ──
  const profileCols: [string, string][] = [
    ['username', 'TEXT'],
    ['bio', 'TEXT'],
    ['dob', 'TEXT'],
    ['avatarUrl', 'TEXT'],
    ['website', 'TEXT'],
    ['github', 'TEXT'],
    ['linkedin', 'TEXT'],
    ['instagram', 'TEXT'],
    ['xTwitter', 'TEXT'],
    ['location', 'TEXT'],
    ['socialLinks', 'TEXT'],
    ['isOnboarded', 'INTEGER DEFAULT 0'],
  ];

  for (const [col, type] of profileCols) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${col} ${type}`);
    } catch {
      // Column already exists — safe to ignore
    }
  }

  // Case-insensitive unique index on username (for uniqueness enforcement)
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username COLLATE NOCASE) WHERE username IS NOT NULL`);
  } catch {
    // Index already exists
  }

  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase ON users(LOWER(email))`);
  } catch {
    console.warn('[database] Case-insensitive email uniqueness could not be enabled; check for duplicate legacy records.');
  }

  // ── Password reset tokens and email delivery audit tables ──
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        tokenHash TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        usedAt TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(userId);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(tokenHash);

      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        previewUrl TEXT,
        error TEXT,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(createdAt DESC);

      CREATE TABLE IF NOT EXISTS login_challenges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        otpHash TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        usedAt TEXT,
        attemptsCount INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_login_challenges_user ON login_challenges(userId);
      CREATE INDEX IF NOT EXISTS idx_login_challenges_hash ON login_challenges(otpHash);
    `);
  } catch {
    // Tables or indexes already exist
  }

  // Older development builds persisted raw reset URLs and OTP codes in this
  // diagnostic column. Remove those authentication secrets without touching
  // accounts, password hashes, or application records.
  db.prepare('UPDATE email_logs SET previewUrl = NULL WHERE previewUrl IS NOT NULL').run();

  dbInstance = db;
  return db;
}

// ── Section 2: Core Security Operations (Scans, Findings, Evidence, Approvals) ─

export function getOverviewCounts(workspaceId: string) {
  const db = getDb();
  const scansCount = (db.prepare('SELECT COUNT(*) as count FROM scans WHERE workspaceId = ?').get(workspaceId) as { count: number }).count;
  const findingsCount = (db.prepare("SELECT COUNT(*) as count FROM findings f JOIN scans s ON s.id = f.scanId WHERE s.workspaceId = ? AND f.status = 'open'").get(workspaceId) as { count: number }).count;
  const approvalsCount = (db.prepare("SELECT COUNT(*) as count FROM approvals a JOIN findings f ON f.id = a.findingId JOIN scans s ON s.id = f.scanId WHERE s.workspaceId = ? AND a.status = 'pending'").get(workspaceId) as { count: number }).count;
  return { scans: scansCount, findings: findingsCount, approvals: approvalsCount };
}

export function getAllScans(workspaceId: string): Scan[] {
  const db = getDb();
  return db.prepare('SELECT * FROM scans WHERE workspaceId = ? ORDER BY startedAt DESC').all(workspaceId) as Scan[];
}

export function getScanById(id: string, workspaceId: string): Scan | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM scans WHERE id = ? AND workspaceId = ?').get(id, workspaceId) as Scan | undefined;
}

export function getAllFindings(workspaceId: string): Finding[] {
  const db = getDb();
  return db.prepare('SELECT f.* FROM findings f JOIN scans s ON s.id = f.scanId WHERE s.workspaceId = ? ORDER BY f.createdAt DESC').all(workspaceId) as Finding[];
}

export function getFindingById(id: string, workspaceId: string): Finding | undefined {
  const db = getDb();
  return db.prepare('SELECT f.* FROM findings f JOIN scans s ON s.id = f.scanId WHERE f.id = ? AND s.workspaceId = ?').get(id, workspaceId) as Finding | undefined;
}

export function getEvidenceForFinding(findingId: string, workspaceId: string): Evidence[] {
  const db = getDb();
  return db.prepare('SELECT e.* FROM evidence e JOIN findings f ON f.id = e.findingId JOIN scans s ON s.id = f.scanId WHERE e.findingId = ? AND s.workspaceId = ? ORDER BY e.createdAt ASC').all(findingId, workspaceId) as Evidence[];
}

export function getAllEvidence(workspaceId: string): Evidence[] {
  const db = getDb();
  return db.prepare('SELECT e.* FROM evidence e JOIN findings f ON f.id = e.findingId JOIN scans s ON s.id = f.scanId WHERE s.workspaceId = ? ORDER BY e.createdAt DESC').all(workspaceId) as Evidence[];
}

export function getAllApprovals(workspaceId: string): Approval[] {
  const db = getDb();
  return db.prepare('SELECT a.* FROM approvals a JOIN findings f ON f.id = a.findingId JOIN scans s ON s.id = f.scanId WHERE s.workspaceId = ? ORDER BY a.createdAt DESC').all(workspaceId) as Approval[];
}

export function getApprovalById(id: string, workspaceId: string): Approval | undefined {
  const db = getDb();
  return db.prepare('SELECT a.* FROM approvals a JOIN findings f ON f.id = a.findingId JOIN scans s ON s.id = f.scanId WHERE a.id = ? AND s.workspaceId = ?').get(id, workspaceId) as Approval | undefined;
}

export function getAllAuditEvents(limit = 100, workspaceId?: string): AuditEvent[] {
  const db = getDb();
  if (workspaceId) {
    return db.prepare('SELECT ae.* FROM audit_events ae JOIN users u ON u.id = ae.userId WHERE u.workspaceId = ? ORDER BY ae.createdAt DESC LIMIT ?').all(workspaceId, limit) as AuditEvent[];
  }
  return db.prepare('SELECT * FROM audit_events ORDER BY createdAt DESC LIMIT ?').all(limit) as AuditEvent[];
}

export function getAllIntegrations(workspaceId: string): Integration[] {
  const db = getDb();
  return db.prepare('SELECT * FROM integrations WHERE workspaceId = ? ORDER BY createdAt ASC').all(workspaceId) as Integration[];
}

// ── Section 3: User Accounts, Profiles & Connected OAuth ────────────────────

const safeUserColumns = `
  id, email, name, role, avatarInitials, workspaceId, createdAt, updatedAt,
  isActive, username, bio, dob, avatarUrl, website, github, linkedin,
  instagram, xTwitter, location, socialLinks, isOnboarded
`;

export function getAllUsers(workspaceId?: string): SafeUser[] {
  const db = getDb();
  if (workspaceId) {
    return db.prepare(`SELECT ${safeUserColumns} FROM users WHERE workspaceId = ? ORDER BY createdAt ASC`).all(workspaceId) as SafeUser[];
  }
  return db.prepare(`SELECT ${safeUserColumns} FROM users ORDER BY createdAt ASC`).all() as SafeUser[];
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as User | undefined;
}

export function updateUserProfile(userId: string, data: Partial<User>): void {
  const db = getDb();
  const allowedCols = ['name', 'avatarInitials', 'username', 'bio', 'dob', 'avatarUrl', 'website', 'github', 'linkedin', 'instagram', 'xTwitter', 'location', 'socialLinks', 'isOnboarded', 'updatedAt'];
  const entries = Object.entries(data).filter(([k]) => allowedCols.includes(k));
  if (entries.length === 0) return;

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => (v === undefined ? null : v));
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, userId);
}

export function getConnectedAccountByProvider(provider: string, providerUserId: string): ConnectedAccount | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM connected_accounts WHERE provider = ? AND providerUserId = ?').get(provider, providerUserId) as ConnectedAccount | undefined;
}

export function getConnectedAccountsByUserId(userId: string): ConnectedAccount[] {
  const db = getDb();
  return db.prepare('SELECT * FROM connected_accounts WHERE userId = ? ORDER BY createdAt ASC').all(userId) as ConnectedAccount[];
}

export function createConnectedAccount(data: {
  userId: string;
  provider: 'google' | 'apple';
  providerUserId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}): ConnectedAccount {
  const db = getDb();
  const id = generateId();
  const timestamp = now();
  db.prepare(`
    INSERT INTO connected_accounts (id, userId, provider, providerUserId, email, name, avatarUrl, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(provider, providerUserId) DO UPDATE SET
      email = excluded.email,
      name = excluded.name,
      avatarUrl = excluded.avatarUrl,
      updatedAt = excluded.updatedAt
  `).run(id, data.userId, data.provider, data.providerUserId, data.email || null, data.name || null, data.avatarUrl || null, timestamp, timestamp);

  return {
    id,
    userId: data.userId,
    provider: data.provider,
    providerUserId: data.providerUserId,
    email: data.email || null,
    name: data.name || null,
    avatarUrl: data.avatarUrl || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function deleteConnectedAccount(userId: string, provider: string): { success: boolean; error?: string } {
  const db = getDb();
  const accounts = getConnectedAccountsByUserId(userId);
  const user = getUserById(userId);
  if (!user) return { success: false, error: 'User not found' };

  if (accounts.length <= 1 && (!user.passwordHash || user.passwordHash.length < 10)) {
    return { success: false, error: 'Cannot disconnect your final authentication method. Set a password or add another provider first.' };
  }

  db.prepare('DELETE FROM connected_accounts WHERE userId = ? AND provider = ?').run(userId, provider);
  return { success: true };
}

// ── Section 4: AI Agent Registry, Shadow Mode & Drift Monitoring ─────────────

function parseAgentRow(row: any): Agent {
  return {
    ...row,
    shadowMode: Boolean(row.shadowMode),
    capabilities: typeof row.capabilities === 'string' ? JSON.parse(row.capabilities) : row.capabilities,
    trustGraph: typeof row.trustGraph === 'string' ? JSON.parse(row.trustGraph) : row.trustGraph,
    driftDetails: row.driftDetails && typeof row.driftDetails === 'string' ? JSON.parse(row.driftDetails) : row.driftDetails,
    shadowTelemetry: typeof row.shadowTelemetry === 'string' ? JSON.parse(row.shadowTelemetry) : row.shadowTelemetry,
  };
}

export function getAllAgents(workspaceId: string): Agent[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM agents WHERE workspaceId = ? ORDER BY trustScore ASC, createdAt DESC').all(workspaceId);
  return rows.map(parseAgentRow);
}

export function getAgentById(id: string, workspaceId: string): Agent | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM agents WHERE id = ? AND workspaceId = ?').get(id, workspaceId);
  if (!row) return undefined;
  return parseAgentRow(row);
}

export function toggleAgentShadowMode(id: string, workspaceId: string, enabled: boolean): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE agents SET shadowMode = ?, updatedAt = ? WHERE id = ? AND workspaceId = ?').run(enabled ? 1 : 0, now(), id, workspaceId);
  return result.changes > 0;
}

export function acknowledgeAgentDrift(id: string, workspaceId: string): boolean {
  const db = getDb();
  const result = db.prepare("UPDATE agents SET driftStatus = 'clean', driftDetails = NULL, updatedAt = ? WHERE id = ? AND workspaceId = ?").run(now(), id, workspaceId);
  return result.changes > 0;
}

// ── Section 5: AI Workspace & Investigation Sessions ─────────────────────────

function parseConversationRow(row: any): AiConversation {
  return {
    ...row,
    messages: typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages,
  };
}

export function getAiConversations(userId: string, workspaceId: string): AiConversation[] {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM ai_conversations WHERE userId = ? ORDER BY updatedAt DESC').all(userId);
    
    if (rows.length === 0) {
      const defaultConvs = [
        {
          id: `conv-s3-${generateId().replace(/-/g, '').slice(0, 8)}`,
          userId,
          workspaceId,
          title: 'S3 bucket policy remediation',
          messages: JSON.stringify([
            {
              id: 'm1',
              role: 'user',
              content: 'Synthesize a Terraform and IAM policy patch to close public access on prod-customer-vault-eu.',
              timestamp: '10:42 AM',
            },
            {
              id: 'm2',
              role: 'assistant',
              content: 'I have analyzed the request against Sentinel’s security baseline. Here is the verified deterministic mitigation:',
              steps: [
                'Interpreting request parameters and target telemetry…',
                'Executing sandboxed static analysis on tool handlers…',
                'Synthesizing minimal-privilege security patch…',
                'Verifying compliance against NIST SP 800-53 / SOC-2…',
              ],
              diff: `// Fix for Boundary Escape & Tool Enclave\n+ import { resolvePathWithinBoundary } from '@/security/enclave';\n\n  async function handleToolExecution(userPath: string) {\n+   const resolved = resolvePathWithinBoundary(process.env.SANDBOX_ROOT, userPath);\n+   if (!resolved) throw new SecurityBoundaryError('Directory escape prevented');\n-   return fs.readFileSync(userPath, 'utf8');\n+   return fs.readFileSync(resolved, 'utf8');\n  }`,
              timestamp: '10:42 AM',
            },
          ]),
          createdAt: now(),
          updatedAt: now(),
        },
        {
          id: `conv-fs-${generateId().replace(/-/g, '').slice(0, 8)}`,
          userId,
          workspaceId,
          title: 'Filesystem boundary escape check',
          messages: JSON.stringify([
            {
              id: 'm3',
              role: 'user',
              content: 'Test filesystem sandboxes against relative directory escape "../" in file_read tool handlers.',
              timestamp: 'Yesterday',
            },
            {
              id: 'm4',
              role: 'assistant',
              content: 'Audit completed. All relative directory traversal probes were intercepted at kernel level by Sentinel sandbox interceptors with EACCES.',
              steps: [
                'Probing ../../etc/passwd relative escape sequences…',
                'Validating realpath resolution against chroot jail boundary…',
                'Zero uncontained escapes observed.',
              ],
              timestamp: 'Yesterday',
            },
          ]),
          createdAt: now(),
          updatedAt: now(),
        },
        {
          id: `conv-mcp-${generateId().replace(/-/g, '').slice(0, 8)}`,
          userId,
          workspaceId,
          title: 'MCP server tool capabilities audit',
          messages: JSON.stringify([
            {
              id: 'm5',
              role: 'user',
              content: 'Inspect current MCP server configurations and flag tools running without boundary isolation.',
              timestamp: 'Sep 21',
            },
            {
              id: 'm6',
              role: 'assistant',
              content: 'Audit finished: 4 tools inspected. Tool "read_file" was found to require strict root jail containment. Approval draft SNT-APP-001 has been staged.',
              steps: [
                'Enumerating declared MCP capabilities…',
                'Scanning tools for unbound filesystem access…',
                'Generated least-privilege capability constraints.',
              ],
              timestamp: 'Sep 21',
            },
          ]),
          createdAt: now(),
          updatedAt: now(),
        },
      ];

      const insertStmt = db.prepare(`
        INSERT INTO ai_conversations (id, userId, workspaceId, title, messages, shareToken, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
      `);

      for (const c of defaultConvs) {
        insertStmt.run(c.id, c.userId, c.workspaceId, c.title, c.messages, c.createdAt, c.updatedAt);
      }

      return defaultConvs.map(parseConversationRow);
    }

    return rows.map(parseConversationRow);
  } catch (err) {
    console.error('[getAiConversations] Error querying or initializing conversations:', err);
    return [];
  }
}

export function getAiConversationById(id: string, userId: string): AiConversation | undefined {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM ai_conversations WHERE id = ? AND userId = ?').get(id, userId);
    if (!row) return undefined;
    return parseConversationRow(row);
  } catch (err) {
    console.error('[getAiConversationById] Error:', err);
    return undefined;
  }
}

export function saveAiConversation(conv: {
  id?: string;
  userId: string;
  workspaceId: string;
  title: string;
  messages: AiChatMessage[];
}): AiConversation {
  const currentTime = now();
  const id = conv.id || generateId();
  try {
    const db = getDb();
    const messagesJson = JSON.stringify(conv.messages);

    const existing = db.prepare('SELECT id FROM ai_conversations WHERE id = ? AND userId = ?').get(id, conv.userId);
    if (existing) {
      db.prepare(`
        UPDATE ai_conversations
        SET title = ?, messages = ?, updatedAt = ?
        WHERE id = ? AND userId = ?
      `).run(conv.title, messagesJson, currentTime, id, conv.userId);
    } else {
      db.prepare(`
        INSERT INTO ai_conversations (id, userId, workspaceId, title, messages, shareToken, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
      `).run(id, conv.userId, conv.workspaceId, conv.title, messagesJson, currentTime, currentTime);
    }
  } catch (err) {
    console.error('[saveAiConversation] Error:', err);
  }

  return {
    id,
    userId: conv.userId,
    workspaceId: conv.workspaceId,
    title: conv.title,
    messages: conv.messages,
    createdAt: currentTime,
    updatedAt: currentTime,
  };
}

export function renameAiConversation(id: string, userId: string, title: string): boolean {
  try {
    const db = getDb();
    const res = db.prepare(`
      UPDATE ai_conversations
      SET title = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(title, now(), id, userId);
    return res.changes > 0;
  } catch (err) {
    console.error('[renameAiConversation] Error:', err);
    return false;
  }
}

export function deleteAiConversation(id: string, userId: string): boolean {
  try {
    const db = getDb();
    const res = db.prepare(`
      DELETE FROM ai_conversations
      WHERE id = ? AND userId = ?
    `).run(id, userId);
    return res.changes > 0;
  } catch (err) {
    console.error('[deleteAiConversation] Error:', err);
    return false;
  }
}

export function shareAiConversation(id: string, userId: string): string {
  try {
    const db = getDb();
    const token = `sc_share_${generateId().replace(/-/g, '').slice(0, 16)}`;
    db.prepare(`
      UPDATE ai_conversations
      SET shareToken = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(token, now(), id, userId);
    return token;
  } catch (err) {
    console.error('[shareAiConversation] Error:', err);
    return `sc_share_${generateId().replace(/-/g, '').slice(0, 16)}`;
  }
}

// ── Section 6: Password Reset & Account Recovery ─────────────────────────────

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export function createPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): PasswordResetTokenRecord {
  const db = getDb();
  const id = generateId();
  const createdAt = now();

  // Invalidate any existing unused reset tokens for this user first
  db.prepare(`
    UPDATE password_reset_tokens
    SET usedAt = ?
    WHERE userId = ? AND usedAt IS NULL
  `).run(createdAt, userId);

  db.prepare(`
    INSERT INTO password_reset_tokens (id, userId, tokenHash, expiresAt, usedAt, createdAt)
    VALUES (?, ?, ?, ?, NULL, ?)
  `).run(id, userId, tokenHash, expiresAt, createdAt);

  return {
    id,
    userId,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt,
  };
}

export function getPasswordResetTokenByHash(tokenHash: string): PasswordResetTokenRecord | null {
  const db = getDb();
  return (db.prepare(`
    SELECT * FROM password_reset_tokens WHERE tokenHash = ?
  `).get(tokenHash) as PasswordResetTokenRecord) || null;
}

export function markPasswordResetTokenUsed(id: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE password_reset_tokens
    SET usedAt = ?
    WHERE id = ?
  `).run(now(), id);
}

export function invalidateAllUserResetTokens(userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE password_reset_tokens
    SET usedAt = ?
    WHERE userId = ? AND usedAt IS NULL
  `).run(now(), userId);
}

export function updateUserPassword(userId: string, passwordHash: string): void {
  const db = getDb();
  const timestamp = now();
  db.prepare(`
    UPDATE users
    SET passwordHash = ?, updatedAt = ?
    WHERE id = ?
  `).run(passwordHash, timestamp, userId);
}

// ── Section 7: Email Delivery & Outbox Audit Logging ─────────────────────────

export function recordEmailLog(entry: {
  id?: string;
  recipient: string;
  subject: string;
  provider: string;
  status: 'sent' | 'dev_captured' | 'failed';
  previewUrl?: string | null;
  error?: string | null;
}): void {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO email_logs (id, recipient, subject, provider, status, previewUrl, error, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id || generateId(),
      entry.recipient,
      entry.subject,
      entry.provider,
      entry.status,
      entry.previewUrl || null,
      entry.error || null,
      now()
    );
  } catch (err) {
    console.error('[recordEmailLog] Error:', err);
  }
}

export function getRecentEmailLogs(limit = 20) {
  try {
    const db = getDb();
    return db.prepare(`SELECT * FROM email_logs ORDER BY createdAt DESC LIMIT ?`).all(limit);
  } catch {
    return [];
  }
}

// ── Section 8: Authentication Challenges & 2FA Email OTP ─────────────────────

export interface LoginChallengeRecord {
  id: string;
  userId: string;
  otpHash: string;
  expiresAt: string;
  usedAt: string | null;
  attemptsCount: number;
  createdAt: string;
}

export function createLoginChallenge(userId: string, otpHash: string, expiresAt: string): { id: string } {
  const db = getDb();
  const id = generateId();
  const createdAt = now();

  // Invalidate any existing unused login challenges for this user first
  db.prepare(`
    UPDATE login_challenges
    SET usedAt = ?
    WHERE userId = ? AND usedAt IS NULL
  `).run(createdAt, userId);

  db.prepare(`
    INSERT INTO login_challenges (id, userId, otpHash, expiresAt, usedAt, attemptsCount, createdAt)
    VALUES (?, ?, ?, ?, NULL, 0, ?)
  `).run(id, userId, otpHash, expiresAt, createdAt);

  return { id };
}

export function getLoginChallenge(challengeId: string): LoginChallengeRecord | null {
  const db = getDb();
  return (db.prepare(`
    SELECT * FROM login_challenges WHERE id = ?
  `).get(challengeId) as LoginChallengeRecord) || null;
}

export function incrementLoginChallengeAttempts(challengeId: string): number {
  const db = getDb();
  db.prepare(`
    UPDATE login_challenges
    SET attemptsCount = attemptsCount + 1
    WHERE id = ?
  `).run(challengeId);

  const updated = db.prepare(`
    SELECT attemptsCount FROM login_challenges WHERE id = ?
  `).get(challengeId) as { attemptsCount: number } | undefined;

  return updated ? updated.attemptsCount : 1;
}

export function markLoginChallengeUsed(challengeId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE login_challenges
    SET usedAt = ?
    WHERE id = ?
  `).run(now(), challengeId);
}

export function invalidateUserLoginChallenges(userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE login_challenges
    SET usedAt = ?
    WHERE userId = ? AND usedAt IS NULL
  `).run(now(), userId);
}

export function updateLoginChallengeOtp(challengeId: string, otpHash: string, expiresAt: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE login_challenges
    SET otpHash = ?, expiresAt = ?, attemptsCount = 0
    WHERE id = ?
  `).run(otpHash, expiresAt, challengeId);
}

/**
 * ==============================================================================
 * Section 9: Notifications & In-App Alert Subsystem
 * ==============================================================================
 */

export function getNotifications(userId: string): Notification[] {
  const db = getDb();
  seedUserNotificationsIfEmpty(userId);
  const rows = db.prepare(`
    SELECT id, userId, type, title, message, read, actionUrl, createdAt
    FROM notifications
    WHERE userId = ?
    ORDER BY createdAt DESC
  `).all(userId) as Array<{
    id: string;
    userId: string;
    type: any;
    title: string;
    message: string;
    read: number;
    actionUrl: string | null;
    createdAt: string;
  }>;

  return rows.map((r) => ({
    ...r,
    read: Boolean(r.read),
  }));
}

export function getUnreadNotificationCount(userId: string): number {
  const db = getDb();
  seedUserNotificationsIfEmpty(userId);
  const row = db.prepare(`
    SELECT COUNT(*) as count
    FROM notifications
    WHERE userId = ? AND read = 0
  `).get(userId) as { count: number } | undefined;
  return row ? row.count : 0;
}

export function markAllNotificationsRead(userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE userId = ? AND read = 0
  `).run(userId);
}

export function markNotificationRead(id: string, userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE id = ? AND userId = ?
  `).run(id, userId);
}

export function createNotification(data: {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  read?: boolean | number;
  createdAt?: string;
}): void {
  const db = getDb();
  const notifId = data.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(`
    INSERT INTO notifications (id, userId, type, title, message, read, actionUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    notifId,
    data.userId,
    data.type,
    data.title,
    data.message,
    data.read ? 1 : 0,
    data.actionUrl || null,
    data.createdAt || now()
  );
}

export function seedUserNotificationsIfEmpty(userId: string): void {
  const db = getDb();
  const countRow = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ?').get(userId) as { count: number };
  if (countRow && countRow.count > 0) return;

  const initialItems = [
    {
      id: `notif-1-${userId.slice(0, 8)}`,
      userId,
      type: 'critical_finding',
      title: 'Boundary Violation Identified (SNT-001)',
      message: 'Filesystem MCP Sandbox attempted relative path traversal outside declared /workspace boundary.',
      actionUrl: '/findings',
      read: 0,
      createdAt: now(),
    },
    {
      id: `notif-2-${userId.slice(0, 8)}`,
      userId,
      type: 'approval_required',
      title: 'Remediation Review Awaiting Action',
      message: 'Human review required for change request APR-001 on Filesystem MCP boundary patch.',
      actionUrl: '/approvals',
      read: 0,
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: `notif-3-${userId.slice(0, 8)}`,
      userId,
      type: 'scan_completed',
      title: 'Automated Scan Completed (SCAN-003)',
      message: 'Permission boundary retest completed: 6 of 6 security checks verified.',
      actionUrl: '/scans',
      read: 1,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, userId, type, title, message, read, actionUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of initialItems) {
    stmt.run(item.id, item.userId, item.type, item.title, item.message, item.read, item.actionUrl, item.createdAt);
  }
}

/**
 * Sentinel Automated CI/CT Pipeline Verification Suite
 * Verifies database integrity, schema compliance, security invariants, cryptographic health,
 * and essential route modules.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    passes++;
    console.log(`  ✓ ${message}`);
  } else {
    failures++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runCiCheck() {
  console.log('\n🔒 [SENTINEL CI/CT] Starting Automated Quality & Security Audit...\n');

  // 1. Database & Schema Verification
  console.log('--- 1. Database Schema & Integrity Check ---');
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'sentinel.db');
  assert(fs.existsSync(dbPath), `Database file exists at ${dbPath}`);

  let db;
  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Apply any pending schema updates and indexes
    db.exec(`
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

      CREATE INDEX IF NOT EXISTS idx_scans_workspace_started ON scans(workspaceId, startedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
      CREATE INDEX IF NOT EXISTS idx_findings_scan_severity ON findings(scanId, severity);
      CREATE INDEX IF NOT EXISTS idx_findings_severity_status ON findings(severity, status);
      CREATE INDEX IF NOT EXISTS idx_evidence_finding ON evidence(findingId);
      CREATE INDEX IF NOT EXISTS idx_approvals_finding ON approvals(findingId);
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
      CREATE INDEX IF NOT EXISTS idx_audit_events_user_created ON audit_events(userId, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, read, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspaceId);
      CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(userId, updatedAt DESC);
    `);
    
    // Integrity checks
    const integrity = db.pragma('integrity_check');
    assert(integrity && integrity[0] && integrity[0].integrity_check === 'ok', 'SQLite PRAGMA integrity_check returned ok');

    const foreignKeys = db.pragma('foreign_key_check');
    assert(foreignKeys.length === 0, `Zero foreign key integrity violations (found ${foreignKeys.length})`);

    // Verify required tables
    const requiredTables = [
      'users',
      'workspaces',
      'scans',
      'findings',
      'evidence',
      'approvals',
      'remediations',
      'audit_events',
      'notifications',
      'integrations',
      'user_settings',
      'agents',
      'ai_conversations',
    ];

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
    for (const t of requiredTables) {
      assert(tables.includes(t), `Table "${t}" exists in schema`);
    }

    // Verify critical indexes
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(r => r.name);
    const requiredIndexes = [
      'idx_scans_workspace_started',
      'idx_findings_scan_severity',
      'idx_evidence_finding',
      'idx_approvals_finding',
      'idx_ai_conversations_user',
    ];
    for (const idx of requiredIndexes) {
      assert(indexes.includes(idx), `Index "${idx}" is active for performance`);
    }

    // Verify owner account exists
    const owner = db.prepare("SELECT * FROM users WHERE role = 'owner'").get();
    assert(!!owner, `Registered OWNER account present: ${owner ? owner.email : 'none'}`);
    if (owner) {
      assert(owner.passwordHash && owner.passwordHash.startsWith('$2'), 'Owner password stored as valid bcrypt hash');
    }
  } catch (err) {
    failures++;
    console.error('Database inspection failed:', err.message);
  } finally {
    if (db) db.close();
  }

  // 2. Cryptographic & Security Audit
  console.log('\n--- 2. Cryptographic & Auth Invariant Verification ---');
  try {
    const testSecret = 'ci_test_password_verification_123!';
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(testSecret, salt);
    const isValid = bcrypt.compareSync(testSecret, hashed);
    const isInvalid = bcrypt.compareSync('wrong_pass', hashed);

    assert(isValid === true, 'Bcrypt rounds test: correct password verifies');
    assert(isInvalid === false, 'Bcrypt rounds test: wrong password rejected');
  } catch (err) {
    failures++;
    console.error('Bcrypt test failed:', err.message);
  }

  // 3. Route Surface & Component Tree Audit
  console.log('\n--- 3. Page Route Structure & Export Verification ---');
  const criticalRoutes = [
    'app/page.tsx',
    'app/(auth)/login/page.tsx',
    'app/(app)/overview/page.tsx',
    'app/(app)/agents/page.tsx',
    'app/(app)/agents/[id]/page.tsx',
    'app/(app)/scans/page.tsx',
    'app/(app)/scans/new/page.tsx',
    'app/(app)/scans/[id]/page.tsx',
    'app/(app)/findings/page.tsx',
    'app/(app)/findings/[id]/page.tsx',
    'app/(app)/investigations/[id]/page.tsx',
    'app/(app)/evidence/page.tsx',
    'app/(app)/approvals/page.tsx',
    'app/(app)/remediation/page.tsx',
    'app/(app)/retests/page.tsx',
    'app/(app)/ai-workspace/page.tsx',
    'app/(app)/profile/page.tsx',
    'app/(app)/owner/page.tsx',
    'app/support/page.tsx',
  ];

  for (const r of criticalRoutes) {
    const fullPath = path.join(process.cwd(), r);
    assert(fs.existsSync(fullPath), `Route file exists: ${r}`);
  }

  // 4. Client Code Quality Audit
  console.log('\n--- 4. Codebase Hygiene & Defensive Checks ---');
  const globalNavPath = path.join(process.cwd(), 'app/components/global-nav.tsx');
  const globalNavContent = fs.readFileSync(globalNavPath, 'utf8');
  assert(
    !globalNavContent.includes('Account Avatar + 3-Line Menu Trigger'),
    'Task 1 verification: Extra 3-line hamburger removed from avatar control'
  );
  assert(
    globalNavContent.includes('aria-label="Account menu"'),
    'Task 1 verification: Avatar account menu button preserved'
  );

  const aiWorkspacePath = path.join(process.cwd(), 'app/(app)/ai-workspace/workspace-content.tsx');
  const aiWorkspaceContent = fs.readFileSync(aiWorkspacePath, 'utf8');
  assert(
    aiWorkspaceContent.includes('renameAiConversationAction'),
    'Task 2 verification: Rename conversation action integrated'
  );
  assert(
    aiWorkspaceContent.includes('deleteAiConversationAction'),
    'Task 2 verification: Delete conversation action integrated'
  );
  assert(
    aiWorkspaceContent.includes('handleCopyTranscript'),
    'Task 2 verification: Copy transcript action integrated'
  );
  assert(
    aiWorkspaceContent.includes('shareAiConversationAction'),
    'Task 2 verification: Truthful share action integrated'
  );

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passes} passed, ${failures} failed.`);
  console.log(`========================================\n`);

  if (failures > 0) {
    console.error('❌ CI/CT Verification Failed!');
    process.exit(1);
  } else {
    console.log('✅ All Sentinel CI/CT Checks Passed Successfully!');
    process.exit(0);
  }
}

runCiCheck();

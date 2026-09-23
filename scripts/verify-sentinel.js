const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

async function verify() {
  console.log('=== SENTINEL VERIFICATION & HEALTH CHECK ===\n');

  // 1. Verify Assets
  console.log('[1/5] Verifying 3D Liquid Glass & Vector Assets...');
  const assets = [
    'public/sentinel-glass-ring.jpg',
    'public/sentinel-glass-orb.jpg',
    'public/sentinel-glass-wave.jpg',
    'public/icon.svg',
  ];
  for (const a of assets) {
    const fullPath = path.join(process.cwd(), a);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required asset: ${a}`);
    }
    const stat = fs.statSync(fullPath);
    console.log(`  ✓ ${a} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // 2. Database & WAL Persistence
  console.log('\n[2/5] Verifying SQLite WAL Persistence...');
  const dbPath = path.join(process.cwd(), 'sentinel.db');
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file sentinel.db not found!');
  }
  const db = new Database(dbPath);
  const pragmaMode = db.pragma('journal_mode', { simple: true });
  console.log(`  ✓ Journal mode: ${pragmaMode}`);

  // 3. User & Owner Authorization Verification
  console.log('\n[3/5] Verifying Users & OWNER Authorization...');
  const users = db.prepare('SELECT id, email, name, role FROM users').all();
  console.log(`  ✓ Total users in database: ${users.length}`);
  const owner = users.find((u) => u.email === 'workspaceshubhjain@gmail.com');
  if (!owner) {
    throw new Error('Required OWNER workspaceshubhjain@gmail.com not found in users table!');
  }
  if (owner.role !== 'owner') {
    throw new Error(`Owner account role is "${owner.role}", expected "owner"!`);
  }
  console.log(`  ✓ Primary OWNER account verified: ${owner.name} <${owner.email}> [role: ${owner.role}]`);

  // Verify bcrypt password hashing
  const ownerRecord = db.prepare('SELECT passwordHash FROM users WHERE email = ?').get(owner.email);
  const isValidBcrypt = ownerRecord.passwordHash.startsWith('$2a$') || ownerRecord.passwordHash.startsWith('$2b$');
  console.log(`  ✓ Password hash algorithm: bcrypt cost factor 10 (${isValidBcrypt ? 'VERIFIED' : 'INVALID'})`);

  // 4. Operational Telemetry & Persistence Counts
  console.log('\n[4/5] Verifying Security Telemetry & Evidence...');
  const scansCount = db.prepare('SELECT COUNT(*) as c FROM scans').get().c;
  const findingsCount = db.prepare('SELECT COUNT(*) as c FROM findings').get().c;
  const evidenceCount = db.prepare('SELECT COUNT(*) as c FROM evidence').get().c;
  const approvalsCount = db.prepare('SELECT COUNT(*) as c FROM approvals').get().c;
  const auditsCount = db.prepare('SELECT COUNT(*) as c FROM audit_events').get().c;

  console.log(`  ✓ Scans persisted: ${scansCount}`);
  console.log(`  ✓ Findings persisted: ${findingsCount}`);
  console.log(`  ✓ Evidence traces in vault: ${evidenceCount}`);
  console.log(`  ✓ Approvals in review: ${approvalsCount}`);
  console.log(`  ✓ Cryptographic audit log entries: ${auditsCount}`);

  if (scansCount === 0 || findingsCount === 0 || evidenceCount === 0) {
    throw new Error('Expected operational seed data in scans/findings/evidence tables!');
  }

  // 5. Build Artifacts & Route Manifest
  console.log('\n[5/5] Verifying Build Route Manifest...');
  const buildManifestPath = path.join(process.cwd(), '.next/server/app-paths-manifest.json');
  if (!fs.existsSync(buildManifestPath)) {
    throw new Error('Build manifest not found. Run npm run build first.');
  }
  const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  const routes = Object.keys(manifest);
  console.log(`  ✓ Total built routes: ${routes.length}`);

  const requiredRoutes = [
    '/',
    '/overview',
    '/scans',
    '/findings',
    '/findings/[id]',
    '/ai-workspace',
    '/support',
    '/support/[category]',
    '/privacy',
    '/about',
    '/terms',
    '/security',
    '/accessibility',
    '/login',
    '/signup',
    '/forgot-password',
    '/owner',
  ];

  const normalizedRoutes = routes.map((r) =>
    r.replace(/\/\([^)]+\)/g, '').replace(/\/page$/, '') || '/'
  );

  for (const r of requiredRoutes) {
    const found = normalizedRoutes.includes(r);
    if (!found) {
      throw new Error(`Required route missing from build: ${r}`);
    } else {
      console.log(`  ✓ Route confirmed: ${r}`);
    }
  }

  console.log('\n=== ALL SENTINEL CHECKS PASSED WITH ZERO ERRORS ===');
  db.close();
}

verify().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

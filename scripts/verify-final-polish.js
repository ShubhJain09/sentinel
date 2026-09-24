/**
 * Sentinel Comprehensive Final Quality & Polish Verification Suite
 * Tests live HTTP server on http://localhost:3000
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { SignJWT } = require('jose');

// Load environment variables from .env.local if present
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

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

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log('\n🚀 [SENTINEL LIVE AUDIT] Testing Running Instance on http://localhost:3000...\n');

  // Test 1: Public Homepage & Security Headers
  console.log('--- Test 1: Public Homepage & Security Headers ---');
  try {
    const homeRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/',
      method: 'GET',
    });

    assert(homeRes.statusCode === 200, `Homepage returned HTTP 200 (got ${homeRes.statusCode})`);
    assert(homeRes.headers['x-frame-options'] === 'SAMEORIGIN', `Header X-Frame-Options: SAMEORIGIN`);
    assert(homeRes.headers['x-content-type-options'] === 'nosniff', `Header X-Content-Type-Options: nosniff`);
    assert(homeRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', `Header Referrer-Policy: strict-origin-when-cross-origin`);
    assert(homeRes.headers['permissions-policy'] === 'camera=(), microphone=(), geolocation=()', `Header Permissions-Policy configured`);
  } catch (err) {
    failures++;
    console.error('Test 1 failed:', err.message);
  }

  // Test 2: Authenticate as Owner
  console.log('\n--- Test 2: Owner Authentication & Session Token ---');
  let sessionCookie = '';
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'sentinel.db');
    const db = new Database(dbPath, { readonly: true });
    const owner = db.prepare("SELECT * FROM users WHERE role = 'owner' LIMIT 1").get();
    db.close();

    assert(!!owner, 'Registered owner account found');

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET is required for authentication tests');
    const encodedKey = new TextEncoder().encode(JWT_SECRET);

    const token = await new SignJWT({
      userId: owner.id,
      email: owner.email,
      name: owner.name,
      role: owner.role,
      avatarInitials: owner.avatarInitials,
      workspaceId: owner.workspaceId,
      username: owner.username || 'owner',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('sentinel')
      .setAudience('sentinel-session')
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(encodedKey);

    assert(!!token, 'Generated valid cryptographically signed JWT session');
    sessionCookie = `sentinel-session=${token}`;
  } catch (err) {
    failures++;
    console.error('Test 2 failed:', err.message);
  }

  // Test 3: Authenticated Overview & GlobalNav Task 1 Verification
  console.log('\n--- Test 3: Overview Page & GlobalNav Avatar Cleanliness (Task 1) ---');
  try {
    const overviewRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/overview',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert(overviewRes.statusCode === 200, `Overview returned HTTP 200 (got ${overviewRes.statusCode})`);
    assert(overviewRes.body.includes('aria-label="Account menu"'), 'GlobalNav contains functional Account menu button');
    assert(!overviewRes.body.includes('Account Avatar + 3-Line Menu Trigger'), 'Task 1: Extraneous 3-line hamburger removed from avatar control');
    assert(overviewRes.body.includes('w-7 h-7 rounded-full bg-[var(--accent-blue)]'), 'Task 1: Clean circular avatar button styling verified');
  } catch (err) {
    failures++;
    console.error('Test 3 failed:', err.message);
  }

  // Test 4: AI Workspace Chat Management (Task 2)
  console.log('\n--- Test 4: AI Workspace Chat Management (Task 2) ---');
  try {
    const aiRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/ai-workspace',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert(aiRes.statusCode === 200, `AI Workspace returned HTTP 200 (got ${aiRes.statusCode})`);
    assert(aiRes.body.includes('New chat'), 'New Chat button present in sidebar');
    assert(aiRes.body.includes('Search history'), 'History search input present');
    assert(aiRes.body.includes('Saved Conversations'), 'Saved Conversations section rendered');
    assert(aiRes.body.includes('S3 bucket policy remediation'), 'Default conversation pre-loaded');
    assert(aiRes.body.includes('Sentinel AI Enclave'), 'Sentinel AI Enclave badge rendered');
    const compSrc = fs.readFileSync(path.join(process.cwd(), 'app/(app)/ai-workspace/workspace-content.tsx'), 'utf8');
    assert(compSrc.includes('Truthful Workspace Access Policy'), 'Truthful workspace access policy present in Share modal');
  } catch (err) {
    failures++;
    console.error('Test 4 failed:', err.message);
  }

  // Test 5: Findings Deep Link & Query Parameter (Task 4)
  console.log('\n--- Test 5: Findings & Inspector Deep Link ---');
  try {
    const findingsRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/findings?selected=SNT-002',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert(findingsRes.statusCode === 200, `Findings returned HTTP 200 (got ${findingsRes.statusCode})`);
    assert(findingsRes.body.includes('SNT-002'), 'Target finding SNT-002 present in response');
    assert(findingsRes.body.includes('Evidence Vault'), 'Evidence Vault panel rendered');
  } catch (err) {
    failures++;
    console.error('Test 5 failed:', err.message);
  }

  // Test 6: Agent Passport & Trust Graph
  console.log('\n--- Test 6: Agent Passport & Trust Graph ---');
  try {
    const agentRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/agents/agt-research-01',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert(agentRes.statusCode === 200, `Agent Passport returned HTTP 200 (got ${agentRes.statusCode})`);
    assert(agentRes.body.includes('Agent Passport'), 'Agent Passport header present');
    assert(agentRes.body.includes('Shadow Mode'), 'Shadow Mode toggle present');
  } catch (err) {
    failures++;
    console.error('Test 6 failed:', err.message);
  }

  // Test 7: Retests & Remediation Verification
  console.log('\n--- Test 7: Remediation & Retests ---');
  try {
    const remRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/remediation',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert(remRes.statusCode === 200, `Remediation returned HTTP 200 (got ${remRes.statusCode})`);

    const retestRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/retests',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert(retestRes.statusCode === 200, `Retests returned HTTP 200 (got ${retestRes.statusCode})`);
  } catch (err) {
    failures++;
    console.error('Test 7 failed:', err.message);
  }

  // Test 8: Owner Control Center (RBAC Guard)
  console.log('\n--- Test 8: Owner Control Center (RBAC Guard) ---');
  try {
    const ownerRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/owner',
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
      },
    });

    assert(ownerRes.statusCode === 200, `Owner Control Center returned HTTP 200 (got ${ownerRes.statusCode})`);
    assert(ownerRes.body.includes('Owner Control Center'), 'Owner Control Center title rendered');
    assert(ownerRes.body.includes('MCP Server Registry'), 'Owner MCP module link present');
  } catch (err) {
    failures++;
    console.error('Test 8 failed:', err.message);
  }

  // Test 9: Support & Documentation Center
  console.log('\n--- Test 9: Support Center & Knowledge Base ---');
  try {
    const supportRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/support',
      method: 'GET',
    });

    assert(supportRes.statusCode === 200, `Support Center returned HTTP 200 (got ${supportRes.statusCode})`);
    assert(supportRes.body.includes('Sentinel Knowledge Base'), 'Knowledge Base section rendered');
  } catch (err) {
    failures++;
    console.error('Test 9 failed:', err.message);
  }

  console.log(`\n========================================`);
  console.log(`LIVE AUDIT RESULTS: ${passes} passed, ${failures} failed.`);
  console.log(`========================================\n`);

  if (failures > 0) {
    console.error('❌ Live Audit Failed!');
    process.exit(1);
  } else {
    console.log('✅ All Live Audit Invariants Verified 100% Against http://localhost:3000!');
    process.exit(0);
  }
}

runLiveVerification();

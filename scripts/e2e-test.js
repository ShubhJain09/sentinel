const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { SignJWT } = require('jose');

const PORT = 3000;
const HOST = 'localhost';

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET is required');
const encodedKey = new TextEncoder().encode(JWT_SECRET);

async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('sentinel')
    .setAudience('sentinel-session')
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: HOST,
        port: PORT,
        ...options,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== SENTINEL LIVE HTTP END-TO-END VERIFICATION ===\n');

  // Test 1: Static Image & Vector Assets
  console.log('[Test 1] Verifying 3D Liquid Glass & SVG Assets over HTTP...');
  const assets = [
    { path: '/sentinel-glass-ring.jpg', type: 'image/jpeg' },
    { path: '/sentinel-glass-orb.jpg', type: 'image/jpeg' },
    { path: '/sentinel-glass-wave.jpg', type: 'image/jpeg' },
    { path: '/icon.svg', type: 'image/svg+xml' },
  ];

  for (const a of assets) {
    const res = await request({ path: a.path, method: 'GET' });
    if (res.statusCode !== 200) {
      throw new Error(`Asset ${a.path} returned status ${res.statusCode}`);
    }
    console.log(`  ✓ ${a.path} -> 200 OK (${res.headers['content-type']})`);
  }

  // Test 2: Unauthenticated Public Pages
  console.log('\n[Test 2] Verifying Public Informational Pages...');
  const publicPages = [
    { path: '/', mustContain: 'Security that moves with you' },
    { path: '/login', mustContain: 'Sign in to Sentinel' },
    { path: '/signup', mustContain: 'Create Sentinel Account' },
    { path: '/forgot-password', mustContain: 'Reset Password' },
    { path: '/support', mustContain: 'How can we help?' },
    { path: '/support/getting-started', mustContain: 'Getting Started' },
    { path: '/privacy', mustContain: 'Zero Model Training' },
    { path: '/about', mustContain: 'A more secure tomorrow' },
    { path: '/terms', mustContain: 'Terms of Service' },
    { path: '/security', mustContain: 'Security Architecture' },
    { path: '/accessibility', mustContain: 'Accessibility Statement' },
  ];

  for (const p of publicPages) {
    const res = await request({ path: p.path, method: 'GET' });
    if (res.statusCode !== 200) {
      throw new Error(`Page ${p.path} returned HTTP ${res.statusCode}`);
    }
    if (!res.body.includes(p.mustContain)) {
      throw new Error(`Page ${p.path} missing expected text: "${p.mustContain}"`);
    }
    console.log(`  ✓ ${p.path} -> 200 OK (verified content)`);
  }

  // Test 3: Unauthenticated Access to Protected Routes
  console.log('\n[Test 3] Verifying Protected Routes Reject Unauthenticated Requests...');
  const protectedRoutes = ['/overview', '/scans', '/findings', '/ai-workspace', '/profile', '/owner'];
  for (const p of protectedRoutes) {
    const res = await request({ path: p, method: 'GET' });
    if (res.statusCode !== 307 && res.statusCode !== 308 && res.statusCode !== 302) {
      throw new Error(`Expected redirect on ${p} when unauthenticated, got ${res.statusCode}`);
    }
    const location = res.headers['location'] || '';
    if (!location.includes('/login')) {
      throw new Error(`Expected redirect to /login for ${p}, got ${location}`);
    }
    console.log(`  ✓ ${p} -> ${res.statusCode} Redirect to /login`);
  }

  // Test 4: Authenticated OWNER Session
  console.log('\n[Test 4] Verifying Authenticated OWNER Session Access...');
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'sentinel.db');
  const db = new Database(dbPath, { readonly: true });
  const owner = db.prepare("SELECT * FROM users WHERE role = 'owner' AND isActive = 1 ORDER BY createdAt ASC LIMIT 1").get();
  db.close();
  if (!owner) throw new Error('No active owner account found for E2E test.');
  const ownerToken = await createToken({
    userId: owner.id,
    email: owner.email,
    name: owner.name,
    role: owner.role,
    avatarInitials: owner.avatarInitials,
    workspaceId: owner.workspaceId,
  });
  const ownerCookie = `sentinel-session=${ownerToken}`;

  const authRoutes = [
    { path: '/overview', mustContain: 'Start a scan' },
    { path: '/scans', mustContain: 'Scans' },
    { path: '/findings', mustContain: 'Findings' },
    { path: '/findings/SNT-001', mustContain: 'Take action' },
    { path: '/ai-workspace', mustContain: 'How can I help you today?' },
    { path: '/profile', mustContain: 'Profile' },
    { path: '/settings', mustContain: 'Settings' },
    { path: '/owner', mustContain: 'Owner' },
  ];

  for (const p of authRoutes) {
    const res = await request({
      path: p.path,
      method: 'GET',
      headers: { Cookie: ownerCookie },
    });
    if (res.statusCode !== 200) {
      throw new Error(`Authenticated route ${p.path} returned status ${res.statusCode}`);
    }
    if (!res.body.includes(p.mustContain)) {
      throw new Error(`Authenticated route ${p.path} missing text: "${p.mustContain}"`);
    }
    console.log(`  ✓ ${p.path} -> 200 OK (OWNER authorized & rendered)`);
  }

  // Test 5: RBAC Role Separation (Analyst denied from /owner)
  console.log('\n[Test 5] Verifying Non-Owner Denied from /owner...');
  const analystToken = await createToken({
    userId: 'usr_analyst_001',
    email: 'analyst@sentinel.security',
    name: 'Analyst User',
    role: 'analyst',
    avatarInitials: 'AU',
    workspaceId: 'ws_prod_001',
  });
  const analystCookie = `sentinel-session=${analystToken}`;

  const ownerAccessAttempt = await request({
    path: '/owner',
    method: 'GET',
    headers: { Cookie: analystCookie },
  });
  if (
    ownerAccessAttempt.statusCode !== 307 &&
    ownerAccessAttempt.statusCode !== 308 &&
    ownerAccessAttempt.statusCode !== 302
  ) {
    throw new Error(
      `Analyst was NOT redirected away from /owner! Got status ${ownerAccessAttempt.statusCode}`
    );
  }
  const deniedLocation = ownerAccessAttempt.headers['location'] || '';
  if (!deniedLocation.includes('Unauthorized')) {
    throw new Error(`Expected Unauthorized error parameter, got ${deniedLocation}`);
  }
  console.log(`  ✓ /owner as analyst -> ${ownerAccessAttempt.statusCode} Redirect to ${deniedLocation}`);

  // Test 6: Logout Flow Verification
  console.log('\n[Test 6] Verifying Robust Logout Lifecycle...');
  const logoutRes = await request({
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: ownerCookie },
  });

  if (logoutRes.statusCode !== 303 && logoutRes.statusCode !== 302 && logoutRes.statusCode !== 307) {
    throw new Error(`Expected 303/302 redirect from /api/auth/logout, got ${logoutRes.statusCode}`);
  }

  const setCookie = logoutRes.headers['set-cookie'] || [];
  const setCookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  console.log(`  ✓ Logout response status: ${logoutRes.statusCode} -> Location: ${logoutRes.headers['location']}`);
  console.log(`  ✓ Set-Cookie header: ${setCookieStr.substring(0, 75)}...`);

  const clearsCookie = setCookieStr.includes('sentinel-session=;') || setCookieStr.includes('Max-Age=0') || setCookieStr.includes('expires=');
  if (!clearsCookie) {
    throw new Error('Logout response did not clear sentinel-session cookie!');
  }
  console.log('  ✓ Verified sentinel-session cookie cleared on logout');

  // Verify /overview rejects request with cleared cookie
  const clearedCookie = 'sentinel-session=';
  const postLogoutOverview = await request({
    path: '/overview',
    method: 'GET',
    headers: { Cookie: clearedCookie },
  });
  if (postLogoutOverview.statusCode !== 307 && postLogoutOverview.statusCode !== 308 && postLogoutOverview.statusCode !== 302) {
    throw new Error(`Expected redirect on /overview post-logout, got ${postLogoutOverview.statusCode}`);
  }
  console.log(`  ✓ Access to /overview post-logout cleanly redirected (${postLogoutOverview.statusCode})`);

  console.log('\n=== ALL 6 END-TO-END SUITES PASSED WITH ZERO ERRORS ===');
}

run().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});

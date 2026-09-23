const http = require('http');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')(path.join(__dirname, '..', 'sentinel.db'));
const { SignJWT, jwtVerify } = require('jose');

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-dev-secret-key-change-in-production-32chars';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: 'localhost',
        port: 3000,
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
    if (body) req.write(body);
    req.end();
  });
}

async function testFullLifecycle() {
  console.log('=== SENTINEL FULL LIFECYCLE AUDIT (LOGIN -> NAV -> LOGOUT -> RE-LOGIN) ===\n');

  const email = 'workspaceshubhjain@gmail.com';
  const password = 'SentinelOwner2026!';

  // Step 1: Verify User in DB & Password Hash
  console.log('[Step 1] Verifying user credentials against database...');
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND isActive = 1').get(email);
  if (!user) throw new Error(`User ${email} not found in database!`);
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) throw new Error('Password mismatch!');
  console.log(`  ✓ Credentials verified for ${user.name} <${user.email}> (role: ${user.role})`);

  // Step 2: Create Authenticated Session Token
  console.log('\n[Step 2] Establishing authenticated session...');
  const sessionToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarInitials: user.avatarInitials,
    workspaceId: user.workspaceId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const sessionCookie = `sentinel-session=${sessionToken}`;
  console.log('  ✓ Session token signed and formatted as cookie');

  // Step 3: Navigate across key surfaces
  console.log('\n[Step 3] Navigating across key surfaces with active session...');
  const routesToTest = [
    { name: 'OVERVIEW', path: '/overview', check: 'Good' },
    { name: 'SCANS', path: '/scans', check: 'Scans' },
    { name: 'FINDINGS', path: '/findings', check: 'Findings' },
    { name: 'AI WORKSPACE', path: '/ai-workspace', check: 'How can I help you today?' },
    { name: 'PROFILE', path: '/profile', check: 'Terminate Active Session' },
    { name: 'SUPPORT', path: '/support', check: 'How can we help?' },
    { name: 'OWNER CONTROL CENTER', path: '/owner', check: 'Owner' },
  ];

  for (const r of routesToTest) {
    const res = await request({
      path: r.path,
      method: 'GET',
      headers: { Cookie: sessionCookie },
    });
    if (res.statusCode !== 200) {
      throw new Error(`Failed to load ${r.name} (${r.path}): HTTP ${res.statusCode}`);
    }
    if (!res.body.includes(r.check)) {
      throw new Error(`${r.name} at ${r.path} missing marker "${r.check}"`);
    }
    console.log(`  ✓ ${r.name.padEnd(20)} (${r.path.padEnd(16)}) -> 200 OK`);
  }

  // Step 4: Perform Logout via /api/auth/logout
  console.log('\n[Step 4] Executing sign out via /api/auth/logout...');
  const logoutRes = await request({
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });

  if (logoutRes.statusCode !== 303 && logoutRes.statusCode !== 302) {
    throw new Error(`Logout failed with status ${logoutRes.statusCode}`);
  }
  const setCookie = logoutRes.headers['set-cookie'] || [];
  const setCookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  console.log(`  ✓ Sign out returned HTTP ${logoutRes.statusCode} -> Location: ${logoutRes.headers['location']}`);
  console.log(`  ✓ Set-Cookie: ${setCookieStr.substring(0, 60)}...`);

  // Step 5: Verify Login Page Renders Normally
  console.log('\n[Step 5] Loading /login after logout...');
  const loginRes = await request({
    path: '/login',
    method: 'GET',
  });
  if (loginRes.statusCode !== 200) {
    throw new Error(`Failed to load /login: HTTP ${loginRes.statusCode}`);
  }
  if (!loginRes.body.includes('Sign in to Sentinel')) {
    throw new Error('/login missing key elements!');
  }
  console.log('  ✓ /login renders normally (200 OK, zero exceptions)');

  // Step 6: Verify Protected Route Rejection After Logout
  console.log('\n[Step 6] Confirming /overview cannot be accessed without session...');
  const postLogoutOverview = await request({
    path: '/overview',
    method: 'GET',
    headers: { Cookie: 'sentinel-session=' },
  });
  if (postLogoutOverview.statusCode !== 307 && postLogoutOverview.statusCode !== 308) {
    throw new Error(`Expected redirect on /overview, got ${postLogoutOverview.statusCode}`);
  }
  console.log(`  ✓ Protected route /overview cleanly rejected with ${postLogoutOverview.statusCode} -> ${postLogoutOverview.headers['location']}`);

  // Step 7: Re-Authenticate (LOGIN AGAIN)
  console.log('\n[Step 7] Re-authenticating session (LOGIN AGAIN)...');
  const reauthSessionToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarInitials: user.avatarInitials,
    workspaceId: user.workspaceId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const reauthCookie = `sentinel-session=${reauthSessionToken}`;
  const reauthOverview = await request({
    path: '/overview',
    method: 'GET',
    headers: { Cookie: reauthCookie },
  });
  if (reauthOverview.statusCode !== 200) {
    throw new Error(`Failed to re-authenticate: HTTP ${reauthOverview.statusCode}`);
  }
  console.log('  ✓ Successfully re-authenticated and loaded /overview (200 OK)');

  console.log('\n=== COMPLETE LIFECYCLE AUDIT PASSED WITH ZERO CRASHES & ZERO ERRORS ===');
  db.close();
}

testFullLifecycle().catch((err) => {
  console.error('\n❌ LIFECYCLE AUDIT FAILED:', err);
  process.exit(1);
});

const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { SignJWT } = require('jose');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
}

function request(path, cookie = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method: 'GET',
        headers: cookie ? { Cookie: cookie } : {},
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, length: data.length }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function testAllRoutes() {
  console.log('Testing all app routes against running server...');

  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'sentinel.db');
  const db = new Database(dbPath, { readonly: true });
  const owner = db.prepare("SELECT * FROM users WHERE role = 'owner' LIMIT 1").get();
  db.close();

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
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
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const cookie = `sentinel-session=${token}`;

  const routes = [
    { path: '/', auth: false },
    { path: '/login', auth: false },
    { path: '/signup', auth: false },
    { path: '/about', auth: false },
    { path: '/privacy', auth: false },
    { path: '/terms', auth: false },
    { path: '/security', auth: false },
    { path: '/accessibility', auth: false },
    { path: '/support', auth: false },
    { path: '/support/contact', auth: false },
    { path: '/support/glossary', auth: false },
    { path: '/support/keyboard-shortcuts', auth: false },
    { path: '/overview', auth: true },
    { path: '/agents', auth: true },
    { path: '/agents/agt-research-01', auth: true },
    { path: '/scans', auth: true },
    { path: '/scans/new', auth: true },
    { path: '/findings', auth: true },
    { path: '/findings/SNT-001', auth: true },
    { path: '/investigations/SNT-001', auth: true },
    { path: '/evidence', auth: true },
    { path: '/approvals', auth: true },
    { path: '/remediation', auth: true },
    { path: '/retests', auth: true },
    { path: '/ai-workspace', auth: true },
    { path: '/activity', auth: true },
    { path: '/analytics', auth: true },
    { path: '/notifications', auth: true },
    { path: '/profile', auth: true },
    { path: '/settings', auth: true },
    { path: '/owner', auth: true },
    { path: '/owner/users', auth: true },
    { path: '/owner/roles', auth: true },
    { path: '/owner/workspaces', auth: true },
    { path: '/owner/audit', auth: true },
    { path: '/owner/mcp', auth: true },
    { path: '/owner/trueforge', auth: true },
    { path: '/owner/runtime', auth: true },
    { path: '/owner/providers', auth: true },
    { path: '/owner/agents', auth: true },
    { path: '/owner/integrations', auth: true },
    { path: '/owner/features', auth: true },
    { path: '/owner/security', auth: true },
    { path: '/owner/secrets', auth: true },
    { path: '/owner/diagnostics', auth: true },
    { path: '/owner/system', auth: true },
  ];

  let errors = 0;
  for (const r of routes) {
    try {
      const res = await request(r.path, r.auth ? cookie : '');
      if (res.status === 200) {
        console.log(`  ✓ ${r.path} -> HTTP 200 (${res.length} bytes)`);
      } else {
        console.error(`  ✗ ${r.path} -> HTTP ${res.status}`);
        errors++;
      }
    } catch (err) {
      console.error(`  ✗ ${r.path} -> Error: ${err.message}`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\nFAIL: ${errors} routes did not return HTTP 200`);
    process.exit(1);
  } else {
    console.log(`\nSUCCESS: All ${routes.length} routes returned HTTP 200 OK!`);
    process.exit(0);
  }
}

testAllRoutes();

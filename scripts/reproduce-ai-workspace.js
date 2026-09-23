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

async function reproduce() {
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

  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/ai-workspace',
      method: 'GET',
      headers: {
        Cookie: cookie,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    },
    (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        console.log('Status code:', res.statusCode);
        console.log('Headers:', res.headers);
        if (data.includes('Workspace Interrupted') || data.includes('Error') || data.includes('441') || res.statusCode !== 200) {
          console.error('ERROR DETECTED IN RESPONSE:');
          console.error(data.slice(0, 4000));
        } else {
          console.log('SUCCESS! Response length:', data.length);
          console.log('First 500 chars:');
          console.log(data.slice(0, 500));
        }
      });
    }
  );

  req.on('error', (err) => console.error('Request failed:', err));
  req.end();
}

reproduce();

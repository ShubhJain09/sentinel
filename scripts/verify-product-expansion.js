const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Load .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  });
}

const BASE_URL = 'http://localhost:3000';
const dbPath = path.join(__dirname, '..', 'sentinel.db');

let failures = 0;
let passed = 0;

function logPass(msg) {
  console.log(`\x1b[32m✓ PASS:\x1b[0m ${msg}`);
  passed++;
}

function logFail(msg) {
  console.error(`\x1b[31m✗ FAIL:\x1b[0m ${msg}`);
  failures++;
}

// HTTP request helper
function request(pathStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathStr, BASE_URL);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('SENTINEL PRODUCT EXPANSION VERIFICATION SUITE');
  console.log('====================================================\n');

  // TEST 1: Database Schema & Seed Verification
  console.log('--- TEST SUITE 1: Database Schema & Seeds ---');
  try {
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    const userCols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
    const expectedCols = ['username', 'bio', 'dob', 'avatarUrl', 'website', 'github', 'linkedin', 'instagram', 'xTwitter', 'location', 'isOnboarded'];
    const missingCols = expectedCols.filter((c) => !userCols.includes(c));

    if (missingCols.length === 0) {
      logPass(`Users table contains all ${expectedCols.length} expanded profile columns`);
    } else {
      logFail(`Users table is missing columns: ${missingCols.join(', ')}`);
    }

    const owner = db.prepare("SELECT * FROM users WHERE role = 'owner' ORDER BY createdAt ASC LIMIT 1").get();
    if (owner) {
      logPass('Owner profile record is present without relying on a hardcoded identity.');
    } else {
      logFail('Owner profile record is missing.');
    }

    const agents = db.prepare("SELECT * FROM agents").all();
    if (agents.length >= 4) {
      logPass(`Agents table verified with ${agents.length} seeded agents`);
      // Verify JSON parses cleanly
      const a1 = agents.find((a) => a.id === 'agt-research-01');
      const caps = JSON.parse(a1.capabilities);
      const graph = JSON.parse(a1.trustGraph);
      const drift = JSON.parse(a1.driftDetails);
      if (caps.length > 0 && graph.nodes.length > 0 && drift.detectedAt) {
        logPass('Agent capabilities, trust graph, and drift details parse valid JSON');
      } else {
        logFail('Agent JSON fields failed validation');
      }
    } else {
      logFail(`Expected at least 4 agents, found ${agents.length}`);
    }
  } catch (err) {
    logFail(`Database verification threw error: ${err.message}`);
  }

  // TEST 2: Authentication & Session Token
  console.log('\n--- TEST SUITE 2: Authentication & Owner Session ---');
  let sessionCookie = '';
  try {
    const loginRes = await request('/login');
    if (loginRes.status === 200) {
      logPass('Login page accessible (200 OK)');
    } else {
      logFail(`Login page returned ${loginRes.status}`);
    }

    // Direct token creation for test suite using jose
    const { SignJWT } = require('jose');
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey || secretKey.length < 32) throw new Error('JWT_SECRET is required for authentication tests');
    const encodedKey = new TextEncoder().encode(secretKey);

    const token = await new SignJWT({
      userId: owner.id,
      email: owner.email,
      name: owner.name,
      role: owner.role,
      avatarInitials: owner.avatarInitials,
      workspaceId: owner.workspaceId,
      username: owner.username,
      avatarUrl: owner.avatarUrl,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('sentinel')
      .setAudience('sentinel-session')
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(encodedKey);

    sessionCookie = `sentinel-session=${token}`;
    logPass('Generated cryptographic HMAC-SHA256 owner session cookie');
  } catch (err) {
    logFail(`Authentication failed: ${err.message}`);
  }

  const authHeaders = { Cookie: sessionCookie };

  // TEST 3: Product Expansion Endpoints
  console.log('\n--- TEST SUITE 3: Product Expansion Endpoints & Features ---');

  const testEndpoints = [
    {
      path: '/overview',
      name: 'Overview Dashboard',
      expectContent: ['Open findings', 'Recent activity'],
    },
    {
      path: '/agents',
      name: 'Agents & Passports Inventory',
      expectContent: ['Agents &amp; Passports', 'Research Assistant Agent', 'Filesystem MCP Enclave', 'Shadow Mode'],
    },
    {
      path: '/agents/agt-research-01',
      name: 'Agent Passport (Research Assistant)',
      expectContent: ['Research Assistant Agent', 'Configuration Drift', 'Trust Graph', 'Capabilities'],
    },
    {
      path: '/agents/agt-fs-sandbox-02',
      name: 'Agent Passport (Filesystem MCP Enclave)',
      expectContent: ['Filesystem MCP Enclave', 'Filesystem Workspace Read'],
    },
    {
      path: '/investigations/SNT-001',
      name: 'Investigation Replay & Scrubber',
      expectContent: ['Chronological Replay', 'Root-Cause Summarization', 'False-Positive Review Assistant'],
    },
    {
      path: '/remediation',
      name: 'Remediation Engine with Safe Diff',
      expectContent: ['Remediation Engine', 'Safe Boundary Patch Preview', 'Side-by-Side'],
    },
    {
      path: '/profile',
      name: 'Operator Profile Editor',
      expectContent: ['Operator Profile', 'Identity Verification Status', 'Display &amp; Appearance'],
    },
    {
      path: '/onboarding/profile',
      name: 'Progressive Onboarding Flow',
      expectContent: ['Operator Onboarding', 'Declare Your Operator Identity'],
    },
    {
      path: '/support',
      name: 'Support & Help Center',
      expectContent: ['How Sentinel Protects an AI Agent', 'Browse by Category', '16 Categories'],
    },
    {
      path: '/support/agents',
      name: 'Support Category Page (/support/agents)',
      expectContent: ['Agent Passports', 'Available Guides &amp; Specifications'],
    },
    {
      path: '/support/agents/agent-passports-explained',
      name: 'Structured Article Reader',
      expectContent: ['Understanding Agent Passports &amp; Capabilities', 'Human-Readable Capabilities'],
    },
    {
      path: '/support/glossary',
      name: 'Security & AI Glossary (/support/glossary)',
      expectContent: ['Sentinel Security &amp; AI Glossary', 'Agent Passport', 'AST Patch'],
    },
    {
      path: '/support/keyboard-shortcuts',
      name: 'Keyboard Shortcuts Cheat Sheet',
      expectContent: ['Sentinel Keyboard Shortcuts', '⌘', 'Spotlight Command Palette'],
    },
    {
      path: '/support/contact',
      name: 'Security Escalation Form',
      expectContent: ['Security Escalation Request', 'Incident Severity'],
    },
  ];

  for (const ep of testEndpoints) {
    try {
      const res = await request(ep.path, { headers: authHeaders });
      if (res.status === 200) {
        let matched = true;
        for (const exp of ep.expectContent) {
          if (!res.body.includes(exp)) {
            matched = false;
            logFail(`${ep.name} (200 OK) but missing expected content: "${exp}"`);
            break;
          }
        }
        if (matched) {
          logPass(`${ep.name} rendered with 200 OK and expected content`);
        }
      } else {
        logFail(`${ep.name} returned HTTP ${res.status}`);
      }
    } catch (err) {
      logFail(`${ep.name} threw error: ${err.message}`);
    }
  }

  // TEST 4: Sign-Out Redirect & Cookie Invalidation
  console.log('\n--- TEST SUITE 4: Sign-Out Clean Redirection ---');
  try {
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders,
    });
    const location = logoutRes.headers.location || '';
    if (logoutRes.status === 303 && (location === '/login' || location.endsWith('/login'))) {
      logPass(`POST /api/auth/logout returned HTTP 303 with redirect to ${location}`);
    } else {
      logFail(`Logout returned ${logoutRes.status} Location: ${location}`);
    }

    const setCookie = logoutRes.headers['set-cookie'] || [];
    const cleared = setCookie.some((c) => {
      const lower = c.toLowerCase();
      return lower.includes('sentinel-session=') && (lower.includes('max-age=0') || lower.includes('expires='));
    });
    if (cleared) {
      logPass('Logout cleared sentinel-session cookie');
    } else {
      logFail(`Logout did not properly clear sentinel-session cookie: ${JSON.stringify(setCookie)}`);
    }
  } catch (err) {
    logFail(`Logout check threw error: ${err.message}`);
  }

  // TEST 5: Verify Zero Browser alert() Calls
  console.log('\n--- TEST SUITE 5: Zero Browser alert() Verification ---');
  try {
    const appDir = path.join(__dirname, '..', 'app');
    function scanForAlerts(dir) {
      let alertCount = 0;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          alertCount += scanForAlerts(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(/(\bwindow\.alert\b|\balert\()/g);
          if (matches) {
            console.error(`Found alert() in: ${fullPath}`);
            alertCount += matches.length;
          }
        }
      }
      return alertCount;
    }

    const totalAlerts = scanForAlerts(appDir);
    if (totalAlerts === 0) {
      logPass('Zero instances of alert() or window.alert() in frontend codebase');
    } else {
      logFail(`Found ${totalAlerts} instances of alert() in codebase`);
    }
  } catch (err) {
    logFail(`Alert scan threw error: ${err.message}`);
  }

  // Final Summary
  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failures} FAILED`);
  console.log('====================================================');

  if (failures > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

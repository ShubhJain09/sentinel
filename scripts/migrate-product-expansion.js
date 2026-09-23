const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'sentinel.db');
console.log(`Connecting to Sentinel database at: ${dbPath}`);
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 1. Additive columns to users table
const userColumns = db.prepare("PRAGMA table_info(users)").all();
const existingColNames = new Set(userColumns.map(c => c.name));

const columnsToAdd = [
  { name: 'username', type: 'TEXT' },
  { name: 'bio', type: 'TEXT' },
  { name: 'dob', type: 'TEXT' },
  { name: 'avatarUrl', type: 'TEXT' },
  { name: 'website', type: 'TEXT' },
  { name: 'github', type: 'TEXT' },
  { name: 'linkedin', type: 'TEXT' },
  { name: 'instagram', type: 'TEXT' },
  { name: 'xTwitter', type: 'TEXT' },
  { name: 'location', type: 'TEXT' },
  { name: 'isOnboarded', type: 'INTEGER NOT NULL DEFAULT 1' },
];

for (const col of columnsToAdd) {
  if (!existingColNames.has(col.name)) {
    console.log(`Adding column: ${col.name} to users table...`);
    db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
  } else {
    console.log(`Column ${col.name} already exists in users table.`);
  }
}

// 2. Update owner workspaceshubhjain@gmail.com with rich profile
const ownerEmail = 'workspaceshubhjain@gmail.com';
const owner = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(ownerEmail);
if (owner) {
  console.log(`Updating owner profile for ${ownerEmail}...`);
  db.prepare(`
    UPDATE users SET
      username = 'shubh',
      bio = 'Principal Security Architect & Autonomous Systems Lead at Sentinel.',
      dob = '1998-04-15',
      website = 'https://sentinel.security',
      github = 'shubhjain',
      linkedin = 'shubhjain',
      instagram = 'shubhjain',
      xTwitter = 'shubhjain',
      location = 'San Francisco, CA',
      isOnboarded = 1
    WHERE id = ?
  `).run(owner.id);
  console.log('Owner profile updated successfully.');
}

// 3. Create agents table
db.exec(`
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
`);

console.log('Agents table verified/created.');

// 4. Seed initial agents if none exist
const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
console.log(`Current agents count: ${agentCount}`);

if (agentCount === 0) {
  console.log('Seeding initial 4 first-class agents...');
  const defaultWorkspace = db.prepare('SELECT id FROM workspaces LIMIT 1').get()?.id || 'default-workspace-id';
  const ownerId = owner?.id || 'owner-user-id';
  const timestamp = new Date().toISOString();

  // Agent 1: Research Assistant Agent (Connected to SNT-002)
  const agent1Capabilities = [
    {
      id: 'cap-web-search',
      name: 'External Search & Retrieve',
      category: 'network',
      description: 'Queries public search engines and fetches raw web pages into memory.',
      plainEnglish: 'Can perform web searches and retrieve public web pages',
      riskLevel: 'elevated',
      requiresApproval: false,
      scope: 'HTTPS Outbound: Google, DuckDuckGo, Wikipedia API',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-doc-summary',
      name: 'Document Analysis & Synthesis',
      category: 'sensitive_resource',
      description: 'Extracts entities, summarizes text, and indexes retrieval passages.',
      plainEnglish: 'Can parse and analyze retrieved research documents',
      riskLevel: 'low',
      requiresApproval: false,
      scope: 'In-Memory Context Window',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-exec-untrusted',
      name: 'Untrusted Instruction Execution',
      category: 'tool_invocation',
      description: 'Executes secondary tools based on unverified prompts in retrieved documents.',
      plainEnglish: 'Attempts to run commands embedded inside external documents (BLOCKED by Sentinel)',
      riskLevel: 'critical',
      requiresApproval: true,
      scope: 'Restricted by Policy SNT-002',
      isObserved: true,
      isUsed: false
    }
  ];

  const agent1TrustGraph = {
    nodes: [
      { id: 'agt-1', label: 'Research Assistant', type: 'agent', status: 'warning', details: 'Active Agent Instance' },
      { id: 'tool-search', label: 'Web Search Tool', type: 'tool', status: 'safe', details: 'mcp::brave_search' },
      { id: 'tool-fetch', label: 'Page Fetcher', type: 'tool', status: 'safe', details: 'mcp::fetch_html' },
      { id: 'res-internal-docs', label: 'Internal Docs Vault', type: 'resource', status: 'warning', details: 'Sensitive markdown archive' },
      { id: 'data-tokens', label: 'API Keys / Secrets', type: 'data', status: 'critical', details: 'Restricted host credentials' },
      { id: 'svc-external', label: 'Public Web Endpoints', type: 'service', status: 'safe', details: 'Outbound HTTPS' }
    ],
    edges: [
      { from: 'agt-1', to: 'tool-search', label: 'invokes', risk: 'low', requiresHumanGate: false },
      { from: 'agt-1', to: 'tool-fetch', label: 'invokes', risk: 'low', requiresHumanGate: false },
      { from: 'tool-fetch', to: 'svc-external', label: 'queries', risk: 'low', requiresHumanGate: false },
      { from: 'agt-1', to: 'res-internal-docs', label: 'attempted read', risk: 'elevated', requiresHumanGate: true },
      { from: 'res-internal-docs', to: 'data-tokens', label: 'contains', risk: 'critical', requiresHumanGate: true }
    ]
  };

  const agent1DriftDetails = {
    detectedAt: '2026-09-22T19:20:00.000Z',
    diffSummary: 'Declared tool whitelist allowed 2 tools (brave_search, fetch_html). Runtime attempted to bind dynamic evaluation tool (eval_script).',
    baselineConfig: { allowedTools: ['brave_search', 'fetch_html'], sandboxNetwork: 'outbound-only', promptInjectionGuard: true },
    activeConfig: { allowedTools: ['brave_search', 'fetch_html', 'eval_script'], sandboxNetwork: 'outbound-only', promptInjectionGuard: false },
    riskAnalysis: 'The agent attempted to dynamically declare an eval_script capability after reading a retrieved prompt injection payload.',
    recommendedAction: 'Enforce static tool manifest and reject runtime schema mutation.'
  };

  const agent1ShadowTelemetry = {
    observedCallsCount: 142,
    requestedTools: ['brave_search', 'fetch_html', 'eval_script'],
    unusedTools: ['eval_script'],
    overprivilegedScopes: ['Dynamic tool registration', 'Host environment variable access'],
    recommendedMinPermissions: ['Allow brave_search', 'Allow fetch_html with content sanitization', 'Block eval_script'],
    lastObservedAt: '2026-09-22T21:40:00.000Z'
  };

  // Agent 2: Filesystem MCP Enclave (Connected to SNT-001)
  const agent2Capabilities = [
    {
      id: 'cap-fs-read',
      name: 'Filesystem Workspace Read',
      category: 'filesystem',
      description: 'Reads authorized code and artifact files within /workspace root.',
      plainEnglish: 'Can read files inside the project workspace directory',
      riskLevel: 'low',
      requiresApproval: false,
      scope: 'Path: /workspace/**',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-fs-traversal',
      name: 'Host Path Traversal Read',
      category: 'filesystem',
      description: 'Attempted to read host credentials and configuration via relative paths (../).',
      plainEnglish: 'Attempted to read files outside the project boundary (BLOCKED by Sentinel)',
      riskLevel: 'critical',
      requiresApproval: true,
      scope: 'Path: /Users/sentinel/fixtures/**',
      isObserved: true,
      isUsed: false
    }
  ];

  const agent2TrustGraph = {
    nodes: [
      { id: 'agt-2', label: 'Filesystem MCP Enclave', type: 'agent', status: 'critical', details: 'Runtime Sandbox Host' },
      { id: 'tool-read', label: 'mcp::read_file', type: 'tool', status: 'warning', details: 'Filesystem Reader' },
      { id: 'tool-write', label: 'mcp::write_file', type: 'tool', status: 'safe', details: 'Filesystem Writer' },
      { id: 'res-workspace', label: '/workspace root', type: 'resource', status: 'safe', details: 'Authorized Sandbox' },
      { id: 'res-host-fs', label: 'Host System Filesystem', type: 'resource', status: 'critical', details: 'Protected Host OS' }
    ],
    edges: [
      { from: 'agt-2', to: 'tool-read', label: 'invokes', risk: 'low', requiresHumanGate: false },
      { from: 'tool-read', to: 'res-workspace', label: 'accesses', risk: 'low', requiresHumanGate: false },
      { from: 'tool-read', to: 'res-host-fs', label: 'traversal attempt', risk: 'critical', requiresHumanGate: true }
    ]
  };

  const agent2ShadowTelemetry = {
    observedCallsCount: 388,
    requestedTools: ['read_file', 'write_file', 'list_directory'],
    unusedTools: ['delete_file'],
    overprivilegedScopes: ['Unrestricted symlink resolution', 'Relative directory traversal ../'],
    recommendedMinPermissions: ['Enforce realpath() boundary check against /workspace root'],
    lastObservedAt: '2026-09-22T21:45:00.000Z'
  };

  // Agent 3: Autonomous Code Reviewer (Verified Clean)
  const agent3Capabilities = [
    {
      id: 'cap-git-diff',
      name: 'Git Diff & AST Analysis',
      category: 'filesystem',
      description: 'Reads repository commits, tree diffs, and parses Abstract Syntax Trees.',
      plainEnglish: 'Can inspect code changes and syntax trees in pull requests',
      riskLevel: 'low',
      requiresApproval: false,
      scope: 'Read-only: repository git worktree',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-lint-exec',
      name: 'Linter & Typecheck Runner',
      category: 'shell',
      description: 'Executes ESLint and TypeScript compiler inside isolated ephemeral container.',
      plainEnglish: 'Can execute linter and compiler checks in a locked container',
      riskLevel: 'moderate',
      requiresApproval: false,
      scope: 'Container: no network, readonly rootfs',
      isObserved: true,
      isUsed: true
    }
  ];

  const agent3TrustGraph = {
    nodes: [
      { id: 'agt-3', label: 'Code Reviewer Enclave', type: 'agent', status: 'safe', details: 'Strict Verification Engine' },
      { id: 'tool-git', label: 'Git Reader Tool', type: 'tool', status: 'safe', details: 'mcp::git_diff' },
      { id: 'tool-eslint', label: 'Linter Container', type: 'tool', status: 'safe', details: 'Isolated Sandbox' },
      { id: 'res-repo', label: 'Source Repository', type: 'resource', status: 'safe', details: 'Read-Only Git Mirror' }
    ],
    edges: [
      { from: 'agt-3', to: 'tool-git', label: 'invokes', risk: 'low', requiresHumanGate: false },
      { from: 'tool-git', to: 'res-repo', label: 'reads', risk: 'low', requiresHumanGate: false },
      { from: 'agt-3', to: 'tool-eslint', label: 'spawns', risk: 'low', requiresHumanGate: false }
    ]
  };

  const agent3ShadowTelemetry = {
    observedCallsCount: 520,
    requestedTools: ['git_diff', 'git_log', 'run_linter'],
    unusedTools: [],
    overprivilegedScopes: [],
    recommendedMinPermissions: ['Current permissions optimal (Least Privilege Verified)'],
    lastObservedAt: '2026-09-22T21:50:00.000Z'
  };

  // Agent 4: Cloud Infrastructure Sentinel (Staging Deployer)
  const agent4Capabilities = [
    {
      id: 'cap-k8s-read',
      name: 'Kubernetes Cluster Telemetry Read',
      category: 'network',
      description: 'Queries staging Kubernetes cluster API for pod health, event logs, and status.',
      plainEnglish: 'Can monitor health metrics and logs of staging services',
      riskLevel: 'low',
      requiresApproval: false,
      scope: 'Kubeconfig: staging-readonly namespace',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-k8s-scale',
      name: 'Container Replicas Adjustment',
      category: 'tool_invocation',
      description: 'Updates deployment replica counts during auto-scaling events.',
      plainEnglish: 'Can adjust server capacity during traffic surges',
      riskLevel: 'moderate',
      requiresApproval: false,
      scope: 'Staging namespace only: 1 to 5 replicas',
      isObserved: true,
      isUsed: true
    },
    {
      id: 'cap-k8s-deploy',
      name: 'Production Image Deployment',
      category: 'tool_invocation',
      description: 'Rolls out new container image tag to production cluster.',
      plainEnglish: 'Requires human approval before rolling out new versions to production',
      riskLevel: 'critical',
      requiresApproval: true,
      scope: 'Production namespace: mandatory 2-person approval gate',
      isObserved: false,
      isUsed: false
    }
  ];

  const agent4TrustGraph = {
    nodes: [
      { id: 'agt-4', label: 'Cloud Infra Sentinel', type: 'agent', status: 'safe', details: 'Deployment Broker' },
      { id: 'tool-k8s', label: 'Kubernetes API Adapter', type: 'tool', status: 'safe', details: 'TLS Client' },
      { id: 'res-staging', label: 'Staging Cluster', type: 'resource', status: 'safe', details: 'Auto-Approved Boundary' },
      { id: 'res-prod', label: 'Production Cluster', type: 'resource', status: 'warning', details: 'Human Gate Required' }
    ],
    edges: [
      { from: 'agt-4', to: 'tool-k8s', label: 'invokes', risk: 'low', requiresHumanGate: false },
      { from: 'tool-k8s', to: 'res-staging', label: 'modifies', risk: 'moderate', requiresHumanGate: false },
      { from: 'tool-k8s', to: 'res-prod', label: 'deploys', risk: 'critical', requiresHumanGate: true }
    ]
  };

  const agent4ShadowTelemetry = {
    observedCallsCount: 290,
    requestedTools: ['k8s_status', 'k8s_scale', 'k8s_deploy'],
    unusedTools: ['k8s_delete_namespace'],
    overprivilegedScopes: ['Broad cluster-admin RBAC role in staging'],
    recommendedMinPermissions: ['Scope staging kubeconfig to specific service namespace'],
    lastObservedAt: '2026-09-22T21:55:00.000Z'
  };

  const insertAgent = db.prepare(`
    INSERT INTO agents (
      id, name, type, description, status, environment, ownerId, workspaceId,
      trustScore, shadowMode, capabilities, trustGraph, driftStatus, driftDetails,
      shadowTelemetry, lastVerifiedAt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAgent.run(
    'agt-research-01',
    'Research Assistant Agent',
    'AI Research & Retrieval Agent',
    'Autonomous research agent with retrieval-augmented generation and web browsing capabilities.',
    'needs_attention',
    'production',
    ownerId,
    defaultWorkspace,
    74,
    1, // Shadow Mode ON
    JSON.stringify(agent1Capabilities),
    JSON.stringify(agent1TrustGraph),
    'drift_detected',
    JSON.stringify(agent1DriftDetails),
    JSON.stringify(agent1ShadowTelemetry),
    '2026-09-22T21:40:00.000Z',
    timestamp,
    timestamp
  );

  insertAgent.run(
    'agt-fs-sandbox-02',
    'Filesystem MCP Enclave',
    'Tool Execution Sandbox',
    'Containerized Model Context Protocol filesystem host providing file manipulation primitives to language models.',
    'needs_attention',
    'production',
    ownerId,
    defaultWorkspace,
    68,
    0, // Shadow Mode OFF
    JSON.stringify(agent2Capabilities),
    JSON.stringify(agent2TrustGraph),
    'clean',
    null,
    JSON.stringify(agent2ShadowTelemetry),
    '2026-09-22T21:45:00.000Z',
    timestamp,
    timestamp
  );

  insertAgent.run(
    'agt-code-reviewer-03',
    'Autonomous Code Reviewer',
    'Code Quality & Boundary Inspector',
    'High-assurance code review agent checking pull requests for security flaws, boundary breaches, and regression bugs.',
    'verified',
    'production',
    ownerId,
    defaultWorkspace,
    96,
    1, // Shadow Mode ON
    JSON.stringify(agent3Capabilities),
    JSON.stringify(agent3TrustGraph),
    'clean',
    null,
    JSON.stringify(agent3ShadowTelemetry),
    '2026-09-22T21:50:00.000Z',
    timestamp,
    timestamp
  );

  insertAgent.run(
    'agt-cloud-infra-04',
    'Cloud Infrastructure Sentinel',
    'Deployment & Scaling Broker',
    'Autonomous broker managing staging environments, container replication, and staging-to-prod deployment verification.',
    'verified',
    'staging',
    ownerId,
    defaultWorkspace,
    91,
    0, // Shadow Mode OFF
    JSON.stringify(agent4Capabilities),
    JSON.stringify(agent4TrustGraph),
    'clean',
    null,
    JSON.stringify(agent4ShadowTelemetry),
    '2026-09-22T21:55:00.000Z',
    timestamp,
    timestamp
  );

  console.log('Seeded 4 first-class agents successfully.');
}

console.log('Migration completed successfully.');

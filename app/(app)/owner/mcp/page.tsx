import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — MCP Server Registry',
};

export default async function McpServersPage() {
  const session = await getSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const servers = [
    {
      id: 'mcp-fs-01',
      name: 'Filesystem Boundary MCP',
      transport: 'stdio',
      endpoint: '/usr/local/bin/mcp-filesystem',
      status: 'active',
      sandbox: 'Enforced (/Users/sentinel/workspace)',
      tools: ['read_file', 'list_dir', 'write_file', 'get_file_info'],
      activeLeases: 3,
      checksPassed: 12,
    },
    {
      id: 'mcp-git-01',
      name: 'Git Operations MCP',
      transport: 'stdio',
      endpoint: '/usr/local/bin/mcp-git-server',
      status: 'active',
      sandbox: 'Repository Root Only',
      tools: ['git_status', 'git_diff', 'git_log', 'git_commit'],
      activeLeases: 1,
      checksPassed: 8,
    },
    {
      id: 'mcp-term-01',
      name: 'Terminal Sandbox MCP',
      transport: 'isolated-pty',
      endpoint: '/usr/local/bin/mcp-terminal-sandbox',
      status: 'active',
      sandbox: 'Seccomp Filter (Non-root)',
      tools: ['run_sandboxed_command', 'get_exit_code'],
      activeLeases: 0,
      checksPassed: 15,
    },
    {
      id: 'mcp-db-01',
      name: 'PostgreSQL Gateway MCP',
      transport: 'socket',
      endpoint: 'localhost:5432/sentinel_ops',
      status: 'active',
      sandbox: 'Read-Only Schema Boundary',
      tools: ['query_read_only', 'describe_tables'],
      activeLeases: 2,
      checksPassed: 6,
    },
    {
      id: 'mcp-web-01',
      name: 'Web Telemetry Gateway MCP',
      transport: 'sse',
      endpoint: 'https://gateway.internal.sentinel/mcp/sse',
      status: 'active',
      sandbox: 'TLS Egress Strict Allowlist',
      tools: ['fetch_content', 'search_intel'],
      activeLeases: 0,
      checksPassed: 10,
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent-blue)] hover:underline mb-3"
        >
          <Icon name="arrow-left" size={14} />
          Owner Control Center
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            Model Context Protocol (MCP) Registry
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full font-bold uppercase tracking-wider">
            Owner Infrastructure
          </span>
        </div>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Registered tool servers, communication transports, capability manifests, and containment sandbox rules.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Active Servers
          </span>
          <div className="text-2xl font-light text-[var(--text-primary)] font-mono">{servers.length}</div>
          <span className="text-[11px] text-[var(--status-safe)]">All running healthy</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Declared Tools
          </span>
          <div className="text-2xl font-light text-[var(--text-primary)] font-mono">16 Tools</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Manifests verified</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Live Tool Leases
          </span>
          <div className="text-2xl font-light text-[var(--accent-blue)] font-mono">6 Concurrent</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Within quota limits</span>
        </div>
        <div className="card-spacious p-4 space-y-1">
          <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Containment
          </span>
          <div className="text-2xl font-light text-[var(--status-safe)] font-mono">SECCOMP</div>
          <span className="text-[11px] text-[var(--text-secondary)]">Path boundaries locked</span>
        </div>
      </div>

      {/* Servers Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Registered MCP Servers
        </h2>
        <div className="space-y-4">
          {servers.map((srv) => (
            <div key={srv.id} className="card-spacious p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{srv.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--well)] text-[var(--text-secondary)] border border-[var(--border-hairline)]">
                      {srv.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[var(--status-safe-subtle)] text-[var(--status-safe)] border border-[var(--status-safe-border)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-safe)]" />
                      {srv.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--text-secondary)] font-mono">
                    Transport: <strong className="text-[var(--text-primary)]">{srv.transport}</strong> · Endpoint: {srv.endpoint}
                  </div>
                </div>

                <div className="text-[12px] font-mono text-[var(--text-tertiary)]">
                  Sandbox: <strong className="text-[var(--text-primary)]">{srv.sandbox}</strong>
                </div>
              </div>

              {/* Declared Tool Manifest */}
              <div className="space-y-2">
                <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
                  Exposed Tool Capabilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {srv.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-[var(--well)] text-[var(--text-primary)] border border-[var(--border-hairline)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

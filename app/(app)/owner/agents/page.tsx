import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/app/components/ui-icon';
import Link from 'next/link';

export const metadata = {
  title: 'SENTINEL — Agent Controls',
};

export default async function AgentsPage() {
  const session = await getSession();

  if (!session || session.role !== 'owner') {
    redirect('/overview');
  }

  const agents = [
    {
      id: 'agent-sandbox',
      name: 'Deterministic Sandbox Inspector',
      type: 'Local Verification Engine',
      status: 'Active',
      desc: 'Performs AST taint tracking, relative directory boundary containment, and policy compliance verification.',
      allowedTools: ['mcp::read_file', 'mcp::list_dir', 'sandbox::containment_check'],
      requiresApproval: false,
    },
    {
      id: 'agent-trueforge',
      name: 'TrueForge Leased Agent Fleet',
      type: 'Autonomous Cloud Runtime',
      status: process.env.TRUEFORGE_API_KEY ? 'Active' : 'Standby',
      desc: 'Executes end-to-end security probe scenarios against external multi-agent clusters with telemetry capture.',
      allowedTools: ['trueforge::agent_lease', 'trueforge::boundary_probe', 'trueforge::traffic_monitor'],
      requiresApproval: true,
    },
    {
      id: 'agent-remediation',
      name: 'Automated Remediation Generator',
      type: 'Patch Synthesis Engine',
      status: 'Guarded',
      desc: 'Synthesizes minimal safe code diffs for approved security findings. Execution is strictly blocked without explicit reviewer sign-off.',
      allowedTools: ['patch::generate_diff', 'patch::verify_retest'],
      requiresApproval: true,
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
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Agent Controls & Tool Policies
        </h1>
        <p className="text-[var(--text-secondary)] text-[13px] mt-1">
          Govern autonomous agent leasing, tool execution boundaries, and human-in-the-loop requirements.
        </p>
      </div>

      <div className="space-y-5">
        {agents.map((agent) => (
          <div key={agent.id} className="bento-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{agent.name}</h3>
                  <span className="text-[10px] font-mono text-[var(--accent-blue)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {agent.type}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-secondary)] max-w-2xl leading-relaxed">{agent.desc}</p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold self-start sm:self-center ${
                  agent.status === 'Active'
                    ? 'bg-[var(--status-safe)]/10 text-[var(--status-safe)] border border-[var(--status-safe)]/30'
                    : agent.status === 'Guarded'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)] border border-[var(--border-subtle)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    agent.status === 'Active'
                      ? 'bg-[var(--status-safe)]'
                      : agent.status === 'Guarded'
                      ? 'bg-amber-500'
                      : 'bg-[var(--text-tertiary)]'
                  }`}
                />
                {agent.status}
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)]">
                  Authorized Tools:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.allowedTools.map((tool) => (
                    <code
                      key={tool}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] font-mono text-[11px]"
                    >
                      {tool}
                    </code>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                Human Review:{' '}
                {agent.requiresApproval ? (
                  <strong className="text-amber-500 font-semibold">Required Before Action</strong>
                ) : (
                  <strong className="text-[var(--status-safe)] font-semibold">Deterministic Verification</strong>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

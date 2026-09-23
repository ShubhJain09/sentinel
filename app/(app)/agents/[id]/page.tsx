import { getSession } from '@/app/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getAgentById, getAllFindings, getAllApprovals } from '@/app/lib/db';
import AgentPassportContent from './agent-passport-content';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = getAgentById(id);
  return {
    title: agent ? `SENTINEL — ${agent.name} Passport` : 'SENTINEL — Agent Passport',
    description: agent ? agent.description : 'Agent passport details and trust graph.',
  };
}

export default async function AgentPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const agent = getAgentById(id);

  if (!agent) {
    notFound();
  }

  const allFindings = getAllFindings();
  const linkedFindings = allFindings.filter(
    (f) =>
      f.target.toLowerCase().includes(agent.name.toLowerCase()) ||
      f.target.toLowerCase().includes(agent.type.toLowerCase()) ||
      (agent.id === 'agt-research-01' && f.id === 'SNT-002') ||
      (agent.id === 'agt-fs-sandbox-02' && f.id === 'SNT-001')
  );

  const allApprovals = getAllApprovals();
  const linkedApprovals = allApprovals.filter(
    (a) =>
      linkedFindings.some((f) => f.id === a.findingId) ||
      a.affectedTarget.toLowerCase().includes(agent.name.toLowerCase())
  );

  return (
    <AgentPassportContent
      session={session}
      initialAgent={agent}
      linkedFindings={linkedFindings}
      linkedApprovals={linkedApprovals}
    />
  );
}

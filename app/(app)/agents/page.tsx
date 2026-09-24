import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getAllAgents, getAllFindings } from '@/app/lib/db';
import AgentsContent from './agents-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SENTINEL — Autonomous Agents & Passports',
  description: 'First-class agent inventory, permission trust graphs, shadow mode, and configuration drift detection.',
};

export default async function AgentsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const agents = getAllAgents(session.workspaceId);
  const findings = getAllFindings(session.workspaceId);

  return <AgentsContent session={session} initialAgents={agents} findings={findings} />;
}

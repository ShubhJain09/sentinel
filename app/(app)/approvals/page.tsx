import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllApprovals, getAllFindings } from '@/app/lib/db';
import ApprovalsContent from './approvals-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Approval & Decision Center',
};

export default async function ApprovalsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const approvals = getAllApprovals(session.workspaceId);
  const findings = getAllFindings(session.workspaceId);

  return <ApprovalsContent approvals={approvals} findings={findings} session={session} />;
}

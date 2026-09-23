import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getAllApprovals } from '@/app/lib/db';
import RemediationContent from './remediation-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SENTINEL — Remediation Engine',
  description: 'Synthesized minimal safe AST diffs and patch deployment ledger for authorized boundary corrections.',
};

export default async function RemediationPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const approvals = getAllApprovals();

  return <RemediationContent approvals={approvals} />;
}

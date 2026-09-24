import { getSession } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getFindingById, getEvidenceForFinding } from '@/app/lib/db';
import { InvestigationReplayView } from './investigation-replay-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SENTINEL — Investigation Replay',
  description: 'Chronological execution replay, telemetry snapshots, and root cause analysis.',
};

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const finding = getFindingById(id, session.workspaceId);

  if (!finding) {
    notFound();
  }

  const evidenceList = getEvidenceForFinding(finding.id, session.workspaceId);

  return <InvestigationReplayView finding={finding} evidenceList={evidenceList} />;
}

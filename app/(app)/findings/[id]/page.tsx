import { getSession } from '@/app/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getFindingById, getEvidenceForFinding, getDb } from '@/app/lib/db';
import { FindingDetailView } from './finding-detail-view';
import type { Finding, Evidence, Approval } from '@/app/lib/types';

export const metadata = {
  title: 'SENTINEL — Finding Detail',
};

export default async function FindingDetailPage({
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
  const db = getDb();
  const linkedApprovals = db
    .prepare(`
      SELECT a.* FROM approvals a
      JOIN findings f ON f.id = a.findingId
      JOIN scans s ON s.id = f.scanId
      WHERE a.findingId = ? AND s.workspaceId = ?
    `)
    .all(finding.id, session.workspaceId) as Approval[];

  return (
    <FindingDetailView
      finding={finding}
      evidenceList={evidenceList}
      linkedApprovals={linkedApprovals}
    />
  );
}

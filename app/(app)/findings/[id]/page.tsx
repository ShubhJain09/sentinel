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
  const finding = getFindingById(id);

  if (!finding) {
    notFound();
  }

  const evidenceList = getEvidenceForFinding(finding.id);
  const db = getDb();
  const linkedApprovals = db
    .prepare('SELECT * FROM approvals WHERE findingId = ?')
    .all(finding.id) as Approval[];

  return (
    <FindingDetailView
      finding={finding}
      evidenceList={evidenceList}
      linkedApprovals={linkedApprovals}
    />
  );
}

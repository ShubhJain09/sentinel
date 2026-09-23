import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllEvidence, getAllFindings } from '@/app/lib/db';
import EvidenceContent from './evidence-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Evidence Vault',
};

export default async function EvidencePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const evidence = getAllEvidence();
  const findings = getAllFindings();

  return <EvidenceContent evidence={evidence} findings={findings} />;
}

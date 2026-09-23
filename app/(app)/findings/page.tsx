import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllFindings, getAllEvidence } from '@/app/lib/db';
import FindingsContent from './findings-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Findings & Investigations',
};

export default async function FindingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ selected?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { selected } = (await searchParams) || {};
  const findings = getAllFindings();
  const evidence = getAllEvidence();

  return (
    <FindingsContent
      findings={findings}
      evidence={evidence}
      initialSelectedId={selected}
    />
  );
}

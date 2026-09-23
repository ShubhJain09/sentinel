import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllScans } from '@/app/lib/db';
import ScansContent from './scans-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Security Scans',
};

export default async function ScansPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const scans = getAllScans();

  return <ScansContent scans={scans} />;
}

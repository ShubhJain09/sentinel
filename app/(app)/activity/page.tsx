import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllAuditEvents } from '@/app/lib/db';
import ActivityContent from './activity-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Activity & Audit History',
};

export default async function ActivityPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const events = getAllAuditEvents(100);

  return <ActivityContent events={events} />;
}

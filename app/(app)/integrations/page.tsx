import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { getAllIntegrations } from '@/app/lib/db';
import IntegrationsContent from './integrations-content';

export const metadata: Metadata = {
  title: 'SENTINEL — Integration Status',
};

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const integrations = getAllIntegrations(session.workspaceId);

  return <IntegrationsContent integrations={integrations} session={session} />;
}

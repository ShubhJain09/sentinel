import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { getAllIntegrations } from '@/app/lib/db';
import OwnerIntegrationsClient from './owner-integrations-client';

export const metadata = {
  title: 'SENTINEL — Technical Integrations',
};

export default async function OwnerIntegrationsPage() {
  const session = await getSession();
  if (!session || (session.role !== 'owner' && session.role !== 'admin')) {
    redirect('/overview');
  }

  const integrations = getAllIntegrations();

  return <OwnerIntegrationsClient integrations={integrations} />;
}

import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { 
  getOverviewCounts, 
  getAllScans, 
  getAllFindings, 
  getAllApprovals, 
  getAllAuditEvents 
} from '@/app/lib/db';
import { OverviewContent } from './overview-content';

export const metadata = { title: 'SENTINEL — Security Overview' };

export default async function OverviewPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const counts = getOverviewCounts();
  const recentScans = getAllScans().slice(0, 5);
  const openFindings = getAllFindings().filter(f => f.status === 'open');
  const pendingApprovals = getAllApprovals().filter(a => a.status === 'pending');
  const recentAudits = getAllAuditEvents(5);

  return (
    <OverviewContent 
      session={session} 
      counts={counts}
      recentScans={recentScans}
      openFindings={openFindings}
      pendingApprovals={pendingApprovals}
      recentAudits={recentAudits}
    />
  );
}

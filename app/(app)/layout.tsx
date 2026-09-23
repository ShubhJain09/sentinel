import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/auth';
import { AppShell } from '@/app/components/app-shell';

export const metadata = {
  title: 'Sentinel',
  description: 'AI/security operations platform',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <AppShell session={session}>{children}</AppShell>;
}

import { getSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'owner' && session.role !== 'admin') {
    redirect('/overview');
  }

  return (
    <div className="owner-layout h-full w-full">
      {children}
    </div>
  );
}
